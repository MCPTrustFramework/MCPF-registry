import pool from "./db.js";
import * as registry from "./registryModel.js";

async function seed() {
  console.log("Seeding MCPF Registry with example servers...\n");

  // Example 1: Weather Service
  await registry.upsertServer({
    did: "did:web:weather.example.com:mcp:api",
    endpoint: "https://weather.example.com/mcp",
    manifest: "https://weather.example.com/mcp/manifest.json",
    credentials: [{
      issuer: "did:web:veritrust.vc",
      type: "MCPServerCredential",
      credentialUrl: "https://weather.example.com/mcp/credential.json"
    }],
    metadata: {
      capabilities: ["getCurrentWeather", "getForecast", "getAlerts"],
      organization: "National Weather Service",
      country: "US",
      tags: ["weather", "public-data", "free-tier"],
      status: "active"
    }
  });
  console.log("✓ Weather Service registered");

  // Example 2: Database Query Service
  await registry.upsertServer({
    did: "did:web:database.example.com:mcp:query",
    endpoint: "https://database.example.com/mcp",
    manifest: "https://database.example.com/mcp/manifest.json",
    credentials: [{
      issuer: "did:web:veritrust.vc",
      type: "MCPServerCredential",
      credentialUrl: "https://database.example.com/mcp/credential.json"
    }],
    metadata: {
      capabilities: ["query", "schema", "analyze"],
      organization: "Example Database Corp",
      country: "US",
      tags: ["database", "sql", "enterprise"],
      status: "active"
    }
  });
  console.log("✓ Database Service registered");

  // Example 3: File System Access
  await registry.upsertServer({
    did: "did:web:filesystem.example.com:mcp:api",
    endpoint: "https://filesystem.example.com/mcp",
    manifest: "https://filesystem.example.com/mcp/manifest.json",
    credentials: [{
      issuer: "did:web:veritrust.vc",
      type: "MCPServerCredential",
      credentialUrl: "https://filesystem.example.com/mcp/credential.json"
    }],
    metadata: {
      capabilities: ["readFile", "writeFile", "listDirectory"],
      organization: "Example Cloud Storage",
      country: "EU",
      tags: ["filesystem", "storage", "cloud"],
      status: "active"
    }
  });
  console.log("✓ Filesystem Service registered");

  console.log("\n✅ Seeding complete!");
  await pool.end();
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
