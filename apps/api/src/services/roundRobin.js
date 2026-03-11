const prisma = require('../lib/prisma');

/**
 * Round-robin algorithm:
 * - Gets all active sellers for a link's org, sorted by position
 * - Uses atomic transaction to read currentIndex and increment it
 * - Returns selected seller
 */
async function getNextSeller(linkId) {
  return await prisma.$transaction(async (tx) => {
    // Lock and get the link
    const link = await tx.rotationLink.findUnique({
      where: { id: linkId },
      include: {
        org: {
          include: {
            sellers: {
              where: { isActive: true },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    if (!link) throw new Error('Link not found');
    if (!link.isActive) throw new Error('Link is inactive');

    const activeSellers = link.org.sellers;
    if (activeSellers.length === 0) throw new Error('No active sellers available');

    const selectedIndex = link.currentIndex % activeSellers.length;
    const selectedSeller = activeSellers[selectedIndex];

    // Atomically increment index
    await tx.rotationLink.update({
      where: { id: linkId },
      data: { currentIndex: link.currentIndex + 1 },
    });

    return {
      seller: selectedSeller,
      index: selectedIndex,
      total: activeSellers.length,
    };
  });
}

module.exports = { getNextSeller };
