import {PixelRatio} from 'react-native';

export const normalizeFont = (size, maxScale = 1.5) => {
  let scale = PixelRatio.getFontScale();
  if (scale > maxScale) scale = maxScale;
  return size * scale;
};
