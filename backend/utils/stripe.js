let stripeClient = null;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'sk_test_REPLACE_ME') {
    return null;
  }
  if (!stripeClient) {
    stripeClient = require('stripe')(key);
  }
  return stripeClient;
}

function isStripeConfigured() {
  const key = process.env.STRIPE_SECRET_KEY;
  return Boolean(key && key !== 'sk_test_REPLACE_ME');
}

module.exports = { getStripe, isStripeConfigured };
