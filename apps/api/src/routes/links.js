const express = require('express');
const { customAlphabet } = require('nanoid');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

// GET /api/links
router.get('/', async (req, res, next) => {
  try {
    const links = await prisma.rotationLink.findMany({
      where: { orgId: req.user.orgId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { leads: true } },
      },
    });
    res.json(links);
  } catch (err) { next(err); }
});

// POST /api/links
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const slug = nanoid();
    const link = await prisma.rotationLink.create({
      data: { name, slug, orgId: req.user.orgId },
    });
    res.status(201).json(link);
  } catch (err) { next(err); }
});

// PUT /api/links/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, isActive } = req.body;
    const existing = await prisma.rotationLink.findFirst({
      where: { id: req.params.id, orgId: req.user.orgId },
    });
    if (!existing) return res.status(404).json({ error: 'Link not found' });

    const link = await prisma.rotationLink.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json(link);
  } catch (err) { next(err); }
});

// DELETE /api/links/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.rotationLink.findFirst({
      where: { id: req.params.id, orgId: req.user.orgId },
    });
    if (!existing) return res.status(404).json({ error: 'Link not found' });

    await prisma.rotationLink.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
