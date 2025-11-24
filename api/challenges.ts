import type { CreateChallenge } from '../types/challenge';
import { authenticatedFetch, getApiUrl } from '../utils/api';

const type: string = 'challenges';

// GET
export const getChallenges = async () => {
  const response = await authenticatedFetch(getApiUrl(`/${type}`));
  return response.json();
};

export const getChallenge = async (challengeId: string) => {
  const response = await authenticatedFetch(getApiUrl(`/${type}/${challengeId}`));
  return response.json();
};

// POST
export const createChallenge = async (challenge: CreateChallenge) => {
  const response = await authenticatedFetch(getApiUrl(`/${type}`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(challenge),
  });
  return response.json();
};

// POST - Join challenge
export const joinChallenge = async (challengeId: string) => {
  const response = await authenticatedFetch(getApiUrl(`/${type}/${challengeId}/join`), {
    method: 'POST',
  });
  
  // Handle empty responses (e.g., 204 No Content or empty 200)
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    return {};
  }
  
  return JSON.parse(text);
};

// POST - Leave challenge
export const leaveChallenge = async (challengeId: string) => {
  const response = await authenticatedFetch(getApiUrl(`/${type}/${challengeId}/leave`), {
    method: 'POST',
  });
  
  // Handle empty responses (e.g., 204 No Content or empty 200)
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    return {};
  }
  
  return JSON.parse(text);
};

