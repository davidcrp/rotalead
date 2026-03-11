const fetch = require('node-fetch');

/**
 * Fires webhook to Zapier / Make / any HTTP endpoint
 * Non-blocking — errors are logged but not thrown
 */
async function fireWebhook(payload) {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.WEBHOOK_SECRET && {
          'X-Webhook-Secret': process.env.WEBHOOK_SECRET,
        }),
      },
      body: JSON.stringify({
        event: 'lead.created',
        timestamp: new Date().toISOString(),
        data: payload,
      }),
    });

    if (!response.ok) {
      console.warn(`Webhook responded with ${response.status}`);
    }
  } catch (err) {
    console.error('Webhook error:', err.message);
  }
}

module.exports = { fireWebhook };
