/**
 * TomTom Search API utility functions
 * 
 * Documentation: https://developer.tomtom.com/search-api/documentation
 */

import type { Location } from '../types/location';

export interface TomTomSearchResult {
  id: string;
  type: string;
  score: number;
  address: {
    streetNumber?: string;
    streetName?: string;
    municipality?: string;
    municipalitySubdivision?: string;
    countrySubdivision?: string;
    postalCode?: string;
    countryCode: string;
    country: string;
    countryCodeISO3?: string;
    freeformAddress: string;
    localName?: string;
  };
  position: {
    lat: number;
    lon: number;
  };
  viewport?: {
    topLeftPoint: { lat: number; lon: number };
    btmRightPoint: { lat: number; lon: number };
  };
  entryPoints?: {
    type: string;
    position: { lat: number; lon: number };
  }[];
}

export interface TomTomSearchResponse {
  summary: {
    query: string;
    queryType: string;
    queryTime: number;
    numResults: number;
    offset: number;
    totalResults: number;
    fuzzyLevel: number;
  };
  results: TomTomSearchResult[];
}

/**
 * Get TomTom API key from environment variables
 */
const getTomTomApiKey = (): string => {
  const apiKey = process.env.EXPO_PUBLIC_TOMTOM_API_KEY;
  if (!apiKey) {
    throw new Error('TomTom API key is not set. Please set EXPO_PUBLIC_TOMTOM_API_KEY in your .env file.');
  }
  return apiKey;
};

/**
 * Perform a fuzzy search using TomTom Search API
 * 
 * @param query - The search query string
 * @param options - Optional search parameters
 * @returns Promise with search results
 */
export const searchLocation = async (
  query: string,
  options?: {
    limit?: number;
    countrySet?: string; // ISO country codes, e.g., "DK" or "DK,SE,NO"
    lat?: number;
    lon?: number;
    radius?: number; // in meters
  }
): Promise<TomTomSearchResponse> => {
  if (!query || query.trim().length === 0) {
    return {
      summary: {
        query: '',
        queryType: 'NON_NEAR',
        queryTime: 0,
        numResults: 0,
        offset: 0,
        totalResults: 0,
        fuzzyLevel: 1,
      },
      results: [],
    };
  }

  const apiKey = getTomTomApiKey();
  const baseUrl = 'https://api.tomtom.com/search/2/search';
  
  // Encode the query
  const encodedQuery = encodeURIComponent(query.trim());
  
  // Build query parameters
  const params = new URLSearchParams({
    key: apiKey,
    limit: String(options?.limit || 10),
  });

  // Add optional parameters
  if (options?.countrySet) {
    params.append('countrySet', options.countrySet);
  }
  
  if (options?.lat !== undefined && options?.lon !== undefined) {
    params.append('lat', String(options.lat));
    params.append('lon', String(options.lon));
  }
  
  if (options?.radius) {
    params.append('radius', String(options.radius));
  }

  const url = `${baseUrl}/${encodedQuery}.json?${params.toString()}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TomTom API error: ${response.status} ${response.statusText}`);
    }

    const data: TomTomSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching location with TomTom:', error);
    throw error;
  }
};

/**
 * Format a TomTom search result into a display string
 */
export const formatLocationResult = (result: TomTomSearchResult): string => {
  return result.address.freeformAddress || 
         `${result.address.streetName || ''} ${result.address.streetNumber || ''}, ${result.address.municipality || ''}`.trim();
};

/**
 * Convert a TomTom search result to a Location object
 */
export const tomTomResultToLocation = (result: TomTomSearchResult): Location => {
  return {
    address: result.address.freeformAddress || 
            `${result.address.streetName || ''} ${result.address.streetNumber || ''}, ${result.address.municipality || ''}`.trim(),
    latitude: result.position.lat,
    longitude: result.position.lon,
    postal_code: result.address.postalCode || '',
    city: result.address.municipality || '',
    country: result.address.country || result.address.countryCode || '',
  };
};

