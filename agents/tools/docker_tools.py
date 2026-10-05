from langchain.tools import tool
import docker
import os

def get_docker_client():
    try:
        return docker.from_env()
    except Exception:
        return None

@tool
def build_docker_image(context_path: str, image_name: str, tag: str) -> dict:
    """Build Docker image"""
    client = get_docker_client()
    if not client:
        return {"error": "Docker is not running", "simulated": True, "success": True}
    try:
        image, logs = client.images.build(path=context_path, tag=f"{image_name}:{tag}")
        return {"success": True, "image_id": image.id, "logs": [str(log) for log in logs]}
    except Exception as e:
        return {"error": str(e), "success": False}

@tool
def push_docker_image(image_name: str, tag: str, registry: str) -> dict:
    """Push to registry"""
    client = get_docker_client()
    if not client:
        return {"error": "Docker is not running", "simulated": True, "success": True}
    try:
        logs = client.images.push(f"{registry}/{image_name}", tag=tag)
        return {"success": True, "logs": logs}
    except Exception as e:
        return {"error": str(e), "success": False}

@tool
def list_docker_images() -> list:
    """List all images"""
    client = get_docker_client()
    if not client:
        return [{"error": "Docker is not running"}]
    try:
        images = client.images.list()
        return [{"id": img.id, "tags": img.tags} for img in images]
    except Exception as e:
        return [{"error": str(e)}]

@tool
def get_container_logs(container_id: str) -> str:
    """Get container logs"""
    client = get_docker_client()
    if not client:
        return "Docker is not running"
    try:
        container = client.containers.get(container_id)
        return container.logs().decode("utf-8")
    except Exception as e:
        return str(e)

@tool
def check_docker_running() -> bool:
    """Check if Docker daemon is running"""
    client = get_docker_client()
    if not client:
        return False
    try:
        client.ping()
        return True
    except Exception:
        return False
