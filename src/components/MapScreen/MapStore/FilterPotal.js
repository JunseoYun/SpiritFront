import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import {Dimensions} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Portal} from 'react-native-paper';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {normalizeFont} from '../../../hooks/normalizeFont';
import ColorUtil from '../../../utils/ColorUtil';
import {
  SunMedium,
  DoorOpen,
  TvMinimal,
  Wine,
  UsersRound,
  CarFront,
  CheckCircle2,
} from 'lucide-react-native';

// Try to resolve keys that may be mojibake in persisted state
const findExistingKey = (filters, hint) => {
  if (!filters) return hint;
  if (Object.prototype.hasOwnProperty.call(filters, hint)) return hint;
  const keys = Object.keys(filters || {});
  const compact = s => (s || '').replace(/\s/g, '');
  const found = keys.find(k => compact(k).includes(compact(hint)));
  return found || hint;
};

const FilterPotal = ({
  filterModalVisible,
  setFilterModalVisible,
  selectedFilters,
  setSelectedFilters,
  initialTab = '거리',
  setRadiusint,
}) => {
  const FILTER_TABS = useMemo(
    () => ['거리', '카테고리', '주종', '매장분위기', '방문시간', '편의시설'],
    [],
  );

  useEffect(() => {
    if (!filterModalVisible) return;

    const onBackPress = () => {
      setFilterModalVisible(false);
      return true; // ❗ true면 기본 뒤로가기 동작 막음
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => subscription.remove();
  }, [filterModalVisible]);

  const scrollRef = useRef(null);
  const tabsScrollRef = useRef(null);
  const timeScrollRef = useRef(null);
  const [activeTab, setActiveTab] = useState('거리');
  const [sectionPositions, setSectionPositions] = useState({});
  const [didInitialScroll, setDidInitialScroll] = useState(false);
  const [timePeriod, setTimePeriod] = useState('');
  const [timePositions, setTimePositions] = useState({});
  const [hasScrolledTime, setHasScrolledTime] = useState(false);
  const [tabPositions, setTabPositions] = useState({});

  const screenWidth = Dimensions.get('window').width;

  const ensureTabVisible = tab => {
    const pos = tabPositions?.[tab];
    if (!pos || !tabsScrollRef.current) return;
    const targetX = Math.max(0, pos.x - (screenWidth - pos.width) / 2);
    tabsScrollRef.current.scrollTo({x: targetX, animated: true});
  };

  // Resolve keys from possibly garbled source
  const keyDistance = findExistingKey(selectedFilters, '거리');
  const keyCategory = findExistingKey(selectedFilters, '카테고리');
  const keyPeople = findExistingKey(selectedFilters, '인원');
  const keyAlcohol = findExistingKey(selectedFilters, '주종');
  const keyStoreatm = findExistingKey(selectedFilters, '매장분위기');
  const keyTime = findExistingKey(selectedFilters, '방문시간');
  const keyParking = findExistingKey(selectedFilters, '주차');
  const keyCorkage = findExistingKey(selectedFilters, '콜키지');
  const keyScreen = findExistingKey(selectedFilters, '스크린');
  const keyRoom = findExistingKey(selectedFilters, '룸');
  const keyOutdoor = findExistingKey(selectedFilters, '야장');

  const getVal = (key, def) => selectedFilters?.[key] ?? def;
  const setVal = (key, value) =>
    setSelectedFilters(prev => ({...prev, [key]: value}));
  // helpers for toggle behavior and multi-select arrays
  const getArrVal = v => (Array.isArray(v) ? v : v ? [v] : []);
  const toggleSingle = (key, value) =>
    setVal(key, getVal(key, '') === value ? '' : value);
  const toggleInArray = (key, value, limit = Infinity) => {
    const prev = getArrVal(getVal(key, []));
    if (prev.includes(value)) {
      setVal(
        key,
        prev.filter(v => v !== value),
      );
    } else if (prev.length < limit) {
      setVal(key, [...prev, value]);
    }
  };

  const storeAtmSelected = getArrVal(getVal(keyStoreatm, []));

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

  const baseTimes = useMemo(() => generateTimes(), []);

  const scrollToSection = tab => {
    const y = sectionPositions[tab];
    if (y != null) {
      scrollRef.current?.scrollTo({y, animated: true});
      setActiveTab(tab);
      // keep the selected tab visible in the horizontal tab bar
      ensureTabVisible(tab);
    }
  };

  // Reset initial scroll flag each time modal opens
  useEffect(() => {
    if (filterModalVisible) {
      setDidInitialScroll(false);
    }
  }, [filterModalVisible]);

  // Perform initial scroll after section positions are measured
  useEffect(() => {
    if (!filterModalVisible || !initialTab || didInitialScroll) return;
    const y = sectionPositions?.[initialTab];
    if (y != null) {
      // Defer slightly to ensure layout settles
      setTimeout(() => {
        scrollToSection(initialTab);
        setDidInitialScroll(true);
      }, 0);
    }
  }, [filterModalVisible, initialTab, sectionPositions, didInitialScroll]);

  // Initialize AM/PM selection and auto-scroll target
  useEffect(() => {
    if (!filterModalVisible) return;
    const timeVal = getVal(keyTime, '');
    let hour = null;
    if (timeVal && typeof timeVal === 'string') {
      const [h] = timeVal.split(':');
      const hh = parseInt(h, 10);
      if (!isNaN(hh)) hour = hh;
    }
    if (hour != null) setTimePeriod(hour >= 12 ? 'PM' : 'AM');
    else setTimePeriod(new Date().getHours() >= 12 ? 'PM' : 'AM');
  }, [filterModalVisible, keyTime]);

  useEffect(() => {
    if (filterModalVisible) {
      setHasScrolledTime(false);
    }
  }, [filterModalVisible]);

  const autoScrollToTime = positions => {
    if (hasScrolledTime) return;
    setHasScrolledTime(true);

    const timeVal = getVal(keyTime, '');
    let index = 0;
    if (timeVal) {
      const [hourStr, minStr] = timeVal.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minStr, 10);
      const hour12 = hour % 12;
      index = hour12 * 2 + (minute >= 30 ? 1 : 0);
    } else {
      const now = new Date();
      const hour = now.getHours() % 12;
      const minute = now.getMinutes();
      index = minute < 30 ? hour * 2 + 1 : ((hour + 1) % 12) * 2;
    }

    const x = positions[index] ?? 0;
    timeScrollRef.current?.scrollTo({x: x, animated: true});
  };

  return (
    <>
      <Portal>
        {filterModalVisible && (
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setFilterModalVisible(false)}
            />
            <View style={styles.modalContentBottom}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>필터</Text>
                <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                  <Ionicons name="close" size={22} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View>
                <ScrollView
                  ref={tabsScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.tabBar}
                  contentContainerStyle={styles.tabContainer}>
                  {FILTER_TABS.map(tab => (
                    <TouchableOpacity
                      key={tab}
                      onLayout={e => {
                        const {x, width} = e.nativeEvent.layout || {};
                        if (x != null && width != null) {
                          setTabPositions(prev => ({
                            ...prev,
                            [tab]: {x, width},
                          }));
                        }
                      }}
                      onPress={() => scrollToSection(tab)}
                      style={[
                        styles.tabButton,
                        activeTab === tab && styles.tabButtonActive,
                      ]}>
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === tab && styles.tabTextActive,
                        ]}>
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <ScrollView
                ref={scrollRef}
                style={{flex: 1}}
                contentContainerStyle={{paddingBottom: 12}}>
                {/* 거리 */}
                <View
                  onLayout={e => {
                    const y = e?.nativeEvent?.layout?.y;
                    if (y != null) {
                      setSectionPositions(p => ({...p, 거리: y}));
                    }
                  }}
                  style={styles.sectionContainer}>
                  <View style={styles.categoryContainer}>
                    <Text style={styles.categoryTitle}>거리</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedFilters(prev => ({
                          ...prev,

                          [keyCategory]: '',
                          [keyAlcohol]: '',
                          [keyStoreatm]: '',
                          [keyTime]: '',
                          [keyPeople]: '',
                          [keyParking]: '',
                          [keyCorkage]: '',
                          [keyScreen]: '',
                          [keyRoom]: '',
                          [keyOutdoor]: '',
                        }));
                        if (typeof setRadiusint === 'function') setRadiusint(1);
                      }}>
                      <Text style={styles.inittext}>초기화</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.filterItemsContainer}>
                    {['500m', '1km', '2km', '3km', '5km'].map(dist => (
                      <TouchableOpacity
                        key={dist}
                        style={[
                          styles.filterItem,
                          getVal(keyDistance, '1km') === dist &&
                            styles.filterItemSelected,
                        ]}
                        onPress={() => {
                          setVal(keyDistance, dist);
                          if (typeof setRadiusint === 'function') {
                            const m = {
                              '500m': 0.5,
                              '1km': 1,
                              '2km': 2,
                              '3km': 3,
                              '5km': 5,
                            };
                            const rv = m[dist] ?? 1;
                            console.log(rv);
                            setRadiusint(rv);
                          }
                        }}>
                        <Text
                          style={[
                            styles.filterItemText,
                            getVal(keyDistance, '1km') === dist &&
                              styles.filterItemTextSelected,
                          ]}>
                          {dist}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 카테고리 */}
                <View
                  onLayout={e => {
                    const y = e?.nativeEvent?.layout?.y;
                    if (y != null) {
                      setSectionPositions(p => ({...p, 카테고리: y}));
                    }
                  }}
                  style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>카테고리</Text>
                  <View style={styles.filterItemsContainer}>
                    {[
                      '이자카야',
                      '한식',
                      '양식',
                      '중식',
                      '감성주점',
                      '구이/전골',
                      '치킨/호프',
                      '회/해산물',
                      '펍/바',
                      '포차',
                    ].map(cat => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.filterItem,
                          getVal(keyCategory, '') === cat &&
                            styles.filterItemSelected,
                        ]}
                        onPress={() => toggleSingle(keyCategory, cat)}>
                        <Text
                          style={[
                            styles.filterItemText,
                            getVal(keyCategory, '') === cat &&
                              styles.filterItemTextSelected,
                          ]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 주종 */}
                <View
                  onLayout={e => {
                    const y = e?.nativeEvent?.layout?.y;
                    if (y != null) {
                      setSectionPositions(p => ({...p, 주종: y}));
                    }
                  }}
                  style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>주종</Text>
                  <View style={styles.filterItemsContainer}>
                    {[
                      '소주',
                      '맥주',
                      '막걸리',
                      '와인',
                      '칵테일',
                      '사케',
                      '고량주',
                      '위스키',
                      '보드카',
                      '전통주',
                      '하이볼',
                      '데킬라',
                    ].map(al => (
                      <TouchableOpacity
                        key={al}
                        style={[
                          styles.filterItem,
                          getVal(keyAlcohol, '') === al &&
                            styles.filterItemSelected,
                        ]}
                        onPress={() => toggleSingle(keyAlcohol, al)}>
                        <Text
                          style={[
                            styles.filterItemText,
                            getVal(keyAlcohol, '') === al &&
                              styles.filterItemTextSelected,
                          ]}>
                          {al}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                {/* 매장분위기 */}
                <View
                  onLayout={e => {
                    const y = e?.nativeEvent?.layout?.y;
                    if (y != null) {
                      setSectionPositions(p => ({...p, 매장분위기: y}));
                    }
                  }}
                  style={styles.sectionContainer}>
                  <View
                    style={{
                      flexDirection: 'row',
                    }}>
                    <Text style={styles.sectionTitle}>매장분위기</Text>
                    {storeAtmSelected.length > 0 && (
                      <Text style={styles.sectionCount}>
                        {storeAtmSelected.length}/4
                      </Text>
                    )}
                  </View>
                  <View style={styles.filterItemsContainer}>
                    {[
                      '대화하기 좋은',
                      '활기찬',
                      '혼술',
                      '데이트',
                      '파티·이벤트',
                      '전통적인',
                      '이국적인',
                      '모던·깔끔함',
                      '노포 감성',
                      '뷰 맛집',
                      '로컬 맛집',
                      '2차 맛집',
                    ].map(st => (
                      <TouchableOpacity
                        key={st}
                        style={[
                          styles.filterItem,
                          getArrVal(getVal(keyStoreatm, []))?.includes(st) &&
                            styles.filterItemSelected,
                        ]}
                        onPress={() => toggleInArray(keyStoreatm, st, 4)}>
                        <Text
                          style={[
                            styles.filterItemText,
                            getArrVal(getVal(keyStoreatm, []))?.includes(st) &&
                              styles.filterItemTextSelected,
                          ]}>
                          {st}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                {/* 방문시간 */}
                <View
                  onLayout={e => {
                    const y = e?.nativeEvent?.layout?.y;
                    if (y != null) {
                      setSectionPositions(p => ({...p, 방문시간: y}));
                    }
                  }}
                  style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>방문시간</Text>

                  <View style={styles.timeTabContainer}>
                    <TouchableOpacity
                      onPress={() => {
                        setTimePeriod('AM');
                        setVal(keyTime, '');
                        setHasScrolledTime(false);
                      }}
                      style={[
                        styles.timeTab,
                        timePeriod === 'AM' && styles.timeTabActive,
                      ]}>
                      <Text
                        style={[
                          styles.timeTabText,
                          timePeriod === 'AM' && styles.timeTabTextActive,
                        ]}>
                        오전
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setTimePeriod('PM');
                        setVal(keyTime, '');
                        setHasScrolledTime(false);
                      }}
                      style={[
                        styles.timeTab,
                        timePeriod === 'PM' && styles.timeTabActive,
                      ]}>
                      <Text
                        style={[
                          styles.timeTabText,
                          timePeriod === 'PM' && styles.timeTabTextActive,
                        ]}>
                        오후
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    ref={timeScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
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
                        .padStart(2, '0')}:${t.minute
                        .toString()
                        .padStart(2, '0')}`;
                      const label = `${timePeriod === 'AM' ? '오전' : '오후'} ${
                        t.label
                      }`;
                      const isSelected = getVal(keyTime, '') === value;
                      return (
                        <TouchableOpacity
                          key={`${timePeriod}-${idx}`}
                          onPress={() =>
                            setVal(
                              keyTime,
                              getVal(keyTime, '') === value ? '' : value,
                            )
                          }
                          onLayout={e => {
                            const x = e?.nativeEvent?.layout?.x ?? 0;
                            setTimePositions(prev => {
                              const newPos = {...prev, [idx]: x};
                              if (
                                Object.keys(newPos).length === baseTimes.length
                              ) {
                                setTimeout(() => autoScrollToTime(newPos), 50);
                              }
                              return newPos;
                            });
                          }}
                          style={[
                            styles.filterItem,
                            isSelected && styles.filterItemSelected,
                          ]}>
                          <Text
                            style={[
                              styles.filterItemText,
                              isSelected && styles.filterItemTextSelected,
                            ]}>
                            {label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <View
                  onLayout={e => {
                    const y = e.nativeEvent.layout.y;
                    setSectionPositions(p => ({...p, ['편의시설']: y}));
                  }}
                  style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>편의시설</Text>
                  <View style={styles.filterItemsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.filterfaciItem,
                        getVal(keyPeople, '') === '단체 방문' &&
                          styles.filterItemSelected,
                      ]}
                      onPress={() =>
                        setVal(
                          keyPeople,
                          getVal(keyPeople, '') === '단체 방문'
                            ? ''
                            : '단체 방문',
                        )
                      }>
                      {getVal(keyPeople, '') === '단체 방문' ? (
                        <CheckCircle2
                          size={18}
                          color="#3CBBFF"
                          strokeWidth={2.2}
                          style={{marginRight: 6}}
                        />
                      ) : (
                        <UsersRound
                          size={18}
                          color="#999"
                          strokeWidth={1.7}
                          style={{marginRight: 6}}
                        />
                      )}
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.filterfaciItemText,
                          getVal(keyPeople, '') === '단체 방문' &&
                            styles.filterItemTextSelected,
                        ]}>
                        단체 방문
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.filterfaciItem,
                        getVal(keyParking, '') === '가능' &&
                          styles.filterItemSelected,
                      ]}
                      onPress={() =>
                        setVal(
                          keyParking,
                          getVal(keyParking, '') === '가능' ? '' : '가능',
                        )
                      }>
                      {getVal(keyParking, '') === '가능' ? (
                        <CheckCircle2
                          size={18}
                          color="#3CBBFF"
                          strokeWidth={2.2}
                          style={{marginRight: 6}}
                        />
                      ) : (
                        <CarFront
                          size={18}
                          color="#999"
                          strokeWidth={1.7}
                          style={{marginRight: 6}}
                        />
                      )}
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.filterfaciItemText,
                          getVal(keyParking, '') === '가능' &&
                            styles.filterItemTextSelected,
                        ]}>
                        주차
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.filterfaciItem,
                        getVal(keyCorkage, '') === '가능' &&
                          styles.filterItemSelected,
                      ]}
                      onPress={() =>
                        setVal(
                          keyCorkage,
                          getVal(keyCorkage, '') === '가능' ? '' : '가능',
                        )
                      }>
                      {getVal(keyCorkage, '') === '가능' ? (
                        <CheckCircle2
                          size={18}
                          color="#3CBBFF"
                          strokeWidth={2.2}
                          style={{marginRight: 6}}
                        />
                      ) : (
                        <Wine
                          size={18}
                          color="#999"
                          strokeWidth={1.7}
                          style={{marginRight: 6}}
                        />
                      )}
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.filterfaciItemText,
                          getVal(keyCorkage, '') === '가능' &&
                            styles.filterItemTextSelected,
                        ]}>
                        콜키지
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.filterfaciItem,
                        getVal(keyScreen, '') === '설치' &&
                          styles.filterItemSelected,
                      ]}
                      onPress={() =>
                        setVal(
                          keyScreen,
                          getVal(keyScreen, '') === '설치' ? '' : '설치',
                        )
                      }>
                      {getVal(keyScreen, '') === '설치' ? (
                        <CheckCircle2
                          size={18}
                          color="#3CBBFF"
                          strokeWidth={2.2}
                          style={{marginRight: 6}}
                        />
                      ) : (
                        <TvMinimal
                          size={18}
                          color="#999"
                          strokeWidth={1.7}
                          style={{marginRight: 6}}
                        />
                      )}

                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.filterfaciItemText,
                          getVal(keyScreen, '') === '설치' &&
                            styles.filterItemTextSelected,
                        ]}>
                        스크린(TV)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.filterfaciItem,
                        getVal(keyRoom, '') === '가능' &&
                          styles.filterItemSelected,
                      ]}
                      onPress={() =>
                        setVal(
                          keyRoom,
                          getVal(keyRoom, '') === '가능' ? '' : '가능',
                        )
                      }>
                      {getVal(keyRoom, '') === '가능' ? (
                        <CheckCircle2
                          size={18}
                          color="#3CBBFF"
                          strokeWidth={2.2}
                          style={{marginRight: 6}}
                        />
                      ) : (
                        <DoorOpen
                          size={18}
                          color="#999"
                          strokeWidth={1.7}
                          style={{marginRight: 6}}
                        />
                      )}
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.filterfaciItemText,
                          getVal(keyRoom, '') === '가능' &&
                            styles.filterItemTextSelected,
                        ]}>
                        룸
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.filterfaciItem,
                        getVal(keyOutdoor, '') === '가능' &&
                          styles.filterItemSelected,
                      ]}
                      onPress={() =>
                        setVal(
                          keyOutdoor,
                          getVal(keyOutdoor, '') === '가능' ? '' : '가능',
                        )
                      }>
                      {getVal(keyOutdoor, '') === '가능' ? (
                        <CheckCircle2
                          size={18}
                          color="#3CBBFF"
                          strokeWidth={2.2}
                          style={{marginRight: 6}}
                        />
                      ) : (
                        <SunMedium
                          size={18}
                          color="#999"
                          strokeWidth={1.7}
                          style={{marginRight: 6}}
                        />
                      )}
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.filterfaciItemText,
                          getVal(keyOutdoor, '') === '가능' &&
                            styles.filterItemTextSelected,
                        ]}>
                        야외 좌석·테라스
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => setFilterModalVisible(false)}>
                  <Text style={styles.resetText}>닫기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setFilterModalVisible(false)}>
                  <Text style={styles.applyText}>적용</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1,
  },
  modalContentBottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '80%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 7,
    marginHorizontal: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    color: '#121212',
  },
  tabContainer: {
    paddingHorizontal: 8,
  },
  tabBar: {
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
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
  sectionContainer: {
    marginHorizontal: 16,
    paddingVertical: 12,
  },
  categoryContainer: {
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Pretendard-Bold',
    marginBottom: 8,
    color: '#333',
    marginRight: 6,
  },
  filterItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterItem: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: ColorUtil.placeholderBorder,
    backgroundColor: '#fff',
    marginRight: 12,
    marginBottom: 10,
  },
  filterfaciItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: ColorUtil.placeholderBorder,
    backgroundColor: '#fff',
  },
  filterItemSelected: {
    borderColor: '#3CBBFF',
    backgroundColor: 'rgba(60,187,255,0.08)',
  },
  filterItemText: {
    fontSize: 13,
    color: '#444',
    fontFamily: 'Pretendard-Regular',
  },
  filterfaciItemText: {
    fontSize: normalizeFont(12, 1.5),
    color: '#444',
    fontFamily: 'Pretendard-Regular',
    textAlign: 'center',
  },
  filterItemTextSelected: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-Medium',
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
  },
  timeTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 7,
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
  sectionCount: {
    fontFamily: 'Pretendard-Regular',
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 1,
  },
});

export default FilterPotal;
