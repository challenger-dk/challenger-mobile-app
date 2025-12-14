import type { CreateChallenge } from '../types/challenge';
import { authenticatedFetch, getApiUrl } from '../utils/api';

const type: string = 'challenges';

// GET
export const getChallenges = async () => {
  const response = await authenticatedFetch(getApiUrl(`/${type}`));
  return response.json();
};

export const getChallenge = async (challengeId: string) => {
  const response = await authenticatedFetch(
    getApiUrl(`/${type}/${challengeId}`)
  );
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

  // Check if response is successful
  if (!response.ok) {
    // Try to parse error message from response
    let errorMessage = `Failed to create challenge: ${response.status} ${response.statusText}`;
    try {
      const text = await response.text();
      if (text) {
        try {
          const errorData = JSON.parse(text);
          // Handle different error response formats
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } catch {
          // If JSON parsing fails, use the text as error message
          // This handles cases where backend returns plain text error messages
          errorMessage = text;
        }
      }
    } catch {
      // If reading response fails, use the default error message
    }
    throw new Error(errorMessage);
  }

  // Parse successful response
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    return {};
  }
  return JSON.parse(text);
};

// POST - Join challenge
export const joinChallenge = async (challengeId: string) => {
  const response = await authenticatedFetch(
    getApiUrl(`/${type}/${challengeId}/join`),
    {
      method: 'POST',
    }
  );

  // Handle empty responses (e.g., 204 No Content or empty 200)
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    return {};
  }

  return JSON.parse(text);
};

// POST - Leave challenge
export const leaveChallenge = async (challengeId: string) => {
  const response = await authenticatedFetch(
    getApiUrl(`/${type}/${challengeId}/leave`),
    {
      method: 'POST',
    }
  );

  // Handle empty responses (e.g., 204 No Content or empty 200)
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    return {};
  }

  return JSON.parse(text);
};
