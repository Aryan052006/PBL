"""Helper to look up a domain by name from the knowledge base."""
import json
import os

_cache = None

def get_domain_by_name(name: str) -> dict:
    global _cache
    if _cache is None:
        path = os.path.join(os.path.dirname(__file__), "domain_knowledge.json")
        with open(path, encoding="utf-8") as f:
            _cache = json.load(f)
    return next((d for d in _cache if d["domain"].lower() == name.lower()), {})
