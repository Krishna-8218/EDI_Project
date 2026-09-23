export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type AssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'UNDER_MAINTENANCE' | 'DAMAGED' | 'LOST' | 'RETIRED';
export type AssignmentStatus = 'ACTIVE' | 'RETURNED';
export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION' | 'ROUTINE';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ReportType = 'DAMAGE' | 'LOSS' | 'ISSUE';
export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string | null;
  phone?: string | null;
  status: UserStatus;
  rfidCardId?: string | null;
  createdAt: string;
  updatedAt?: string;
  assignments?: AssetAssignment[];
  reports?: AssetReport[];
  _count?: {
    assignments: number;
    reports: number;
  };
}

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  description?: string | null;
  serialNumber?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  purchaseDate?: string | null;
  purchasePrice?: number | string | null;
  warrantyExpiry?: string | null;
  status: AssetStatus;
  location?: string | null;
  condition?: string | null;
  createdAt: string;
  updatedAt: string;
  assignments?: AssetAssignment[];
  maintenances?: Maintenance[];
  reports?: AssetReport[];
  _count?: {
    assignments: number;
    maintenances: number;
    reports: number;
  };
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  userId: string;
  assignedAt: string;
  returnedAt?: string | null;
  notes?: string | null;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt?: string;
  asset?: Asset;
  user?: User;
}

export interface Maintenance {
  id: string;
  assetId: string;
  title: string;
  description?: string | null;
  maintenanceType: MaintenanceType;
  scheduledDate?: string | null;
  completedDate?: string | null;
  cost?: number | string | null;
  status: MaintenanceStatus;
  performedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  asset?: Asset;
}

export interface AssetReport {
  id: string;
  assetId: string;
  reportedBy: string;
  type: ReportType;
  description: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string | null;
  asset?: Asset;
  reporter?: User;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  description: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  } | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  errors?: unknown;
}

export interface DashboardStats {
  summary: {
    totalAssets: number;
    availableAssets: number;
    assignedAssets: number;
    maintenanceAssets: number;
    damagedAssets: number;
    lostAssets: number;
    retiredAssets: number;
    totalUsers: number;
    activeAssignments: number;
    pendingReports: number;
    totalMaintenances: number;
    activeMaintenances: number;
    totalMaintenanceCost: number | string;
    avgMaintenanceCost: number | string;
  };
  charts: {
    assetsByCategory: { category: string; count: number }[];
    assetsByStatus: { status: AssetStatus; count: number }[];
    assetsByLocation: { location: string; count: number }[];
  };
  recentActivities: AuditLog[];
}

export interface HealthProbabilities {
  HEALTHY: number;
  MAINTENANCE_REQUIRED: number;
  REPLACE_SOON: number;
}

export interface HealthFactor {
  key: string;
  label: string;
  impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'CRITICAL';
  icon: string;
}

export interface HealthRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string;
}

export interface AssetHealthPrediction {
  id: string;
  assetId: string;
  healthScore: number;
  status: 'HEALTHY' | 'MAINTENANCE_REQUIRED' | 'REPLACE_SOON';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probabilities: HealthProbabilities;
  factors: HealthFactor[];
  recommendations: HealthRecommendation[];
  modelVersion: string;
  predictedAt: string;
  createdAt: string;
}

export interface HealthOverviewStats {
  totalAssets: number;
  analyzedAssets: number;
  unanalyzedAssets: number;
  avgHealthScore: number;
  statusCounts: {
    HEALTHY: number;
    MAINTENANCE_REQUIRED: number;
    REPLACE_SOON: number;
  };
  riskCounts: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  recentPredictions: AssetHealthPrediction[];
}

