const express = require('express');
const prisma = require('../lib/prisma');
const { getNextSeller } = require('../services/roundRobin');
const { fireWebhook } = require('../services/webhook');
const { appendLeadToSheet } = require('../services/sheetsSync');

const router = express.Router();

// GET /r/:slug — The main redirect endpoint
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const link = await prisma.rotationLink.findUnique({ where: { slug } });
    if (!link) {
      return res.status(404).send('Link not found');
    }
    if (!link.isActive) {
      return res.status(410).send('This link is no longer active');
    }

    const { seller } = await getNextSeller(link.id);

    // Record the lead
    const lead = await prisma.lead.create({
      data: {
        sourceIp: req.ip || req.headers['x-forwarded-for'] || null,
        userAgent: req.headers['user-agent'] || null,
        referer: req.headers['referer'] || null,
        sellerId: seller.id,
        linkId: link.id,
      },
      include: {
        seller: true,
        link: true,
      },
    });

    // Non-blocking async integrations
    fireWebhook({
      leadId: lead.id,
      sellerName: seller.name,
      sellerPhone: seller.phone,
      linkName: link.name,
      linkSlug: slug,
      redirectUrl: seller.redirectUrl,
      sourceIp: lead.sourceIp,
      timestamp: lead.createdAt,
    }).catch(console.error);

    appendLeadToSheet(lead).catch(console.error);

    // Redirect to seller
    return res.redirect(302, seller.redirectUrl);
  } catch (err) {
    if (err.message === 'No active sellers available') {
      return res.status(503).send('No sellers available at this time. Please try again later.');
    }
    next(err);
  }
});

module.exports = router;
