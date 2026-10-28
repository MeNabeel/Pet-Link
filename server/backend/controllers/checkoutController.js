const { Pool } = require('pg');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const isSupabaseOrProd = process.env.NODE_ENV === 'production' || (connectionString && (connectionString.includes('supabase') || connectionString.includes('pooler.supabase.com')));
const pool = new Pool({
  connectionString,
  ssl: isSupabaseOrProd ? { rejectUnauthorized: false } : false
});

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
  if (!secretKey) return null;
  const Stripe = require('stripe');
  return new Stripe(secretKey);
};

/**
 * @desc    Create Stripe Checkout Session for selected store products
 * @route   POST /api/checkout/create-session
 * @access  Public / Authenticated
 */
exports.createCheckoutSession = async (req, res) => {
  try {
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

    // Fetch authoritative product records from the database
    // Handle both Prisma and raw pg Pool
    let dbProducts = [];
    try {
      const { prisma } = require('../database/supabase/client');
      if (prisma && prisma.product) {
        dbProducts = await prisma.product.findMany({
          where: {
            id: { in: productIds }
          }
        });
      }
    } catch {
      // Fallback to direct pg pool query
      const placeholders = productIds.map((_, i) => `$${i + 1}`).join(',');
      const queryResult = await pool.query(
        `SELECT id, name, brand, "regularPrice", "salePrice", price, "stockQuantity", status, images 
         FROM products WHERE id IN (${placeholders})`,
        productIds
      );
      dbProducts = queryResult.rows;
    }

    const productMap = new Map();
    dbProducts.forEach(p => {
      productMap.set(p.id, p);
    });

    // Authoritative calculation and validation
    const validatedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const pid = item.productId || item._id || item.id;
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

      let imageUrl = null;
      if (Array.isArray(dbProd.images) && dbProd.images.length > 0) {
        const first = dbProd.images[0];
        if (typeof first === 'string' && first.startsWith('http')) {
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

    const stripe = getStripe();
    if (!stripe) {
      // Save pending order in database for record keeping
      const orderInsert = await pool.query(
        `INSERT INTO orders ("userId", items, amount, currency, status, "paymentMethod", "shippingAddress", "customerEmail", "customerName")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, status, amount, "createdAt"`,
        [
          userId,
          JSON.stringify(validatedItems),
          totalAmount,
          'PKR',
          'pending_payment',
          'stripe',
          JSON.stringify(shippingAddress || {}),
          customerEmail || '',
          customerName || ''
        ]
      );

      return res.status(503).json({
        success: false,
        configured: false,
        orderId: orderInsert.rows[0]?.id,
        message: 'Stripe payment gateway is not yet configured on the server. Please set STRIPE_SECRET_KEY.'
      });
    }

    // Prepare line items for Stripe Checkout Session
    // Stripe PKR unit_amount is in minor units (paisa: 1 PKR = 100 paisa)
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

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customerEmail || undefined,
      client_reference_id: userId || undefined,
      metadata: {
        userId: userId || 'guest',
        itemCount: validatedItems.length.toString(),
        totalAmount: totalAmount.toString(),
        productIds: productIds.slice(0, 10).join(',')
      },
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl
    });

    // Record order in PostgreSQL
    const orderInsert = await pool.query(
      `INSERT INTO orders ("userId", items, amount, currency, status, "paymentMethod", "stripeSessionId", "shippingAddress", "customerEmail", "customerName")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, status, amount, "stripeSessionId", "createdAt"`,
      [
        userId,
        JSON.stringify(validatedItems),
        totalAmount,
        'PKR',
        'pending',
        'stripe',
        session.id,
        JSON.stringify(shippingAddress || {}),
        customerEmail || '',
        customerName || ''
      ]
    );

    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
      orderId: orderInsert.rows[0]?.id
    });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize checkout session.'
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
    console.warn('Stripe webhook received but STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY is missing.');
    return res.status(200).json({ received: true, note: 'Webhook secret not configured' });
  }

  let event;
  try {
    const rawBody = req.rawBody || req.body;
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const stripeSessionId = session.id;
      const paymentIntentId = session.payment_intent;

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
            console.error('Error decrementing inventory post-checkout:', invErr);
          }
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
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
    console.error('Error getting order status:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
