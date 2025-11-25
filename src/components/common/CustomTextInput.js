import React, {forwardRef} from 'react';
import {TextInput} from 'react-native';
import {normalizeFont} from '../../hooks/normalizeFont';

const CustomTextInput = forwardRef(({style, maxScale = 1.3, ...props}, ref) => {
  const flattened = Array.isArray(style)
    ? Object.assign({}, ...style)
    : {...(style || {})};

  const {fontSize, ...rest} = flattened;

  const normalizedStyle = {
    ...rest,
    ...(fontSize ? {fontSize: normalizeFont(fontSize, maxScale)} : {}),
  };

  return (
    <TextInput
      ref={ref} // 🔥 여기서 내부 TextInput에 ref 전달됨
      {...props}
      allowFontScaling={false}
      style={normalizedStyle}
    />
  );
});

export default CustomTextInput;
