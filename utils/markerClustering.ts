import type { Challenge } from '../types/challenge';
import type { Facility } from '../types/facility';

export interface Cluster {
  id: string;
  challenges: Challenge[];
  latitude: number;
  longitude: number;
  count: number;
}

export interface FacilityCluster {
  id: string;
  facilities: Facility[];
  latitude: number;
  longitude: number;
  count: number;
}

/**
 * Calculate distance between two coordinates in meters using Haversine formula
 */
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Cluster challenges based on zoom level and distance
 * @param challenges Array of challenges to cluster
 * @param region Current map region
 * @returns Array of clusters and individual challenges
 */
export function clusterChallenges(
  challenges: Challenge[],
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }
): { clusters: Cluster[]; individualChallenges: Challenge[] } {
  // Calculate clustering threshold based on zoom level
  // Higher latitudeDelta = more zoomed out = larger clustering distance
  // We'll cluster markers that are within ~3% of the visible area (more aggressive)
  const clusteringDistance = region.latitudeDelta * 111000 * 0.05; // Convert degrees to meters, then 3% of visible area
  
  // If zoomed in enough (latitudeDelta < 0.005), don't cluster (lower threshold = cluster even when more zoomed in)
  if (region.latitudeDelta < 0.001) {
    return {
      clusters: [],
      individualChallenges: challenges,
    };
  }

  const clusters: Cluster[] = [];
  const processed = new Set<number>();
  const individualChallenges: Challenge[] = [];

  for (let i = 0; i < challenges.length; i++) {
    if (processed.has(challenges[i].id)) continue;

    const challenge = challenges[i];
    const nearbyChallenges: Challenge[] = [challenge];
    processed.add(challenge.id);

    // Find all nearby challenges
    for (let j = i + 1; j < challenges.length; j++) {
      if (processed.has(challenges[j].id)) continue;

      const otherChallenge = challenges[j];
      const distance = getDistance(
        challenge.location.latitude,
        challenge.location.longitude,
        otherChallenge.location.latitude,
        otherChallenge.location.longitude
      );

      if (distance <= clusteringDistance) {
        nearbyChallenges.push(otherChallenge);
        processed.add(otherChallenge.id);
      }
    }

    // If we have multiple challenges, create a cluster
    if (nearbyChallenges.length > 1) {
      // Calculate cluster center (average of all challenge locations)
      const avgLat =
        nearbyChallenges.reduce(
          (sum, c) => sum + c.location.latitude,
          0
        ) / nearbyChallenges.length;
      const avgLon =
        nearbyChallenges.reduce(
          (sum, c) => sum + c.location.longitude,
          0
        ) / nearbyChallenges.length;

      clusters.push({
        id: `cluster-${challenge.id}`,
        challenges: nearbyChallenges,
        latitude: avgLat,
        longitude: avgLon,
        count: nearbyChallenges.length,
      });
    } else {
      // Single challenge, show individually
      individualChallenges.push(challenge);
    }
  }

  return { clusters, individualChallenges };
}

/**
 * Cluster facilities based on zoom level and distance
 * @param facilities Array of facilities to cluster
 * @param region Current map region
 * @returns Array of clusters and individual facilities
 */
export function clusterFacilities(
  facilities: Facility[],
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }
): { clusters: FacilityCluster[]; individualFacilities: Facility[] } {
  // Calculate clustering threshold based on zoom level
  // Higher latitudeDelta = more zoomed out = larger clustering distance
  // We'll cluster markers that are within ~20% of the visible area (more aggressive)
  const clusteringDistance = region.latitudeDelta * 111000 * 0.05; // Convert degrees to meters, then 20% of visible area
  
  // If zoomed in enough (latitudeDelta < 0.001), don't cluster (lower threshold = cluster even when more zoomed in)
  if (region.latitudeDelta < 0.001) {
    return {
      clusters: [],
      individualFacilities: facilities,
    };
  }

  const clusters: FacilityCluster[] = [];
  const processed = new Set<string>();
  const individualFacilities: Facility[] = [];

  for (let i = 0; i < facilities.length; i++) {
    if (processed.has(facilities[i].id)) continue;

    const facility = facilities[i];
    const nearbyFacilities: Facility[] = [facility];
    processed.add(facility.id);

    // Find all nearby facilities
    for (let j = i + 1; j < facilities.length; j++) {
      if (processed.has(facilities[j].id)) continue;

      const otherFacility = facilities[j];
      const distance = getDistance(
        facility.location.latitude,
        facility.location.longitude,
        otherFacility.location.latitude,
        otherFacility.location.longitude
      );

      if (distance <= clusteringDistance) {
        nearbyFacilities.push(otherFacility);
        processed.add(otherFacility.id);
      }
    }

    // If we have multiple facilities, create a cluster
    if (nearbyFacilities.length > 1) {
      // Calculate cluster center (average of all facility locations)
      const avgLat =
        nearbyFacilities.reduce(
          (sum, f) => sum + f.location.latitude,
          0
        ) / nearbyFacilities.length;
      const avgLon =
        nearbyFacilities.reduce(
          (sum, f) => sum + f.location.longitude,
          0
        ) / nearbyFacilities.length;

      clusters.push({
        id: `facility-cluster-${facility.id}`,
        facilities: nearbyFacilities,
        latitude: avgLat,
        longitude: avgLon,
        count: nearbyFacilities.length,
      });
    } else {
      // Single facility, show individually
      individualFacilities.push(facility);
    }
  }

  return { clusters, individualFacilities };
}

