from langchain_core.messages import SystemMessage, HumanMessage
from langchain_groq import ChatGroq
from ..state import AgentOpsState
from ..tools.prometheus_tools import query_prometheus, get_cpu_usage, get_memory_usage, get_error_rate, get_request_rate, check_alerts
from ..tools.k8s_tools import get_pod_logs
from ..config import config
from rich.console import Console

console = Console()

def run_monitoring(state: AgentOpsState) -> AgentOpsState:
    console.log("[bold cyan]Running Monitoring Agent...[/bold cyan]")
    
    metrics = {
        "cpu": get_cpu_usage.invoke({"pod_name": "simulated"}),
        "memory": get_memory_usage.invoke({"pod_name": "simulated"}),
        "error_rate": get_error_rate.invoke({"service": "simulated"}),
        "request_rate": get_request_rate.invoke({"service": "simulated"})
    }
    
    is_healthy = metrics["error_rate"] < 0.05
    
    status = {
        "metrics": metrics,
        "alerts": [],
        "is_healthy": is_healthy,
        "issues": ["High CPU usage"] if not is_healthy else [],
        "recovery_suggestion": ""
    }
    
    if not is_healthy:
        llm = ChatGroq(model="llama-3.1-70b-versatile", api_key=config.GROQ_API_KEY)
        messages = [
            SystemMessage(content="You are an SRE. Analyze the metrics and suggest a recovery action."),
            HumanMessage(content=f"Metrics: {metrics}. System is unhealthy.")
        ]
        response = llm.invoke(messages)
        status["recovery_suggestion"] = response.content
    
    state["monitoring_status"] = status
    state["current_step"] = "monitoring"
    state["logs"] = state.get("logs", []) + [{"timestamp": "now", "agent": "monitoring", "level": "INFO" if is_healthy else "WARNING", "message": f"Monitoring checked. Healthy: {is_healthy}"}]
    
    return state
