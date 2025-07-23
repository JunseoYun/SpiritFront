import React, {useMemo} from 'react';
import {View, Text, ScrollView, Dimensions, StyleSheet} from 'react-native';
import {PieChart, BarChart} from 'react-native-chart-kit';
import ResultitemCustom from '../StoreAreastats/ResultitemCustom';

const screenWidth = Dimensions.get('window').width;

const StoreViewResult = ({result, showBy}) => {
  const dataByDate = result?.data || [];

  const subtitleFlags = useMemo(() => {
    const flags = {
      hasGenderOnly: false,
      hasAgeOnly: false,
      hasAllFilters: false,
    };

    dataByDate.forEach(entry => {
      const statList = entry.statList || [];
      const hasGender = statList.every(item => item.gender);
      const hasAgeGroup = statList.every(item => item.ageGroup);
      flags.hasAllFilters ||= hasGender && hasAgeGroup;
      flags.hasGenderOnly ||= hasGender && !hasAgeGroup;
      flags.hasAgeOnly ||= !hasGender && hasAgeGroup;
    });

    return flags;
  }, [dataByDate]);

  const renderChartForStatList = (statList, date) => {
    const genderLabels = {MALE: '남자', FEMALE: '여자'};
    const genders = ['MALE', 'FEMALE'];

    const hasGender = statList.every(item => item.gender);
    const hasAgeGroup = statList.every(item => item.ageGroup);

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
      const found = statList.find(item => item.gender === g);
      return {
        gender: genderLabels[g],
        count: found ? found.count : 0,
        color: g === 'MALE' ? '#3CA5FF' : '#FF6F61',
      };
    });

    const genderOnlyDataWithPercent = genderOnlyData
      .filter(d => d.count > 0)
      .map(d => ({
        name: `${d.gender}`,
        count: d.count,
        color: d.color,
        legendFontColor: '#333',
        legendFontSize: 14,
      }));

    const ageOnlyData = statList
      .filter(item => item.ageGroup && !item.gender)
      .map(item => ({
        ageGroup: item.ageGroup,
        count: item.count,
        color: ageGroupColors[item.ageGroup] || '#4F98FF',
      }))
      .sort((a, b) => parseInt(a.ageGroup) - parseInt(b.ageGroup));

    const ageOnlyDataWithPercent = ageOnlyData
      .filter(d => d.count > 0)
      .map(d => ({
        name: `${d.ageGroup.replace('s', '대')}`,
        count: d.count,
        color: d.color,
        legendFontColor: '#333',
        legendFontSize: 14,
      }));

    const validData = statList.filter(
      item => item.ageGroup && genders.includes(item.gender),
    );

    const ageGroups = Array.from(new Set(validData.map(i => i.ageGroup))).sort(
      (a, b) => parseInt(a) - parseInt(b),
    );

    const groupedCombinedData = [];
    const groupedColors = [];

    ageGroups.forEach(ageGroup => {
      genders.forEach(gender => {
        const label = `${ageGroup.replace('s', '대')}${genderLabels[gender]}`;
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

    const chartHeight = 280;
    const barWidth = 80;

    const formatDateToKorean = dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const today = new Date(); // 현재 날짜

      if (showBy === 'day') {
        return `${year}년 ${month}월 ${day}일`;
      }

      if (showBy === 'week') {
        const startDate = new Date(year, month - 1, day);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        const actualEndDate = endDate > today ? today : endDate;

        const startMonth = startDate.getMonth() + 1;
        const endMonth = actualEndDate.getMonth() + 1;

        if (startMonth === endMonth) {
          return `${year}년 ${startMonth}월 ${startDate.getDate()}일 ~ ${actualEndDate.getDate()}일`;
        } else {
          return `${year}년 ${startMonth}월 ${startDate.getDate()}일 ~ ${endMonth}월 ${actualEndDate.getDate()}일`;
        }
      }

      if (showBy === 'month') {
        return `${year}년 ${month}월`;
      }
    };

    return (
      <View key={date} style={{marginBottom: 24}}>
        <Text style={styles.dateText}>{formatDateToKorean(date)}</Text>

        {isGenderOnly && genderOnlyDataWithPercent.length > 0 && (
          <ScrollView horizontal>
            <PieChart
              data={genderOnlyDataWithPercent}
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
        )}

        {isAgeOnly && ageOnlyDataWithPercent.length > 0 && (
          <ScrollView horizontal>
            <PieChart
              data={ageOnlyDataWithPercent}
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
        )}

        {isAllFiltersPresent &&
          groupedCombinedData.length > 0 &&
          groupedTotal > 0 && (
            <>
              <ScrollView horizontal>
                <BarChart
                  showYAxisLabels={true}
                  data={{
                    labels: groupedLabelsWithPercent,
                    datasets: [
                      {
                        data: groupedPercentData,
                        colors: groupedColors.map(c => () => c),
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
              <ResultitemCustom data={legendData} />
            </>
          )}
      </View>
    );
  };

  return (
    <View>
      <View style={{marginBottom: 12}}>
        {subtitleFlags.hasGenderOnly && (
          <Text style={styles.subtitle}>성별 인원수 (비율)</Text>
        )}
        {subtitleFlags.hasAgeOnly && (
          <Text style={styles.subtitle}>나이대별 인원수 (비율)</Text>
        )}
        {subtitleFlags.hasAllFilters && (
          <Text style={styles.subtitle}>나이대 + 성별 인원수 (비율)</Text>
        )}
        {dataByDate.length == 0 && (
          <Text style={styles.nulltext}>
            {' '}
            조건의 해당 통계가 없습니다.{'\n'}
            {'\n'}조건을 변경하여 확인 해보세요!
          </Text>
        )}
      </View>

      {dataByDate.map((entry, index) => {
        return renderChartForStatList(entry.statList || [], entry.date);
      })}
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
  dateText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Bold',
    marginBottom: 10,
    color: '#666',
  },
});

export default React.memo(StoreViewResult);
