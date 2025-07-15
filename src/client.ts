import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import {
  ThreatDetection,
  ThreatPolicy,
  VulnerabilityFinding,
  EventRequest,
  EventList,
  ThreatDetectionUpdateRequest,
  ThreatPolicyUpdateRequest,
  ListThreatDetectionsParams,
  ListVulnerabilityFindingsParams,
  ListThreatPoliciesParams,
  UpwindApiError,
} from './types';

export class UpwindClient {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private baseUrl: string = 'https://api.upwind.io',
    private authUrl: string = 'https://auth.upwind.io'
  ) {
    this.api = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: any) => {
        if (error.response) {
          const upwindError: UpwindApiError = {
            error: error.response.data?.error || 'Unknown error',
            message: error.response.data?.message || error.message,
            statusCode: error.response.status,
          };
          throw upwindError;
        }
        throw error;
      }
    );

    // Add request interceptor for authentication
    this.api.interceptors.request.use(async (config) => {
      await this.ensureValidToken();
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });
  }

  private async ensureValidToken(): Promise<void> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return;
    }

    try {
      const response = await axios.post(
        `${this.authUrl}/oauth/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;
    } catch (error) {
      throw new Error(`Failed to authenticate with Upwind: ${error}`);
    }
  }

  // Threat Detection Methods
  async listThreatDetections(params: ListThreatDetectionsParams): Promise<ThreatDetection[]> {
    const queryParams = new URLSearchParams();
    
    if (params.severity) queryParams.append('severity', params.severity);
    if (params.type) queryParams.append('type', params.type);
    if (params.category) queryParams.append('category', params.category);
    if (params.minFirstSeenTime) queryParams.append('min-first-seen-time', params.minFirstSeenTime);
    if (params.maxFirstSeenTime) queryParams.append('max-first-seen-time', params.maxFirstSeenTime);
    if (params.minLastSeenTime) queryParams.append('min-last-seen-time', params.minLastSeenTime);
    if (params.maxLastSeenTime) queryParams.append('max-last-seen-time', params.maxLastSeenTime);

    const response = await this.api.get<ThreatDetection[]>(
      `/v1/organizations/${params.organizationId}/threat-detections?${queryParams.toString()}`
    );
    return response.data;
  }

  async getThreatDetection(organizationId: string, detectionId: string): Promise<ThreatDetection> {
    const response = await this.api.get<ThreatDetection>(
      `/v1/organizations/${organizationId}/threat-detections/${detectionId}`
    );
    return response.data;
  }

  async updateThreatDetection(
    organizationId: string,
    detectionId: string,
    update: ThreatDetectionUpdateRequest
  ): Promise<ThreatDetection> {
    const response = await this.api.patch<ThreatDetection>(
      `/v1/organizations/${organizationId}/threat-detections/${detectionId}`,
      update
    );
    return response.data;
  }

  // Threat Policy Methods
  async listThreatPolicies(params: ListThreatPoliciesParams): Promise<ThreatPolicy[]> {
    const queryParams = new URLSearchParams();
    
    if (params.managedBy) queryParams.append('managed-by', params.managedBy);

    const response = await this.api.get<ThreatPolicy[]>(
      `/v1/organizations/${params.organizationId}/threat-policies?${queryParams.toString()}`
    );
    return response.data;
  }

  async updateThreatPolicy(
    organizationId: string,
    policyId: string,
    update: ThreatPolicyUpdateRequest
  ): Promise<ThreatPolicy> {
    const response = await this.api.patch<ThreatPolicy>(
      `/v1/organizations/${organizationId}/threat-policies/${policyId}`,
      update
    );
    return response.data;
  }

  // Vulnerability Methods
  async listVulnerabilityFindings(params: ListVulnerabilityFindingsParams): Promise<VulnerabilityFinding[]> {
    const queryParams = new URLSearchParams();
    
    if (params.perPage) queryParams.append('per-page', params.perPage.toString());
    if (params.pageToken) queryParams.append('page-token', params.pageToken);
    if (params.cloudAccountId) queryParams.append('cloud-account-id', params.cloudAccountId);
    if (params.clusterId) queryParams.append('cluster-id', params.clusterId);
    if (params.namespace) queryParams.append('namespace', params.namespace);
    if (params.ingressActiveCommunication !== undefined) {
      queryParams.append('ingress-active-communication', params.ingressActiveCommunication.toString());
    }
    if (params.inUse !== undefined) queryParams.append('in-use', params.inUse.toString());
    if (params.exploitable !== undefined) queryParams.append('exploitable', params.exploitable.toString());
    if (params.fixAvailable !== undefined) queryParams.append('fix-available', params.fixAvailable.toString());
    if (params.severity) queryParams.append('severity', params.severity);
    if (params.imageName) queryParams.append('image-name', params.imageName);

    const response = await this.api.get<VulnerabilityFinding[]>(
      `/v1/organizations/${params.organizationId}/vulnerability-findings?${queryParams.toString()}`
    );
    return response.data;
  }

  async getVulnerabilityFinding(organizationId: string, findingId: string): Promise<VulnerabilityFinding> {
    const response = await this.api.get<VulnerabilityFinding>(
      `/v1/organizations/${organizationId}/vulnerability-findings/${findingId}`
    );
    return response.data;
  }

  // Event Methods
  async createEvent(organizationId: string, eventRequest: EventRequest): Promise<EventList[]> {
    const response = await this.api.post<EventList[]>(
      `/v1/organizations/${organizationId}/events`,
      eventRequest
    );
    return response.data;
  }

  // Helper method to discover organization ID from JWT token
  async discoverOrganizationId(): Promise<string | null> {
    try {
      await this.ensureValidToken();
      
      if (this.accessToken) {
        return this.extractOrgIdFromToken(this.accessToken);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to discover organization ID from JWT token:', error);
      return null;
    }
  }

  // Helper method to extract organization ID from JWT token
  private extractOrgIdFromToken(token: string): string | null {
    try {
      // JWT tokens have 3 parts separated by dots: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Decode the payload (second part)
      const payload = parts[1];
      // Add padding if needed for proper base64 decoding
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      const decodedPayload = atob(paddedPayload);
      const payloadObj = JSON.parse(decodedPayload);

      // Look for organization ID in various possible fields
      if (payloadObj.organizationId) {
        return payloadObj.organizationId;
      }
      if (payloadObj.org_id) {
        return payloadObj.org_id;
      }
      if (payloadObj.organization && payloadObj.organization.id) {
        return payloadObj.organization.id;
      }
      if (payloadObj.org) {
        return payloadObj.org;
      }
      if (payloadObj.tenant_id) {
        return payloadObj.tenant_id;
      }
      if (payloadObj.tenantId) {
        return payloadObj.tenantId;
      }

      // Log the payload for debugging (remove sensitive info)
      const debugPayload = { ...payloadObj };
      delete debugPayload.exp;
      delete debugPayload.iat;
      delete debugPayload.sub;
      console.log('JWT payload (for debugging):', JSON.stringify(debugPayload, null, 2));

      return null;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }
}
