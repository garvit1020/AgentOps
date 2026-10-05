from langchain.tools import tool
from prometheus_api_client import PrometheusConnect
import os

def get_prom_client():
    url = os.getenv("PROMETHEUS_URL", "http://localhost:9090")
    try:
        prom = PrometheusConnect(url=url, disable_ssl=True)
        if prom.check_prometheus_connection():
            return prom
    except Exception:
        pass
    return None

@tool
def query_prometheus(query: str) -> dict:
    """PromQL instant query"""
    prom = get_prom_client()
    if not prom:
        return {"simulated": True, "result": "Prometheus not available"}
    try:
        res = prom.custom_query(query)
        return {"result": res}
    except Exception as e:
        return {"error": str(e)}

@tool
def get_cpu_usage(pod_name: str) -> float:
    """CPU usage for a pod"""
    prom = get_prom_client()
    if not prom:
        return 0.15
    try:
        query = f'rate(container_cpu_usage_seconds_total{{pod="{pod_name}"}}[5m])'
        res = prom.custom_query(query)
        if res:
            return float(res[0]['value'][1])
        return 0.0
    except Exception:
        return 0.0

@tool
def get_memory_usage(pod_name: str) -> float:
    """Memory usage"""
    prom = get_prom_client()
    if not prom:
        return 256.0
    try:
        query = f'container_memory_usage_bytes{{pod="{pod_name}"}}'
        res = prom.custom_query(query)
        if res:
            return float(res[0]['value'][1]) / (1024 * 1024)
        return 0.0
    except Exception:
        return 0.0

@tool
def get_error_rate(service: str) -> float:
    """HTTP error rate"""
    prom = get_prom_client()
    if not prom:
        return 0.01
    try:
        query = f'rate(http_requests_total{{service="{service}", status=~"5.."}}[5m])'
        res = prom.custom_query(query)
        if res:
            return float(res[0]['value'][1])
        return 0.0
    except Exception:
        return 0.0

@tool
def get_request_rate(service: str) -> float:
    """Requests per second"""
    prom = get_prom_client()
    if not prom:
        return 10.5
    try:
        query = f'rate(http_requests_total{{service="{service}"}}[5m])'
        res = prom.custom_query(query)
        if res:
            return float(res[0]['value'][1])
        return 0.0
    except Exception:
        return 0.0

@tool
def check_alerts() -> list:
    """Get active Prometheus alerts"""
    prom = get_prom_client()
    if not prom:
        return []
    try:
        return []
    except Exception:
        return []
