import express from 'express';
import * as db from '../db/database.js';

const router = express.Router();

router.get('/metrics', (req, res) => {
  // Simulate Prometheus metrics for demo purposes
  res.json({
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    requests_per_second: Math.floor(Math.random() * 500),
    error_rate: Math.random() * 5,
    timestamp: new Date().toISOString()
  });
});

router.get('/alerts', (req, res) => {
  try {
    const alerts = db.getActiveAlerts();
    res.json({ data: alerts });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/alerts/:id/resolve', (req, res) => {
  try {
    db.resolveAlert(req.params.id);
    res.json({ message: 'Alert resolved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = db.getRecentLogs(limit);
    res.json({ data: logs });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
