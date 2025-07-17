# Upwind MCP Server

## Overview

The Upwind MCP Server provides access to the Upwind Management REST API v1, allowing you to manage threats, vulnerabilities, and security posture programmatically.

## Features

### Threat Management
- List threat detections
- Get specific threat detection details
- Update threat detection status
- List threat policies
- Update threat policy settings

### Vulnerability Management
- List vulnerability findings
- Get specific vulnerability finding details
- Filter vulnerabilities by severity, exploitability, and fix availability

### Event Management
- Create events for CI/CD integration
- Support for IMAGE_BUILD and IMAGE_DEPLOY events

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Configure your Upwind credentials in `.env`:
```
UPWIND_CLIENT_ID=your_client_id
UPWIND_CLIENT_SECRET=your_client_secret
UPWIND_BASE_URL=https://api.upwind.io
UPWIND_AUTH_URL=https://auth.upwind.io
```

4. Build the project:
```bash
npm run build
```

## Add to MCP Configuration

To add the Upwind MCP server to your MCP configuration, include the following in your `mcp-config.json`:

```json
{
  "mcpServers": {
    "upwind": {
      "command": "node",
      "args": ["path/to/upwind-mcp/dist/start.cjs"],
      "env": {
        "UPWIND_CLIENT_ID": "your_client_id",
        "UPWIND_CLIENT_SECRET": "your_client_secret",
        "UPWIND_BASE_URL": "https://api.upwind.io",
        "UPWIND_AUTH_URL": "https://auth.upwind.io"
      }
    }
  }
}
```

## Available Tools

### Threat Detection Tools
- `upwind_list_threat_detections`: List all threat detections for an organization
- `upwind_get_threat_detection`: Get details for a specific threat detection
- `upwind_update_threat_detection`: Update a threat detection's status
- `upwind_list_threat_policies`: List all threat policies
- `upwind_update_threat_policy`: Update a threat policy's settings

### Vulnerability Tools
- `upwind_list_vulnerability_findings`: List all vulnerability findings
- `upwind_get_vulnerability_finding`: Get details for a specific vulnerability finding

### Event Tools
- `upwind_create_event`: Create a new event for CI/CD integration

## Authentication

The server uses OAuth 2.0 with client credentials flow. You'll need to:

1. Obtain client credentials from the Upwind console
2. Configure the credentials in your environment variables
3. The server will automatically handle token refresh

## Example Usage

```javascript
// List threat detections
const detections = await upwind_list_threat_detections({
  organizationId: "org_123",
  severity: "HIGH"
});

// Get vulnerability findings
const vulns = await upwind_list_vulnerability_findings({
  organizationId: "org_123",
  exploitable: true,
  fixAvailable: true
});

// Create a build event
await upwind_create_event({
  organizationId: "org_123",
  type: "IMAGE_BUILD",
  data: {
    image: "myapp:latest",
    commit_sha: "abc123",
    repository: "myorg/myapp"
  }
});
```

## Error Handling

The server includes comprehensive error handling for:
- Authentication failures
- Rate limiting (429 errors)
- Invalid requests (400 errors)
- Not found errors (404 errors)
- Server errors (500 errors)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License
