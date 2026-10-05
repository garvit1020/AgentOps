import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', '..', 'agentops.db');

const db = new Database(dbPath, { verbose: console.log });

export const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS pipeline_runs (
      id TEXT PRIMARY KEY,
      pipeline_id TEXT,
      repo_url TEXT,
      branch TEXT,
      status TEXT,
      current_step TEXT,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      result_json TEXT
    );
    
    CREATE TABLE IF NOT EXISTS agent_logs (
      id TEXT PRIMARY KEY,
      pipeline_id TEXT,
      agent_name TEXT,
      level TEXT,
      message TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS deployments (
      id TEXT PRIMARY KEY,
      pipeline_id TEXT,
      image_name TEXT,
      image_tag TEXT,
      status TEXT,
      deployment_name TEXT,
      endpoint TEXT,
      deployed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      pipeline_id TEXT,
      severity TEXT,
      message TEXT,
      suggestion TEXT,
      is_resolved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const insertPipeline = (id, pipeline_id, repo_url, branch) => {
  const stmt = db.prepare('INSERT INTO pipeline_runs (id, pipeline_id, repo_url, branch, status) VALUES (?, ?, ?, ?, ?)');
  return stmt.run(id, pipeline_id, repo_url, branch, 'pending');
};

export const updatePipeline = (pipeline_id, status, current_step, result_json) => {
  const completedAt = (status === 'completed' || status === 'failed') ? new Date().toISOString() : null;
  if (completedAt) {
    const stmt = db.prepare('UPDATE pipeline_runs SET status = ?, current_step = ?, result_json = ?, completed_at = ? WHERE pipeline_id = ?');
    return stmt.run(status, current_step, result_json, completedAt, pipeline_id);
  }
  const stmt = db.prepare('UPDATE pipeline_runs SET status = ?, current_step = ?, result_json = ? WHERE pipeline_id = ?');
  return stmt.run(status, current_step, result_json, pipeline_id);
};

export const getPipelineHistory = (limit = 50, offset = 0) => {
  return db.prepare('SELECT * FROM pipeline_runs ORDER BY started_at DESC LIMIT ? OFFSET ?').all(limit, offset);
};

export const getPipelineById = (id) => {
  return db.prepare('SELECT * FROM pipeline_runs WHERE pipeline_id = ?').get(id);
};

export const getCurrentPipeline = () => {
  return db.prepare('SELECT * FROM pipeline_runs ORDER BY started_at DESC LIMIT 1').get();
};

export const deletePipeline = (id) => {
  return db.prepare('DELETE FROM pipeline_runs WHERE pipeline_id = ?').run(id);
};

export const insertLog = (id, pipeline_id, agent_name, level, message) => {
  const stmt = db.prepare('INSERT INTO agent_logs (id, pipeline_id, agent_name, level, message) VALUES (?, ?, ?, ?, ?)');
  return stmt.run(id, pipeline_id, agent_name, level, message);
};

export const getLogsByPipeline = (pipeline_id) => {
  return db.prepare('SELECT * FROM agent_logs WHERE pipeline_id = ? ORDER BY timestamp ASC').all(pipeline_id);
};

export const getRecentLogs = (limit = 100) => {
  return db.prepare('SELECT * FROM agent_logs ORDER BY timestamp DESC LIMIT ?').all(limit);
};

export const insertDeployment = (id, pipeline_id, image_name, image_tag, status, deployment_name, endpoint) => {
  const stmt = db.prepare('INSERT INTO deployments (id, pipeline_id, image_name, image_tag, status, deployment_name, endpoint) VALUES (?, ?, ?, ?, ?, ?, ?)');
  return stmt.run(id, pipeline_id, image_name, image_tag, status, deployment_name, endpoint);
};

export const getDeployments = () => {
  return db.prepare('SELECT * FROM deployments ORDER BY deployed_at DESC').all();
};

export const getDeploymentById = (id) => {
  return db.prepare('SELECT * FROM deployments WHERE id = ?').get(id);
};

export const getCurrentDeployment = () => {
  return db.prepare('SELECT * FROM deployments ORDER BY deployed_at DESC LIMIT 1').get();
};

export const insertAlert = (id, pipeline_id, severity, message, suggestion) => {
  const stmt = db.prepare('INSERT INTO alerts (id, pipeline_id, severity, message, suggestion) VALUES (?, ?, ?, ?, ?)');
  return stmt.run(id, pipeline_id, severity, message, suggestion);
};

export const getActiveAlerts = () => {
  return db.prepare('SELECT * FROM alerts WHERE is_resolved = 0 ORDER BY created_at DESC').all();
};

export const resolveAlert = (id) => {
  return db.prepare('UPDATE alerts SET is_resolved = 1 WHERE id = ?').run(id);
};

export default db;
