# Stripe Integration Reference & Setup Guide

## Values to Replace

The following values are placeholders and must be updated before going live.

**Files containing placeholders:**
- [client/web/.env](client/web/.env)
- [server/backend/.env](server/backend/.env)

| Field | Current Value | What to Set |
|-------|--------------|-------------|
| mode | payment | Set to "payment" for one-time charges or "subscription" for recurring billing. (Currently configured to `"payment"` for PetLink store product orders). |
| VITE_STRIPE_PUBLISHABLE_KEY | (empty/placeholder) | Your Stripe Publishable Key (`pk_test_...` in test mode or `pk_live_...` in live mode) from the Stripe Dashboard (https://dashboard.stripe.com/test/apikeys). |
| STRIPE_SECRET_KEY | (empty/placeholder) | Your Stripe Secret Key (`sk_test_...` in test mode or `sk_live_...` in live mode) from the Stripe Dashboard. |
| STRIPE_WEBHOOK_SECRET | (empty/placeholder) | Your Stripe Webhook Signing Secret (`whsec_...`) from Stripe Dashboard -> Developers -> Webhooks (https://dashboard.stripe.com/workbench/webhooks). |

## Configured Parameters

These parameters were configured in Checkout Studio and are already set correctly.

**Files containing these parameters:**
- [server/backend/controllers/checkoutController.js](server/backend/controllers/checkoutController.js)

| Parameter | Value |
|-----------|-------|
| ui_mode | form |
| billing_address_collection | required |
| phone_number_collection | { "enabled": false } |
| automatic_tax | { "enabled": false } |
| submit_type | auto |
| shipping_address_collection | { "allowed_countries": ["PK"] } |
| integration_identifier | custom_embedded_web_0001 |

## Setup and Next Steps

### Setup Instructions
1. **Environment Variables**:
   - In `server/backend/.env` (and Render Environment Settings):
     ```env
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```
   - In `client/web/.env` (and Vercel Environment Settings):
     ```env
     VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
     ```
   *Note: In Vite, browser-accessible variables must begin with `VITE_`.*

2. **API Keys & SDK**:
   - Server uses Stripe API version `2026-03-25.dahlia`.
   - Client loads Stripe Dahlia directly via `<script src="https://js.stripe.com/dahlia/stripe.js"></script>` in HTML `<head>`.

### Project Structure of Integration Files
- `server/backend/controllers/checkoutController.js`: Session creation endpoint (`/api/checkout/create-session`) and webhook listener (`/api/checkout/webhook`).
- `client/web/index.html`: Direct Stripe Dahlia script inclusion (`https://js.stripe.com/dahlia/stripe.js`).
- `client/web/src/components/CartDrawer.jsx`: Embedded Checkout Form container (`#checkout-form`) and `stripe.initCheckoutFormSdk` lifecycle integration.

### How the Integration Works (Flow Overview)
1. User browses store and selects items in the Cart Drawer.
2. Clicking **Checkout Selected** sends a POST request to `/api/checkout/create-session` with the selected item IDs and quantities.
3. The server validates products against the database catalog, calculates PKR pricing, and creates a Stripe Checkout Session with `ui_mode: "form"`.
4. The server responds with `{ client_secret: session.client_secret }`.
5. The frontend initializes Stripe's Checkout Form SDK (`stripe.initCheckoutFormSdk({ clientSecret, appearance })`) with the configured custom appearance.
6. The form mounts onto `<div id="checkout-form"></div>`.
7. Once the user submits payment details, `loadActionsResult.actions.confirm({ formConfirmEvent: event })` securely processes payment within the iframe.
8. Stripe dispatches a `checkout.session.completed` event to `/api/checkout/webhook` to mark the order as paid in Supabase.

### Testing Credit Card Numbers and Test Modes
- When testing in sandbox/test mode, use Stripe's standard test card numbers:
  - **Card Number**: `4242 4242 4242 4242`
  - **Expiration**: Any future month and year (e.g., `12/32`)
  - **CVC**: Any 3 digits (e.g., `123`)
  - **Postal Code**: Any valid postal code (e.g., `54000`)

### Next Steps
- **Order Fulfillment & Tracking**: Connect automated notifications or email delivery when `checkout.session.completed` events are received.
- **Production Switch**: Replace `pk_test_...` and `sk_test_...` with live credentials once account activation in supported merchant regions is finalized.
- **Resources**:
  - Support: https://support.stripe.com
  - Documentation: https://docs.stripe.com
  - Stripe MCP: https://docs.stripe.com/mcp

