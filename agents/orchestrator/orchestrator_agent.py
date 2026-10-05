from langgraph.graph import StateGraph, END
from ..state import AgentOpsState
from ..code_analysis.code_analysis_agent import run_code_analysis
from ..cicd.cicd_agent import run_cicd
from ..deployment.deployment_agent import run_deployment
from ..monitoring.monitoring_agent import run_monitoring
from rich.console import Console
import asyncio

console = Console()

class OrchestratorAgent:
    def __init__(self):
        self.graph = self._build_graph()
    
    def _build_graph(self):
        workflow = StateGraph(AgentOpsState)
        
        workflow.add_node("code_analysis", run_code_analysis)
        workflow.add_node("cicd", run_cicd)
        workflow.add_node("deployment", run_deployment)
        workflow.add_node("monitoring", run_monitoring)
        workflow.add_node("recovery", self.recovery_node)
        workflow.add_node("error_handler", self.error_handler_node)
        
        workflow.set_entry_point("code_analysis")
        
        workflow.add_edge("code_analysis", "cicd")
        workflow.add_edge("cicd", "deployment")
        workflow.add_edge("deployment", "monitoring")
        
        workflow.add_conditional_edges(
            "monitoring",
            self.should_retry,
            {
                "end": END,
                "retry": "recovery",
                "error": "error_handler"
            }
        )
        
        workflow.add_edge("recovery", "deployment")
        workflow.add_edge("error_handler", END)
        
        return workflow.compile()
    
    def recovery_node(self, state: AgentOpsState) -> AgentOpsState:
        console.log("[bold yellow]Running Recovery Node...[/bold yellow]")
        state["retry_count"] = state.get("retry_count", 0) + 1
        state["current_step"] = "recovery"
        state["logs"].append({"timestamp": "now", "agent": "recovery", "level": "WARNING", "message": f"Retrying deployment (Attempt {state['retry_count']})"})
        return state

    def error_handler_node(self, state: AgentOpsState) -> AgentOpsState:
        console.log("[bold red]Pipeline Failed: Max Retries Exceeded[/bold red]")
        state["is_failed"] = True
        state["current_step"] = "failed"
        state["logs"].append({"timestamp": "now", "agent": "error_handler", "level": "ERROR", "message": "Pipeline failed permanently."})
        return state
    
    def should_retry(self, state: AgentOpsState) -> str:
        mon_status = state.get("monitoring_status", {})
        if mon_status.get("is_healthy", True):
            return "end"
        
        retries = state.get("retry_count", 0)
        if retries < 3:
            return "retry"
        else:
            return "error"
    
    async def run_pipeline(self, repo_url: str, branch: str = 'main') -> AgentOpsState:
        initial_state = {
            "repo_url": repo_url,
            "branch": branch,
            "commit_sha": "latest",
            "pipeline_id": "run-001",
            "code_analysis_report": {},
            "cicd_status": {},
            "deployment_status": {},
            "monitoring_status": {},
            "current_step": "idle",
            "errors": [],
            "messages": [],
            "retry_count": 0,
            "is_failed": False,
            "recovery_suggestion": "",
            "logs": []
        }
        
        final_state = await self.graph.ainvoke(initial_state)
        return final_state
