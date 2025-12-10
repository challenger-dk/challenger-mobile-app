import type { User } from './user';
import type { Location } from './location';

export type CreateTeam = {
  name: string;
  location?: Location;
};

export type UpdateTeam = {
  name: string;
};

export type Team = {
  id: number;
  name: string;
  creator: User;
  users: User[];
  location?: Location;
};
