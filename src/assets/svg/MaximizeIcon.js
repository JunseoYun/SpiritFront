import React from 'react';
import Svg, {Path} from 'react-native-svg';

const MaximizeIcon = ({size = 18, color = '#fff', strokeWidth = 2}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 10V4H14M4 14V20H10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
    </Svg>
  );
};

export default MaximizeIcon;
