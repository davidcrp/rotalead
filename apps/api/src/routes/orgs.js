const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/orgs/me
router.get('/me', async (req, res, next) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.user.orgId },
    });
    res.json(org);
  } catch (err) { next(err); }
});

// PUT /api/orgs/me
router.put('/me', async (req, res, next) => {
  try {
    const { name } = req.body;
    const org = await prisma.organization.update({
      where: { id: req.user.orgId },
      data: { name },
    });
    res.json(org);
  } catch (err) { next(err); }
});

module.exports = router;
