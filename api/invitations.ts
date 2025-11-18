import { authenticatedFetch, getApiUrl } from '@/utils/api';
import { CreateInvitation } from "@/types/invitation";

const type: string = 'invitations';

export const getInvitationsByUser = async (userId: number | string) => {
  const response = await authenticatedFetch(getApiUrl(`/${type}/user/${userId}`));
  return response.json();
};

export const getMyInvitations = async () => {
  const response = await authenticatedFetch(getApiUrl(`/${type}/me`));
  return response.json();
};

export const SendInvitation = async (inv: CreateInvitation) => {
  const response = await authenticatedFetch(getApiUrl(`/${type}`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inv),
  });

  if (response.ok) {
    return;
  }

  // Read the error response as text, not JSON
  const errorText = await response.text();
  throw new Error(errorText || 'Failed to send invitation');
};

export const acceptInvitation = async (invId: number) => {
  const response = await authenticatedFetch(getApiUrl(`/${type}/${invId}/accept`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (response.ok) {
    return;
  }

  // Read the error response as text, not JSON
  const errorText = await response.text();
  throw new Error(errorText || 'Failed to accept invitation');
};

export const declineInvitation = async (invId: number) => {
  const response = await authenticatedFetch(getApiUrl(`/${type}/${invId}/decline`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (response.ok) {
    return;
  }

  // Read the error response as text, not JSON
  const errorText = await response.text();
  throw new Error(errorText || 'Failed to decline invitation');
};