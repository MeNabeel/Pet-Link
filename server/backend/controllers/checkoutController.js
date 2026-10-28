const { Pool } = require('pg');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

// Reuse database pool from init.js to avoid connection leaks
let pool;
try {
  const initModule = require('../database/supabase/init');
  pool = initModule.pool;
} catch {
  // Fallback if initModule not available
}

if (!pool) {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const isSupabaseOrProd = process.env.NODE_ENV === 'production' || (connectionString && (connectionString.includes('supabase') || connectionString.includes('pooler.supabase.com')));
  pool = new Pool({
    connectionString,
    ssl: isSupabaseOrProd ? { rejectUnauthorized: false } : false
  });
}

// Track whether orders table has been verified in current process
let isOrdersTableEnsured = false;

/**
 * Ensures the orders table and its indexes exist in PostgreSQL/Supabase.
 * Self-healing and idempotent.
 */
const ensureOrdersTable = async () => {
  if (isOrdersTableEnsured) return;
  try {
    if (!pool) return;
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT,
        items JSONB NOT NULL DEFAULT '[]',
        amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'PKR',
        status VARCHAR(50) DEFAULT 'pending',
        "paymentMethod" VARCHAR(50) DEFAULT 'stripe',
        "stripeSessionId" TEXT UNIQUE,
        "stripePaymentIntentId" TEXT,
        "shippingAddress" JSONB DEFAULT '{}',
        "customerEmail" VARCHAR(255) DEFAULT '',
        "customerName" VARCHAR(255) DEFAULT '',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders("userId");`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders("stripeSessionId");`);
    isOrdersTableEnsured = true;
    console.log('[checkoutController] Orders table verified/created in database.');
  } catch (err) {
    console.warn('[checkoutController] ensureOrdersTable warning:', err.message);
  }
};

// Helper to extract authenticated user ID from headers or token safely
const extractUserId = (req) => {
  let requesterId = req.headers['x-requester-id'] || req.headers['x-user-id'] || req.user?.id;
  if (!requesterId && req.headers['authorization']) {
    try {
      const authHeader = req.headers['authorization'];
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'petlink_super_secret_key_2026');
        if (decoded && decoded.id) requesterId = decoded.id;
      }
    } catch {
      // Ignored - fallback to requesterId
    }
  }
  return requesterId || null;
};

// Initialize Stripe instance lazily
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.trim() === '') return null;
  const Stripe = require('stripe');
  return new Stripe(secretKey.trim());
};

