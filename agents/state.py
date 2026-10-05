import operator
from typing import TypedDict, Annotated, Literal, List, Dict, Any

def add_messages(left: list, right: list) -> list:
    return left + right

class AgentOpsState(TypedDict):
    repo_url: str
    branch: str
    commit_sha: str
    pipeline_id: str
    code_analysis_report: Dict[str, Any]
    cicd_status: Dict[str, Any]
    deployment_status: Dict[str, Any]
    monitoring_status: Dict[str, Any]
    current_step: Literal['idle', 'code_analysis', 'cicd', 'deployment', 'monitoring', 'recovery', 'completed', 'failed']
    errors: List[str]
    messages: Annotated[list, add_messages]
    retry_count: int
    is_failed: bool
    recovery_suggestion: str
    logs: List[Dict[str, Any]]
