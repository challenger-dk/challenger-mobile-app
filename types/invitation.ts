import type { User } from './user';

export type CreateInvitation = {
  inviter_id: number | string;
  invitee_id: number | string;
  note: string;
  resource_type: InvitationType;
  resource_id?: number;
};

export type Invitation = {
  id: number;
  inviter: User;
  note: string;
  resource_type: InvitationType;
  status: Status;
};

export type Status = 'pending' | 'accepted' | 'declined';
export type InvitationType = 'team' | 'friend' | 'challenge';
