import json
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_groq import ChatGroq
from ..state import AgentOpsState
from ..tools.github_tools import list_repo_files, fetch_file_contents, fetch_repo_info, get_recent_commits
from ..config import config
from rich.console import Console

console = Console()

def run_code_analysis(state: AgentOpsState) -> AgentOpsState:
    console.log("[bold cyan]Running Code Analysis Agent...[/bold cyan]")
    
    llm = ChatGroq(model="llama-3.1-70b-versatile", api_key=config.GROQ_API_KEY)
    tools = [list_repo_files, fetch_file_contents, fetch_repo_info, get_recent_commits]
    llm_with_tools = llm.bind_tools(tools)
    
    system_prompt = """You are an expert code reviewer analyzing Python/Node.js/React code for quality, security, and dependencies.
    You will analyze the repository and output a JSON report with:
    {
        "quality_score": <int 0-100>,
        "issues": [<list of strings>],
        "dependencies": [<list of strings>],
        "security_vulnerabilities": [<list of strings>],
        "recommendations": [<list of strings>],
        "dockerfile_suggestion": <string>,
        "summary": <string>
    }
    Respond ONLY with valid JSON.
    """
    
    repo_url = state.get("repo_url", "https://github.com/garvit1020/AgentOps.git")
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"Please analyze the repository {repo_url} and provide the JSON report.")
    ]
    
    response = llm.invoke(messages)
    
    report = {
        "quality_score": 85,
        "issues": [],
        "dependencies": [],
        "security_vulnerabilities": [],
        "recommendations": [],
        "dockerfile_suggestion": "",
        "summary": "Analysis completed."
    }
    
    try:
        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        report = json.loads(content)
    except Exception as e:
        console.log(f"[bold red]Failed to parse LLM response as JSON: {e}[/bold red]")
        report["summary"] = f"Failed to parse report: {response.content}"
    
    state["code_analysis_report"] = report
    state["current_step"] = "code_analysis"
    state["logs"] = state.get("logs", []) + [{"timestamp": "now", "agent": "code_analysis", "level": "INFO", "message": "Code analysis completed"}]
    
    return state
