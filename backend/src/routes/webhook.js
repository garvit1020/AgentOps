import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as db from '../db/database.js';
import * as agentService from '../services/agentService.js';
import * as githubService from '../services/githubService.js';

const router = express.Router();
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'secret';

// Use raw body for GitHub signature verification
router.post('/github', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = req.body;
  
  if (!githubService.verifyWebhookSignature(payload, signature, GITHUB_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  try {
    const data = JSON.parse(payload.toString());
    
    // Only handle push events
    if (req.headers['x-github-event'] === 'push') {
      const repoUrl = data.repository.clone_url;
      const branch = data.ref.replace('refs/heads/', '');
      const commitSha = data.after;
      
      const pipelineId = `pipe_${uuidv4()}`;
      
      // Store in DB
      db.insertPipeline(uuidv4(), pipelineId, repoUrl, branch);
      
      // Trigger pipeline in background
      agentService.triggerPipeline(repoUrl, branch).catch(err => {
         console.error('Failed to trigger pipeline from webhook', err);
      });
      
      return res.status(200).json({ message: 'Pipeline triggered', pipeline_id: pipelineId });
    }
    
    return res.status(200).json({ message: 'Ignored non-push event' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/trigger', express.json(), async (req, res) => {
  const { repo_url, branch } = req.body;
  
  if (!repo_url || !branch) {
    return res.status(400).json({ error: 'repo_url and branch are required' });
  }

  try {
    const pipelineId = `pipe_${uuidv4()}`;
    db.insertPipeline(uuidv4(), pipelineId, repo_url, branch);
    
    const triggeredId = await agentService.triggerPipeline(repo_url, branch);
    return res.status(200).json({ message: 'Pipeline triggered manually', pipeline_id: triggeredId || pipelineId });
  } catch (error) {
    console.error('Manual trigger error:', error);
    return res.status(500).json({ error: 'Failed to trigger pipeline' });
  }
});

export default router;
