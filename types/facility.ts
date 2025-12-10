import type { Location } from './location';

export type Facility = {
  id: string;
  name: string;
  detailedName?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  facilityType: string;
  location: Location;
  indoor: boolean;
  notes?: string;
};
