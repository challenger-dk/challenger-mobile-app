import { UserSettings } from '@/types/settings';
import type { Challenge } from './challenge';
import type { Sport } from './sports';

export type User = {
  id: string | number;
  email: string;
  first_name: string;
  last_name?: string;
  profile_picture?: string;
  bio?: string;
  favorite_sports?: Sport[];
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  friends?: PublicUser[];
  birth_date?: Date;
  city?: string;
  settings: UserSettings;
  completed_challenges?: number;
  next_challenges?: Challenge[];
  emergency_contacts?: EmergencyContact[];
};

export type EmergencyContact = {
  id: string | number;
  name: string;
  phone_number: string;
  relationship: string;
}

export type PublicUser = {
  id: string | number;
  email: string;
  first_name: string;
  last_name?: string;
  profile_picture?: string;
  bio?: string;
  city?: string;
  favorite_sports?: Sport[];
  birth_date?: Date;
};

export type UpdateUser = {
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
  bio?: string;
  city?: string;
  favorite_sports?: string[];
  birth_date?: Date;
};

export type CreateUser = {
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
  profile_picture?: string;
  bio?: string;
  city?: string;
  favorite_sports?: string[];
  birth_date?: Date;
};

export interface CommonStats {
  common_friends_count: number;
  common_teams_count: number;
  common_sports: Sport[];
}

export interface UsersSearchResponse {
  users: User[];
  next_cursor: string | null;
}
