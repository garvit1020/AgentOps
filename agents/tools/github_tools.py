from langchain.tools import tool
import os
from github import Github
from github import Auth

def get_github_client():
    token = os.getenv("GITHUB_TOKEN", "")
    if not token:
        return Github()
    auth = Auth.Token(token)
    return Github(auth=auth)

@tool
def fetch_repo_info(repo_url: str) -> dict:
    """Get repo metadata using PyGithub"""
    try:
        g = get_github_client()
        repo_name = repo_url.replace("https://github.com/", "").replace(".git", "")
        repo = g.get_repo(repo_name)
        return {
            "name": repo.name,
            "description": repo.description,
            "stars": repo.stargazers_count,
            "language": repo.language,
            "topics": repo.get_topics()
        }
    except Exception as e:
        return {"error": str(e)}

@tool
def fetch_file_contents(repo_url: str, file_path: str) -> str:
    """Get file content from GitHub"""
    try:
        g = get_github_client()
        repo_name = repo_url.replace("https://github.com/", "").replace(".git", "")
        repo = g.get_repo(repo_name)
        contents = repo.get_contents(file_path)
        return contents.decoded_content.decode('utf-8')
    except Exception as e:
        return f"Error: {str(e)}"

@tool
def list_repo_files(repo_url: str) -> list:
    """List all files in the repo"""
    try:
        g = get_github_client()
        repo_name = repo_url.replace("https://github.com/", "").replace(".git", "")
        repo = g.get_repo(repo_name)
        contents = repo.get_contents("")
        files = []
        while contents:
            file_content = contents.pop(0)
            if file_content.type == "dir":
                contents.extend(repo.get_contents(file_content.path))
            else:
                files.append(file_content.path)
        return files
    except Exception as e:
        return [f"Error: {str(e)}"]

@tool
def get_recent_commits(repo_url: str, count: int = 5) -> list:
    """Get recent commits"""
    try:
        g = get_github_client()
        repo_name = repo_url.replace("https://github.com/", "").replace(".git", "")
        repo = g.get_repo(repo_name)
        commits = repo.get_commits()
        recent = []
        for i, commit in enumerate(commits):
            if i >= count:
                break
            recent.append({
                "sha": commit.sha,
                "message": commit.commit.message,
                "author": commit.commit.author.name,
                "date": str(commit.commit.author.date)
            })
        return recent
    except Exception as e:
        return [{"error": str(e)}]

@tool
def trigger_github_actions(repo_url: str, workflow_file: str, branch: str) -> dict:
    """Trigger a workflow"""
    try:
        g = get_github_client()
        repo_name = repo_url.replace("https://github.com/", "").replace(".git", "")
        repo = g.get_repo(repo_name)
        workflow = repo.get_workflow(workflow_file)
        success = workflow.create_dispatch(branch)
        return {"success": success, "message": f"Triggered workflow {workflow_file} on branch {branch}"}
    except Exception as e:
        return {"error": str(e)}

@tool
def check_workflow_status(repo_url: str, run_id: int) -> dict:
    """Check workflow run status"""
    try:
        g = get_github_client()
        repo_name = repo_url.replace("https://github.com/", "").replace(".git", "")
        repo = g.get_repo(repo_name)
        workflow_run = repo.get_workflow_run(run_id)
        return {
            "status": workflow_run.status,
            "conclusion": workflow_run.conclusion,
            "url": workflow_run.html_url
        }
    except Exception as e:
        return {"error": str(e)}
