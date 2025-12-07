import React from 'react';
import Svg, {Path} from 'react-native-svg';

// Menu icon converted from MenuIcon.svg
const MenuIcon = ({size = 20, color = '#333'}) => {
  const height = size;
  const width = (35 / 19) * height;

  return (
    <Svg width={width} height={height} viewBox="0 0 35 19" fill="none">
      <Path
        d="M22 15C23.1046 15 24 15.8954 24 17C24 18.1046 23.1046 19 22 19H2C0.895431 19 0 18.1046 0 17C0 15.8954 0.895431 15 2 15H22ZM33 0C34.1046 0 35 0.895431 35 2C35 3.10457 34.1046 4 33 4H2C0.895431 4 0 3.10457 0 2C0 0.895431 0.895431 0 2 0H33Z"
        fill={color}
      />
    </Svg>
  );
};

export default MenuIcon;
