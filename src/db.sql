CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- MCP registry table
CREATE TABLE IF NOT EXISTS mcp_registry (
    id SERIAL PRIMARY KEY,
    did TEXT NOT NULL UNIQUE,
    endpoint TEXT NOT NULL,
    manifest TEXT NOT NULL,
    credentials JSONB NOT NULL DEFAULT '[]'::jsonb,
    meta_capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    meta_organization TEXT,
    meta_country TEXT,
    meta_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    meta_status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mcp_registry_created_at ON mcp_registry (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mcp_registry_did ON mcp_registry (did);
CREATE INDEX IF NOT EXISTS idx_mcp_registry_status ON mcp_registry (meta_status);
