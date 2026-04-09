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
  is_verified: boolean
  show_profile: boolean
}

export interface AuthResponse {
  user: User
  token: string
  role: string
}
