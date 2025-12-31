#!/usr/bin/env node
/**
 * Example MCP Registry client in Node.js
 */

class RegistryClient {
  constructor(baseUrl = 'http://localhost:4002') {
    this.baseUrl = baseUrl;
  }

  async listServers(page = 1, limit = 50) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const response = await fetch(`${this.baseUrl}/mcp/servers?${params}`);
    if (!response.ok) throw new Error(`List servers failed: ${response.statusText}`);
    return response.json();
  }

  async getServer(did) {
    const encodedDid = encodeURIComponent(did);
    const response = await fetch(`${this.baseUrl}/mcp/servers/${encodedDid}`);
    if (!response.ok) throw new Error(`Get server failed: ${response.statusText}`);
    return response.json();
  }

  async registerServer(serverData) {
    const response = await fetch(`${this.baseUrl}/mcp/servers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serverData)
    });
    if (!response.ok) throw new Error(`Register failed: ${response.statusText}`);
    return response.json();
  }

  async search(filters = {}) {
    const params = new URLSearchParams();
    if (filters.capability) params.append('capability', filters.capability);
    if (filters.organization) params.append('organization', filters.organization);
    if (filters.country) params.append('country', filters.country);
    if (filters.tag) params.append('tag', filters.tag);
    
    const response = await fetch(`${this.baseUrl}/mcp/search?${params}`);
    if (!response.ok) throw new Error(`Search failed: ${response.statusText}`);
    return response.json();
  }

  async getIssuers() {
    const response = await fetch(`${this.baseUrl}/mcp/issuers`);
    if (!response.ok) throw new Error(`Get issuers failed: ${response.statusText}`);
    return response.json();
  }
}

// Example usage
(async () => {
  const client = new RegistryClient();
  
  try {
    // Search for servers
    const result = await client.search({ capability: 'weather.getCurrentWeather' });
    console.log('Search results:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
