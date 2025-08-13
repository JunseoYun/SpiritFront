import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';

const AgeDistributionTable = ({ageDistributionData, option}) => {
  const maxPopulation = useMemo(
    () => Math.max(...ageDistributionData.map(item => item.population)),
    [ageDistributionData],
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={[styles.label, styles.headerText]}>
            {option === 'storeLike' ? '연령대 (인원)' : '연령대'}
          </Text>
          <View style={{flex: 1}}>
            <Text style={styles.headerText}>비율 그래프</Text>
          </View>
        </View>
        {ageDistributionData.map((item, index) => {
          const isMax = item.population === maxPopulation;
          const percentStr = `${item.population.toFixed(1)}%`;
          const barColor = isMax ? '#45C9FF' : '#ABE3FA';
          const widthPercent = (item.population / maxPopulation) * 100;

          return (
            <View key={item.name} style={styles.dataRow}>
              <Text style={[styles.label, isMax && styles.boldText]}>
                {item.name} {option === 'storeLike' && `(${item.count})`}
              </Text>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${widthPercent}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.barText,
                    {color: item.population < 5 ? '#777' : '#ffffff'},
                  ]}>
                  {percentStr}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default AgeDistributionTable;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    backgroundColor: '#f9fafb',
    paddingTop: 10,
  },
  card: {
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  headerText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    color: '#334155',
    marginRight: 7,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 12,
  },
  label: {
    width: 70,
    fontSize: 13.5,
    fontFamily: 'Pretendard-Medium',
    color: '#1e293b',
    textAlign: 'center',
  },
  boldText: {
    fontFamily: 'Pretendard-Bold',
    color: '#0f172a',
  },
  barContainer: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginLeft: 5,
  },
  barFill: {
    height: '100%',
    borderTopRightRadius: 100,
    borderBottomRightRadius: 100,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  barText: {
    position: 'absolute',
    fontSize: 13,
    fontFamily: 'Pretendard-Bold',
    marginLeft: 5,
  },
});
