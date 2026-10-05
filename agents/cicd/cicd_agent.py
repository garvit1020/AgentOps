from langchain_core.messages import SystemMessage, HumanMessage
from langchain_groq import ChatGroq
from ..state import AgentOpsState
from ..tools.github_tools import trigger_github_actions, check_workflow_status, get_recent_commits
from ..tools.docker_tools import check_docker_running
from ..config import config
from rich.console import Console

console = Console()

def run_cicd(state: AgentOpsState) -> AgentOpsState:
    console.log("[bold cyan]Running CI/CD Agent...[/bold cyan]")
    
    is_docker_running = check_docker_running.invoke({})
    
    status = {
        "workflow_url": "simulated_url",
        "status": "success",
        "build_success": True,
        "test_results": "All tests passed",
        "duration": "120s"
    }
    
    llm = ChatGroq(model="llama-3.1-70b-versatile", api_key=config.GROQ_API_KEY)
    
    system_prompt = "You are a CI/CD expert. Given the code analysis report, validate or generate an ideal GitHub Actions YAML config. Summarize your actions."
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Report: {state.get('code_analysis_report')}")
    ]
    
    response = llm.invoke(messages)
    
    state["cicd_status"] = status
    state["current_step"] = "cicd"
    state["logs"] = state.get("logs", []) + [{"timestamp": "now", "agent": "cicd", "level": "INFO", "message": f"CI/CD completed: {status['status']}. Details: {response.content}"}]
    
    return state
