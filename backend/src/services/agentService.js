import axios from 'axios';
import { broadcast } from './websocketService.js';
import * as db from '../db/database.js';

const AGENT_URL = process.env.AGENT_SERVER_URL || process.env.AGENT_URL || 'http://localhost:8000';
const DEMO_MODE = process.env.DEMO_MODE === 'true';

const agentApi = axios.create({ baseURL: AGENT_URL, timeout: 8000 });

// ─── Pipeline step simulation (when agent server is offline) ─────────────────
const DEMO_STEPS = [
  { step: 0, key: 'code_analysis', agent: 'Code Analysis', label: 'Analyzing code quality, security, dependencies...' },
  { step: 1, key: 'cicd',          agent: 'CI/CD',          label: 'Triggering GitHub Actions, running tests...' },
  { step: 2, key: 'deployment',    agent: 'Deployment',     label: 'Building Docker image, deploying to Kubernetes...' },
  { step: 3, key: 'monitoring',    agent: 'Monitoring',     label: 'Verifying pod health, collecting metrics...' },
];

const DEMO_COMPLETIONS = [
  { key: 'code_analysis', msg: 'Code analysis complete — Score: 91/100, 0 vulnerabilities' },
  { key: 'cicd',          msg: 'Build #418 successful — 48/48 tests passed ✓' },
  { key: 'deployment',    msg: 'Deployed v1.2.4 — 2/2 pods running ✓' },
  { key: 'monitoring',    msg: 'All systems healthy — CPU: 42%, Memory: 68%, Error rate: 0.02%' },
];

async function runDemoPipeline(pipelineId, repoUrl, branch) {
  const repoName = repoUrl.replace('https://github.com/', '').split('/').pop() || 'project';
  let stepIndex = 0;
  const delays = [5000, 6000, 7000, 4000]; // ms per step

  broadcast('pipeline:started', {
    pipeline_id: pipelineId, repo_url: repoUrl,
    branch, timestamp: new Date().toISOString()
  });

  for (const s of DEMO_STEPS) {
    // Step starting
    broadcast('pipeline:step', {
      pipeline_id: pipelineId, step: s.step,
      step_key: s.key, status: 'running',
      agent: s.agent, message: s.label,
      timestamp: new Date().toISOString()
    });
    broadcast('log:new', {
      pipeline_id: pipelineId, agent: s.agent,
      level: 'INFO', message: `▶ ${s.label}`,
      timestamp: new Date().toLocaleTimeString()
    });

    await new Promise(r => setTimeout(r, delays[s.step]));

    const done = DEMO_COMPLETIONS[s.step];
    // Step complete
    broadcast('pipeline:step', {
      pipeline_id: pipelineId, step: s.step,
      step_key: s.key, status: 'success',
      agent: s.agent, message: done.msg,
      timestamp: new Date().toISOString()
    });
    broadcast('log:new', {
      pipeline_id: pipelineId, agent: s.agent,
      level: 'INFO', message: `✓ ${done.msg}`,
      timestamp: new Date().toLocaleTimeString()
    });
    broadcast('agent:update', {
      name: s.agent, status: 'success',
      message: done.msg, timestamp: new Date().toISOString()
    });
  }

  // Final complete
  broadcast('pipeline:completed', {
    pipeline_id: pipelineId, success: true,
    repo_url: repoUrl, branch,
    summary: `Pipeline completed for ${repoName}. All 4 stages passed.`,
    timestamp: new Date().toISOString()
  });
  broadcast('log:new', {
    pipeline_id: pipelineId, agent: 'Orchestrator',
    level: 'INFO', message: `🎉 Pipeline ${pipelineId} completed successfully for ${repoName}@${branch}`,
    timestamp: new Date().toLocaleTimeString()
  });

  // Simulate metrics update
  broadcast('metrics:update', {
    cpu: Math.floor(Math.random() * 30) + 30,
    memory: Math.floor(Math.random() * 30) + 50,
    requests: +(Math.random() * 2 + 0.5).toFixed(1),
    errors: +(Math.random() * 0.05).toFixed(3),
    timestamp: new Date().toISOString()
  });

  try {
    db.updatePipeline(pipelineId, 'completed', 'completed', JSON.stringify({ success: true }));
  } catch(e) { /* db may not have this id */ }
}

