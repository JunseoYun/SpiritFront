import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import useSafeAndroidInsets from '../../../hooks/useSafeAndroidInsets';
import CustomText from '../../common/CustomText';
const SCREEN_WIDTH = Dimensions.get('window').width;

const FILTER_TABS = ['카테고리', '인원', '방문 시간', '주종'];

const categoryOptions = [
  {label: '이자카야', value: 'IZAKAYA'},
  {label: '한식', value: 'KOREAN'},
  {label: '양식', value: 'WESTERN'},
  {label: '중식', value: 'CHINESE'},
  {label: '감성주점', value: 'GAMSEONG'},
  {label: '구이/찜', value: 'GRILLED_STEW'},
  {label: '치킨/호프', value: 'CHICKEN_HOF'},
  {label: '회/해산물', value: 'RAW_SEAFOOD'},
  {label: '펍/바', value: 'PUB_BAR'},
  {label: '포차', value: 'POCHA'},
];

const peopleOptions = ['소수 방문', '단체 방문'];

const alcoholOptions = [
  {label: '소주', value: 'SOJU'},
  {label: '맥주', value: 'BEER'},
  {label: '막걸리', value: 'MAKGEOLLI'},
  {label: '와인', value: 'WINE'},
  {label: '칵테일', value: 'COCKTAIL'},
  {label: '사케', value: 'SAKE'},
  {label: '고량주', value: 'KAOLIANG'},
  {label: '위스키', value: 'WHISKEY'},
  {label: '보드카', value: 'VODKA'},
  {label: '전통주', value: 'TRADITIONAL'},
  {label: '하이볼', value: 'HIGHBALL'},
  {label: '데킬라', value: 'TEQUILA'},
];

const generateTimes = () => {
  const times = [];
  for (let h = 0; h < 12; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hourLabel = h === 0 ? 12 : h;
      const minLabel = m === 0 ? '00' : '30';
      times.push({hour: h, minute: m, label: `${hourLabel}:${minLabel}`});
    }
  }
  return times;
};

