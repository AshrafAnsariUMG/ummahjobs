export interface User {
  id: string
  email: string
  display_name: string
  role: 'candidate' | 'employer' | 'admin'
  legacy_password: boolean
  is_active: boolean
  email_verified_at: string | null
}

export interface Candidate {
  id: number
  user_id: string
  title: string | null
  location: string | null
  phone: string | null
  gender: string | null
  age_range: string | null
  experience_years: string | null
  qualification: string | null
  languages: string[] | null
  job_category: string | null
  salary_type: string | null
  socials: { network: string; url: string }[] | null
  cv_path: string | null
  profile_photo_path: string | null
  show_profile: boolean
  profile_complete_pct: number
}

export interface Employer {
  id: number
  user_id: string
  company_name: string
  slug: string
  category: string | null
  description: string | null
  email: string | null
  phone: string | null
  address: string | null
  logo_path: string | null
  cover_photo_path: string | null
  map_lat: number | null
  map_lng: number | null
  socials: { network: string; url: string }[] | null
  is_verified: boolean
  show_profile: boolean
  views_count: number
}

export interface EmployerReview {
  id: number
  employer_id: number
  reviewer_id: string
  rating: number
  review_text: string | null
  created_at: string
  reviewer: { id: string; display_name: string } | null
}

export interface JobType {
  id: number
  name: string
  slug: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface AuthResponse {
  user: User
  token: string
  role: string
}

export interface JobCategory {
  id: number
  name: string
  slug: string
  icon: string | null
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content?: string
  category: string | null
  featured_image_path: string | null
  published_at: string
  author?: { id: string; display_name: string } | null
}

export interface Package {
  id: number
  name: string
  price: number
  post_count: number
  post_type: string
  duration_days: number
  includes_newsletter: boolean
  is_active: boolean
}

export interface EmployerPackageItem {
  id: number
  employer_id: number
  package_id: number
  stripe_order_id: string | null
  credits_remaining: number
  duration_days: number
  granted_by_admin: boolean
  expires_at: string | null
  created_at: string
  package: Package | null
}

export interface CreditBalance {
  total_credits: number
  packages: EmployerPackageItem[]
}

export interface StripeOrderItem {
  id: number
  employer_id: number
  package_id: number
  stripe_session_id: string
  amount: number
  status: string
  completed_at: string | null
  created_at: string
  package: Package | null
}

export interface Job {
  id: number
  title: string
  slug: string
  description: string
  job_type: string | null
  location: string | null
  country: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  salary_type: string | null
  experience_level: string | null
  career_level: string | null
  apply_type: string
  apply_url: string | null
  is_featured: boolean
  is_urgent: boolean
  status: string
  expires_at: string | null
  views_count: number
  created_at: string
  employer: Employer
  category: JobCategory | null
}
