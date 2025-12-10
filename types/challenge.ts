import type { Location } from './location';
import type { Team } from './team';
import type { User } from './user';

export type CreateChallenge = {
  name: string;
  description: string;
  sport: string;
  location: Location;
  is_public: boolean;
  is_indoor: boolean;
  play_for: string;
  has_costs: boolean;
  comment: string;
  users: number[];
  teams: number[];
  date: string;
  start_time: string;
  end_time: string;
  team_size: number;
};

export type Challenge = {
  id: number;
  name: string;
  description: string;
  sport: string;
  location: Location;
  creator: User;
  users: User[];
  teams: Team[];
  is_public: boolean;
  is_indoor: boolean;
  is_completed: boolean;
  play_for: string;
  has_costs: boolean;
  comment: string;
  date: string;
  start_time: string;
  end_time: string;
  team_size: number;
};
