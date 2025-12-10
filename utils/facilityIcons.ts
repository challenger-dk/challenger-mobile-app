export type FacilityCategory =
  | 'Boldspil'
  | 'Ketchersport'
  | 'Andet'
  | 'Sportshaller'
  | 'Open area';

export interface FacilityCategoryConfig {
  category: FacilityCategory;
  iconLibrary: 'ionicons' | 'material-community' | 'fontawesome6';
  iconName: string;
  color: string;
}

/**
 * Categorize facility types into 5 main categories
 */
export const getFacilityCategory = (facilityType: string): FacilityCategory => {
  const typeLower = facilityType.toLowerCase();

  // Boldspil - football/soccer facilities
  if (typeLower.includes('fodbold') || typeLower.includes('fodboldanlæg')) {
    return 'Boldspil';
  }

  // Ketchersport - racket sports
  if (
    typeLower.includes('tennis') ||
    typeLower.includes('padel') ||
    typeLower.includes('badminton') ||
    typeLower.includes('squash')
  ) {
    return 'Ketchersport';
  }

  // Sportshaller - sports halls
  if (
    typeLower.includes('idræt') ||
    typeLower.includes('sportshal') ||
    typeLower.includes('idrætshal') ||
    typeLower.includes('sportshaller') ||
    typeLower.includes('store idrætshaller') ||
    typeLower.includes('små idrætshaller') ||
    typeLower.includes('idrætslokaler')
  ) {
    return 'Sportshaller';
  }

  // Open area - outdoor/open spaces
  if (
    typeLower.includes('åbent område') ||
    typeLower.includes('open area') ||
    typeLower.includes('åben plads') ||
    typeLower.includes('græs') ||
    typeLower.includes('mark')
  ) {
    return 'Open area';
  }

  // Default to "Andet" for everything else
  return 'Andet';
};

/**
 * Get icon and color configuration for a facility category
 */
export const getFacilityCategoryConfig = (
  facilityType: string
): FacilityCategoryConfig => {
  const category = getFacilityCategory(facilityType);

  switch (category) {
    case 'Boldspil':
      return {
        category: 'Boldspil',
        iconLibrary: 'ionicons',
        iconName: 'football',
        color: 'softGreen',
      };
    case 'Ketchersport':
      return {
        category: 'Ketchersport',
        iconLibrary: 'ionicons',
        iconName: 'tennisball',
        color: 'softBlue',
      };
    case 'Sportshaller':
      return {
        category: 'Sportshaller',
        iconLibrary: 'fontawesome6',
        iconName: 'school-flag',
        color: 'softPurple',
      };
    case 'Open area':
      return {
        category: 'Open area',
        iconLibrary: 'material-community',
        iconName: 'land-fields',
        color: 'darkBrown',
      };
    case 'Andet':
    default:
      return {
        category: 'Andet',
        iconLibrary: 'ionicons',
        iconName: 'location', // placeholder icon
        color: '#262626', // same as Challenge Markers
      };
  }
};
