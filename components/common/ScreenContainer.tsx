import { View, ViewProps } from 'react-native';
import {
  SafeAreaView,
  SafeAreaViewProps,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

interface ScreenContainerProps extends ViewProps {
  safeArea?: boolean;
  edges?: SafeAreaViewProps['edges'];
}

export const ScreenContainer = ({
  children,
  safeArea = false,
  edges = ['top'],
  style,
  className = '',
  ...props
}: ScreenContainerProps) => {
  const insets = useSafeAreaInsets();
  const Container = safeArea ? SafeAreaView : View;

  // For non-SafeAreaView containers, add top padding for status bar
  const containerStyle = !safeArea
    ? [{ paddingTop: insets.top }, style]
    : style;

  return (
    <Container
      className={`flex-1 bg-background ${className}`}
      {...(safeArea ? { edges } : {})}
      style={containerStyle}
      {...props}
    >
      <View className="flex-1 w-full">{children}</View>
    </Container>
  );
};
