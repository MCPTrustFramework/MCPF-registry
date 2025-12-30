# MCP Trust Registry – Reference Implementation (FastAPI)

This is a minimal reference implementation of an **MCP Trust Registry** compatible with the **MCP Trust Framework (MCPF)**.

It provides:

- A simple in-memory registry of MCP servers
- HTTP API as specified in `specs/registry-api.md`
- Preloaded example entry from `examples/sample-registry-entry.json`

> ⚠️ This implementation is **for demonstration and testing**. It does **not** implement authentication, cryptographic verification, or persistent storage.

---

## 1. Requirements

- Python 3.10 or newer
- `pip` (or a compatible installer such as `uv` / `pipx`)
- Optionally Docker & docker-compose

---

## 2. Install and Run (Directly with Python)

From the repository root:

```bash
cd registry-reference-implementation

# (Optional) create and activate a virtualenv
python -m venv .venv
source .venv/bin/activate  # on Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the service
cd src
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

The registry will be available at `http://localhost:8080`.

Key endpoints:

- `GET /mcp/servers`
- `GET /mcp/servers/{did}`
- `GET /mcp/search`
- `POST /mcp/servers`
- `GET /mcp/issuers`
- `GET /mcp/revocations`

---

## 3. Install and Run with Docker

From the repository root:

```bash
cd registry-reference-implementation
docker-compose up --build
```

The registry will listen on `http://localhost:8080`.

---

## 4. Example Calls

List servers:

```bash
curl http://localhost:8080/mcp/servers
```

Get one server by DID:

```bash
curl "http://localhost:8080/mcp/servers/did:web:veritrust.vc:mcp:edgeguard-siem"
```

Search by capability:

```bash
curl "http://localhost:8080/mcp/search?capability=telemetry"
```

Register a new server:

```bash
curl -X POST http://localhost:8080/mcp/servers \
  -H "Content-Type: application/json" \
  -d @../examples/sample-registry-entry.json
```

---

## 5. Notes

- Storage is in-memory only; restarting the service will reset the data.
- On startup, the registry will attempt to load `../examples/sample-registry-entry.json` if present (and the same file in Docker at `/app/examples/`).
- Authentication and cryptographic verification are intentionally out-of-scope for this MVP.
