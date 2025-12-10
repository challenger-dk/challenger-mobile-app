import { authenticatedFetch, getApiUrl } from '@/utils/api';

export type ReportTargetType = 'USER' | 'TEAM' | 'CHALLENGE' | 'MESSAGE';

export interface CreateReportDto {
  target_id: number;
  target_type: ReportTargetType;
  reason: string;
  comment?: string;
}

export const createReport = async (data: CreateReportDto) => {
  const response = await authenticatedFetch(getApiUrl('/reports'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.status === 201) {
    return { success: true };
  }

  const text = await response.text();

  // Handle empty responses that aren't strictly 204
  if (!text) {
    if (response.ok) {
      return { success: true };
    }
    throw new Error('Failed to submit report');
  }

  try {
    const responseData = JSON.parse(text);
    if (!response.ok) {
      throw new Error(
        responseData.message || responseData.error || 'Failed to submit report'
      );
    }
    return responseData;
  } catch (e) {
    // If response is OK but not JSON (and not empty), treat as success
    if (response.ok) {
      return { success: true };
    }
    throw new Error('Invalid server response');
  }
};
