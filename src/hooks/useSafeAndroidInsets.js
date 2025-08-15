import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Platform} from 'react-native';

export default function useSafeAndroidInsets() {
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'android') {
    return {
      top: insets.top,
      bottom: insets.bottom,
      left: insets.left,
      right: insets.right,
    };
  }

  return {top: 0, bottom: 0, left: 0, right: 0};
}
