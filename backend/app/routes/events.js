import { Router } from 'express';
import { prisma } from '../prismaClient.js';
import { verifyToken, optionalVerifyToken, requireRole } from '../middlewares/authMiddleware.js';
import { Parser } from 'json2csv';

const router = Router();

router.get('/', verifyToken, async (req, res) => {
  const { type_id, user_id, page = 1, limit = 10 } = req.query;

  try {
    const where = {};
    if (type_id) where.type_id = parseInt(type_id, 10);
    if (user_id) where.user_id = parseInt(user_id, 10);

    const events = await prisma.event.findMany({
      where,
      skip: (page - 1) * limit,
      take: parseInt(limit, 10),
      orderBy: { timestamp: 'desc' },
      include: { type: true, user: true },
    });

    const total = await prisma.event.count({ where });

    res.json({ events, total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page, 10) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/', optionalVerifyToken, async (req, res) => {
    const { type_id, metadata, timestamp } = req.body;
  
    try {
      const event = await prisma.event.create({
        data: {
          type_id,
          user_id: req.user ? req.user.id : null, // Attach user_id for logged-in users or null for anonymous
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          metadata,
        },
      });
      res.status(201).json(event);
    } catch (error) {
      console.error('Error logging event:', error.message);
      res.status(500).json({ error: 'Failed to log event' });
    }
});
  

export default router;
