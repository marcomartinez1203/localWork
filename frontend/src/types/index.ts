// ============================================
// LocalWork — Shared Types (Frontend)
// ============================================

export type UserRole = 'seeker' | 'employer' | 'admin'
export type JobStatus = 'active' | 'paused' | 'closed' | 'draft'
export type JobModality = 'Presencial' | 'Remoto' | 'Híbrido'
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'accepted' | 'rejected' | 'completed'
export type NotificationType = 'application_received' | 'application_status_changed' | 'profile_viewed' | 'new_job_match' | 'system'

export interface User {
  id: string
  role: UserRole
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  bio?: string
  location?: string
  service_public: boolean
  resume_url?: string
  skills?: string[]
  work_type?: string
  availability?: string
  hourly_rate?: string
  education: Education[]
  experience: Experience[]
  preferred_mode?: 'jobs' | 'services'
  created_at: string
  updated_at: string
}

export interface Education {
  institution: string
  degree: string
  field?: string
  start_year: number
  end_year?: number
}

export interface Experience {
  company: string
  position: string
  description?: string
  start_date: string
  end_date?: string
}

export interface Company {
  id: string
  owner_id: string
  name: string
  nit?: string
  description?: string
  logo_url?: string
  website?: string
  phone?: string
  address?: string
  location?: string
  verified: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  description?: string
  sort_order: number
  created_at: string
}

export interface Barrio {
  id: string
  nombre: string
  lat: number
  lng: number
}

export interface Job {
  id: string
  employer_id: string
  company_id?: string
  category_id: string
  title: string
  description: string
  requirements?: string
  benefits?: string
  salary_min?: number
  salary_max?: number
  salary_text?: string
  modality: JobModality
  location: string
  status: JobStatus
  barrio_id?: string
  vacancies: number
  expires_at?: string
  created_at: string
  updated_at: string
  // joined fields
  company_name?: string
  category_name?: string
  category_slug?: string
  logo_url?: string
  is_saved?: boolean
  distance?: number
  company_verified?: boolean
  total_applications?: number
  location_lat?: number
  location_lng?: number
  lat?: number
  lng?: number
  barrio_nombre?: string
}

export interface JobFilters {
  page?: number
  perPage?: number
  category?: string
  modality?: string
  location?: string
  sort?: string
  search?: string
  status?: string
}

export interface NearbyFilters {
  lat?: number
  lng?: number
  radius?: number
  category?: string
  modality?: string
  barrio_id?: string
}

export interface Application {
  id: string
  job_id: string
  seeker_id: string
  cover_letter?: string
  resume_url?: string
  status: ApplicationStatus
  notes?: string
  created_at: string
  updated_at: string
  // joined fields
  job_title?: string
  company_name?: string
  seeker_name?: string
  seeker_avatar?: string
}

export interface ApplicationFilters {
  page?: number
  perPage?: number
  status?: ApplicationStatus
}

export interface Rating {
  id: string
  rater_id: string
  rated_user_id: string
  job_id?: string
  application_id?: string
  rating_type: 'general' | 'post_service'
  score: number
  punctuality?: number
  quality?: number
  communication?: number
  would_recommend?: boolean
  comment?: string
  is_visible: boolean
  created_at: string
  // joined fields
  rater_name?: string
  rater?: { full_name?: string; avatar_url?: string }
}

export interface RatingBreakdown {
  avg_score: number
  avg_punctuality: number
  avg_quality: number
  avg_communication: number
  total_ratings: number
  recommend_pct: number
}

export interface RatingSummary {
  average: number
  count: number
  total?: number
  breakdown?: RatingBreakdown
  ratings: Rating[]
  data?: Rating[]
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message?: string
  data?: Record<string, unknown>
  read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  application_id?: string
  seeker_id: string
  employer_id: string
  last_message_at?: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content?: string
  attachment_url?: string
  attachment_name?: string
  created_at: string
  read_at?: string
}

export interface ConversationSummary {
  id: string
  application_id: string | null
  last_message_at: string | null
  created_at: string
  kind: 'application' | 'direct'
  other_user: {
    id: string
    full_name: string
    avatar_url: string | null
  }
  last_message: {
    content: string | null
    created_at: string
    sender_id: string
    attachment_url: string | null
    attachment_name: string | null
  }
  application?: {
    job_title?: string
  }
}

export interface WorkerProfile {
  id: string
  full_name: string
  avatar_url?: string
  bio?: string
  location?: string
  skills?: string[]
  work_type?: string
  phone?: string
  email?: string
  availability?: string
  hourly_rate?: string
  service_public: boolean
  avg_rating?: number
  created_at: string
}

export interface WorkerFilters {
  page?: number
  perPage?: number
  skill?: string
  search?: string
  workType?: string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}
