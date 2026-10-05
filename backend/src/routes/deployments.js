import express from 'express';
import * as db from '../db/database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const deployments = db.getDeployments();
    res.json({ data: deployments });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/current', (req, res) => {
  try {
    const deployment = db.getCurrentDeployment();
    if (!deployment) {
      return res.status(404).json({ error: 'No active deployment found' });
    }
    res.json(deployment);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const deployment = db.getDeploymentById(req.params.id);
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    res.json(deployment);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/:id/rollback', (req, res) => {
  try {
    const deployment = db.getDeploymentById(req.params.id);
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    
    // In a real system, this would trigger a rollback pipeline
    // For now, we simulate success
    res.json({ message: 'Rollback triggered successfully', deployment });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
