export type UserOccupation = 'freelancer' | 'job_holder' | 'student' | 'housewife' | 'other';

export interface User {
  id: string;
  email: string;
  name: string;
  occupation?: UserOccupation;
  avatar?: string;
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}
