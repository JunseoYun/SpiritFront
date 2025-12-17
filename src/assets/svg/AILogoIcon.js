import React from 'react';
import Svg, {Defs, LinearGradient, Path, Stop} from 'react-native-svg';

const AILogoIcon = ({size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 41 41" fill="none">
    <Defs>
      <LinearGradient
        id="aiLogoGradient"
        x1="48.2734"
        y1="-8.72461"
        x2="-4.40733"
        y2="52.0212"
        gradientUnits="userSpaceOnUse">
        <Stop stopColor="#3CBBFF" />
        <Stop offset="0.5" stopColor="#30D4F9" />
        <Stop offset="1" stopColor="#9A6CFF" />
      </LinearGradient>
    </Defs>
    <Path
      d="M38.5862 0.0975548C39.4326 -0.297666 40.3106 0.580332 39.9154 1.42673L27.8174 27.3357C27.7181 27.5484 27.5471 27.7194 27.3344 27.8187L1.42538 39.9168C0.57898 40.312 -0.299016 39.434 0.0962047 38.5876L12.1942 12.6786C12.2935 12.4659 12.4645 12.2949 12.6772 12.1956L38.5862 0.0975548Z"
      fill="url(#aiLogoGradient)"
    />
  </Svg>
);

const AIEmptyLogoIcon = ({size = 24, color = '#fff'}) => (
  <Svg width={size} height={size} viewBox="0 0 41 41" fill="none">
    <Path
      d="M38.5862 0.0975551C39.4326 -0.297666 40.3106 0.580331 39.9154 1.42673L27.8174 27.3357C27.7181 27.5484 27.5471 27.7194 27.3344 27.8187L1.42538 39.9168C0.578979 40.312 -0.299015 39.434 0.0962033 38.5876L12.1942 12.6786C12.2935 12.4659 12.4645 12.2949 12.6772 12.1956L38.5862 0.0975551Z"
      fill={color}
    />
  </Svg>
);

export {AILogoIcon, AIEmptyLogoIcon};
