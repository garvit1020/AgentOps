import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class Config:
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")
    GITHUB_REPO: str = os.getenv("GITHUB_REPO", "garvit1020/AgentOps")
    DOCKER_HOST: str = os.getenv("DOCKER_HOST", "unix:///var/run/docker.sock")
    K8S_NAMESPACE: str = os.getenv("K8S_NAMESPACE", "agentops")
    PROMETHEUS_URL: str = os.getenv("PROMETHEUS_URL", "http://localhost:9090")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:5000")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

config = Config()
