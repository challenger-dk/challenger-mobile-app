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

