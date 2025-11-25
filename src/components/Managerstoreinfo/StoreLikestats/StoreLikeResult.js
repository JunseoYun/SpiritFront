import React, {useEffect, useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  InteractionManager,
} from 'react-native';
import GroupBySelector from '../GroupBySelector';
import GenderPieChart from '../GenderPieChart';
import AgeDistributionTable from '../AgeDistributionTable';
import StoreLikeBarGraph from './StoreLikeBarGraph';
import CustomText from '../../common/CustomText';
const genders = ['MALE', 'FEMALE'];
const genderColor = [
  {label: '남자', color: '#3CA5FF'},
  {label: '여자', color: '#FF7096'},
];

function getAgeGenderStats(data, ageGroups) {
  const resultMap = {};
  let total = 0;

  data.forEach(item => {
    const key = `${item.ageGroup}${item.gender}`;
    if (!resultMap[key]) resultMap[key] = 0;
    resultMap[key] += item.count;
    total += item.count;
  });

  const result = [];
  ageGroups.forEach(age => {
    genders.forEach(gender => {
      const key = `${age}${gender}`;
      const count = resultMap[key] || 0;
      result.push({
        label: `${key}`,
        count: count,
      });
    });
  });
  return result;
}

const StoreLikeResult = ({result, setLoading, groupBy, toggleGroupBy}) => {
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

  const validAgeGenderData = useMemo(() => {
    return data.filter(
      item =>
        item.ageGroup &&
        !['80s', '90s', '100s'].includes(item.ageGroup) &&
        genders.includes(item.gender),
    );
  }, [data]);

  const ageGroups = useMemo(
    () =>
      Array.from(new Set(validAgeGenderData.map(item => item.ageGroup))).sort(
        (a, b) => parseInt(a) - parseInt(b),
      ),
    [validAgeGenderData],
  );

  const ageGenderStats = useMemo(() => {
    if (validAgeGenderData.length === 0 || ageGroups.length === 0) return [];
    return getAgeGenderStats(validAgeGenderData, ageGroups);
  }, [validAgeGenderData, ageGroups]);

  const hasGenderOnly =
    data.length > 0 &&
    data.some(item => item.gender) &&
    !data.some(item => item.ageGroup);

  const ageOrders = ['20s', '30s', '40s', '50s', '60s', '70s'];

  const ageDistributionData = useMemo(() => {
    const filtered = data.filter(
      item => item.ageGroup && !['80s', '90s', '100s'].includes(item.ageGroup),
    );
    const total = filtered.reduce((sum, d) => sum + (d.count || 0), 0);
    return ageOrders
      .map(age => {
        const found = filtered.find(item => item.ageGroup === age);
        if (!found) return null;
        return {
          name: age.replace('s', '대'),
          count: found.count,
          population:
            total > 0
              ? parseFloat(((found.count / total) * 100).toFixed(1))
              : 0,
        };
      })
      .filter(Boolean)
      .filter(d => d.population > 0);
  }, [data]);

  return (
    <View>
      {data.length === 0 && (
        <CustomText style={styles.nulltext}>
          해당 조건에 해당하는 데이터가 없어요{'\n\n'}조건을 변경하여
          확인해보세요!
        </CustomText>
      )}

      {/* 나이대 + 성별 있을 때 막대 차트 */}
      {ageGenderStats.length > 0 && (
        <>
          <View style={styles.titleView}>
            <CustomText style={styles.subtitle}>성별 · 연령대</CustomText>
            <GroupBySelector groupBy={groupBy} toggleGroupBy={toggleGroupBy} />
          </View>
          <View style={[styles.genderView]}>
            {genderColor.map(gen => {
              return (
                <View key={gen.label} style={[styles.genderSubView]}>
                  <View
                    style={[
                      styles.genderPoint,
                      {backgroundColor: gen.color},
                    ]}></View>
                  <CustomText style={styles.genderText}>{gen.label}</CustomText>
                </View>
              );
            })}
          </View>
          <StoreLikeBarGraph ageGenderStats={ageGenderStats} />
          {/* <ScrollView horizontal>
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
            </ScrollView> */}
          {/* <View style={{flex: 1}}>
              <ResultitemCustom data={legendData} />
            </View> */}
        </>
      )}
      {/* 성별만 있을 때 원형 차트 */}
      {ageGenderStats.length === 0 && hasGenderOnly && (
        <>
          <View style={styles.titleView}>
            <CustomText style={styles.subtitle}>성별</CustomText>
            <GroupBySelector groupBy={groupBy} toggleGroupBy={toggleGroupBy} />
          </View>
          <View style={[styles.genderView]}>
            {genderColor.map(gen => {
              return (
                <View key={gen.label} style={[styles.genderSubView]}>
                  <View
                    style={[
                      styles.genderPoint,
                      {backgroundColor: gen.color},
                    ]}></View>
                  <CustomText style={styles.genderText}>
                    {gen.label}{' '}
                    {gen.label === '남자'
                      ? `${data.find(d => d.gender === 'MALE')?.count ?? 0}명`
                      : `${
                          data.find(d => d.gender === 'FEMALE')?.count ?? 0
                        }명`}
                  </CustomText>
                </View>
              );
            })}
          </View>
          <GenderPieChart
            male={data.find(d => d.gender === 'MALE')?.count ?? 0}
            female={data.find(d => d.gender === 'FEMALE')?.count ?? 0}
          />
        </>
      )}

      {/* 연령대만 PieChart */}
      {ageGenderStats.length === 0 &&
        !hasGenderOnly &&
        ageDistributionData.length > 0 && (
          <>
            <View style={styles.titleView}>
              <CustomText style={styles.subtitle}>연령대별</CustomText>
              <GroupBySelector
                groupBy={groupBy}
                toggleGroupBy={toggleGroupBy}
              />
            </View>

            <AgeDistributionTable
              ageDistributionData={ageDistributionData}
              option={'storeLike'}
            />
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
    color: '#999',
  },
  titleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 6,
    color: '#121212',
  },
  genderView: {
    flexDirection: 'row',
    marginTop: 10,
    marginHorizontal: 18,
  },
  genderSubView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderPoint: {
    width: 7,
    height: 7,
    borderRadius: 30,
    backgroundColor: '#3CA5FF',
    marginRight: 5,
  },
  genderText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    marginRight: 10,
    color: '#666',
  },
});

export default StoreLikeResult;
