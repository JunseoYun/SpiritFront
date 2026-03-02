import React from 'react';
import Svg, {Path} from 'react-native-svg';

// Menu icon converted from MenuIcon.svg
const MenuIcon = ({size = 20, color = '#333'}) => {
  const height = size;
  const width = (35 / 19) * height;

  return (
    <Svg width={width} height={height} viewBox="0 0 35 19" fill="none">
      <Path
        d="M33 15C34.1046 15 35 15.8954 35 17C35 18.1046 34.1046 19 33 19H13C11.8954 19 11 18.1046 11 17C11 15.8954 11.8954 15 13 15H33ZM33 0C34.1046 0 35 0.895431 35 2C35 3.10457 34.1046 4 33 4H2C0.895431 4 0 3.10457 0 2C0 0.895431 0.895431 0 2 0H33Z"
        fill={color}
      />
    </Svg>
  );
};

export default MenuIcon;
