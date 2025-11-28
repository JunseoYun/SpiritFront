import React from 'react';
import {Text} from 'react-native';
import {normalizeFont} from '../hooks/normalizeFont';

const CustomText = ({
  children,
  style,
  maxScale = 1.3, // 🔹추가: 원하는 배율
  ...props
}) => {
  const flattened = Array.isArray(style)
    ? Object.assign({}, ...style)
    : {...(style || {})};

  const {fontSize, ...rest} = flattened;

  const normalizedStyle = {
    ...rest,
    ...(fontSize ? {fontSize: normalizeFont(fontSize, maxScale)} : {}),
  };

  return (
    <Text {...props} allowFontScaling={false} style={normalizedStyle}>
      {children}
    </Text>
  );
};

export default CustomText;
