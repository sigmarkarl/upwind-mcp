#!/usr/bin/env node

import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { UpwindMcpServer } from './upwind-server.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Store active transports by session ID
const activeTransports = new Map<string, SSEServerTransport>();

// Create HTTP server
const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url!, `http://${req.headers.host}`);
  
  // Health check endpoint
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // SSE endpoint for establishing MCP connection
  if (url.pathname === '/sse' && req.method === 'GET') {
    try {
      const transport = new SSEServerTransport('/message', res);
      const mcpServer = new UpwindMcpServer();
      
      // Store transport for message routing
      activeTransports.set(transport.sessionId, transport);
      
      // Clean up when connection closes
      transport.onclose = () => {
        activeTransports.delete(transport.sessionId);
      };
      
      // Connect MCP server to transport
      await mcpServer.connect(transport);
      await transport.start();
      
      console.error(`New MCP connection established: ${transport.sessionId}`);
    } catch (error) {
      console.error('Error establishing SSE connection:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to establish connection' }));
    }
    return;
  }

  // Message endpoint for receiving MCP messages
  if (url.pathname === '/message' && req.method === 'POST') {
    try {
      const sessionId = url.searchParams.get('sessionId');
      if (!sessionId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Session ID required' }));
        return;
      }

      const transport = activeTransports.get(sessionId);
      if (!transport) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Session not found' }));
        return;
      }

      await transport.handlePostMessage(req, res);
    } catch (error) {
      console.error('Error handling message:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to handle message' }));
    }
    return;
  }

  // Default 404 for unknown endpoints
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Start server
httpServer.listen(parseInt(PORT.toString()), HOST, () => {
  console.error(`Upwind MCP HTTP server running on http://${HOST}:${PORT}`);
  console.error(`SSE endpoint: http://${HOST}:${PORT}/sse`);
  console.error(`Health check: http://${HOST}:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.error('Shutting down server...');
  httpServer.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.error('Shutting down server...');
  httpServer.close(() => {
    process.exit(0);
  });
});