import type { SportIconConfig } from './sportIcons';

/**
 * Map facility types to sport icons
 */
export const getFacilityTypeIcon = (facilityType: string): SportIconConfig => {
  const typeLower = facilityType.toLowerCase();
  
  // Map facility types to sports/icons
  const facilityTypeMap: Record<string, SportIconConfig> = {
    // Direct sport mappings
    'fodboldanlæg': { library: 'ionicons', name: 'football' },
    'tennisanlæg': { library: 'material-community', name: 'tennis' },
    'padelbaner': { library: 'material-community', name: 'tennis' },
    'badmintonhaller': { library: 'material-community', name: 'badminton' },
    'squashbaner': { library: 'material-community', name: 'squash' },
    'golfanlæg': { library: 'ionicons', name: 'golf' },
    'svømmeanlæg': { library: 'material-community', name: 'swim' },
    'klatreanlæg': { library: 'material-community', name: 'hiking' },
    'skatefaciliteter': { library: 'material-community', name: 'skateboard' },
    'fitnesscentre': { library: 'material-community', name: 'dumbbell' },
    'atletikanlæg': { library: 'material-community', name: 'run' },
    'bowlingcentre': { library: 'material-community', name: 'bowling' },
    'is- og skøjteanlæg': { library: 'material-community', name: 'ice-skate' },
    'mtb-spor og cykelanlæg': { library: 'ionicons', name: 'bicycle' },
    'motorsportsanlæg': { library: 'material-community', name: 'motorbike' },
    'parkouranlæg': { library: 'material-community', name: 'run-fast' },
    'orienteeringsbaner': { library: 'material-community', name: 'map-marker' },
    'kabelbaner': { library: 'material-community', name: 'water-ski' },
    'alpine skianlæg': { library: 'material-community', name: 'ski' },
    'skydeanlæg': { library: 'material-community', name: 'target' },
    
    // Generic sports halls - use a generic icon
    'store idrætshaller (>800 m2)': { library: 'material-community', name: 'stadium' },
    'små idrætshaller (300-799 m2)': { library: 'material-community', name: 'stadium' },
    'idrætslokaler/sale (<300 m2)': { library: 'material-community', name: 'dumbbell' },
  };
  
  // Try exact match first
  if (facilityTypeMap[typeLower]) {
    return facilityTypeMap[typeLower];
  }
  
  // Try partial matches
  if (typeLower.includes('fodbold')) {
    return { library: 'ionicons', name: 'football' };
  }
  if (typeLower.includes('tennis') || typeLower.includes('padel')) {
    return { library: 'material-community', name: 'tennis' };
  }
  if (typeLower.includes('badminton')) {
    return { library: 'material-community', name: 'badminton' };
  }
  if (typeLower.includes('squash')) {
    return { library: 'material-community', name: 'squash' };
  }
  if (typeLower.includes('golf')) {
    return { library: 'ionicons', name: 'golf' };
  }
  if (typeLower.includes('svømme') || typeLower.includes('bad')) {
    return { library: 'material-community', name: 'swim' };
  }
  if (typeLower.includes('fitness') || typeLower.includes('træning')) {
    return { library: 'material-community', name: 'dumbbell' };
  }
  if (typeLower.includes('klatre')) {
    return { library: 'material-community', name: 'hiking' };
  }
  if (typeLower.includes('skate')) {
    return { library: 'material-community', name: 'skateboard' };
  }
  if (typeLower.includes('idræt') || typeLower.includes('sport')) {
    return { library: 'material-community', name: 'stadium' };
  }
  
  // Default fallback
  return { library: 'ionicons', name: 'location' };
};

