// User and Authentication types
export type UserRole = 'admin' | 'user' | 'viewer';
export type UserOccupation = 'freelancer' | 'job_holder' | 'student' | 'housewife' | 'other';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  occupation?: UserOccupation;
  avatar?: string;
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}
