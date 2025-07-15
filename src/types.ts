export interface ThreatDetection {
  id: string;
  type: string;
  category: 'NETWORK' | 'PROCESS' | 'CLOUD_LOGS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'OPEN' | 'ARCHIVED';
  title: string;
  description: string;
  first_seen_time: string;
  last_seen_time: string;
  occurrence_count: number;
  resource: Resource;
  mitre_attacks: MitreAttackDetails[];
  triggers: ThreatDetectionTrigger[];
}

export interface ThreatDetectionTrigger {
  policy_id: string;
  policy_name: string;
  events: ThreatDetectionEvent[];
}

export interface ThreatDetectionEvent {
  id: string;
  event_type: 'AUDIT_LOG_EVENT' | 'NETWORK_ACTIVITY' | 'PROCESS_EXECUTION';
  description: string;
  event_time: string;
  data: any;
}

export interface ThreatPolicy {
  id: string;
  display_name: string;
  category: 'PROCESS_EXECUTION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scope: 'ALL_RESOURCES' | 'SUBSET';
  open_issues: number;
  managed_by: 'UPWIND';
  enabled: boolean;
}

export interface VulnerabilityFinding {
  id: string;
  status: 'OPEN' | 'ARCHIVED';
  source: 'SENSOR' | 'CLOUD_SCANNER';
  first_seen_time: string;
  last_scan_time: string;
  vulnerability: Vulnerability;
  image: Image;
  package: Package;
  resource: Resource;
  remediation: RemediationItem[];
}

export interface Vulnerability {
  name: string;
  description: string;
  nvd_cve_id: string;
  nvd_description: string;
  nvd_publish_time: string;
  nvd_cvss_v3_severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  nvd_cvss_v3_score: string;
  impact_metrics: ImpactMetrics;
}

export interface Image {
  name: string;
  digest: string;
  uri: string;
  registry: string;
  repository: string;
  os_version: string;
  os_name: string;
  tag: string;
}

export interface Package {
  name: string;
  framework: string;
  type: string;
  version: string;
  in_use: boolean;
}

export interface Resource {
  id: string;
  external_id: string;
  name: string;
  type: string;
  path: string;
  cloud_provider: 'AWS' | 'GCP' | 'AZURE';
  cloud_account_id: string;
  region: string;
  cluster_id: string;
  namespace: string;
  internet_exposure: InternetExposure;
}

export interface InternetExposure {
  ingress: InternetExposureDetails;
}

export interface InternetExposureDetails {
  active_communication: boolean;
}

export interface ImpactMetrics {
  affected_resource_count: number;
  affected_image_count: number;
}

export interface MitreAttackDetails {
  tactic_id: string;
  tactic_name: string;
  technique_id: string;
  technique_name: string;
}

export interface RemediationItem {
  type: 'OFFICIAL_FIX';
  data: string;
}

export interface EventRequest {
  type: 'IMAGE_BUILD' | 'IMAGE_DEPLOY';
  reporter: 'GITHUB_ACTIONS' | 'CIRCLE_CI' | 'CUSTOM_CI' | 'CUSTOM_CD';
  data: CiEventData | CdEventData;
}

export interface CiEventData {
  image: string;
  image_sha: string;
  commit_sha: string;
  version_control_platform: 'GITHUB' | 'GITLAB' | 'BITBUCKET';
  repository: string;
  branch: string;
  pull_request_ids: number[];
  build_time: string;
}

export interface CdEventData {
  resource_name: string;
  resource_namespace: string;
  resource_kind: string;
  cluster_id: string;
  start_time: string;
  end_time: string;
  initiator: string;
}

export interface EventList {
  id: string;
  type: string;
  reporter: string;
  data: CiEventData | CdEventData;
}

export interface ThreatDetectionUpdateRequest {
  status: 'ARCHIVED';
}

export interface ThreatPolicyUpdateRequest {
  enabled: boolean;
}

export interface ListThreatDetectionsParams {
  organizationId?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type?: string;
  category?: 'NETWORK' | 'PROCESS' | 'CLOUD_LOGS';
  minFirstSeenTime?: string;
  maxFirstSeenTime?: string;
  minLastSeenTime?: string;
  maxLastSeenTime?: string;
}

export interface ListVulnerabilityFindingsParams {
  organizationId?: string;
  perPage?: number;
  pageToken?: string;
  cloudAccountId?: string;
  clusterId?: string;
  namespace?: string;
  ingressActiveCommunication?: boolean;
  inUse?: boolean;
  exploitable?: boolean;
  fixAvailable?: boolean;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  imageName?: string;
}

export interface ListThreatPoliciesParams {
  organizationId?: string;
  managedBy?: 'UPWIND';
}

export interface UpwindApiError {
  error: string;
  message: string;
  statusCode: number;
}
