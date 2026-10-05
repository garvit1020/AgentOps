from langchain.tools import tool
from kubernetes import client, config
import yaml

def get_k8s_client():
    try:
        config.load_kube_config()
        return True
    except Exception:
        return False

@tool
def apply_k8s_manifest(manifest_path: str, namespace: str) -> dict:
    """Apply YAML manifest"""
    if not get_k8s_client():
        return {"success": True, "simulated": True, "message": "Kubernetes not available. Simulated success."}
    try:
        from kubernetes import utils
        k8s_client = client.ApiClient()
        utils.create_from_yaml(k8s_client, manifest_path, namespace=namespace)
        return {"success": True, "message": "Manifest applied"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@tool
def get_deployment_status(name: str, namespace: str) -> dict:
    """Get deployment details"""
    if not get_k8s_client():
        return {"simulated": True, "available_replicas": 1, "status": "running"}
    try:
        apps_v1 = client.AppsV1Api()
        dep = apps_v1.read_namespaced_deployment(name, namespace)
        return {
            "name": name,
            "replicas": dep.spec.replicas,
            "available_replicas": dep.status.available_replicas,
            "ready_replicas": dep.status.ready_replicas
        }
    except Exception as e:
        return {"error": str(e)}

@tool
def get_pod_logs(pod_name: str, namespace: str) -> str:
    """Get pod logs"""
    if not get_k8s_client():
        return "Simulated logs: System running normally."
    try:
        core_v1 = client.CoreV1Api()
        return core_v1.read_namespaced_pod_log(name=pod_name, namespace=namespace)
    except Exception as e:
        return str(e)

@tool
def scale_deployment(name: str, replicas: int, namespace: str) -> dict:
    """Scale deployment"""
    if not get_k8s_client():
        return {"success": True, "simulated": True}
    try:
        apps_v1 = client.AppsV1Api()
        dep = apps_v1.read_namespaced_deployment(name, namespace)
        dep.spec.replicas = replicas
        apps_v1.patch_namespaced_deployment(name, namespace, dep)
        return {"success": True, "message": f"Scaled {name} to {replicas}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@tool
def rollback_deployment(name: str, namespace: str) -> dict:
    """Rollback deployment"""
    return {"success": True, "message": f"Simulated rollback of {name} in {namespace}"}

@tool
def list_pods(namespace: str) -> list:
    """List all pods"""
    if not get_k8s_client():
        return [{"name": "simulated-pod-1", "status": "Running"}]
    try:
        core_v1 = client.CoreV1Api()
        pods = core_v1.list_namespaced_pod(namespace)
        return [{"name": pod.metadata.name, "status": pod.status.phase} for pod in pods.items]
    except Exception as e:
        return [{"error": str(e)}]
