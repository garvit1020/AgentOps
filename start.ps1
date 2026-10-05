# ============================================================
# AgentOps - One-Click Start Script (Windows PowerShell)
# Run: .\start.ps1
# ============================================================

Write-Host ""
Write-Host "  ██████╗ ██████╗ ███████╗███╗   ██╗████████╗ ██████╗ ██████╗ ███████╗" -ForegroundColor Cyan
Write-Host "  ██╔══██╗██╔════╝╚════██║████╗  ██║╚══██╔══╝██╔═══██╗██╔══██╗██╔════╝" -ForegroundColor Cyan
Write-Host "  ███████║██║  ███╗   ███╔╝██╔██╗ ██║   ██║   ██║   ██║██████╔╝███████╗" -ForegroundColor Cyan
Write-Host "  ██╔══██║██║   ██║  ███╔╝ ██║╚██╗██║   ██║   ██║   ██║██╔═══╝ ╚════██║" -ForegroundColor Cyan
Write-Host "  ██║  ██║╚██████╔╝ ███████╗██║ ╚████║   ██║   ╚██████╔╝██║     ███████║" -ForegroundColor Cyan
Write-Host "  ╚═╝  ╚═╝ ╚═════╝  ╚══════╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚══════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  AI-Powered DevOps Automation Platform" -ForegroundColor White
Write-Host "  UPES B.Tech Project | Groq + LangGraph + React" -ForegroundColor Gray
Write-Host "============================================================" -ForegroundColor DarkGray
Write-Host ""

$rootDir = $PSScriptRoot

# ── Check .env ───────────────────────────────────────────────────────────────
if (-not (Test-Path "$rootDir\.env")) {
    Write-Host "  [WARN] .env file not found! Copying .env.example..." -ForegroundColor Yellow
    Copy-Item "$rootDir\.env.example" "$rootDir\.env"
    Write-Host "  [INFO] Edit .env and add your GROQ_API_KEY before starting." -ForegroundColor Cyan
}

$env_content = Get-Content "$rootDir\.env" -Raw
$groq_set = $env_content -match "GROQ_API_KEY=(?!your_groq)" 

if (-not $groq_set) {
    Write-Host ""
    Write-Host "  ⚠  GROQ_API_KEY not set in .env" -ForegroundColor Yellow
    Write-Host "  ➜  Get a FREE key at: https://console.groq.com" -ForegroundColor Cyan
    Write-Host "  ➜  Running in DEMO MODE (simulated pipeline output)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "  ✓  GROQ_API_KEY detected — Full AI mode enabled" -ForegroundColor Green
    Write-Host ""
}

# ── Start Python Agent Server ─────────────────────────────────────────────────
Write-Host "  [1/3] Starting Python Agent Server (port 8000)..." -ForegroundColor Blue
$agentDir = "$rootDir\agents"

# Install Python deps if needed
if (-not (Test-Path "$agentDir\__installed__")) {
    Write-Host "       Installing Python packages..." -ForegroundColor Gray
    pip install -r "$agentDir\requirements.txt" --quiet
    New-Item -Path "$agentDir\__installed__" -ItemType File -Force | Out-Null
}

$agentProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$agentDir'; python api_server.py" -PassThru
Write-Host "  ✓  Agent Server starting (PID $($agentProcess.Id))" -ForegroundColor Green

Start-Sleep -Seconds 2

# ── Start Node.js Backend ────────────────────────────────────────────────────
Write-Host "  [2/3] Starting Node.js Backend (port 5000)..." -ForegroundColor Blue
$backendDir = "$rootDir\backend"

# Install node deps if needed
if (-not (Test-Path "$backendDir\node_modules")) {
    Write-Host "       Installing Node.js packages..." -ForegroundColor Gray
    Push-Location $backendDir
    npm install --silent
    Pop-Location
}

$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; npm run dev" -PassThru
Write-Host "  ✓  Backend starting (PID $($backendProcess.Id))" -ForegroundColor Green

Start-Sleep -Seconds 2

# ── Start React Frontend ──────────────────────────────────────────────────────
Write-Host "  [3/3] Starting React Frontend (port 3000)..." -ForegroundColor Blue
$frontendDir = "$rootDir\frontend"

if (-not (Test-Path "$frontendDir\node_modules")) {
    Write-Host "       Installing frontend packages..." -ForegroundColor Gray
    Push-Location $frontendDir
    npm install --silent
    Pop-Location
}

$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev" -PassThru
Write-Host "  ✓  Frontend starting (PID $($frontendProcess.Id))" -ForegroundColor Green

Start-Sleep -Seconds 3

# ── Open Browser ──────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================================" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  🚀 AgentOps is RUNNING!" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend    →  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend     →  http://localhost:5000" -ForegroundColor Cyan
Write-Host "  Agent API   →  http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📋 Getting Started:" -ForegroundColor White
Write-Host "     1. Open http://localhost:3000" -ForegroundColor Gray
Write-Host "     2. Click 'Get Started' or 'Sign In'" -ForegroundColor Gray
Write-Host "     3. Use any email + password to log in" -ForegroundColor Gray
Write-Host "     4. Paste your GitHub repo URL and click 'Launch Pipeline'" -ForegroundColor Gray
Write-Host ""
Write-Host "  Press Ctrl+C in each terminal window to stop." -ForegroundColor DarkGray
Write-Host ""

Start-Process "http://localhost:3000"
