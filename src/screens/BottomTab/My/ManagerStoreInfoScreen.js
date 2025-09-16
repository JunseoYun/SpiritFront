import React, {useState, useRef} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

import StoreAreastats from '../../../components/Managerstoreinfo/StoreAreastats/StoreAreastats';
import StoreLikestats from '../../../components/Managerstoreinfo/StoreLikestats/StoreLikestats';
import StoreViewstats from '../../../components/Managerstoreinfo/StoreViewstats/StoreViewstats';
import useSafeAndroidInsets from '../../../hooks/useSafeAndroidInsets';

const tabs = [
  {
    id: 'around',
    label: '주변 사람들',
    subLabel: '내 매장 근처에 이런 사람들이 있어요',
    icon: 'radio-outline',
  },
  {
    id: 'view',
    label: '둘러본 사람들',
    subLabel: '앱에서 내 매장을 구경한 사람들이에요',
    icon: 'search-outline',
  },
  {
    id: 'like',
    label: '찜한 사람들',
    subLabel: '내 매장을 찜해둔 사람들이에요',
    icon: 'heart-outline',
  },
];

const ManagerStoreInfoScreen = () => {
  const route = useRoute();
  const {storeId, locationDto} = route.params;
  const {bottom} = useSafeAndroidInsets();
  const [selectedTab, setSelectedTab] = useState('around');
  const [radius, setRadius] = useState('2');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const currentTab = tabs.find(t => t.id === selectedTab);

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

  return (
    <SafeAreaView style={[styles.container, {paddingBottom: bottom}]}>
      {/* 선택된 탭 부가설명 영역 */}
      <View style={styles.subLabelContainer}>
        <View style={{flexDirection: 'row'}}>
          <Ionicons
            name={currentTab.icon}
            size={20}
            color="#999"
            style={styles.subLabelIcon}
          />
          <Text style={styles.subLabelText}>{currentTab.subLabel}</Text>
        </View>

        {selectedTab === 'around' && (
          <Pressable
            hitSlop={10}
            onPress={() => toggleDropdown()}
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              alignContent: 'center',
            }}>
            <Text style={[styles.subLabelText, {marginRight: 3, fontSize: 14}]}>
              {radius}km
            </Text>
            <Feather
              name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
              size={17}
              color="#555"
            />
          </Pressable>
        )}
        {selectedTab === 'around' && dropdownVisible && (
          <Animated.View
            style={[
              styles.dropdown,
              {transform: [{translateY: dropdownTranslateY}]},
            ]}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                toggleDropdown();
                setRadius('2');
              }}>
              <Text
                style={[
                  styles.dropdownText,
                  radius === '2' && {color: '#121212'},
                ]}>
                2km
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                toggleDropdown();
                setRadius('3');
              }}>
              <Text
                style={[
                  styles.dropdownText,
                  radius === '3' && {color: '#121212'},
                ]}>
                3km
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                toggleDropdown();
                setRadius('5');
              }}>
              <Text
                style={[
                  styles.dropdownText,
                  radius === '5' && {color: '#121212'},
                ]}>
                5km
              </Text>
            </TouchableOpacity>

            {/* 필요한 기능 더 추가 가능 */}
          </Animated.View>
        )}
      </View>

      {/* 통계 컴포넌트 렌더링 */}
      <View style={styles.contentContainer}>
        {selectedTab === 'around' && (
          <StoreAreastats
            locationDto={locationDto}
            radius={radius}
            onScrollCloseDropdown={() => dropdownVisible && toggleDropdown()}
          />
        )}
        {selectedTab === 'view' && <StoreViewstats storeId={storeId} />}
        {selectedTab === 'like' && <StoreLikestats storeId={storeId} />}
      </View>

      {/* 하단 심플 탭 */}
      <View style={styles.tabBar}>
        {tabs.map(tab => {
          const focused = tab.id === selectedTab;
          return (
            <Pressable
              key={tab.id}
              onPress={() => {
                setSelectedTab(tab.id);
                if (dropdownVisible) {
                  toggleDropdown();
                }
              }}
              style={[styles.tabItem]}
              android_ripple={{color: '#ddd'}}>
              <Ionicons
                name={tab.icon}
                size={22}
                color={focused ? '#45C9FF' : '#999'}
                style={{marginBottom: 4}}
              />
              <Text
                style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default ManagerStoreInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  subLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f9faff',
    justifyContent: 'space-between',
  },
  subLabelIcon: {
    marginRight: 8,
  },
  subLabelText: {
    fontSize: 13,
    color: '#555',
    fontFamily: 'Pretendard-Regular',
    lineHeight: 18,
    whiteSpace: 'pre-line', // 줄바꿈 허용
  },
  contentContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 8 : 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
  tabLabelFocused: {
    color: '#45C9FF',
    fontFamily: 'Pretendard-SemiBold',
  },
  dropdown: {
    position: 'absolute',
    top: 50, // 부가기능 버튼 아래 위치 조절
    right: 15, // 버튼 padding 맞춰 위치 조절
    backgroundColor: '#fff',
    borderRadius: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    paddingVertical: 5,
    width: 70,
    zIndex: 999,

    // flexDirection: 'column', 기본값이라 생략 가능
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
