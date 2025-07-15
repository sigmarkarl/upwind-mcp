# Example MCP client configuration for Upwind server

## Claude Desktop Configuration

Add this to your Claude Desktop configuration file:

### macOS
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "upwind": {
      "command": "node",
      "args": ["/path/to/upwind-mcp/upwind-mcp/dist/index.js"],
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

### Windows
Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "upwind": {
      "command": "node",
      "args": ["C:\\path\\to\\upwind-mcp\\upwind-mcp\\dist\\index.js"],
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

## Alternative: Using Environment File

If you prefer to use an .env file, configure it like this:

```json
{
  "mcpServers": {
    "upwind": {
      "command": "node",
      "args": ["/path/to/upwind-mcp/upwind-mcp/dist/index.js"],
      "cwd": "/path/to/upwind-mcp/upwind-mcp"
    }
  }
}
```

Then create a `.env` file in the upwind-mcp directory with your credentials.

## Example Usage

Once configured, you can use the Upwind server in Claude:

### List High Severity Threat Detections
```
Can you list all high severity threat detections for organization org_123?
```

### Get Vulnerability Findings
```
Show me all critical vulnerability findings that are exploitable and have fixes available for organization org_123.
```

### Create a Build Event
```
Create a build event for organization org_123 with image myapp:v1.2.3, commit abc123, from GitHub Actions.
```

### Archive a Threat Detection
```
Archive the threat detection with ID det_456 for organization org_123.
```
