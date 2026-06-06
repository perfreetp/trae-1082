export type UserType = 'personal' | 'enterprise';

export type DeclarationStatus =
  | 'draft'
  | 'submitted'
  | 'reviewing'
  | 'changing'
  | 'change_reviewing'
  | 'change_approved'
  | 'change_rejected'
  | 'correction'
  | 'approved'
  | 'rejected'
  | 'revoked';

export type DisposalType =
  | 'submit'
  | 'correction_request'
  | 'correction_submit'
  | 'approve'
  | 'reject'
  | 'change_request'
  | 'change_accept'
  | 'change_supplement'
  | 'change_approve'
  | 'change_reject'
  | 'revoke';

export type TaskType =
  | 'aerial_photography'
  | 'mapping'
  | 'inspection'
  | 'performance'
  | 'training'
  | 'other';

export type RiskLevel = 'low' | 'medium' | 'high';

export type MessageType = 'system' | 'review' | 'expiry' | 'warning' | 'change';

export type AircraftStatus = 'bound' | 'unbound' | 'expired';

export type ReviewStepStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export type MaterialStatus = 'uploaded' | 'verified' | 'rejected';

export type AirspaceType = 'controlled' | 'restricted' | 'prohibited' | 'uncontrolled';

export type ChangeStatus = 'requested' | 'reviewing' | 'supplement' | 'approved' | 'rejected';

export type ReviewAction = 'approve' | 'reject' | 'correction';

export interface User {
  id: string;
  name: string;
  idCard: string;
  phone: string;
  userType: UserType;
  enterpriseName?: string;
  creditCode?: string;
  avatar?: string;
  realNameVerified: boolean;
  enterpriseVerified: boolean;
  idCardFront?: string;
  idCardBack?: string;
  verificationDate?: string;
  enterpriseMaterials?: EnterpriseMaterial[];
}

export interface EnterpriseMaterial {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  status: 'uploaded' | 'verified' | 'rejected';
  size?: number;
}

export interface Aircraft {
  id: string;
  userId: string;
  model: string;
  registrationNo: string;
  airworthinessCert: string;
  status: AircraftStatus;
  boundAt: string;
  expiryDate?: string | null;
  airworthinessExpiry?: string;
}

export interface FlightPlan {
  id: string;
  declarationId: string;
  airspace: string;
  airspaceName: string;
  altitudeMin: number;
  altitudeMax: number;
  startTime: string;
  endTime: string;
  frequency: string;
  aircraftIds: string[];
  description?: string;
}

export interface Material {
  id: string;
  declarationId: string;
  name: string;
  type: string;
  url: string;
  size: number;
  required: boolean;
  status: MaterialStatus;
  uploadedAt: string;
}

export interface ReviewStep {
  id: string;
  declarationId: string;
  stepName: string;
  stepOrder: number;
  status: ReviewStepStatus;
  opinion?: string;
  reviewer?: string;
  reviewedAt?: string;
}

export interface ChangeRecord {
  id: string;
  declarationId: string;
  reason: string;
  status: ChangeStatus;
  requestedAt: string;
  acceptedAt?: string;
  processedAt?: string;
  processor?: string;
  opinion?: string;
  result?: 'approved' | 'rejected';
}

export interface DisposalRecord {
  id: string;
  declarationId: string;
  type: DisposalType;
  title: string;
  description?: string;
  operator: string;
  operatedAt: string;
  opinion?: string;
}

export interface Declaration {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: DeclarationStatus;
  taskType: TaskType;
  riskLevel: RiskLevel;
  riskScore: number;
  riskAnswers?: number[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  licenceExpiry?: string;
  changeReason?: string;
  changeRequestedAt?: string;
  changeRecords?: ChangeRecord[];
  disposalRecords?: DisposalRecord[];
  lastChangeResult?: 'approved' | 'rejected';
  lastChangeProcessedAt?: string;
  lastChangeProcessor?: string;
  lastChangeOpinion?: string;
  flightPlan?: FlightPlan;
  materials: Material[];
  reviewSteps?: ReviewStep[];
}

export interface Message {
  id: string;
  userId: string;
  declarationId?: string;
  type: MessageType;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface BlacklistRecord {
  id: string;
  name: string;
  idCard: string;
  reason: string;
  penaltyDate: string;
  expiryDate: string;
  status: 'active' | 'expired';
}

export interface AirspaceInfo {
  id: string;
  name: string;
  type: AirspaceType;
  coordinates: string;
  altitudeMin: number;
  altitudeMax: number;
  description: string;
}

export interface MaterialTemplate {
  type: string;
  name: string;
  required: boolean;
  description: string;
}

export interface LicenceData {
  declarationId: string;
  declarationTitle: string;
  airspaceName: string;
  altitudeMin: number;
  altitudeMax: number;
  startTime: string;
  endTime: string;
  aircraftModels: string[];
  applicant: string;
  licenceNo: string;
  issuedAt: string;
  expiryAt: string;
}
