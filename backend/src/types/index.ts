// ============================================
// LocalWork — TypeScript Type Definitions
// ============================================

// ── User Roles ──
export type UserRole = 'seeker' | 'employer' | 'admin';
export type JobStatus = 'active' | 'paused' | 'closed' | 'draft';
export type JobModality = 'Presencial' | 'Remoto' | 'Híbrido';
export type ApplicationStatus =
  | 'pending'
  | 'reviewed'
  | 'shortlisted'
  | 'interview'
  | 'accepted'
  | 'rejected';
export type NotificationType =
  | 'application_received'
  | 'application_status_changed'
  | 'profile_viewed'
  | 'new_job_match'
  | 'system';

// ── Database Row Types ──

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  resume_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  owner_id: string;
  name: string;
  nit: string | null;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  location: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  category_id: string;
  title: string;
  description: string;
  requirements: string | null;
  benefits: string | null;
  modality: JobModality;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_text: string | null;
  vacancies: number;
  status: JobStatus;
  is_featured: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobWithDetails extends Job {
  company_name: string;
  company_logo_url: string | null;
  company_verified: boolean;
  category_name: string;
  category_slug: string;
  category_icon: string | null;
  total_applications: number;
  total_saves: number;
}

export interface Application {
  id: string;
  job_id: string;
  seeker_id: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  resume_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Rating {
  id: string;
  rater_id: string;
  rated_id: string;
  job_id: string | null;
  score: number;
  comment: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
}

// ── API Request / Response Types ──

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  company_name?: string;
  company_nit?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Profile;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface JobFilters {
  page?: number;
  per_page?: number;
  category?: string;
  modality?: JobModality;
  location?: string;
  sort?: 'newest' | 'salary-desc' | 'salary-asc';
  search?: string;
  status?: JobStatus;
}

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

// ── Express Augmentation ──
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: UserRole;
  accessToken?: string;
}
