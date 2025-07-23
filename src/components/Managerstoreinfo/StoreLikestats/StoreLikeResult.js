import React, {useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  InteractionManager,
} from 'react-native';
import {PieChart, BarChart} from 'react-native-chart-kit';
import ResultitemCustom from '../StoreAreastats/ResultitemCustom';

const screenWidth = Dimensions.get('window').width;

const StoreLikeResult = ({result, setLoading}) => {
  useEffect(() => {
    if (result) {
      // 그래프 렌더링이 모두 끝난 후에 loading 끄기
      InteractionManager.runAfterInteractions(() => {
        setLoading(false);
      });
    } else {
      setLoading(true);
    }
  }, [result]);

  const data = result?.data || [];

  const genderLabels = {MALE: '남자', FEMALE: '여자'};
  const genders = ['MALE', 'FEMALE'];

  const hasGender = data.every(item => item.gender);
  const hasAgeGroup = data.every(item => item.ageGroup);

  const isAllFiltersPresent = hasGender && hasAgeGroup;
  const isGenderOnly = hasGender && !hasAgeGroup;
  const isAgeOnly = !hasGender && hasAgeGroup;

  const ageGroupColors = {
    '10s': '#4F98FF',
    '20s': '#FF8C00',
    '30s': '#8A2BE2',
    '40s': '#228B22',
    '50s': '#FF1493',
    '60s': '#FFD700',
    '70s': '#16BBFF',
  };

  const genderOnlyData = genders.map(g => {
    const found = data.find(item => item.gender === g);
    return {
      gender: genderLabels[g],
      count: found ? found.count : 0,
      color: g === 'MALE' ? '#3CA5FF' : '#FF6F61',
    };
  });

  const ageOnlyData = data
    .filter(item => item.ageGroup && !item.gender)
    .map(item => ({
      ageGroup: item.ageGroup,
      count: item.count,
      color: ageGroupColors[item.ageGroup] || '#4F98FF',
    }))
    .sort((a, b) => parseInt(a.ageGroup) - parseInt(b.ageGroup));

  const validData = data.filter(
    item => item.ageGroup && genders.includes(item.gender),
  );

  const ageGroups = Array.from(
    new Set(validData.map(item => item.ageGroup)),
  ).sort((a, b) => parseInt(a) - parseInt(b));

  const groupedCombinedData = [];
  const groupedColors = [];

  ageGroups.forEach(ageGroup => {
    genders.forEach(gender => {
      const label = `${ageGroup.replace('s', '대')}\n${genderLabels[gender]}`;
      const found = validData.find(
        item => item.ageGroup === ageGroup && item.gender === gender,
      );
      const count = found ? found.count : 0;

      groupedCombinedData.push({label, count});
      groupedColors.push(gender === 'MALE' ? '#3CA5FF' : '#FF7096');
    });
  });

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    style: {borderRadius: 8},
    propsForBackgroundLines: {strokeDasharray: '3 3'},
    formatYLabel: yValue => `${parseInt(yValue, 10)}`,
  };

  const chartHeight = 280;
  const barWidth = 80;

  const genderOnlyDataWithCount = genderOnlyData
    .filter(d => d.count > 0)
    .map(d => ({
      name: `${d.gender} (${d.count}명)`,
      count: d.count,
      color: d.color,
      legendFontColor: '#333',
      legendFontSize: 14,
    }));

  const ageOnlyDataWithCount = ageOnlyData
    .filter(d => d.count > 0)
    .map(d => ({
      name: `${d.ageGroup.replace('s', '대')}  (${d.count}명)`,
      count: d.count,
      color: d.color,
      legendFontColor: '#333',
      legendFontSize: 14,
    }));

  const groupedCountData = groupedCombinedData.map(d => d.count ?? 0);

  const groupedLabels = groupedCombinedData.map(d => d.label);

  const legendData = groupedCombinedData.map((d, i) => ({
    name: d.label.replace(/\n/g, ''),
    color: groupedColors[i],
    percent: `${d.count}명`,
  }));

  return (
    <View>
      {data.length === 0 && (
        <Text style={styles.nulltext}>
          조건의 해당 통계가 없습니다.{'\n'}
          {'\n'}조건을 변경하여 확인 해보세요!
        </Text>
      )}
      {/* 성별만 있을 때 원형 차트 */}
      {isGenderOnly && genderOnlyDataWithCount.length > 0 && (
        <>
          <Text style={styles.subtitle}>성별 인원수</Text>
          <ScrollView horizontal>
            <PieChart
              data={genderOnlyDataWithCount}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="20"
              center={[0, 0]}
              absolute={false}
            />
          </ScrollView>
        </>
      )}

      {/* 나이대만 있을 때 원형 차트 */}
      {isAgeOnly && ageOnlyDataWithCount.length > 0 && (
        <>
          <Text style={styles.subtitle}>나이대별 인원수</Text>
          <ScrollView horizontal>
            <PieChart
              data={ageOnlyDataWithCount}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="20"
              center={[0, 0]}
              absolute={false}
            />
          </ScrollView>
        </>
      )}

      {/* 나이대 + 성별 있을 때 막대 차트 */}
      {isAllFiltersPresent &&
        groupedCombinedData.length > 0 &&
        groupedCountData.reduce((acc, cur) => acc + cur, 0) > 0 && (
          <>
            <Text style={styles.subtitle}>나이대 + 성별 인원수</Text>
            <ScrollView horizontal>
              <BarChart
                showYAxisLabels={true}
                data={{
                  labels: groupedLabels,
                  datasets: [
                    {
                      data: groupedCountData,
                      colors: groupedColors.map(color => () => color),
                    },
                  ],
                }}
                width={Math.max(
                  screenWidth,
                  groupedCombinedData.length * barWidth,
                )}
                height={chartHeight + 40}
                chartConfig={chartConfig}
                fromZero
                showValuesOnTopOfBars
                withCustomBarColorFromData
                flatColor
                style={{marginBottom: 20, borderRadius: 8, marginLeft: -10}}
              />
            </ScrollView>
            <View style={{flex: 1}}>
              <ResultitemCustom data={legendData} />
            </View>
          </>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  nulltext: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    marginTop: 6,
    textAlign: 'center',
  },
  subtitle: {fontSize: 16, fontFamily: 'Pretendard-Bold', marginBottom: 6},
});

export default StoreLikeResult;
