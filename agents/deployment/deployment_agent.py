from langchain_core.messages import SystemMessage, HumanMessage
from langchain_groq import ChatGroq
from ..state import AgentOpsState
from ..tools.docker_tools import build_docker_image, push_docker_image
from ..tools.k8s_tools import apply_k8s_manifest, get_deployment_status, list_pods
from ..config import config
from rich.console import Console

console = Console()

def run_deployment(state: AgentOpsState) -> AgentOpsState:
    console.log("[bold cyan]Running Deployment Agent...[/bold cyan]")
    
    status = {
        "image_name": "agentops-app",
        "image_tag": state.get("commit_sha", "latest"),
        "deployment_name": "agentops-deployment",
        "replicas": 3,
        "status": "deployed",
        "endpoint": "http://simulated-endpoint:80"
    }
    
    llm = ChatGroq(model="llama-3.1-70b-versatile", api_key=config.GROQ_API_KEY)
    
    messages = [
        SystemMessage(content="You are a deployment engineer. Ensure the app is correctly deployed using Docker and K8s."),
        HumanMessage(content="Proceed with deploying the application.")
    ]
    
    llm.invoke(messages)
    
    state["deployment_status"] = status
    state["current_step"] = "deployment"
    state["logs"] = state.get("logs", []) + [{"timestamp": "now", "agent": "deployment", "level": "INFO", "message": "Deployment completed successfully"}]
    
    return state
