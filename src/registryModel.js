// Simple MCP registry data access layer.
// Adjust DB import / query helpers to match existing project.

import pool from "../db.js";

function normalizeJsonField(value, fallback) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return fallback;
  try {
    return JSON.parse(value);
  } catch (_err) {
    return fallback;
  }
}

function rowToRegistryEntry(row) {
  return {
    did: row.did,
    endpoint: row.endpoint,
    manifest: row.manifest,
    credentials: normalizeJsonField(row.credentials, []),
    metadata: {
      capabilities: normalizeJsonField(row.meta_capabilities, []),
      organization: row.meta_organization || null,
      country: row.meta_country || null,
      tags: normalizeJsonField(row.meta_tags, []),
      status: row.meta_status || "active"
    }
  };
}

export async function listServers(page = 1, limit = 50) {
  const offset = (page - 1) * limit;

  const [{ rows }, countResult] = await Promise.all([
    pool.query(
      "SELECT * FROM mcp_registry ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    ),
    pool.query("SELECT COUNT(*) AS total FROM mcp_registry")
  ]);

  const total = Number(countResult.rows?.[0]?.total || 0);

  return {
    page,
    limit,
    total,
    items: rows.map(rowToRegistryEntry)
  };
}

export async function getServerByDid(did) {
  const { rows } = await pool.query(
    "SELECT * FROM mcp_registry WHERE did = $1 LIMIT 1",
    [did]
  );
  if (!rows.length) return null;
  return rowToRegistryEntry(rows[0]);
}

export async function searchServers(filters) {
  const where = [];
  const params = [];

  if (filters.capability) {
    params.push(filters.capability);
    where.push(`meta_capabilities @> to_jsonb(ARRAY[$${params.length}]::text[])`);
  }
  if (filters.tag) {
    params.push(filters.tag);
    where.push(`meta_tags @> to_jsonb(ARRAY[$${params.length}]::text[])`);
  }
  if (filters.organization) {
    params.push(filters.organization);
    where.push(`meta_organization = $${params.length}`);
  }
  if (filters.country) {
    params.push(filters.country);
    where.push(`meta_country = $${params.length}`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const { rows } = await pool.query(
    `SELECT * FROM mcp_registry ${whereClause} ORDER BY created_at DESC LIMIT 100`,
    params
  );

  return rows.map(rowToRegistryEntry);
}

export async function upsertServer(entry) {
  const {
    did,
    endpoint,
    manifest,
    credentials,
    metadata
  } = entry;

  const meta = metadata || {};
  const capabilities = meta.capabilities || [];
  const organization = meta.organization || null;
  const country = meta.country || null;
  const tags = meta.tags || [];
  const status = meta.status || "active";

  await pool.query(
    `
    INSERT INTO mcp_registry (
      did, endpoint, manifest, credentials,
      meta_capabilities, meta_organization, meta_country,
      meta_tags, meta_status
    ) VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8::jsonb, $9)
    ON CONFLICT (did) DO UPDATE SET
      endpoint = EXCLUDED.endpoint,
      manifest = EXCLUDED.manifest,
      credentials = EXCLUDED.credentials,
      meta_capabilities = EXCLUDED.meta_capabilities,
      meta_organization = EXCLUDED.meta_organization,
      meta_country = EXCLUDED.meta_country,
      meta_tags = EXCLUDED.meta_tags,
      meta_status = EXCLUDED.meta_status,
      updated_at = now()
    `,
    [
      did,
      endpoint,
      manifest,
      JSON.stringify(credentials || []),
      JSON.stringify(capabilities),
      organization,
      country,
      JSON.stringify(tags),
      status
    ]
  );

  return { status: "ok", did };
}

export async function listIssuers() {
  // For MVP: hard-code Veritrust as the only issuer.
  return {
    issuers: [
      {
        id: process.env.MCPF_ISSUER_DID || "did:web:veritrust.vc",
        name: "Veritrust",
        documentation: "https://veritrust.vc/issuer/"
      }
    ]
  };
}

export async function getRevocations() {
  // MVP: empty revocation lists.
  // Later: wire this to your StatusList2021 data in /status/agents-2025.
  return {
    revokedServers: [],
    revokedCredentials: []
  };
}
