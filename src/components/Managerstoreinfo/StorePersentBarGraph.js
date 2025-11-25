import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import CustomText from '../common/CustomText';

const BAR_HEIGHT = 170;

const processData = (data = []) => {
  const grouped = {};
  data.forEach(item => {
    const match = item.label?.match(/^(\d{2})s(MALE|FEMALE)$/);
    if (!match) return;
    const age = `${match[1]}대`;
    const gender = match[2] === 'MALE' ? 'male' : 'female';
    if (!grouped[age]) grouped[age] = {age, male: 0, female: 0};
    grouped[age][gender] = parseFloat(item.percent) || 0;
  });
  const sortKey = ageLabel => {
    const match = ageLabel.match(/^(\d+)/);
    return match ? parseInt(match[1]) : 999;
  };
  return Object.values(grouped).sort((a, b) => sortKey(a.age) - sortKey(b.age));
};

const StorePersentBarGraph = ({ageGenderStats = []}) => {
  const groupedData = processData(ageGenderStats || []);
  const maxPercent = Math.max(
    ...groupedData.flatMap(d => [d.male, d.female]),
    0,
  );

  const renderGuideLine = (percent, top, key) => (
    <View key={key} style={[styles.guideLine, {top}]}>
      {percent !== '0%' && (
        <CustomText style={styles.guideLabel}>{percent}</CustomText>
      )}
      <View style={styles.line} />
    </View>
  );

  if (!groupedData.length) {
    return (
      <View
        style={[
          styles.container,
          {
            height: BAR_HEIGHT + 50,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}>
        <CustomText style={{color: '#aaa'}}>데이터 없음</CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 기준선 */}
      {renderGuideLine(`${maxPercent.toFixed(1)}%`, 0, 'top')}
      {renderGuideLine(
        `${(maxPercent / 2).toFixed(1)}%`,
        BAR_HEIGHT / 2,
        'mid',
      )}
      {renderGuideLine('0%', BAR_HEIGHT, 'bottom')}

      <View style={styles.chartArea}>
        {groupedData.map((item, idx) => (
          <View key={`group-${item.age}`} style={styles.barGroup}>
            <View style={styles.barPair}>
              <View
                style={[
                  styles.bar,
                  {
                    height: maxPercent
                      ? (item.male / maxPercent) * BAR_HEIGHT
                      : 0,
                    backgroundColor: '#3CA5FF',
                  },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  {
                    height: maxPercent
                      ? (item.female / maxPercent) * BAR_HEIGHT
                      : 0,
                    backgroundColor: '#FF7096',
                  },
                ]}
              />
            </View>
            <CustomText style={styles.ageLabel}>{item.age}</CustomText>
          </View>
        ))}
      </View>
    </View>
  );
};

export default StorePersentBarGraph;

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    paddingHorizontal: 40,
    position: 'relative',
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: BAR_HEIGHT + 30,
    marginLeft: 30,
  },
  barGroup: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  barPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: BAR_HEIGHT,
  },
  bar: {
    width: 12,
    marginHorizontal: 1,
    borderRadius: 3,
  },
  ageLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginTop: 6,
    textAlign: 'center',
  },
  guideLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  guideLabel: {
    position: 'absolute',
    top: 3,
    width: 36,
    fontSize: 11,
    color: '#888',
    textAlign: 'left',
    marginLeft: 12,
  },
  line: {
    flex: 1,
    height: 1,
    marginHorizontal: 12,
    backgroundColor: '#BBB',
    opacity: 0.5,
  },
});
