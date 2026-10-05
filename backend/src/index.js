import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

// Imports
import { initDb } from './db/database.js';
import { initWebSocket } from './services/websocketService.js';
import { checkAgentHealth } from './services/agentService.js';

// Routers
import webhookRouter from './routes/webhook.js';
import pipelineRouter from './routes/pipeline.js';
import agentsRouter from './routes/agents.js';
import deploymentsRouter from './routes/deployments.js';
import monitoringRouter from './routes/monitoring.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: '*' }));
// Express JSON middleware is attached globally, EXCEPT we need raw body for github webhook.
// So we use it conditionally or it's handled inside the webhook route.
// Actually, it's easier to apply express.json() but skip it for /api/webhook/github.
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook/github') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Initialize Database
console.log('Initializing SQLite database...');
initDb();

// Initialize WebSocket
console.log('Initializing WebSocket server...');
initWebSocket(server);

// Routes
app.use('/api/webhook', webhookRouter);
app.use('/api/pipeline', pipelineRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/deployments', deploymentsRouter);
app.use('/api/monitoring', monitoringRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  
  try {
    console.log('Checking connection to Python Agent Server...');
    const health = await checkAgentHealth();
    console.log('Python Agent Server Health:', health);
  } catch (error) {
    console.error('Warning: Python Agent Server might not be running.', error.message);
  }
});
