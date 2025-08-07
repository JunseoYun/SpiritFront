import React, {useMemo, useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  Pressable,
  ScrollView,
} from 'react-native';
import GroupBySelector from '../GroupBySelector';
import StorePersentBarGraph from '../StorePersentBarGraph';
import GenderPieChart from '../GenderPieChart';
import AgeDistributionTable from '../AgeDistributionTable';
import Feather from 'react-native-vector-icons/Feather';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_WIDTH_HALF = SCREEN_WIDTH / 2;
const genders = ['MALE', 'FEMALE'];
const genderColor = [
  {label: '남자', color: '#3CA5FF'},
  {label: '여자', color: '#FF7096'},
];
const excludedAges = ['80s', '90s', '100s'];
const ageOrders = ['20s', '30s', '40s', '50s', '60s', '70s'];

function getAgeGenderStats(data, ageGroups) {
  const resultMap = {};
  let total = 0;
  data.forEach(item => {
    const key = `${item.ageGroup}${item.gender}`;
    resultMap[key] = (resultMap[key] || 0) + item.count;
    total += item.count;
  });
  return ageGroups.flatMap(age =>
    genders.map(gender => {
      const key = `${age}${gender}`;
      const count = resultMap[key] || 0;
      return {
        label: `${age}${gender}`,
        percent: total === 0 ? 0 : Math.round((count / total) * 1000) / 10,
      };
    }),
  );
}

