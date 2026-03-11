const prisma = require('../lib/prisma');

/**
 * Round-robin algorithm (atomic, concurrency-safe):
 * - Uses a single atomic UPDATE ... RETURNING to increment the index
 *   and read the previous value in one DB round-trip.
 * - This prevents race conditions in serverless environments where
 *   multiple instances can execute simultaneously.
 */
async function getNextSeller(linkId) {
  // Atomically increment currentIndex and return the value BEFORE the increment.
  // Single SQL operation — no race condition possible.
  const result = await prisma.$queryRaw`
    UPDATE "RotationLink"
    SET "currentIndex" = "currentIndex" + 1
    WHERE id = ${linkId}
    RETURNING id, "orgId", "isActive", "currentIndex" - 1 AS "prevIndex"
  `;

  if (!result || result.length === 0) {
    throw new Error('Link not found');
  }

  const link = result[0];

  if (!link.isActive) {
    throw new Error('Link is inactive');
  }

  const activeSellers = await prisma.seller.findMany({
    where: { orgId: link.orgId, isActive: true },
    orderBy: { position: 'asc' },
  });

  if (activeSellers.length === 0) {
    throw new Error('No active sellers available');
  }

  // prevIndex is the value before increment — safe to use for selection
  const selectedIndex = Number(link.prevIndex) % activeSellers.length;
  const selectedSeller = activeSellers[selectedIndex];

  return {
    seller: selectedSeller,
    index: selectedIndex,
    total: activeSellers.length,
  };
}

module.exports = { getNextSeller };
