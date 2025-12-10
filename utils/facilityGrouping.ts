import type { Facility } from '../types/facility';

export type GroupedFacility = {
  id: string;
  name: string;
  detailedName?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  location: Facility['location'];
  indoor: boolean;
  notes?: string;
  facilityTypes: string[]; // All facility types at this location
  facilities: Facility[]; // Original facilities that were grouped
};

/**
 * Normalize strings for comparison (lowercase, trim, remove extra spaces)
 */
const normalizeString = (str: string): string => {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
};

/**
 * Check if two coordinates are very close (within ~50 meters)
 */
const areCoordinatesClose = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  thresholdMeters: number = 50
): boolean => {
  // Rough conversion: 1 degree latitude ≈ 111 km
  // 1 degree longitude ≈ 111 km * cos(latitude)
  const latDiff = Math.abs(lat1 - lat2) * 111000; // Convert to meters
  const lonDiff = Math.abs(lon1 - lon2) * 111000 * Math.cos((lat1 + lat2) / 2 * Math.PI / 180);
  const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
  return distance < thresholdMeters;
};

/**
 * Check if two facilities are duplicates based on name, address, or coordinates
 */
const areFacilitiesDuplicate = (facility1: Facility, facility2: Facility): boolean => {
  // Check if coordinates are very close (within 50 meters)
  const coordinatesMatch = areCoordinatesClose(
    facility1.location.latitude,
    facility1.location.longitude,
    facility2.location.latitude,
    facility2.location.longitude,
    50
  );

  // Check if name matches (normalized)
  const nameMatch = normalizeString(facility1.name) === normalizeString(facility2.name);

  // Check if address matches (normalized)
  const addressMatch = normalizeString(facility1.address) === normalizeString(facility2.address);

  // Consider them duplicates if:
  // 1. Coordinates are very close AND (name matches OR address matches)
  // 2. Name and address both match (even if coordinates differ slightly)
  return (coordinatesMatch && (nameMatch || addressMatch)) || (nameMatch && addressMatch);
};

/**
 * Group duplicate facilities together
 * Facilities are considered duplicates if they have the same name, address, or are at the same coordinates
 * Optimized using hash maps and spatial grid to reduce O(n²) to approximately O(n)
 */
export function groupDuplicateFacilities(facilities: Facility[]): (Facility | GroupedFacility)[] {
  if (facilities.length === 0) {
    return [];
  }

  // Performance limit: if too many facilities, skip grouping to avoid freezing
  // This is a safety measure - in production, you might want to process in chunks or use web workers
  const MAX_FACILITIES_TO_PROCESS = 5000;
  if (facilities.length > MAX_FACILITIES_TO_PROCESS) {
    console.warn(`Too many facilities (${facilities.length}), skipping grouping to avoid performance issues`);
    return facilities;
  }

  // Cache normalized values to avoid recalculating
  const normalizedCache = new Map<string, { name: string; address: string }>();
  const getNormalized = (facility: Facility) => {
    if (!normalizedCache.has(facility.id)) {
      normalizedCache.set(facility.id, {
        name: normalizeString(facility.name),
        address: normalizeString(facility.address),
      });
    }
    return normalizedCache.get(facility.id)!;
  };

  // Fast path: use hash maps for exact name/address matches (O(n))
  const nameMap = new Map<string, Facility[]>();
  const addressMap = new Map<string, Facility[]>();
  const processed = new Set<string>();
  const result: (Facility | GroupedFacility)[] = [];

  // First pass: group by normalized name and address (fast hash-based lookup)
  for (const facility of facilities) {
    const normalized = getNormalized(facility);

    if (!nameMap.has(normalized.name)) {
      nameMap.set(normalized.name, []);
    }
    nameMap.get(normalized.name)!.push(facility);

    if (!addressMap.has(normalized.address)) {
      addressMap.set(normalized.address, []);
    }
    addressMap.get(normalized.address)!.push(facility);
  }

  // Process facilities - check both name and address matches
  for (const facility of facilities) {
    if (processed.has(facility.id)) {
      continue;
    }

    const normalized = getNormalized(facility);
    const duplicates: Facility[] = [facility];
    processed.add(facility.id);
    const checkedIds = new Set<string>([facility.id]);

    // Check facilities with same name
    const sameNameFacilities = nameMap.get(normalized.name) || [];
    for (const other of sameNameFacilities) {
      if (!checkedIds.has(other.id) && !processed.has(other.id)) {
        checkedIds.add(other.id);
        if (areFacilitiesDuplicate(facility, other)) {
          duplicates.push(other);
          processed.add(other.id);
        }
      }
    }

    // Check facilities with same address
    const sameAddressFacilities = addressMap.get(normalized.address) || [];
    for (const other of sameAddressFacilities) {
      if (!checkedIds.has(other.id) && !processed.has(other.id)) {
        checkedIds.add(other.id);
        if (areFacilitiesDuplicate(facility, other)) {
          duplicates.push(other);
          processed.add(other.id);
        }
      }
    }

    // If we found duplicates, create a grouped facility
    if (duplicates.length > 1) {
      // Use the first facility as the base, but collect all facility types
      const base = duplicates[0];
      const facilityTypes = [...new Set(duplicates.map(f => f.facilityType))];
      
      // Calculate average coordinates for better positioning
      const avgLat = duplicates.reduce((sum, f) => sum + f.location.latitude, 0) / duplicates.length;
      const avgLon = duplicates.reduce((sum, f) => sum + f.location.longitude, 0) / duplicates.length;

      const grouped: GroupedFacility = {
        id: `grouped-${base.id}`,
        name: base.name,
        detailedName: base.detailedName,
        address: base.address,
        phone: base.phone,
        email: base.email,
        website: base.website,
        location: {
          ...base.location,
          latitude: avgLat,
          longitude: avgLon,
        },
        indoor: base.indoor,
        notes: base.notes,
        facilityTypes: facilityTypes.sort(),
        facilities: duplicates,
      };

      result.push(grouped);
    } else {
      // No duplicates, keep as individual facility
      result.push(duplicates[0]);
    }
  }

  return result;
}

/**
 * Check if a facility is a grouped facility
 */
export function isGroupedFacility(
  facility: Facility | GroupedFacility
): facility is GroupedFacility {
  return 'facilityTypes' in facility && Array.isArray((facility as GroupedFacility).facilityTypes);
}

