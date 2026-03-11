const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/leads
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {
      link: { orgId: req.user.orgId },
    };

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          seller: { select: { id: true, name: true, phone: true } },
          link: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    res.json({
      data: leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) { next(err); }
});

// GET /api/leads/stats
router.get('/stats', async (req, res, next) => {
  try {
    const orgId = req.user.orgId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, todayCount, bySeller] = await Promise.all([
      prisma.lead.count({ where: { link: { orgId } } }),
      prisma.lead.count({
        where: {
          link: { orgId },
          createdAt: { gte: today },
        },
      }),
      prisma.lead.groupBy({
        by: ['sellerId'],
        where: { link: { orgId } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
    ]);

    // Enrich seller data
    const sellerIds = bySeller.map((s) => s.sellerId);
    const sellers = await prisma.seller.findMany({
      where: { id: { in: sellerIds } },
      select: { id: true, name: true },
    });
    const sellerMap = Object.fromEntries(sellers.map((s) => [s.id, s.name]));

    res.json({
      total,
      today: todayCount,
      bySeller: bySeller.map((s) => ({
        sellerId: s.sellerId,
        sellerName: sellerMap[s.sellerId] || 'Unknown',
        count: s._count.id,
      })),
    });
  } catch (err) { next(err); }
});

module.exports = router;