/**
 * @desc    Create Stripe Checkout Session for selected store products
 * @route   POST /api/checkout/create-session
 * @access  Public / Authenticated
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    // 1. Ensure table exists in database
    await ensureOrdersTable();

    const userId = extractUserId(req);
    const { items, customerEmail, customerName, shippingAddress, successUrl, cancelUrl } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided for checkout.' });
    }

    // Extract product IDs
    const productIds = items.map(it => it.productId || it._id || it.id).filter(Boolean);
    if (productIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid product identifiers in items.' });
    }

    // 2. Fetch authoritative product records from the database
    // Resilient lookup: Prisma (Postgres) -> raw pg pool -> MongoDB model
    let dbProducts = [];

    // Attempt Prisma
    try {
      const { prisma } = require('../database/supabase/client');
      if (prisma && prisma.product) {
        dbProducts = await prisma.product.findMany({
          where: {
            id: { in: productIds }
          }
        });
      }
    } catch (prismaErr) {
      console.warn('[checkoutController] Prisma lookup warning:', prismaErr.message);
    }

    // Attempt direct pg pool if Prisma returned no records
    if (dbProducts.length === 0 && pool) {
      try {
        const placeholders = productIds.map((_, i) => `$${i + 1}`).join(',');
        const queryResult = await pool.query(
          `SELECT id, name, brand, "regularPrice", "salePrice", price, "stockQuantity", status, images 
           FROM products WHERE id IN (${placeholders})`,
          productIds
        );
        dbProducts = queryResult.rows;
      } catch (pgErr) {
        console.warn('[checkoutController] Raw PG lookup warning:', pgErr.message);
      }
    }

    // Attempt MongoDB if still empty (for hybrid environments)
    if (dbProducts.length === 0) {
      try {
        const ProductMongo = require('../models/Product');
        if (ProductMongo) {
          const mongoProds = await ProductMongo.find({ _id: { $in: productIds } });
          dbProducts = mongoProds.map(p => ({
            id: p._id.toString(),
            name: p.name,
            brand: p.brand || '',
            regularPrice: p.regularPrice,
            salePrice: p.salePrice,
            price: p.price,
            stockQuantity: p.stockQuantity,
            status: p.status,
            images: p.images || []
          }));
        }
      } catch (mongoErr) {
        console.warn('[checkoutController] MongoDB lookup warning:', mongoErr.message);
      }
    }

    const productMap = new Map();
    dbProducts.forEach(p => {
      productMap.set(p.id?.toString(), p);
    });

    // 3. Authoritative calculation and validation
    const validatedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const pid = (item.productId || item._id || item.id)?.toString();
      const dbProd = productMap.get(pid);

      if (!dbProd) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name || pid}" is no longer available in the catalog.`
        });
      }

      // Check published status
      if (dbProd.status && dbProd.status.toLowerCase() !== 'published' && dbProd.status.toLowerCase() !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product "${dbProd.name}" is currently unavailable.`
        });
      }

      const qty = Math.max(1, Number(item.quantity || item.selectedQuantity) || 1);

      // Check stock quantity if tracked
      if (typeof dbProd.stockQuantity === 'number' && dbProd.stockQuantity < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${dbProd.name}". Available: ${dbProd.stockQuantity}.`
        });
      }

      // Authoritative pricing: salePrice if valid, else regularPrice, else price
      let unitPrice = 0;
      if (dbProd.salePrice && Number(dbProd.salePrice) > 0) {
        unitPrice = Number(dbProd.salePrice);
      } else if (dbProd.regularPrice && Number(dbProd.regularPrice) > 0) {
        unitPrice = Number(dbProd.regularPrice);
      } else if (dbProd.price && Number(dbProd.price) > 0) {
        unitPrice = Number(dbProd.price);
      }

      if (unitPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid product pricing for "${dbProd.name}".`
        });
      }

      const itemTotal = unitPrice * qty;
      totalAmount += itemTotal;

      // Only pass public HTTP/HTTPS images to Stripe; never base64 data URLs
      let imageUrl = null;
      if (Array.isArray(dbProd.images) && dbProd.images.length > 0) {
        const first = dbProd.images[0];
        if (typeof first === 'string' && /^https?:\/\//i.test(first) && first.length < 2000) {
          imageUrl = first;
        }
      }

      validatedItems.push({
        productId: dbProd.id,
        cartItemId: item.cartItemId || `${dbProd.id}-${item.selectedVariant || 'default'}`,
        name: dbProd.name,
        brand: dbProd.brand || '',
        selectedVariant: item.selectedVariant || null,
        unitPrice: unitPrice,
        quantity: qty,
        itemTotal: itemTotal,
        image: imageUrl
      });
    }

    // 4. Verify Stripe Configuration
    const stripe = getStripe();
    if (!stripe) {
      let savedOrderId = null;
      try {
        if (pool) {
          const orderInsert = await pool.query(
            `INSERT INTO orders ("userId", items, amount, currency, status, "paymentMethod", "shippingAddress", "customerEmail", "customerName")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id`,
            [
              userId,
              JSON.stringify(validatedItems),
              totalAmount,
              'PKR',
              'pending_payment',
              'stripe',
              JSON.stringify(shippingAddress || {}),
              (customerEmail || '').trim(),
              (customerName || '').trim()
            ]
          );
          savedOrderId = orderInsert.rows[0]?.id;
        }
      } catch (orderErr) {
        console.warn('[checkoutController] Could not record unconfigured order:', orderErr.message);
      }

      return res.status(503).json({
        success: false,
        configured: false,
        orderId: savedOrderId,
        message: 'Stripe Sandbox secret key is not configured in Render environment variables. Please set STRIPE_SECRET_KEY=sk_test_... in Render dashboard.'
      });
    }

    // 5. Prepare Line Items for Stripe Checkout
    // Currency: PKR (Pakistani Rupee). In Stripe, PKR unit_amount is in paisa (1 PKR = 100 paisa)
    const lineItems = validatedItems.map(it => {
      const description = it.selectedVariant ? `Variant: ${it.selectedVariant}` : (it.brand ? `Brand: ${it.brand}` : undefined);
      return {
        price_data: {
          currency: 'pkr',
          product_data: {
            name: it.name,
            ...(description ? { description } : {}),
            ...(it.image ? { images: [it.image] } : {})
          },
          unit_amount: Math.round(it.unitPrice * 100)
        },
        quantity: it.quantity
      };
    });

    const fallbackOrigin = req.headers.origin || 'http://localhost:5173';
    const finalSuccessUrl = successUrl || `${fallbackOrigin}/#/shop?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${fallbackOrigin}/#/shop?checkout=cancel`;

    // 6. Create Stripe Checkout Session
    let session;
    try {
      const sessionParams = {
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        metadata: {
          userId: userId || 'guest',
          itemCount: validatedItems.length.toString(),
          totalAmount: totalAmount.toString(),
          productIds: productIds.slice(0, 10).join(',')
        },
        success_url: finalSuccessUrl,
        cancel_url: finalCancelUrl
      };

      if (customerEmail && typeof customerEmail === 'string' && customerEmail.includes('@')) {
        sessionParams.customer_email = customerEmail.trim();
      }
      if (userId) {
        sessionParams.client_reference_id = userId.toString();
      }

      session = await stripe.checkout.sessions.create(sessionParams);
    } catch (stripeErr) {
      console.error('[Stripe Checkout Error]:', stripeErr.type, stripeErr.code, stripeErr.message);

      const isCurrencyError = stripeErr.message && (
        stripeErr.message.toLowerCase().includes('currency') || 
        stripeErr.message.toLowerCase().includes('pkr')
      );

      return res.status(400).json({
        success: false,
        stripeError: true,
        code: stripeErr.code || stripeErr.type || 'stripe_error',
        message: isCurrencyError 
          ? `Stripe account error: ${stripeErr.message}. If testing in sandbox with an international test account that restricts PKR, please ensure PKR multi-currency presentment is enabled on your Stripe test dashboard.`
          : stripeErr.message || 'Failed to create Stripe Checkout session.'
      });
    }

    // 7. Record Order in Database (Non-blocking on failure)
    let orderId = null;
    try {
      if (pool) {
        const orderInsert = await pool.query(
          `INSERT INTO orders ("userId", items, amount, currency, status, "paymentMethod", "stripeSessionId", "shippingAddress", "customerEmail", "customerName")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING id`,
          [
            userId,
            JSON.stringify(validatedItems),
            totalAmount,
            'PKR',
            'pending',
            'stripe',
            session.id,
            JSON.stringify(shippingAddress || {}),
            (customerEmail || '').trim(),
            (customerName || '').trim()
          ]
        );
        orderId = orderInsert.rows[0]?.id;
      }
    } catch (dbOrderErr) {
      console.warn('[checkoutController] Could not record pending order in DB:', dbOrderErr.message);
    }

    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
      orderId: orderId
    });
  } catch (error) {
    console.error('[checkoutController] Unexpected error in createCheckoutSession:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unexpected server error while initializing checkout session.'
    });
  }
};

/**
 * @desc    Stripe Webhook handler for asynchronous payment verification
 * @route   POST /api/checkout/webhook
 * @access  Public (Signature verified)
 */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = getStripe();

  if (!stripe || !webhookSecret) {
    console.warn('[checkoutController] Stripe webhook received but STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY is missing.');
    return res.status(200).json({ received: true, note: 'Webhook secret not configured' });
  }

  let event;
  try {
    const rawBody = req.rawBody || req.body;
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('[checkoutController] Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await ensureOrdersTable();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const stripeSessionId = session.id;
      const paymentIntentId = session.payment_intent;

      if (pool) {
        // Find and update the order
        const orderQuery = await pool.query(
          `SELECT id, items, status FROM orders WHERE "stripeSessionId" = $1`,
          [stripeSessionId]
        );

        if (orderQuery.rows.length > 0) {
          const order = orderQuery.rows[0];

          if (order.status !== 'paid') {
            await pool.query(
              `UPDATE orders 
               SET status = 'paid', "stripePaymentIntentId" = $1, "updatedAt" = NOW()
               WHERE id = $2`,
              [paymentIntentId, order.id]
            );

            // Decrement product inventory safely
            try {
              const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
              if (Array.isArray(items)) {
                for (const it of items) {
                  if (it.productId && it.quantity) {
                    await pool.query(
                      `UPDATE products 
                       SET "stockQuantity" = GREATEST(0, "stockQuantity" - $1),
                           "updatedAt" = NOW()
                       WHERE id = $2`,
                      [it.quantity, it.productId]
                    );
                  }
                }
              }
            } catch (invErr) {
              console.error('[checkoutController] Error decrementing inventory post-checkout:', invErr);
            }
          }
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[checkoutController] Error processing Stripe webhook:', error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * @desc    Get order status by session ID or order ID
 * @route   GET /api/checkout/status/:identifier
 * @access  Public / Authenticated
 */
exports.getOrderStatus = async (req, res) => {
  try {
    const { identifier } = req.params;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Identifier is required.' });
    }

    await ensureOrdersTable();

    if (!pool) {
      return res.status(503).json({ success: false, message: 'Database connection unavailable.' });
    }

    const orderQuery = await pool.query(
      `SELECT id, "userId", items, amount, currency, status, "stripeSessionId", "createdAt", "updatedAt"
       FROM orders 
       WHERE "stripeSessionId" = $1 OR id::text = $1`,
      [identifier]
    );

    if (orderQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderQuery.rows[0];
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

    return res.status(200).json({
      success: true,
      order: {
        ...order,
        items
      }
    });
  } catch (error) {
    console.error('[checkoutController] Error getting order status:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
