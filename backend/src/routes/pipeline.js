import express from 'express';
import * as db from '../db/database.js';
import * as agentService from '../services/agentService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/current', (req, res) => {
  try {
    const pipeline = db.getCurrentPipeline();
    if (!pipeline) {
      return res.status(404).json({ error: 'No current pipeline run found' });
    }
    res.json(pipeline);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const history = db.getPipelineHistory(limit, offset);
    res.json({ data: history });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pipeline = db.getPipelineById(req.params.id);
    if (!pipeline) {
      // Maybe check with agent server if not in db
      try {
        const agentData = await agentService.getPipelineStatus(req.params.id);
        return res.json(agentData);
      } catch (err) {
        return res.status(404).json({ error: 'Pipeline not found' });
      }
    }
    res.json(pipeline);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/logs', (req, res) => {
  try {
    const logs = db.getLogsByPipeline(req.params.id);
    res.json({ data: logs });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/trigger', async (req, res) => {
  const { repo_url, branch = 'main' } = req.body;
  if (!repo_url) {
    return res.status(400).json({ error: 'repo_url is required' });
  }

  const pipelineId = `pipe_${Date.now()}`;
  try {
    db.insertPipeline(uuidv4(), pipelineId, repo_url, branch);
  } catch (dbErr) {
    // DB might not have table yet — non-fatal
    console.warn('[Pipeline] DB insert skipped:', dbErr.message);
  }

  // Trigger pipeline — never throws (graceful fallback to demo mode inside)
  try {
    const realId = await agentService.triggerPipeline(repo_url, branch);
    return res.status(200).json({ message: 'Pipeline triggered', pipeline_id: realId || pipelineId, mode: 'live' });
  } catch (err) {
    // Should never reach here after the new agentService, but just in case
    return res.status(200).json({ message: 'Pipeline triggered (demo mode)', pipeline_id: pipelineId, mode: 'demo' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.deletePipeline(req.params.id);
    res.json({ message: 'Pipeline run deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
