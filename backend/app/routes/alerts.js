import { Router } from 'express';
import { prisma } from '../prismaClient.js';

const router = Router();

// Create a threshold alert
router.post('/', async (req, res) => {
  const { user_id, type_id, threshold, duration } = req.body;

  try {
    const alert = await prisma.thresholdAlert.create({
      data: { user_id, type_id, threshold, duration },
    });
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Fetch all alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await prisma.thresholdAlert.findMany({
      include: { user: true, type: true },
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Delete an alert
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.thresholdAlert.delete({ where: { id: parseInt(id, 10) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

export default router;
