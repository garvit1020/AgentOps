import express from 'express';
import * as agentService from '../services/agentService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const agents = await agentService.getAgentStatuses();
    res.json(agents);
  } catch (error) {
    console.error('Failed to get agent statuses', error);
    res.status(502).json({ error: 'Bad Gateway: Python agent service unavailable' });
  }
});

router.get('/status/health', async (req, res) => {
  try {
    const health = await agentService.checkAgentHealth();
    res.json(health);
  } catch (error) {
    res.status(502).json({ status: 'down', message: 'Agent service is down' });
  }
});

router.get('/:name', async (req, res) => {
  try {
    const agents = await agentService.getAgentStatuses();
    const agent = agents.find(a => a.name === req.params.name);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json(agent);
  } catch (error) {
    res.status(502).json({ error: 'Agent service unavailable' });
  }
});

export default router;
