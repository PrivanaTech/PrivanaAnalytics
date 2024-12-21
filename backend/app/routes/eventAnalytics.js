import { Router } from 'express';
import {
  getTotalEvents,
  getEventsByType,
  getEventsByUser,
  getDailyEventTrends,
  getTopUsers,
  getFilteredEvents,
  getAverageEventsPerDay,
  getMostPopularTypes,
  getEventTypeDistribution,
  getEventHeatmap,
} from '../services/eventAnalytics.js';
import { optionalVerifyToken, verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyToken)

router.get('/total', async (req, res) => {
  const total = await getTotalEvents();
  res.json({ total });
});

router.get('/by-type', async (req, res) => {
  const data = await getEventsByType();
  res.json(data);
});

router.get('/by-user', async (req, res) => {
  const data = await getEventsByUser();
  res.json(data);
});

router.get('/trends/daily', async (req, res) => {
  const { startDate, endDate } = req.query;
  const trends = await getDailyEventTrends(startDate, endDate);
  res.json(trends);
});

router.get('/top-users', async (req, res) => {
  const users = await getTopUsers();
  res.json(users);
});

router.get('/filter', async (req, res) => {
  const { typeId, startDate, endDate } = req.query;
  const data = await getFilteredEvents(typeId, startDate, endDate);
  res.json(data);
});

router.get('/average', async (req, res) => {
    const { startDate, endDate } = req.query;
  const avg = await getAverageEventsPerDay(startDate, endDate);
  res.json({ averagePerDay: avg });
});

router.get('/popular', async (req, res) => {
  const data = await getMostPopularTypes();
  res.json(data);
});

router.get('/distribution', async (req, res) => {
  const data = await getEventTypeDistribution();
  res.json(data);
});

router.get('/heatmap', async (req, res) => {
  const heatmap = await getEventHeatmap();
  res.json(heatmap);
});

export default router;
