from __future__ import annotations

from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from models import (
    RegistryEntry,
    PaginatedServers,
    SearchResults,
    Issuer,
    RevocationStatus,
    ErrorResponse,
)
from storage import InMemoryStorage
from config import settings

from pathlib import Path
import json

app = FastAPI(
    title="MCP Trust Registry (Reference Implementation)",
    description="Minimal reference registry implementing the MCP Trust Framework (MCPF) API.",
    version="0.1.0",
)

# Allow CORS from anywhere for simplicity in the reference implementation
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

storage = InMemoryStorage()


def _load_example_entry() -> None:
    """
    Try to load the sample registry entry from known locations and add a default issuer.
    """
    base = Path(__file__).resolve()
    candidates = [
        # Repository layout: repo_root/examples/sample-registry-entry.json
        base.parents[2] / "examples" / "sample-registry-entry.json",
        # Docker layout: /app/examples/sample-registry-entry.json (src/ is copied separately)
        base.parents[1] / "examples" / "sample-registry-entry.json",
    ]

    example_path = next((path for path in candidates if path.is_file()), None)

    if example_path is None:
        print("[startup] No example registry entry found in any known location")
    else:
        with example_path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        entry = RegistryEntry(**data)
        storage.upsert_server(entry)
        print(f"[startup] Loaded example registry entry from {example_path}")

    # Add a default issuer for demonstration purposes
    storage.add_issuer(
        Issuer(
            id="did:web:veritrust.vc",
            name="Veritrust",
            documentation=settings.base_url,
        )
    )


@app.on_event("startup")
async def on_startup() -> None:
    _load_example_entry()


# --- API endpoints ---


@app.get(
    "/mcp/servers",
    response_model=PaginatedServers,
    responses={500: {"model": ErrorResponse}},
)
async def list_servers(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
):
    servers = storage.list_servers()
    total = len(servers)

    start = (page - 1) * limit
    end = start + limit
    items = servers[start:end]

    return PaginatedServers(page=page, limit=limit, total=total, items=items)


@app.get(
    "/mcp/servers/{did}",
    response_model=RegistryEntry,
    responses={
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def get_server(did: str):
    entry = storage.get_server(did)
    if not entry:
        raise HTTPException(
            status_code=404,
            detail=ErrorResponse(
                error="not_found",
                message=f"No registry entry found for DID {did}",
            ).model_dump(),
        )
    return entry


@app.get(
    "/mcp/search",
    response_model=SearchResults,
    responses={500: {"model": ErrorResponse}},
)
async def search_servers(
    capability: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    organization: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
):
    results = storage.search_servers(
        capability=capability,
        tag=tag,
        organization=organization,
        country=country,
    )
    return SearchResults(items=results)


@app.post(
    "/mcp/servers",
    response_model=dict,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
async def upsert_server(entry: RegistryEntry):
    # In a real implementation, this would be authenticated and validated further
    storage.upsert_server(entry)
    return {"status": "ok", "did": entry.did}


@app.get(
    "/mcp/issuers",
    response_model=dict,
    responses={500: {"model": ErrorResponse}},
)
async def list_issuers():
    issuers = storage.list_issuers()
    return {"issuers": issuers}


@app.get(
    "/mcp/revocations",
    response_model=RevocationStatus,
    responses={500: {"model": ErrorResponse}},
)
async def list_revocations():
    return storage.list_revocations()
