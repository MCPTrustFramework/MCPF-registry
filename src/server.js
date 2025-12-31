import express from "express";
import pool from "./db.js";
import * as registry from "./registryModel.js";

const app = express();
app.use(express.json());

// Access log
app.use((req, _res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// Ensure schema at boot
async function ensureSchema() {
  const fs = await import("fs/promises");
  const sql = await fs.readFile("./db.sql", "utf8");
  await pool.query(sql);
}
ensureSchema().catch(err => {
  console.error("SCHEMA_INIT_ERROR", err);
  process.exit(1);
});

// Health check
app.get("/health", (_req, res) => res.json({ 
  status: "ok",
  version: process.env.MCPF_REGISTRY_VERSION || "1.0.0-alpha",
  mcpfVersion: "1.0",
  time: new Date().toISOString()
}));

// Registry info
app.get("/mcp", (_req, res) => {
  return res.json({
    name: "MCPF Trust Registry",
    version: process.env.MCPF_REGISTRY_VERSION || "1.0.0-alpha",
    mcpfVersion: "1.0",
    documentation: "https://mcpf.dev/docs/registry",
    endpoints: {
      servers: "/mcp/servers",
      search: "/mcp/search",
      issuers: "/mcp/issuers",
      revocations: "/mcp/revocations"
    }
  });
});

app.get("/mcp/health", (_req, res) => res.json({ 
  status: "ok",
  version: process.env.MCPF_REGISTRY_VERSION || "1.0.0-alpha",
  mcpfVersion: "1.0",
  time: new Date().toISOString()
}));

// List servers with pagination
app.get("/mcp/servers", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "50", 10);
    const data = await registry.listServers(page, limit);
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

// Get server by DID
app.get("/mcp/servers/:did", async (req, res, next) => {
  try {
    const encodedDid = req.params.did;
    const did = decodeURIComponent(encodedDid);

    const entry = await registry.getServerByDid(did);
    if (!entry) {
      return res.status(404).json({ error: "Not found", did });
    }
    return res.json(entry);
  } catch (err) {
    next(err);
  }
});

// Register server
app.post("/mcp/servers", async (req, res, next) => {
  try {
    // TODO: Add authentication (API key / OAuth)
    const body = req.body || {};
    if (!body.did || !body.endpoint || !body.manifest) {
      return res.status(400).json({ 
        error: "did, endpoint, manifest are required" 
      });
    }

    const result = await registry.upsertServer(body);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// Search servers
app.get("/mcp/search", async (req, res, next) => {
  try {
    const filters = {
      capability: req.query.capability,
      tag: req.query.tag,
      organization: req.query.organization,
      country: req.query.country
    };
    const items = await registry.searchServers(filters);
    return res.json({ items });
  } catch (err) {
    next(err);
  }
});

// List trusted issuers
app.get("/mcp/issuers", async (_req, res, next) => {
  try {
    const data = await registry.listIssuers();
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

// Get revocations
app.get("/mcp/revocations", async (_req, res, next) => {
  try {
    const data = await registry.getRevocations();
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("UNCAUGHT", err);
  res.status(500).json({ error: "internal" });
});

// Start server
const port = Number(process.env.PORT || 4002);
const host = "0.0.0.0";
app.listen(port, host, () => 
  console.log(`MCPF Registry listening on http://${host}:${port}`)
);
