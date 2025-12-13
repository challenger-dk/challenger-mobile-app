import type { Sport } from './sports';
import type { Challenge } from './challenge';
import { UserSettings } from '@/types/settings';

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
  age?: number;
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
  age?: number;
};

export type UpdateUser = {
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
  bio?: string;
  city?: string;
  favorite_sports?: string[];
  age?: number;
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
  age?: number;
};

export interface CommonStats {
  common_friends_count: number;
  common_teams_count: number;
  common_sports: Sport[];
}
