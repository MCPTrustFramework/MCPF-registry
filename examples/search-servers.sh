#!/bin/bash
# Search for servers

CAPABILITY=${1:-"getCurrentWeather"}

echo "Searching for servers with capability: $CAPABILITY"
curl "http://localhost:4002/mcp/search?capability=$CAPABILITY" | jq .
