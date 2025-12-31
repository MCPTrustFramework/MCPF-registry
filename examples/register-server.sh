#!/bin/bash
# Register a weather MCP server

curl -X POST http://localhost:4002/mcp/servers \
  -H 'Content-Type: application/json' \
  -d '{
    "did": "did:web:weather.example.com:mcp:api",
    "endpoint": "https://weather.example.com/mcp",
    "manifest": "https://weather.example.com/mcp/manifest.json",
    "credentials": [{
      "issuer": "did:web:veritrust.vc",
      "type": "MCPServerCredential",
      "credentialUrl": "https://weather.example.com/mcp/credential.json"
    }],
    "metadata": {
      "capabilities": ["getCurrentWeather", "getForecast"],
      "organization": "National Weather Service",
      "country": "US",
      "tags": ["weather", "public-data"],
      "status": "active"
    }
  }'

echo ""
