export type UserType = 'personal' | 'enterprise';

export type DeclarationStatus =
  | 'draft'
  | 'submitted'
  | 'reviewing'
  | 'correction'
  | 'approved'
  | 'rejected'
  | 'revoked';

export type TaskType =
  | 'aerial_photography'
  | 'mapping'
  | 'inspection'
  | 'performance'
  | 'training'
  | 'other';

export type RiskLevel = 'low' | 'medium' | 'high';

export type MessageType = 'system' | 'review' | 'expiry' | 'warning';

export type AircraftStatus = 'bound' | 'unbound' | 'expired';

export type ReviewStepStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export type MaterialStatus = 'uploaded' | 'verified' | 'rejected';

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
}

export interface Aircraft {
  id: string;
  userId: string;
  model: string;
  registrationNo: string;
  airworthinessCert: string;
  status: AircraftStatus;
  boundAt: string;
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

export interface Declaration {
  id: string;
  userId: string;
  title: string;
  status: DeclarationStatus;
  taskType: TaskType;
  riskLevel: RiskLevel;
  riskScore: number;
  createdAt: string;
  updatedAt: string;
  flightPlan?: FlightPlan;
  materials?: Material[];
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
  type: 'controlled' | 'restricted' | 'prohibited' | 'uncontrolled';
  coordinates: string;
  altitudeMin: number;
  altitudeMax: number;
  description: string;
}
