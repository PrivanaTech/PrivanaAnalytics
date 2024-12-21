import { Router } from 'express';
import { prisma } from '../prismaClient.js';
import { optionalVerifyToken, verifyToken } from '../middlewares/authMiddleware.js';
import { Parser } from 'json2csv';

const router = Router();

// Log a New Event
router.post('/', optionalVerifyToken, async (req, res) => {
  const { type_id, metadata, timestamp } = req.body;

  try {
    const event = await prisma.event.create({
      data: {
        type_id,
        user_id: req.user ? req.user.id : null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        metadata,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error logging event:', error.message);
    res.status(500).json({ error: 'Failed to log event', details: error.message });
  }
});

// Retrieve Events with Filtering
router.get('/', verifyToken, async (req, res) => {
  const { type_id, user_id, startDate, endDate, page = 1, limit = 10 } = req.query;

  try {
    const where = {};
    if (type_id) where.type_id = parseInt(type_id, 10);
    if (user_id) where.user_id = parseInt(user_id, 10);
    if (startDate && endDate) {
      where.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const events = await prisma.event.findMany({
      where,
      skip: (page - 1) * limit,
      take: parseInt(limit, 10),
      orderBy: { timestamp: 'desc' },
      include: { type: true, user: true },
    });

    const total = await prisma.event.count({ where });
    res.json({
      events,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page, 10),
    });
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).json({ error: 'Failed to fetch events', details: error.message });
  }
});

// Export Events to CSV
router.post('/export', verifyToken, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { type: true, user: true },
    });

    const fields = [
      { label: 'Event ID', value: 'id' },
      { label: 'Type', value: 'type.name' },
      { label: 'User', value: 'user.name' },
      { label: 'Timestamp', value: 'timestamp' },
      { label: 'Metadata', value: 'metadata' },
    ];
    const parser = new Parser(fields);
    const csv = parser.parse(events);

    res.header('Content-Type', 'text/csv');
    res.attachment('events.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting events:', error.message);
    res.status(500).json({ error: 'Failed to export events', details: error.message });
  }
});

export default router;
