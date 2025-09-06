#!/usr/bin/env node
   
   // CommonJS wrapper to properly load ES module
   (async () => {
     try {
       const module = await import('./index.js');
       // The module should start automatically when imported
     } catch (error) {
       console.error('Failed to start MCP server:', error);
       process.exit(1);
     }
   })();