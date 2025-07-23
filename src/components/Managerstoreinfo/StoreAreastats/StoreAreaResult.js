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
import ResultitemCustom from './ResultitemCustom';

const screenWidth = Dimensions.get('window').width;

const StoreAreaResult = ({result, setLoading}) => {
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

  // 총 인원 수 계산 (count가 없으면 0)
  const totalCount = data.reduce((acc, cur) => acc + (cur.count || 0), 0);

  // 성별 데이터 준비
  const genderOnlyData = genders.map(g => {
    const found = data.find(item => item.gender === g);
    return {
      gender: genderLabels[g],
      count: found ? found.count : 0,
      color: g === 'MALE' ? '#3CA5FF' : '#FF6F61',
    };
  });

  // 연령대 색상 매핑
  const ageGroupColors = {
    '10s': '#4F98FF', // 10대 - 파랑
    '20s': '#FF8C00', // 20대 - 주황
    '30s': '#8A2BE2', // 30대 - 보라
    '40s': '#228B22', // 40대 - 초록
    '50s': '#FF1493', // 50대 - 핑크
    '60s': '#FFD700', // 60대 - 금색
    '70s': '#16BBFF', // 70대 - 하늘색
  };

  // 나이대 데이터 준비
  const ageOnlyData = data
    .filter(item => item.ageGroup && !item.gender)
    .map(item => ({
      ageGroup: item.ageGroup,
      count: item.count,
      color: ageGroupColors[item.ageGroup] || '#4F98FF',
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
      const found = validData.find(
        item => item.ageGroup === ageGroup && item.gender === gender,
      );
      const count = found ? found.count : 0;

      groupedCombinedData.push({label, count});
      groupedColors.push(gender === 'MALE' ? '#3CA5FF' : '#FF7096');
    });
  });

  // 차트 기본 설정
  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    style: {borderRadius: 8},
    propsForBackgroundLines: {strokeDasharray: '3 3'},
    formatYLabel: () => '', // Y축 숫자 숨김
  };

  const chartHeight = 280;
  const barWidth = 80;

  // 성별 데이터에 퍼센트 추가
  const genderTotal = genderOnlyData.reduce((acc, cur) => acc + cur.count, 0);
  const genderOnlyDataWithPercent = genderOnlyData
    .filter(d => d.count > 0 && genderTotal > 0)
    .map(d => {
      const percent = ((d.count / genderTotal) * 100).toFixed(1);
      return {
        name: `${d.gender}`,
        population: parseFloat(percent),
        color: d.color,
        legendFontColor: '#333',
        legendFontSize: 14,
      };
    });

  // 나이대 데이터에 퍼센트 추가
  const ageTotal = ageOnlyData.reduce((acc, cur) => acc + cur.count, 0);
  const ageOnlyDataWithPercent = ageOnlyData
    .filter(d => d.count > 0 && ageTotal > 0)
    .map(d => {
      const percent = ((d.count / ageTotal) * 100).toFixed(1);
      return {
        population: parseFloat(percent),
        name: `${d.ageGroup.replace('s', '대')}`,
        color: d.color,
        legendFontColor: '#333',
        legendFontSize: 14,
      };
    });

  const groupedTotal = groupedCombinedData.reduce(
    (acc, cur) => acc + cur.count,
    0,
  );

  const groupedPercentData = groupedCombinedData.map(d =>
    groupedTotal > 0
      ? parseFloat(((d.count / groupedTotal) * 100).toFixed(1))
      : 0,
  );

  const legendData = groupedCombinedData.map((d, i) => ({
    name: d.label.replace(/\n/g, ''), // 🔥 줄바꿈 제거
    color: groupedColors[i],
    percent:
      groupedTotal > 0
        ? `${parseFloat(((d.count / groupedTotal) * 100).toFixed(1))}%`
        : '0.0%',
  }));
  // 라벨에 소수점 1자리 붙임
  const groupedLabelsWithPercent = groupedCombinedData.map((d, i) => {
    const percent = groupedPercentData[i] ?? 0;
    return `${d.label} `;
  });

  return (
    <View>
      {data.length == 0 && (
        <Text style={styles.nulltext}>
          조건의 해당 통계가 없습니다.{'\n'}
          {'\n'}조건을 변경하여 확인 해보세요!
        </Text>
      )}
      {/* 성별만 있을 때 원형 차트 */}
      {isGenderOnly && genderOnlyDataWithPercent.length > 0 && (
        <>
          <Text style={styles.subtitle}>성별 인원수 (비율)</Text>
          <ScrollView horizontal>
            <PieChart
              data={genderOnlyDataWithPercent}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="20"
              center={[0, 0]}
              absolute={false}
            />
          </ScrollView>
        </>
      )}

      {/* 나이대만 있을 때 원형 차트 */}
      {isAgeOnly && ageOnlyDataWithPercent.length > 0 && (
        <>
          <Text style={styles.subtitle}>나이대별 인원수 (비율)</Text>
          <ScrollView horizontal>
            <PieChart
              data={ageOnlyDataWithPercent}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
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
        groupedTotal > 0 && (
          <>
            <Text style={styles.subtitle}>나이대 + 성별 인원수 (비율)</Text>
            <ScrollView horizontal>
              <BarChart
                showYAxisLabels={false}
                data={{
                  labels: groupedLabelsWithPercent,
                  datasets: [
                    {
                      data: groupedPercentData,
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

export default StoreAreaResult;
