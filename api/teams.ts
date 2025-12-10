import type { CreateTeam, UpdateTeam } from '../types/team';
import { authenticatedFetch, getApiUrl } from '../utils/api';

const type: string = 'teams';

// GET
export const getTeams = async () => {
  const response = await authenticatedFetch(getApiUrl(`/${type}`));
  return response.json();
};

export const getTeam = async (teamId: string) => {
  const response = await authenticatedFetch(getApiUrl(`/${type}/${teamId}`));
  return response.json();
};

export const getTeamsByUser = async (userId: string) => {
  const response = await authenticatedFetch(
    getApiUrl(`/${type}/user/${userId}`)
  );
  return response.json();
};

export const getMyTeams = async () => {
  const response = await authenticatedFetch(getApiUrl(`/${type}/me`));
  return response.json();
};

// POST
export const createTeam = async (team: CreateTeam) => {
  const response = await authenticatedFetch(getApiUrl(`/${type}`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(team),
  });
  return response.json();
};

// PUT
export const updateTeam = async (teamId: string, team: UpdateTeam) => {
  const response = await authenticatedFetch(getApiUrl(`/${type}/${teamId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(team),
  });
  return response.json();
};

// DELETE
export const deleteTeam = async (teamId: string) => {
  const response = await authenticatedFetch(getApiUrl(`/${type}/${teamId}`), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const leaveTeam = async (teamId: string) => {
  const response = await authenticatedFetch(
    getApiUrl(`/${type}/${teamId}/leave`),
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const removeUserFromTeam = async (teamId: string, rmvUserId: string) => {
  const response = await authenticatedFetch(
    getApiUrl(`/${type}/${teamId}/user/${rmvUserId}`),
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};
