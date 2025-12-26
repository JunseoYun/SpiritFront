import React from 'react';
import Svg, {Path} from 'react-native-svg';

// Heart outline icon derived from Heart.svg
const HeartIcon = ({
  size = 24,
  color = '#333',
  strokeWidth = 2,
  filled = false,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 7.69431C10 2.99988 3 3.49988 3 9.49991C3 15.4999 12 20.5001 12 20.5001C12 20.5001 21 15.4999 21 9.49991C21 3.49988 14 2.99988 12 7.69431Z"
        stroke={color}
        fill={filled ? color : 'none'}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default HeartIcon;
