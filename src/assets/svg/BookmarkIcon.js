import React from 'react';
import Svg, {Path} from 'react-native-svg';

// Bookmark outline icon to match the line style of other custom icons
const BookmarkIcon = ({
  size = 24,
  color = '#333',
  strokeWidth = 2,
  filled = false,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.5 3H16.5C17.6046 3 18.5 3.89543 18.5 5V20L12 16.2L5.5 20V5C5.5 3.89543 6.39543 3 7.5 3Z"
        stroke={color}
        fill={filled ? color : 'none'}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default BookmarkIcon;