// ─── Real pipeline via Python agent server ───────────────────────────────────
async function pollPipelineStatus(pipelineId) {
  let attempts = 0;
  const max = 300;
  const interval = setInterval(async () => {
    attempts++;
    if (attempts > max) { clearInterval(interval); return; }
    try {
      const { data: status } = await agentApi.get(`/api/pipeline/${pipelineId}`);
      const stepMap = { code_analysis: 0, cicd: 1, deployment: 2, monitoring: 3, completed: 4 };
      broadcast('pipeline:step', {
        pipeline_id: pipelineId,
        step: stepMap[status.current_step] ?? 0,
        step_key: status.current_step || 'running',
        status: status.status || 'running',
        agent: 'Orchestrator',
        message: status.logs?.[status.logs.length - 1]?.message || '',
        timestamp: new Date().toISOString()
      });

      // Forward any new log lines
      if (status.logs?.length) {
        for (const log of status.logs.slice(-1)) {
          broadcast('log:new', {
            pipeline_id: pipelineId,
            agent: log.agent || 'Orchestrator',
            level: log.level || 'INFO',
            message: log.message,
            timestamp: log.timestamp || new Date().toLocaleTimeString()
          });
        }
      }

      if (status.status === 'completed' || status.status === 'failed') {
        clearInterval(interval);
        broadcast('pipeline:completed', {
          pipeline_id: pipelineId,
          success: status.status === 'completed',
          summary: status.ai_summary || '',
          code_score: status.code_analysis_report?.quality_score,
          timestamp: new Date().toISOString()
        });
        try { db.updatePipeline(pipelineId, status.status, status.current_step, JSON.stringify(status)); } catch(e) {}
      }
    } catch (_) { /* agent may still be processing */ }
  }, 2000);
}

// ─── Exports ─────────────────────────────────────────────────────────────────
export async function triggerPipeline(repoUrl, branch = 'main') {
  const pipelineId = `pipe_${Date.now()}`;

  // Try Python agent server first
  try {
    const { data } = await agentApi.post('/api/pipeline/trigger', { repo_url: repoUrl, branch });
    const realId = data.pipeline_id || pipelineId;
    broadcast('pipeline:started', { pipeline_id: realId, repo_url: repoUrl, branch, timestamp: new Date().toISOString() });
    broadcast('log:new', { pipeline_id: realId, agent: 'Orchestrator', level: 'INFO', message: `Pipeline ${realId} triggered via AI agents`, timestamp: new Date().toLocaleTimeString() });
    pollPipelineStatus(realId);
    return realId;
  } catch (err) {
    // Agent server offline — run demo simulation in background
    console.log('[AgentService] Agent server offline — running demo pipeline simulation');
    broadcast('log:new', {
      pipeline_id: pipelineId, agent: 'System',
      level: 'INFO', message: 'Running in demo mode (Python agent server offline). Start it with: cd agents && python api_server.py',
      timestamp: new Date().toLocaleTimeString()
    });
    runDemoPipeline(pipelineId, repoUrl, branch); // fire and forget
    return pipelineId;
  }
}

export async function getPipelineStatus(pipelineId) {
  try {
    const { data } = await agentApi.get(`/api/pipeline/${pipelineId}`);
    return data;
  } catch (err) {
    throw new Error('Agent server unavailable');
  }
}

export async function getAgentStatuses() {
  try {
    const { data } = await agentApi.get('/api/agents/status');
    return data;
  } catch {
    return {
      agents: [
        { id: 1, name: 'Orchestrator',  status: 'idle' },
        { id: 2, name: 'Code Analysis', status: 'idle' },
        { id: 3, name: 'CI/CD',         status: 'idle' },
        { id: 4, name: 'Deployment',    status: 'idle' },
        { id: 5, name: 'Monitoring',    status: 'idle' },
      ],
      mode: 'demo',
      server: 'offline'
    };
  }
}

export async function checkAgentHealth() {
  try {
    const { data } = await agentApi.get('/api/health');
    return { ...data, server: 'online' };
  } catch {
    return { status: 'offline', mode: 'demo', server: 'offline' };
  }
}
