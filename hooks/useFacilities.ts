import { useMemo } from 'react';
import facilitiesDataRaw from '../assets/facilities/facilities.json';
import type { Facility } from '../types/facility';

// Handle both default export and direct import (Metro bundler may wrap JSON differently)
const facilitiesData = (facilitiesDataRaw as any).default || facilitiesDataRaw;

// Ensure we have an array
const allFacilities: Facility[] = Array.isArray(facilitiesData) 
  ? (facilitiesData as Facility[]) 
  : [];

export function useFacilities() {
  // Filter facilities with valid coordinates
  const validFacilities = useMemo(() => {
    return allFacilities.filter(
      (facility: Facility) =>
        facility.location &&
        typeof facility.location.latitude === 'number' &&
        typeof facility.location.longitude === 'number' &&
        !isNaN(facility.location.latitude) &&
        !isNaN(facility.location.longitude)
    );
  }, []);

  return {
    facilities: validFacilities,
    isLoading: false, // Static data, always loaded
    error: null,
    refetch: () => Promise.resolve(), // No-op for static data
  };
}

