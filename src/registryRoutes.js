import express from "express";
import * as registry from "./registryModel.js";

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    return res.json({
      name: "MCPF Trust Registry",
      version: "0.1.0",
      mcpfVersion: "1.0",
      documentation: "https://mcpf.dev/docs/registry",
      endpoints: {
        servers: "/mcp/servers",
        search: "/mcp/search",
        issuers: "/mcp/issuers",
        revocations: "/mcp/revocations"
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get("/health", async (_req, res, next) => {
  try {
    return res.json({
      status: "ok",
      version: process.env.MCPF_REGISTRY_VERSION || "0.1.0",
      mcpfVersion: "1.0",
      time: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

router.get("/servers", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "50", 10);
    const data = await registry.listServers(page, limit);
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/servers/:did", async (req, res, next) => {
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

router.post("/servers", async (req, res, next) => {
  try {
    // TODO: Protect this endpoint (API key / internal admin only).
    const body = req.body || {};
    if (!body.did || !body.endpoint || !body.manifest) {
      return res.status(400).json({ error: "did, endpoint, manifest are required" });
    }

    const result = await registry.upsertServer(body);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/search", async (req, res, next) => {
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

router.get("/issuers", async (_req, res, next) => {
  try {
    const data = await registry.listIssuers();
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/revocations", async (_req, res, next) => {
  try {
    const data = await registry.getRevocations();
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