export default function FastSearchFilter({
  selectedFilters,
  setSelectedFilters,
  onClose,
  handleApply,
}) {
  const [activeTab, setActiveTab] = useState('카테고리');
  const [timePeriod, setTimePeriod] = useState('');
  const scrollRef = useRef(null);
  const timeScrollRef = useRef(null); // ✅ 가로 스크롤 참조
  const [sectionPositions, setSectionPositions] = useState({});
  const {bottom} = useSafeAndroidInsets();
  const [timePositions, setTimePositions] = useState({}); // idx: x좌표

  const scrollToTimeIndex = idx => {
    const x = timePositions[idx] ?? 0;
    timeScrollRef.current?.scrollTo({x: x - 16, animated: true});
  };
  const [hasScrolled, setHasScrolled] = useState(false);

  const autoScrollToTime = positions => {
    if (hasScrolled) return; // 이미 스크롤했으면 종료
    setHasScrolled(true);

    const timeVal = selectedFilters['방문 시간'];
    let index = 0;

    if (timeVal) {
      const [hourStr, minStr] = timeVal.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minStr, 10);
      index = (hour % 12) * 2 + (minute >= 30 ? 1 : 0);
    } else {
      const now = new Date();
      const hour = now.getHours() % 12;
      const minute = now.getMinutes();

      if (minute < 30) {
        index = hour * 2 + 1; // 현재 시간 :30
      } else {
        index = ((hour + 1) % 12) * 2; // 다음 시간 :00
      }
    }

    const x = positions[index] ?? 0;
    timeScrollRef.current?.scrollTo({x: x - 16, animated: true});
  };

  // // ✅ 선택된 시간 기반 초기 세팅
  useEffect(() => {
    if (hasScrolled == true) {
      const timeVal = selectedFilters['방문 시간'];
      if (timeVal && typeof timeVal === 'string') {
        const hour = parseInt(timeVal.split(':')[0], 10);
        if (!isNaN(hour)) {
          // 오전/오후 설정
          if (hour >= 12) setTimePeriod('PM');
          else setTimePeriod('AM');

          // 스크롤 이동
          const hour12 = hour % 12;
          const minute = parseInt(timeVal.split(':')[1], 10);
          const index = hour12 * 2 + (minute >= 30 ? 1 : 0);
          setTimeout(() => {
            scrollToTimeIndex(index);
          }, 100);
        }
      }
    }
  }, [selectedFilters['방문 시간'], hasScrolled]);

  const toggleFilter = (tab, item) => {
    setSelectedFilters(prev => {
      const currentValue = prev[tab] || '';
      return {
        ...prev,
        [tab]: currentValue === item ? '' : item,
      };
    });
  };

  const handleLayout = (tab, event) => {
    const {y} = event.nativeEvent.layout;
    setSectionPositions(prev => ({...prev, [tab]: y}));
  };

  const scrollToSection = tab => {
    setActiveTab(tab);
    const y = sectionPositions[tab] ?? 0;
    scrollRef.current?.scrollTo({y, animated: true});
  };

  const renderChips = (tab, options) => (
    <View onLayout={e => handleLayout(tab, e)} style={styles.sectionContainer}>
      {tab == '카테고리' ? (
        <View style={styles.categoryContainer}>
          <CustomText style={styles.categoryTitle}>{tab}</CustomText>
          <TouchableOpacity
            onPress={() => {
              setSelectedFilters({
                카테고리: '',
                인원: '',
                '방문 시간': '',
                주종: '',
              });
            }}>
            <CustomText style={styles.inittext}>초기화</CustomText>
          </TouchableOpacity>
        </View>
      ) : (
        <CustomText style={styles.sectionTitle}>{tab}</CustomText>
      )}

      <View style={styles.filterItemsContainer}>
        {options.map(opt => {
          const label = typeof opt === 'string' ? opt : opt.label;
          const value = typeof opt === 'string' ? opt : opt.value;
          const isSelected = selectedFilters[tab] === value;
          return (
            <TouchableOpacity
              key={value}
              onPress={() => toggleFilter(tab, value)}
              style={[
                styles.filterItem,
                isSelected && styles.filterItemSelected,
              ]}>
              <CustomText
                style={[
                  styles.filterItemText,
                  isSelected && styles.filterItemTextSelected,
                ]}>
                {label}
              </CustomText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderTimeChips = () => {
    const baseTimes = generateTimes();
    return (
      <View
        onLayout={e => handleLayout('방문 시간', e)}
        style={styles.sectionContainer}>
        <CustomText style={styles.sectionTitle}>방문 시간</CustomText>

        <View style={styles.timeTabContainer}>
          <TouchableOpacity
            onPress={() => {
              setTimePeriod('AM');
              setSelectedFilters(prev => ({...prev, '방문 시간': ''}));
            }}
            style={[
              styles.timeTab,
              timePeriod === 'AM' && styles.timeTabActive,
            ]}>
            <CustomText
              style={[
                styles.timeTabText,
                timePeriod === 'AM' && styles.timeTabTextActive,
              ]}>
              오전
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setTimePeriod('PM');
              setSelectedFilters(prev => ({...prev, '방문 시간': ''}));
            }}
            style={[
              styles.timeTab,
              timePeriod === 'PM' && styles.timeTabActive,
            ]}>
            <CustomText
              style={[
                styles.timeTabText,
                timePeriod === 'PM' && styles.timeTabTextActive,
              ]}>
              오후
            </CustomText>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={timeScrollRef} // ✅ 가로 스크롤에 ref
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 16}}
          style={styles.timeScroll}>
          {baseTimes.map((t, idx) => {
            const hourForValue =
              timePeriod === 'AM'
                ? t.hour
                : t.hour + 12 === 24
                ? 0
                : t.hour + 12;
            const value = `${hourForValue
              .toString()
              .padStart(2, '0')}:${t.minute.toString().padStart(2, '0')}`;
            const label = `${timePeriod === 'AM' ? '오전' : '오후'} ${t.label}`;
            const isSelected = selectedFilters['방문 시간'] === value;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => toggleFilter('방문 시간', value)}
                onLayout={e => {
                  const {x} = e.nativeEvent.layout;
                  setTimePositions(prev => {
                    const newPos = {...prev, [idx]: x};
                    if (Object.keys(newPos).length === generateTimes().length) {
                      autoScrollToTime(newPos);
                    }
                    return newPos;
                  });
                }}
                style={[
                  styles.filterItem,
                  isSelected && styles.filterItemSelected,
                ]}>
                <CustomText
                  style={[
                    styles.filterItemText,
                    isSelected && styles.filterItemTextSelected,
                  ]}>
                  {label}
                </CustomText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeContainer, {paddingBottom: bottom}]}>
      <View style={styles.tabContainer}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => scrollToSection(tab)}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonActive,
            ]}>
            <CustomText
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}>
              {tab}
            </CustomText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        style={[styles.scrollArea, {flex: 1}]}
        contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}>
        {renderChips('카테고리', categoryOptions)}
        <View style={styles.divider} />
        {renderChips('인원', peopleOptions)}
        <View style={styles.divider} />
        {renderTimeChips()}
        <View style={styles.divider} />
        {renderChips('주종', alcoholOptions)}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={() => onClose()}>
          <CustomText style={styles.resetText}>닫기</CustomText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <CustomText style={styles.applyText}>검색</CustomText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 8,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 4,
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#3CBBFF',
  },
  tabText: {
    fontSize: 14,
    color: '#777',
    fontFamily: 'Pretendard-Medium',
  },
  tabTextActive: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-Bold',
  },
  scrollArea: {
    flex: 1,
  },
  categoryContainer: {
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
  },
  categoryTitle: {
    fontSize: 15,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
  },
  inittext: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#777',
  },
  sectionContainer: {
    marginHorizontal: 0,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Pretendard-Bold',
    marginBottom: 8,
    color: '#333',
    marginHorizontal: 16,
  },
  filterItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
  },
  filterItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  filterItemSelected: {
    backgroundColor: '#E9F5FB',
    borderColor: '#3CBBFF',
  },
  filterItemText: {
    fontSize: 13,
    color: '#444',
    fontFamily: 'Pretendard-Regular',
  },
  filterItemTextSelected: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-SemiBold',
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    height: 44,
  },
  resetText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Pretendard-Medium',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#3CBBFF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  applyText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Pretendard-Bold',
  },
  timeTabContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    marginHorizontal: 16,
  },
  timeTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  timeTabActive: {
    backgroundColor: '#fff',
    borderColor: '#3CBBFF',
  },
  timeTabText: {
    color: '#444',
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
  },
  timeTabTextActive: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-SemiBold',
  },
  timeScroll: {
    flexDirection: 'row',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f5f5f5',
    marginVertical: 10,
  },
});
