import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ReactElement } from 'react';

export type IconLibrary = 'ionicons' | 'material' | 'material-community';

export interface SportIconConfig {
  library: IconLibrary;
  name: string;
}

export const getSportIcon = (sport: string): SportIconConfig => {
  const iconMap: Record<string, SportIconConfig> = {
    Football: { library: 'ionicons', name: 'football' },
    Soccer: { library: 'ionicons', name: 'football' },
    Basketball: { library: 'ionicons', name: 'basketball' },
    Tennis: { library: 'material-community', name: 'tennis' },
    PadelTennis: { library: 'material-community', name: 'tennis' },
    TableTennis: { library: 'material-community', name: 'table-tennis' },
    Volleyball: { library: 'material-community', name: 'volleyball' },
    Golf: { library: 'ionicons', name: 'golf' },
    Badminton: { library: 'material-community', name: 'badminton' },
    Boxing: { library: 'material-community', name: 'boxing-gloves' },
    Squash: { library: 'material-community', name: 'squash' },
    Petanque: { library: 'material-community', name: 'bowling' },
    Hockey: { library: 'material-community', name: 'hockey-sticks' },
    Handball: { library: 'material-community', name: 'handball' },
    Running: { library: 'material-community', name: 'run' },
    Biking: { library: 'ionicons', name: 'bicycle' },
    Minigolf: { library: 'ionicons', name: 'golf' },
    Climbing: { library: 'material-community', name: 'hiking' },
    Skateboarding: { library: 'material-community', name: 'skateboard' },
    Surfing: { library: 'material-community', name: 'surfing' },
    Hiking: { library: 'material-community', name: 'hiking' },
    UltimateFrisbee: { library: 'material-community', name: 'frisbee' },
    Floorball: { library: 'material-community', name: 'hockey-sticks' },
  };
  return iconMap[sport] || { library: 'ionicons', name: 'ellipse' };
};

interface SportIconProps {
  sport: string;
  size?: number;
  color?: string;
}

export const SportIcon = ({
  sport,
  size = 48,
  color = '#ffffff',
}: SportIconProps): ReactElement => {
  const iconConfig = getSportIcon(sport);

  switch (iconConfig.library) {
    case 'material':
      return (
        <MaterialIcons
          name={iconConfig.name as any}
          size={size}
          color={color}
        />
      );
    case 'material-community':
      return (
        <MaterialCommunityIcons
          name={iconConfig.name as any}
          size={size}
          color={color}
        />
      );
    case 'ionicons':
    default:
      return (
        <Ionicons name={iconConfig.name as any} size={size} color={color} />
      );
  }
};
