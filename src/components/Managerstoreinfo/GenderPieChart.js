import React from 'react';
import {View, StyleSheet} from 'react-native';
import Svg, {Path, Text as SvgText} from 'react-native-svg';

const SIZE = 210;
const RADIUS = SIZE / 2;
const STROKE = RADIUS - 1;

function describeArc(cx, cy, r, startAngle, endAngle) {
  const sA = startAngle - 90;
  const eA = endAngle - 90;
  const start = {
    x: cx + r * Math.cos((Math.PI * sA) / 180),
    y: cy + r * Math.sin((Math.PI * sA) / 180),
  };
  const end = {
    x: cx + r * Math.cos((Math.PI * eA) / 180),
    y: cy + r * Math.sin((Math.PI * eA) / 180),
  };
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

function getLabelPosition(cx, cy, r, startAngle, endAngle) {
  const angle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
  const rr = r * 0.6;
  return {
    x: cx + rr * Math.cos(angle),
    y: cy + rr * Math.sin(angle),
  };
}

const GenderPieChart = ({male = 0, female = 0}) => {
  const safeMale = Number(male) || 0;
  const safeFemale = Number(female) || 0;
  const total = safeMale + safeFemale;

  if (total === 0) {
    return (
      <View style={[styles.container, {height: SIZE}]}>
        <Svg width={SIZE} height={SIZE}>
          <SvgText
            x={RADIUS}
            y={RADIUS + 8}
            fontSize="18"
            fontWeight="bold"
            fill="#aaa"
            textAnchor="middle">
            데이터 없음
          </SvgText>
        </Svg>
      </View>
    );
  }

  if (safeMale > 0 && safeFemale === 0) {
    return (
      <View style={styles.container}>
        <Svg width={SIZE} height={SIZE}>
          <Path
            d={'M 105 105 L 105 1 A 104 104 0 1 1 104.99 1 Z'}
            fill="#3CA5FF"
          />
          <SvgText
            x={RADIUS}
            y={RADIUS + 6}
            fontSize="21"
            fontWeight="bold"
            fill="#fff"
            textAnchor="middle">
            100%
          </SvgText>
        </Svg>
      </View>
    );
  }

  if (safeFemale > 0 && safeMale === 0) {
    return (
      <View style={styles.container}>
        <Svg width={SIZE} height={SIZE}>
          <Path
            d={'M 105 105 L 105 1 A 104 104 0 1 1 104.99 1 Z'}
            fill="#FF7096"
          />
          <SvgText
            x={RADIUS}
            y={RADIUS + 6}
            fontSize="21"
            fontWeight="bold"
            fill="#fff"
            textAnchor="middle">
            100%
          </SvgText>
        </Svg>
      </View>
    );
  }

  // 둘 다 값 있음 (애니메이션 제거된 버전)
  const malePercent = (safeMale / total) * 100;
  const femalePercent = 100 - malePercent;

  const maleAngle = (malePercent / 100) * 360;
  const femaleAngle = 360 - maleAngle;

  const maleStart = 0;
  const maleEnd = maleAngle;
  const femaleStart = maleEnd;
  const femaleEnd = 360;

  const malePath = describeArc(RADIUS, RADIUS, STROKE, maleStart, maleEnd);
  const femalePath = describeArc(
    RADIUS,
    RADIUS,
    STROKE,
    femaleStart,
    femaleEnd,
  );

  const maleLabelPos = getLabelPosition(
    RADIUS,
    RADIUS,
    STROKE,
    maleStart,
    maleEnd,
  );
  const femaleLabelPos = getLabelPosition(
    RADIUS,
    RADIUS,
    STROKE,
    femaleStart,
    femaleEnd,
  );

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        <Path d={femalePath} fill="#FF7096" />
        <Path d={malePath} fill="#3CA5FF" />
        {malePercent > 4 && (
          <SvgText
            x={maleLabelPos.x}
            y={maleLabelPos.y + 5}
            fontSize="17"
            fontWeight="400"
            fill="#fff"
            textAnchor="middle">
            {`${malePercent.toFixed(1)}%`}
          </SvgText>
        )}
        {femalePercent > 4 && (
          <SvgText
            x={femaleLabelPos.x}
            y={femaleLabelPos.y + 5}
            fontSize="17"
            fontWeight="400"
            fill="#fff"
            textAnchor="middle">
            {`${femalePercent.toFixed(1)}%`}
          </SvgText>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
    height: 500,
  },
});

export default GenderPieChart;
