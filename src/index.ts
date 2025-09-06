#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { UpwindMcpServer } from './upwind-server.js';

// Run the server with stdio transport
async function main() {
  const server = new UpwindMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Upwind MCP server running on stdio');
}

main().catch(console.error);
