const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/sellers
router.get('/', async (req, res, next) => {
  try {
    const sellers = await prisma.seller.findMany({
      where: { orgId: req.user.orgId },
      orderBy: { position: 'asc' },
    });
    res.json(sellers);
  } catch (err) { next(err); }
});

// POST /api/sellers
router.post('/', async (req, res, next) => {
  try {
    const { name, phone, email, redirectUrl } = req.body;
    if (!name || !redirectUrl) {
      return res.status(400).json({ error: 'name and redirectUrl are required' });
    }

    // Position = current count
    const count = await prisma.seller.count({ where: { orgId: req.user.orgId } });

    const seller = await prisma.seller.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        redirectUrl,
        position: count,
        orgId: req.user.orgId,
      },
    });
    res.status(201).json(seller);
  } catch (err) { next(err); }
});

// PUT /api/sellers/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, phone, email, redirectUrl, isActive, position } = req.body;

    // Ensure seller belongs to org
    const existing = await prisma.seller.findFirst({
      where: { id: req.params.id, orgId: req.user.orgId },
    });
    if (!existing) return res.status(404).json({ error: 'Seller not found' });

    const seller = await prisma.seller.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(redirectUrl !== undefined && { redirectUrl }),
        ...(isActive !== undefined && { isActive }),
        ...(position !== undefined && { position }),
      },
    });
    res.json(seller);
  } catch (err) { next(err); }
});

// DELETE /api/sellers/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.seller.findFirst({
      where: { id: req.params.id, orgId: req.user.orgId },
    });
    if (!existing) return res.status(404).json({ error: 'Seller not found' });

    await prisma.seller.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
