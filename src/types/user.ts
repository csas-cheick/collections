// Types pour les utilisateurs
export interface User {
  id: number;
  name: string;
  userName: string;
  phone?: string;
  email: string;
  role: string;
  country?: string;
  city?: string;
  status: boolean;
  picture?: string;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  userName: string;
  phone?: string;
  email: string;
  password: string;
  role: string;
  country?: string;
  city?: string;
  status: boolean;
  picture?: string;
}

export interface UpdateUserRequest {
  name: string;
  userName: string;
  phone?: string;
  email: string;
  role: string;
  country?: string;
  city?: string;
  status: boolean;
  picture?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserListResponse {
  success: boolean;
  message: string;
  users: User[];
  totalCount: number;
}

export interface UserOperationResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface UserFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: boolean;
}

export interface UserFormData {
  name: string;
  userName: string;
  phone: string;
  email: string;
  password: string;
  role: string;
  country: string;
  city: string;
  status: boolean;
  picture: string;
  pictureFile?: File;
}

// Options pour les rôles
export const USER_ROLES = [
  { value: 'Admin', label: 'Administrateur' },
  { value: 'User', label: 'Utilisateur' },
] as const;

// Options pour les pays (exemples)
export const COUNTRIES = [
  'France',
  'Belgique',
  'Suisse',
  'Canada',
  'Maroc',
  'Tunisie',
  'Algérie',
  'Sénégal',
  'Côte d\'Ivoire',
  'Cameroun',
  'Ghana',
  'RDC',
  'Nigeria',
  'Mali',
  'Burkina Faso',
  'Niger',
  'Tchad',
] as const;

export type UserRole = typeof USER_ROLES[number]['value'];
export type Country = typeof COUNTRIES[number];