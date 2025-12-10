import type { PublicUser } from './user';

export type NotificationType =
  | 'system'
  | 'team_invite'
  | 'team_accept'
  | 'team_decline'
  | 'friend_request'
  | 'friend_accept'
  | 'friend_decline'
  | 'challenge_request'
  | 'challenge_accept'
  | 'challenge_decline';

export interface Notification {
  id: number;
  title: string;
  content: string;
  type: NotificationType;
  is_read: boolean;
  actor?: PublicUser;
  resource_id?: number;
  resource_type?: string;
  invitation_id?: number;
  created_at: string;
}
