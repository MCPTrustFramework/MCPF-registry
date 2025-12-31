#!/usr/bin/env python3
"""
Example MCP Registry client in Python
"""

import requests
import json

class RegistryClient:
    def __init__(self, base_url="http://localhost:4002"):
        self.base_url = base_url
    
    def list_servers(self, page=1, limit=50):
        """List all servers with pagination"""
        response = requests.get(
            f"{self.base_url}/mcp/servers",
            params={"page": page, "limit": limit}
        )
        response.raise_for_status()
        return response.json()
    
    def get_server(self, did):
        """Get server by DID"""
        import urllib.parse
        encoded_did = urllib.parse.quote(did, safe='')
        response = requests.get(f"{self.base_url}/mcp/servers/{encoded_did}")
        response.raise_for_status()
        return response.json()
    
    def register_server(self, server_data):
        """Register new server"""
        response = requests.post(
            f"{self.base_url}/mcp/servers",
            json=server_data
        )
        response.raise_for_status()
        return response.json()
    
    def search(self, capability=None, organization=None, country=None, tag=None):
        """Search servers by filters"""
        params = {}
        if capability: params['capability'] = capability
        if organization: params['organization'] = organization
        if country: params['country'] = country
        if tag: params['tag'] = tag
        
        response = requests.get(
            f"{self.base_url}/mcp/search",
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def get_issuers(self):
        """Get list of trusted issuers"""
        response = requests.get(f"{self.base_url}/mcp/issuers")
        response.raise_for_status()
        return response.json()

# Example usage
if __name__ == "__main__":
    client = RegistryClient()
    
    # Search for weather servers
    result = client.search(capability="weather.getCurrentWeather")
    print("Weather servers:", json.dumps(result, indent=2))
    
    # Get specific server
    if result['items']:
        did = result['items'][0]['did']
        server = client.get_server(did)
        print("\nServer details:", json.dumps(server, indent=2))
