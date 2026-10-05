/**
 * AgentOps Demo Application
 * A simple Node.js HTTP server that simulates a real deployed application
 * Exposes /metrics endpoint for Prometheus scraping
 */

const http = require('http');
const os = require('os');

const PORT = process.env.PORT || 8080;
const APP_NAME = process.env.APP_NAME || 'AgentOps Demo App';
const VERSION = process.env.VERSION || '1.0.0';

// Simulated request counters
let requestCount = 0;
let errorCount = 0;
let startTime = Date.now();

const server = http.createServer((req, res) => {
  requestCount++;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      app: APP_NAME,
      version: VERSION,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString()
    }));

  } else if (req.url === '/metrics') {
    // Prometheus text format metrics
    res.setHeader('Content-Type', 'text/plain');
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const cpuUsage = process.cpuUsage();
    const memUsage = process.memoryUsage();

    res.writeHead(200);
    res.end(`
# HELP http_requests_total Total HTTP requests received
# TYPE http_requests_total counter
http_requests_total{app="${APP_NAME}",version="${VERSION}"} ${requestCount}

# HELP http_errors_total Total HTTP errors
# TYPE http_errors_total counter
http_errors_total{app="${APP_NAME}"} ${errorCount}

# HELP app_uptime_seconds Application uptime in seconds
# TYPE app_uptime_seconds gauge
app_uptime_seconds{app="${APP_NAME}"} ${uptime}

# HELP process_heap_bytes Node.js heap memory usage
# TYPE process_heap_bytes gauge
process_heap_bytes{app="${APP_NAME}"} ${memUsage.heapUsed}

# HELP process_rss_bytes Node.js RSS memory
# TYPE process_rss_bytes gauge
process_rss_bytes{app="${APP_NAME}"} ${memUsage.rss}
`.trim());

  } else if (req.url === '/') {
    res.writeHead(200);
    res.end(JSON.stringify({
      app: APP_NAME,
      version: VERSION,
      status: 'running',
      message: '🚀 Deployed and monitored by AgentOps',
      endpoints: ['/health', '/metrics', '/api/data'],
      github: 'https://github.com/garvit1020/AgentOps',
      timestamp: new Date().toISOString()
    }));

  } else if (req.url === '/api/data') {
    res.writeHead(200);
    res.end(JSON.stringify({
      data: Array.from({length: 5}, (_, i) => ({
        id: i + 1,
        value: Math.random() * 100,
        timestamp: new Date().toISOString()
      })),
      total: requestCount
    }));

  } else {
    errorCount++;
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found', path: req.url }));
  }
});

server.listen(PORT, () => {
  console.log(`✅ ${APP_NAME} v${VERSION} running on port ${PORT}`);
  console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);
  console.log(`❤️  Health:  http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
