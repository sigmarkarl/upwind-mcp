# Upwind MCP Server

A Model Context Protocol (MCP) server that provides programmatic access to the Upwind Security Platform APIs for threat detection, vulnerability management, and security event tracking.

## 🚀 Quick Start

1. **Clone and Setup**
   ```bash
   cd upwind-mcp
   npm run setup
   ```

2. **Configure Credentials**
   ```bash
   # Edit .env file with your Upwind credentials
   nano .env
   ```

3. **Test Connection**
   ```bash
   npm test
   ```

4. **Start Server**
   ```bash
   npm start
   ```

## 📋 Prerequisites

- Node.js 18+ and npm
- Upwind account with API access
- Client credentials (Client ID and Client Secret) from Upwind console

### Getting Upwind Credentials

1. Log into the [Upwind Console](https://console.upwind.io)
2. Navigate to Settings > Credentials
3. Click "Generate New Credentials"
4. Copy the Client ID and Client Secret
5. Configure these in your `.env` file

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
UPWIND_CLIENT_ID=your_client_id_here
UPWIND_CLIENT_SECRET=your_client_secret_here
UPWIND_BASE_URL=https://api.upwind.io
UPWIND_AUTH_URL=https://auth.upwind.io
UPWIND_DEFAULT_ORGANIZATION_ID=org_your_default_org_id
```

### MCP Client Configuration

See `mcp-config-example.md` for detailed setup instructions for various MCP clients.

## 🛠 Available Tools

### Threat Management
- **`upwind_list_threat_detections`** - List threat detections with filtering
- **`upwind_get_threat_detection`** - Get detailed threat detection info
- **`upwind_update_threat_detection`** - Update threat detection status
- **`upwind_list_threat_policies`** - List threat policies
- **`upwind_update_threat_policy`** - Enable/disable threat policies

### Vulnerability Management  
- **`upwind_list_vulnerability_findings`** - List vulnerability findings
- **`upwind_get_vulnerability_finding`** - Get detailed vulnerability info

### Event Management
- **`upwind_create_event`** - Create CI/CD integration events

## 📚 Documentation

- **[Setup Guide](README.md)** - This file
- **[Configuration Examples](mcp-config-example.md)** - MCP client setup
- **[Usage Examples](examples.md)** - Tool usage examples and common workflows
- **[API Types](src/types.ts)** - TypeScript type definitions

## 🏗 Project Structure

```
upwind-mcp/
├── src/
│   ├── index.ts          # Main MCP server
│   ├── client.ts         # Upwind API client
│   └── types.ts          # TypeScript types
├── dist/                 # Compiled JavaScript
├── examples.md           # Usage examples
├── mcp-config-example.md # MCP client configuration
├── .env.example          # Environment template
├── setup.sh              # Setup script
├── test-connection.js    # Connection test
└── package.json
```

## 🔐 Authentication

The server uses OAuth 2.0 client credentials flow:

1. Server automatically obtains access tokens using your credentials
2. Tokens are refreshed automatically before expiry
3. All API requests include proper authentication headers

## 🎯 Common Use Cases

### Security Operations
```javascript
// Find critical threats
await upwind_list_threat_detections({
  organizationId: "org_123",
  severity: "CRITICAL"
})

// Investigate specific threat
await upwind_get_threat_detection({
  organizationId: "org_123", 
  detectionId: "det_456"
})

// Archive resolved threat
await upwind_update_threat_detection({
  organizationId: "org_123",
  detectionId: "det_456",
  status: "ARCHIVED"
})
```

### Vulnerability Management
```javascript
// Find exploitable vulnerabilities
await upwind_list_vulnerability_findings({
  organizationId: "org_123",
  severity: "HIGH",
  exploitable: true,
  fixAvailable: true
})
```

### CI/CD Integration
```javascript
// Report build completion
await upwind_create_event({
  organizationId: "org_123",
  type: "IMAGE_BUILD",
  reporter: "GITHUB_ACTIONS",
  data: {
    image: "myapp:v1.2.3",
    commit_sha: "abc123",
    repository: "myorg/myapp"
  }
})
```

## 🚨 Error Handling

The server provides detailed error messages for:
- **401 Unauthorized** - Invalid credentials
- **403 Forbidden** - Insufficient permissions  
- **404 Not Found** - Resource doesn't exist
- **429 Rate Limited** - Too many requests
- **500 Server Error** - Upwind API issues

## 🧪 Testing

```bash
# Test connection and authentication
npm test

# Run in development mode
npm run dev

# Build and run production
npm run build && npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check `examples.md` for detailed usage examples
- **Issues**: Report bugs or request features via GitHub issues
- **Upwind Support**: Contact Upwind support for API-related questions

## 🔗 Related Links

- [Upwind Platform](https://upwind.io)
- [Upwind Documentation](https://docs.upwind.io)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Upwind API Reference](https://docs.upwind.io/restapi/v1/introduction)