const StoreViewResult = ({
  result,
  showBy,
  groupBy,
  toggleGroupBy,
  showByOptions,
  onShowByChange,
}) => {
  const dataByDate = result?.data || [];

  const listRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const [dropdownWidth, setDropdownWidth] = useState(170);

  const dropdownTranslateY = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 0],
  });

  const toggleDropdown = () => {
    if (dropdownVisible) {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setDropdownVisible(false));
    } else {
      setDropdownVisible(true);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const subtitleFlags = useMemo(() => {
    const flags = {
      hasGenderOnly: false,
      hasAgeOnly: false,
      hasAllFilters: false,
    };
    for (const entry of dataByDate) {
      const statList = entry.statList || [];
      const hasGender = statList.every(item => item.gender);
      const hasAgeGroup = statList.every(item => item.ageGroup);
      flags.hasAllFilters ||= hasGender && hasAgeGroup;
      flags.hasGenderOnly ||= hasGender && !hasAgeGroup;
      flags.hasAgeOnly ||= !hasGender && hasAgeGroup;
    }
    return flags;
  }, [dataByDate]);

  const formatDateToKorean = dateStr => {
    const today = new Date();

    if (!dateStr) return '';

    const [year, month, day] = dateStr.split('-').map(Number);
    if (showBy === 'day') return `${year}년 ${month}월 ${day}일`;
    if (showBy === 'week') {
      const start = new Date(year, month - 1, day);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const actualEnd = end > today ? today : end;
      const sMonth = start.getMonth() + 1;
      const eMonth = actualEnd.getMonth() + 1;
      return sMonth === eMonth
        ? `${year}년 ${sMonth}월 ${start.getDate()}일 ~ ${actualEnd.getDate()}일`
        : `${year}년 ${sMonth}월 ${start.getDate()}일 ~ ${eMonth}월 ${actualEnd.getDate()}일`;
    }
    if (showBy === 'month') return `${year}년 ${month}월`;
  };

  const scrollTo = index => {
    if (index >= 0 && index < dataByDate.length) {
      listRef.current?.scrollToIndex({index, animated: true});
      setCurrentIndex(index);
    }
  };

  useEffect(() => {
    if (dataByDate.length > 0 && listRef.current) {
      const latestIndex = dataByDate.length - 1;
      const timeout = setTimeout(() => {
        listRef.current?.scrollToIndex({index: latestIndex, animated: false});
        setCurrentIndex(latestIndex);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [dataByDate]);

  const renderChartForStatList = (statList, date) => {
    const hasGenderOnly =
      statList.length > 0 &&
      statList.some(item => item.gender) &&
      !statList.some(item => item.ageGroup);
    const validAgeGenderData = statList.filter(
      item =>
        item.ageGroup &&
        !excludedAges.includes(item.ageGroup) &&
        genders.includes(item.gender),
    );
    const ageGroups = Array.from(
      new Set(validAgeGenderData.map(item => item.ageGroup)),
    ).sort((a, b) => parseInt(a) - parseInt(b));
    const ageGenderStats =
      validAgeGenderData.length && ageGroups.length
        ? getAgeGenderStats(validAgeGenderData, ageGroups)
        : [];
    const filtered = statList.filter(
      item => item.ageGroup && !excludedAges.includes(item.ageGroup),
    );
    const total = filtered.reduce((sum, d) => sum + (d.count || 0), 0);
    const ageDistributionData = ageOrders
      .map(age => {
        const match = filtered.find(item => item.ageGroup === age);
        if (!match) return null;
        return {
          name: age.replace('s', '대'),
          population:
            total > 0
              ? parseFloat(((match.count / total) * 100).toFixed(1))
              : 0,
        };
      })
      .filter(Boolean)
      .filter(d => d.population > 0);

    return (
      <View key={date} style={{width: SCREEN_WIDTH}}>
        {ageGenderStats.length > 0 && (
          <StorePersentBarGraph ageGenderStats={ageGenderStats} />
        )}
        {ageGenderStats.length === 0 && hasGenderOnly && (
          <GenderPieChart
            male={statList.find(s => s.gender === 'MALE')?.count ?? 0}
            female={statList.find(s => s.gender === 'FEMALE')?.count ?? 0}
          />
        )}
        {ageGenderStats.length === 0 &&
          !hasGenderOnly &&
          ageDistributionData.length > 0 && (
            <AgeDistributionTable ageDistributionData={ageDistributionData} />
          )}
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      {/* 날짜 텍스트 분리 */}

      {/* 차트 타이틀 및 설명 */}
      <View style={{marginBottom: 12}}>
        {subtitleFlags.hasGenderOnly && (
          <>
            <View style={styles.titleView}>
              <Text style={styles.subtitle}>성별 (비율)</Text>
              <GroupBySelector
                groupBy={groupBy}
                toggleGroupBy={toggleGroupBy}
                setDropdownVisible={setDropdownVisible}
              />
            </View>
          </>
        )}
        {subtitleFlags.hasAgeOnly && (
          <View style={styles.titleView}>
            <Text style={styles.subtitle}>연령대별 (비율)</Text>
            <GroupBySelector
              groupBy={groupBy}
              toggleGroupBy={toggleGroupBy}
              setDropdownVisible={setDropdownVisible}
            />
          </View>
        )}
        {subtitleFlags.hasAllFilters && (
          <>
            <View style={styles.titleView}>
              <Text style={styles.subtitle}>성별 · 연령대 (비율)</Text>
              <GroupBySelector
                groupBy={groupBy}
                toggleGroupBy={toggleGroupBy}
                setDropdownVisible={setDropdownVisible}
              />
            </View>
          </>
        )}
        {dataByDate.length === 0 && (
          <Text style={styles.nulltext}>
            해당 조건에 해당하는 데이터가 없어요{'\n\n'}조건을 변경하여
            확인해보세요!
          </Text>
        )}
      </View>

      {dataByDate.length > 0 && (
        <View style={styles.dateView}>
          {/* 왼쪽 화살표 */}
          {dataByDate.length > 1 && (
            <TouchableOpacity
              onPress={() => {
                scrollTo(currentIndex - 1);
                if (dropdownVisible) toggleDropdown();
              }}
              disabled={currentIndex === 0}
              style={styles.dateIconWrapper}
              pointerEvents={currentIndex === 0 ? 'none' : 'auto'}>
              <Feather
                name="chevron-left"
                size={20}
                color={currentIndex === 0 ? '#ccc' : '#777'} // ← 흰색으로 변경
                style={styles.dateIcon}
              />
            </TouchableOpacity>
          )}

          {/* 날짜 텍스트 */}
          <Pressable
            onPress={toggleDropdown}
            onLayout={e => {
              const {width} = e.nativeEvent.layout;
              setDropdownWidth(width + 30);
            }}>
            <Text style={styles.dateText}>
              {formatDateToKorean(dataByDate[currentIndex]?.date)}
            </Text>
          </Pressable>

          {/* 오른쪽 화살표 */}
          {dataByDate.length > 1 && (
            <TouchableOpacity
              onPress={() => {
                scrollTo(currentIndex + 1);
                if (dropdownVisible) toggleDropdown();
              }}
              disabled={currentIndex === dataByDate.length - 1}
              style={styles.dateIconWrapper}
              pointerEvents={
                currentIndex === dataByDate.length - 1 ? 'none' : 'auto'
              }>
              <Feather
                name="chevron-right"
                size={20}
                color={currentIndex === dataByDate.length - 1 ? '#ccc' : '#777'}
                style={styles.dateIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View
        style={[
          styles.infoView,
          subtitleFlags.hasAgeOnly &&
            showByOptions?.length > 1 && {marginBottom: 10},
        ]}>
        <View style={{flex: 1}}>
          {!subtitleFlags.hasAgeOnly && dataByDate.length > 0 && (
            <View style={styles.genderView}>
              {genderColor.map(gen => (
                <View key={gen.label} style={styles.genderSubView}>
                  <View
                    style={[styles.genderPoint, {backgroundColor: gen.color}]}
                  />
                  <Text style={styles.genderText}>{gen.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        {showByOptions?.length > 1 && (
          <View style={styles.showBySelector}>
            {showByOptions.map(option => {
              const isSelected = showBy === option.value;
              return (
                <Pressable
                  key={option.value}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  onPress={() => {
                    if (dropdownVisible) setDropdownVisible(false);
                    onShowByChange(option.value);
                  }}>
                  <Text
                    style={[
                      styles.showByButtonText,
                      isSelected && styles.showByButtonTextSelected,
                    ]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <FlatList
        data={dataByDate}
        ref={listRef}
        keyExtractor={item => item.date}
        horizontal
        pagingEnabled
        onScrollToIndexFailed={({index}) => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({index, animated: false});
          }, 100);
        }}
        getItemLayout={(data, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onScrollBeginDrag={() => {
          if (dropdownVisible) {
            setDropdownVisible(false);
          }
        }}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
          );
          setCurrentIndex(index);
        }}
        initialScrollIndex={dataByDate.length > 0 ? dataByDate.length - 1 : 0}
        renderItem={({item}) =>
          renderChartForStatList(item.statList || [], item.date)
        }
      />

      {dropdownVisible && dataByDate.length > 1 && (
        <Animated.View
          style={[
            styles.dropdown,
            {
              transform: [{translateY: dropdownTranslateY}],
              maxHeight: 240,
              width: dropdownWidth,
              left: SCREEN_WIDTH_HALF - dropdownWidth / 2,
            },
          ]}>
          <ScrollView>
            {[...dataByDate]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((item, index) => {
                const actualIndex = dataByDate.findIndex(
                  d => d.date === item.date,
                );
                return (
                  <TouchableOpacity
                    key={item.date}
                    style={styles.dropdownItem}
                    onPress={() => {
                      scrollTo(actualIndex);
                      toggleDropdown();
                    }}>
                    <Text style={styles.dropdownText}>
                      {formatDateToKorean(item.date)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        </Animated.View>
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
  dateView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateIcon: {
    marginHorizontal: 20,
  },
  dateText: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    textAlign: 'center',
    color: '#666',
  },
  infoView: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginBottom: -10,
    paddingVertical: 10,
  },
  genderView: {
    flexDirection: 'row',
  },
  genderSubView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  genderPoint: {
    width: 7,
    height: 7,
    borderRadius: 30,
    marginRight: 5,
  },
  genderText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#666',
  },
  showBySelector: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },

  showByButtonText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    paddingHorizontal: 7,
  },
  showByButtonTextSelected: {
    color: '#121212',
    fontFamily: 'Pretendard-SemiBold',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    backgroundColor: '#fff',
    borderRadius: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    paddingVertical: 5,
    zIndex: 999,
  },
  dropdownItem: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
});

export default React.memo(StoreViewResult);
