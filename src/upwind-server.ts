import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool,
  CallToolResult,
  TextContent,
  ErrorCode,
  McpError,
  CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { UpwindClient } from './client.js';
import { 
  ListThreatDetectionsParams,
  ListVulnerabilityFindingsParams,
  ListThreatPoliciesParams,
  EventRequest,
  ThreatDetectionUpdateRequest,
  ThreatPolicyUpdateRequest,
  UpwindApiError,
} from './types.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class UpwindMcpServer {
  private server: Server;
  private client: UpwindClient;

  constructor() {
    this.server = new Server(
      {
        name: 'upwind-mcp-server',
        version: '1.0.0',
      }
    );

    // Initialize Upwind client
    const clientId = process.env.UPWIND_CLIENT_ID;
    const clientSecret = process.env.UPWIND_CLIENT_SECRET;
    const baseUrl = process.env.UPWIND_BASE_URL || 'https://api.upwind.io';
    const authUrl = process.env.UPWIND_AUTH_URL || 'https://auth.upwind.io';

    if (!clientId || !clientSecret) {
      throw new Error('UPWIND_CLIENT_ID and UPWIND_CLIENT_SECRET environment variables are required');
    }

    this.client = new UpwindClient(clientId, clientSecret, baseUrl, authUrl);

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'upwind_list_threat_detections',
            description: 'List threat detections for an organization with optional filtering',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: {
                  type: 'string',
                  description: 'The unique identifier for the organization (optional - will use organization from auth token if not provided)',
                },
                severity: {
                  type: 'string',
                  enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                  description: 'Filter by severity level',
                },
                type: {
                  type: 'string',
                  description: 'Filter by detection type',
                },
                category: {
                  type: 'string',
                  enum: ['NETWORK', 'PROCESS', 'CLOUD_LOGS'],
                  description: 'Filter by detection category',
                },
                minFirstSeenTime: {
                  type: 'string',
                  description: 'Filter by earliest first seen time (ISO8601 format)',
                },
                maxFirstSeenTime: {
                  type: 'string',
                  description: 'Filter by latest first seen time (ISO8601 format)',
                },
                minLastSeenTime: {
                  type: 'string',
                  description: 'Filter by earliest last seen time (ISO8601 format)',
                },
                maxLastSeenTime: {
                  type: 'string',
                  description: 'Filter by latest last seen time (ISO8601 format)',
                },
              },
              required: [],
            },
          },
          {
            name: 'upwind_get_threat_detection',
            description: 'Get detailed information about a specific threat detection',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: {
                  type: 'string',
                  description: 'The unique identifier for the organization (optional - will use organization from auth token if not provided)',
                },
                detectionId: {
                  type: 'string',
                  description: 'The unique identifier for the threat detection',
                },
              },
              required: ['organizationId', 'detectionId'],
            },
          },
          {
            name: 'upwind_update_threat_detection',
            description: 'Update a threat detection status (e.g., archive)',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: {
                  type: 'string',
                  description: 'The unique identifier for the organization (optional - will use organization from auth token if not provided)',
                },
                detectionId: {
                  type: 'string',
                  description: 'The unique identifier for the threat detection',
                },
                status: {
                  type: 'string',
                  enum: ['ARCHIVED'],
                  description: 'New status for the threat detection',
                },
              },
              required: ['organizationId', 'detectionId', 'status'],
            },
          },
          {
            name: 'upwind_list_threat_policies',
            description: 'List threat policies for an organization',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: {
                  type: 'string',
                  description: 'The unique identifier for the organization (optional - will use organization from auth token if not provided)',
                },
                managedBy: {
                  type: 'string',
                  enum: ['UPWIND'],
                  description: 'Filter by policy management entity',
                },
              },
              required: [],
            },
          },
          {
            name: 'upwind_update_threat_policy',
            description: 'Update a threat policy (e.g., enable/disable)',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: {
                  type: 'string',
                  description: 'The unique identifier for the organization (optional - will use organization from auth token if not provided)',
                },
                policyId: {
                  type: 'string',
                  description: 'The unique identifier for the threat policy',
                },
                enabled: {
                  type: 'boolean',
                  description: 'Whether the policy should be enabled',
                },
              },
              required: ['organizationId', 'policyId', 'enabled'],
            },
          },
          {
            name: 'upwind_list_vulnerability_findings',
            description: 'List vulnerability findings for an organization with filtering options',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: {
                  type: 'string',
                  description: 'The unique identifier for the organization (optional - will use organization from auth token if not provided)',
                },
                perPage: {
                  type: 'number',
                  description: 'Number of results per page (default: 100)',
                },
                pageToken: {
                  type: 'string',
                  description: 'Token for pagination',
                },
                cloudAccountId: {
                  type: 'string',
                  description: 'Filter by cloud account ID',
                },
                clusterId: {
                  type: 'string',
                  description: 'Filter by cluster ID',
                },
                namespace: {
                  type: 'string',
                  description: 'Filter by namespace',
                },
                ingressActiveCommunication: {
                  type: 'boolean',
                  description: 'Filter for resources with active internet ingress communication',
                },
                inUse: {
                  type: 'boolean',
                  description: 'Filter for packages currently in use',
                },
                exploitable: {
                  type: 'boolean',
                  description: 'Filter for packages with known exploits',
                },
                fixAvailable: {
                  type: 'boolean',
                  description: 'Filter for packages with available fixes',
                },
                severity: {
                  type: 'string',
                  enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                  description: 'Filter by severity level',
                },
                imageName: {
                  type: 'string',
                  description: 'Filter by image name (e.g., nginx:latest)',
                },
              },
              required: [],
            },
          },
          {
            name: 'upwind_get_vulnerability_finding',
            description: 'Get detailed information about a specific vulnerability finding',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: {
                  type: 'string',
                  description: 'The unique identifier for the organization (optional - will use organization from auth token if not provided)',
                },
                findingId: {
                  type: 'string',
                  description: 'The unique identifier for the vulnerability finding',
                },
              },
              required: ['organizationId', 'findingId'],
            },
          },
          {
            name: 'upwind_create_event',
            description: 'Create a new event (e.g., for CI/CD integration)',
            inputSchema: {
              type: 'object',
              properties: {
                organizationId: {
                  type: 'string',
                  description: 'The unique identifier for the organization (optional - will use organization from auth token if not provided)',
                },
                type: {
                  type: 'string',
                  enum: ['IMAGE_BUILD', 'IMAGE_DEPLOY'],
                  description: 'Type of event',
                },
                reporter: {
                  type: 'string',
                  enum: ['GITHUB_ACTIONS', 'CIRCLE_CI', 'CUSTOM_CI', 'CUSTOM_CD'],
                  description: 'Entity creating the event',
                },
                data: {
                  type: 'object',
                  description: 'Event data (structure depends on event type)',
                },
              },
              required: ['organizationId', 'type', 'reporter', 'data'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'upwind_list_threat_detections':
            return await this.listThreatDetections(args as unknown as ListThreatDetectionsParams);
          
          case 'upwind_get_threat_detection':
            return await this.getThreatDetection(args as unknown as { organizationId?: string; detectionId: string });
          
          case 'upwind_update_threat_detection':
            return await this.updateThreatDetection(args as unknown as { organizationId?: string; detectionId: string; status: 'ARCHIVED' });
          
          case 'upwind_list_threat_policies':
            return await this.listThreatPolicies(args as unknown as ListThreatPoliciesParams);
          
          case 'upwind_update_threat_policy':
            return await this.updateThreatPolicy(args as unknown as { organizationId?: string; policyId: string; enabled: boolean });
          
          case 'upwind_list_vulnerability_findings':
            return await this.listVulnerabilityFindings(args as unknown as ListVulnerabilityFindingsParams);
          
          case 'upwind_get_vulnerability_finding':
            return await this.getVulnerabilityFinding(args as unknown as { organizationId?: string; findingId: string });
          
          case 'upwind_create_event':
            return await this.createEvent(args as unknown as { organizationId?: string } & EventRequest);
          
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        const upwindError = error as UpwindApiError;
        if (upwindError.statusCode) {
          throw new McpError(
            ErrorCode.InternalError,
            `Upwind API error (${upwindError.statusCode}): ${upwindError.message}`
          );
        }
        
        throw new McpError(ErrorCode.InternalError, `Unexpected error: ${error}`);
      }
    });
  }

  private async listThreatDetections(params: ListThreatDetectionsParams): Promise<CallToolResult> {
    const organizationId = params.organizationId || await this.client.discoverOrganizationId();
    if (!organizationId) {
      throw new McpError(ErrorCode.InvalidParams, 'Organization ID not provided and could not be determined from auth token');
    }
    
    const finalParams = { ...params, organizationId };
    const detections = await this.client.listThreatDetections(finalParams);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(detections, null, 2),
        } as TextContent,
      ],
      isError: false,
    };
  }

  private async getThreatDetection(params: { organizationId?: string; detectionId: string }): Promise<CallToolResult> {
    const organizationId = params.organizationId || await this.client.discoverOrganizationId();
    if (!organizationId) {
      throw new McpError(ErrorCode.InvalidParams, 'Organization ID not provided and could not be determined from auth token');
    }
    
    const detection = await this.client.getThreatDetection(organizationId, params.detectionId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(detection, null, 2),
        } as TextContent,
      ],
      isError: false,
    };
  }

  private async updateThreatDetection(params: { organizationId?: string; detectionId: string; status: 'ARCHIVED' }): Promise<CallToolResult> {
    const organizationId = params.organizationId || await this.client.discoverOrganizationId();
    if (!organizationId) {
      throw new McpError(ErrorCode.InvalidParams, 'Organization ID not provided and could not be determined from auth token');
    }
    
    const update: ThreatDetectionUpdateRequest = { status: params.status };
    const detection = await this.client.updateThreatDetection(organizationId, params.detectionId, update);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(detection, null, 2),
        } as TextContent,
      ],
      isError: false,
    };
  }

  private async listThreatPolicies(params: ListThreatPoliciesParams): Promise<CallToolResult> {
    const organizationId = params.organizationId || await this.client.discoverOrganizationId();
    if (!organizationId) {
      throw new McpError(ErrorCode.InvalidParams, 'Organization ID not provided and could not be determined from auth token');
    }
    
    const finalParams = { ...params, organizationId };
    const policies = await this.client.listThreatPolicies(finalParams);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(policies, null, 2),
        } as TextContent,
      ],
      isError: false,
    };
  }

  private async updateThreatPolicy(params: { organizationId?: string; policyId: string; enabled: boolean }): Promise<CallToolResult> {
    const organizationId = params.organizationId || await this.client.discoverOrganizationId();
    if (!organizationId) {
      throw new McpError(ErrorCode.InvalidParams, 'Organization ID not provided and could not be determined from auth token');
    }
    
    const update: ThreatPolicyUpdateRequest = { enabled: params.enabled };
    const policy = await this.client.updateThreatPolicy(organizationId, params.policyId, update);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(policy, null, 2),
        } as TextContent,
      ],
      isError: false,
    };
  }

  private async listVulnerabilityFindings(params: ListVulnerabilityFindingsParams): Promise<CallToolResult> {
    const organizationId = params.organizationId || await this.client.discoverOrganizationId();
    if (!organizationId) {
      throw new McpError(ErrorCode.InvalidParams, 'Organization ID not provided and could not be determined from auth token');
    }
    
    const finalParams = { ...params, organizationId };
    const findings = await this.client.listVulnerabilityFindings(finalParams);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(findings, null, 2),
        } as TextContent,
      ],
      isError: false,
    };
  }

  private async getVulnerabilityFinding(params: { organizationId?: string; findingId: string }): Promise<CallToolResult> {
    const organizationId = params.organizationId || await this.client.discoverOrganizationId();
    if (!organizationId) {
      throw new McpError(ErrorCode.InvalidParams, 'Organization ID not provided and could not be determined from auth token');
    }
    
    const finding = await this.client.getVulnerabilityFinding(organizationId, params.findingId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(finding, null, 2),
        } as TextContent,
      ],
      isError: false,
    };
  }

  private async createEvent(params: { organizationId?: string } & EventRequest): Promise<CallToolResult> {
    const organizationId = params.organizationId || await this.client.discoverOrganizationId();
    if (!organizationId) {
      throw new McpError(ErrorCode.InvalidParams, 'Organization ID not provided and could not be determined from auth token');
    }
    
    const { organizationId: _, ...eventRequest } = params;
    const events = await this.client.createEvent(organizationId, eventRequest);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(events, null, 2),
        } as TextContent,
      ],
      isError: false,
    };
  }

  async connect(transport: Transport): Promise<void> {
    await this.server.connect(transport);
  }
}