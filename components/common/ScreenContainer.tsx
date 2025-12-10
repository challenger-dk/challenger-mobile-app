import { View, ViewProps } from 'react-native';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';

interface ScreenContainerProps extends ViewProps {
  safeArea?: boolean;
  edges?: SafeAreaViewProps['edges'];
}

export const ScreenContainer = ({
    children,
    safeArea = false,
    edges = ['top'],
    style,
    className = "",
    ...props
  }: ScreenContainerProps) => {
  const Container = safeArea ? SafeAreaView : View;

  return (
    <Container
      className={`flex-1 bg-[#171616] ${className}`}
      {...(safeArea ? { edges } : {})}
      style={style}
      {...props}
    >
      <View className="flex-1 w-full">
        {children}
      </View>
    </Container>
  );
};
