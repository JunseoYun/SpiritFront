import React from 'react';
import {View, Text, ScrollView, Dimensions, StyleSheet} from 'react-native';
import {BarChart} from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const ManagerlogScreen = ({result}) => {
  const data = result?.data || [];

  console.log(data);

  const genderLabels = {MALE: '남자', FEMALE: '여자'};
  const genders = ['MALE', 'FEMALE'];

  const hasGender = data.every(item => item.gender);
  const hasAgeGroup = data.every(item => item.ageGroup);

  const isAllFiltersPresent = hasGender && hasAgeGroup;
  const isGenderOnly = hasGender && !hasAgeGroup;
  const isAgeOnly = !hasGender && hasAgeGroup;

  // 성별 인원수 계산
  const genderCount = {};
  data.forEach(item => {
    if (item.gender) {
      genderCount[item.gender] = (genderCount[item.gender] || 0) + 1;
    }
  });
  const genderOnlyData = genders.map(g => {
    // result.data 배열에서 해당 gender 항목 찾기
    const found = data.find(item => item.gender === g);
    return {
      gender: genderLabels[g],
      count: found ? found.count : 0,
      color: g === 'MALE' ? '#4CAF50' : '#BA68C8',
    };
  });
  // 나이대별 인원수 계산
  const ageGroupCount = {};
  data.forEach(item => {
    if (item.ageGroup) {
      ageGroupCount[item.ageGroup] = (ageGroupCount[item.ageGroup] || 0) + 1;
    }
  });
  const ageOnlyData = data
    .filter(item => item.ageGroup && !item.gender) // 성별 없는 연령대별 데이터만
    .map(item => ({
      ageGroup: item.ageGroup,
      count: item.count,
    }))
    .sort((a, b) => parseInt(a.ageGroup) - parseInt(b.ageGroup));

  // 나이대 + 성별 데이터 준비
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
      const count = validData.filter(
        item => item.ageGroup === ageGroup && item.gender === gender,
      ).length;

      groupedCombinedData.push({label, count});
      groupedColors.push(gender === 'MALE' ? '#4CAF50' : '#BA68C8'); // 남초록, 여자보라
    });
  });

  const chartConfigBase = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    style: {borderRadius: 8},
    propsForBackgroundLines: {strokeDasharray: '3 3'},
    formatYLabel: () => '', // ← 이 부분이 핵심입니다!
  };

  const chartHeight = 280;
  const barWidth = 50;

  return (
    <View>
      <Text style={styles.title}>총 인원: {data.length}명</Text>

      {isGenderOnly && (
        <>
          <Text style={styles.subtitle}>성별 인원수</Text>
          <ScrollView horizontal>
            <BarChart
              data={{
                labels: genderOnlyData.map(d => d.gender),
                datasets: [
                  {
                    data: genderOnlyData.map(d => d.count),
                    colors: genderOnlyData.map(d => () => d.color),
                  },
                ],
              }}
              width={Math.max(
                screenWidth - 32,
                genderOnlyData.length * barWidth,
              )}
              height={chartHeight}
              chartConfig={chartConfigBase}
              fromZero
              showValuesOnTopOfBars
              withCustomBarColorFromData
              flatColor
              style={{marginBottom: 20, borderRadius: 8, marginLeft: -10}}
            />
          </ScrollView>
        </>
      )}

      {isAgeOnly && (
        <>
          <Text style={styles.subtitle}>나이대별 인원수</Text>
          <ScrollView horizontal>
            <BarChart
              data={{
                labels: ageOnlyData.map(d => d.ageGroup.replace('s', '대')),
                datasets: [
                  {
                    data: ageOnlyData.map(d => d.count),
                    colors: ageOnlyData.map(() => () => '#4F98FF'), // 파랑 고정
                  },
                ],
              }}
              width={Math.max(screenWidth - 32, ageOnlyData.length * barWidth)}
              height={chartHeight}
              chartConfig={chartConfigBase}
              fromZero
              showValuesOnTopOfBars
              withCustomBarColorFromData
              flatColor
              style={{marginBottom: 20, borderRadius: 8, marginLeft: -10}}
            />
          </ScrollView>
        </>
      )}

      {isAllFiltersPresent && groupedCombinedData.length > 0 && (
        <>
          <Text style={styles.subtitle}>나이대 + 성별 인원수</Text>
          <ScrollView horizontal>
            <BarChart
              showYAxisLabels={false}
              data={{
                labels: groupedCombinedData.map(d => d.label),
                datasets: [
                  {
                    data: groupedCombinedData.map(d => d.count),
                    colors: groupedColors.map(color => () => color),
                  },
                ],
              }}
              width={Math.max(
                screenWidth,
                groupedCombinedData.length * barWidth,
              )}
              height={chartHeight + 40}
              chartConfig={chartConfigBase}
              fromZero
              showValuesOnTopOfBars
              withCustomBarColorFromData
              flatColor
              style={{marginBottom: 20, borderRadius: 8, marginLeft: -10}}
            />
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {fontSize: 18, fontWeight: 'bold', marginBottom: 12},
  subtitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 6},
});

export default ManagerlogScreen;
