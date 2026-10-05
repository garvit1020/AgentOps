# 🤖 AgentOps — Intelligent DevOps Automation with Agentic AI

> AI-powered DevOps platform that automates the complete software delivery lifecycle using five specialized LangGraph agents.

[![GitHub](https://img.shields.io/badge/GitHub-garvit1020%2FAgentOps-blue?logo=github)](https://github.com/garvit1020/AgentOps)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=nodedotjs)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2-purple)](https://langchain-ai.github.io/langgraph/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)](https://docker.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-ready-blue?logo=kubernetes)](https://kubernetes.io)

---

## 📋 Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [AI Agents](#ai-agents)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Usage](#usage)
- [Monitoring](#monitoring)
- [Deployment (AWS)](#deployment-aws)

---

## Overview

AgentOps is an AI-driven DevOps automation system that connects the complete software delivery lifecycle. The system accepts source code from a GitHub repository and uses **five specialized AI agents** to analyze, build, test, deploy, and monitor the application — automatically detecting and recovering from failures.

### Workflow
```
Developer pushes code to GitHub
         ↓
Orchestrator Agent detects push
         ↓
Code Analysis Agent → reviews code, dependencies, security
         ↓
CI/CD Agent → triggers GitHub Actions, builds & tests
         ↓
Deployment Agent → builds Docker image, deploys to Kubernetes
         ↓
Monitoring Agent → watches Prometheus/Grafana metrics
         ↓
(if failure detected) AI-based fix → Redeployment
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                React.js Dashboard (Port 3000)                │
│         Real-time pipeline, agents, metrics, logs            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP + WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│              Node.js + Express Backend (Port 5000)           │
│     REST API │ Socket.io │ SQLite │ GitHub Webhook           │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
┌──────────────────────────▼──────────────────────────────────┐
│           Python FastAPI — AI Agents (Port 8000)             │
│                                                              │
│  Orchestrator → Code Analysis → CI/CD → Deploy → Monitor    │
│            (LangGraph StateGraph + Groq LLM)                 │
└───────┬──────────────┬───────────────┬──────────────────────┘
        │              │               │
   GitHub API     Docker/K8s      Prometheus
   Actions        Manifests       Grafana/Loki
```

---

## AI Agents

| Agent | Responsibility | Weight |
|-------|---------------|--------|
| 🧠 **Orchestrator** | Coordinates all agents, manages the LangGraph workflow | 20% |
| 🔍 **Code Analysis** | Analyzes code quality, security, dependencies using LLM | 20% |
| 🔁 **CI/CD** | Triggers GitHub Actions, monitors build & test pipeline | 25% |
| 🐳 **Deployment** | Builds Docker image, pushes to registry, deploys to K8s | 20% |
| 📊 **Monitoring & Recovery** | Watches Prometheus metrics, detects failures, AI-based fixes | 15% |

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React.js 18, Vite, Recharts, Framer Motion, Socket.io-client |
| **Backend** | Node.js 20, Express.js, Socket.io, SQLite |
| **AI/ML** | Python 3.11, LangGraph, LangChain, Groq API (Llama 3.1 70B) |
| **CI/CD** | GitHub Actions (3 workflows: CI, Build, Deploy) |
| **Containers** | Docker, Docker Compose |
| **Orchestration** | Kubernetes (K8s manifests + Helm-ready) |
| **Cloud** | AWS EKS, ECR, VPC (Terraform) |
| **Monitoring** | Prometheus, Grafana, Loki, Promtail |
| **IaC** | Terraform (AWS provider) |

---

## Quick Start

### Prerequisites
- Docker Desktop installed
- Node.js 20+ installed
- Python 3.11+ installed
- Free Groq API key from [console.groq.com](https://console.groq.com)
- GitHub Personal Access Token

### 1. Clone & Setup
```bash
git clone https://github.com/garvit1020/AgentOps.git
cd AgentOps

# Copy environment file
cp .env.example .env
# Edit .env with your GROQ_API_KEY and GITHUB_TOKEN
```

### 2. Option A — Run with Docker Compose (Recommended)
```bash
# Start all services (frontend, backend, agents, prometheus, grafana, loki)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

**Services will be available at:**
| Service | URL |
|---------|-----|
| 🖥️ Dashboard | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:5000 |
| 🤖 Agent API | http://localhost:8000 |
| 📊 Grafana | http://localhost:3001 (admin/agentops123) |
| 🔥 Prometheus | http://localhost:9090 |

### 3. Option B — Run Services Locally

**Terminal 1 — Python Agents:**
```bash
cd agents
pip install -r requirements.txt
uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Node.js Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 3 — React Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Terminal 4 — Monitoring Stack (optional):**
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

---

## Project Structure

```
agentops/
├── 📁 agents/                    # Python AI Agents (LangGraph)
│   ├── api_server.py             # FastAPI server
│   ├── config.py                 # Configuration
│   ├── state.py                  # LangGraph state definition
│   ├── orchestrator/             # Main orchestrator agent
│   ├── code_analysis/            # Code review agent
│   ├── cicd/                     # CI/CD agent
│   ├── deployment/               # Docker + K8s agent
│   ├── monitoring/               # Prometheus monitoring agent
│   └── tools/                    # LangChain tools
│
├── 📁 backend/                   # Node.js + Express API
│   └── src/
│       ├── index.js              # Main server
│       ├── routes/               # API endpoints
│       ├── services/             # WebSocket, GitHub, Agent comm
│       └── db/                   # SQLite database
│
├── 📁 frontend/                  # React.js Dashboard
│   └── src/
│       ├── pages/                # Dashboard, Pipeline, Agents, etc.
│       ├── components/           # Reusable UI components
│       └── services/             # API + WebSocket clients
│
├── 📁 infrastructure/
│   ├── docker/                   # Demo app + Dockerfile
│   ├── kubernetes/               # K8s manifests
│   └── terraform/                # AWS IaC (EKS, ECR, VPC)
│
├── 📁 monitoring/
│   ├── prometheus/               # prometheus.yml
│   ├── grafana/                  # Dashboards + provisioning
│   └── loki/                     # Log aggregation
│
├── 📁 .github/workflows/
│   ├── ci.yml                    # Code analysis & tests
│   ├── build-push.yml            # Docker build & push
│   └── deploy.yml                # Kubernetes deploy
│
├── docker-compose.yml            # Full local stack
└── .env.example                  # Environment template
```

---

## Configuration

Copy `.env.example` to `.env` and configure:

```env
# Required
GROQ_API_KEY=your_groq_key_from_console.groq.com
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_REPO=garvit1020/AgentOps

# For Docker Hub (CI/CD)
DOCKERHUB_USERNAME=your_username
DOCKERHUB_PASSWORD=your_password

# Demo mode (no real Docker/K8s needed for testing)
DEMO_MODE=true
```

### GitHub Secrets (for CI/CD workflows)
Add these in your GitHub repo → Settings → Secrets:
- `GROQ_API_KEY`
- `GITHUB_TOKEN`
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_PASSWORD`
- `AGENTOPS_WEBHOOK_URL` (your deployed backend URL)
- `AWS_ACCESS_KEY_ID` (for production)
- `AWS_SECRET_ACCESS_KEY` (for production)

---

## Usage

### Trigger a Pipeline

**Option 1 — Dashboard Button:**
Visit http://localhost:3000 → Click "▶ Trigger Pipeline"

**Option 2 — API:**
```bash
curl -X POST http://localhost:5000/api/pipeline/trigger \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/garvit1020/AgentOps", "branch": "main"}'
```

**Option 3 — GitHub Webhook:**
Configure GitHub webhook → `http://your-server/api/webhook/github`

### Watch Real-Time Progress
The dashboard shows live updates as each agent runs:
1. 🔍 Code Analysis (LLM analyzes repo)
2. 🔁 CI/CD Pipeline (GitHub Actions)
3. 🐳 Docker Build & Push
4. ☸️ Kubernetes Deployment
5. 📊 Monitoring active
6. 🔄 Auto-recovery if failure detected

---

## Monitoring

| Tool | URL | Purpose |
|------|-----|---------|
| Grafana | http://localhost:3001 | Dashboards (admin/agentops123) |
| Prometheus | http://localhost:9090 | Metrics & queries |
| Loki | http://localhost:3100 | Log aggregation |
| Demo App | http://localhost:8080 | Deployed test app |
| Demo Metrics | http://localhost:8080/metrics | Prometheus metrics |

---

## Deployment (AWS)

### Prerequisites
- Terraform installed
- AWS CLI configured

```bash
cd infrastructure/terraform

# Initialize
terraform init

# Plan
terraform plan -var="aws_access_key=KEY" -var="aws_secret_key=SECRET"

# Apply (creates EKS, ECR, VPC)
terraform apply

# Configure kubectl
aws eks update-kubeconfig --region us-east-1 --name agentops-cluster

# Deploy to K8s
kubectl apply -f ../kubernetes/
```

---

## University Project

**Institution**: UPES — University of Petroleum and Energy Studies  
**Program**: B.Tech Computer Science Engineering  
**Project**: AgentOps: Intelligent DevOps Automation using Agentic AI  
**Mentor**: Amit Khandelwal  

---

*Built with ❤️ using LangGraph, LangChain, Groq, React, Node.js, Docker, Kubernetes, and Terraform*
