import React, {useState} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import StoreAreastats from '../../../components/Managerstoreinfo/StoreAreastats/StoreAreastats';
import StoreLikestats from '../../../components/Managerstoreinfo/StoreLikestats/StoreLikestats';
import StoreViewstats from '../../../components/Managerstoreinfo/StoreViewstats/StoreViewstats';

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

  const [selectedTab, setSelectedTab] = useState('around');

  const currentTab = tabs.find(t => t.id === selectedTab);

  return (
    <SafeAreaView style={styles.container}>
      {/* 선택된 탭 부가설명 영역 */}
      <View style={styles.subLabelContainer}>
        <Ionicons
          name={currentTab.icon}
          size={20}
          color="#999"
          style={styles.subLabelIcon}
        />
        <Text style={styles.subLabelText}>{currentTab.subLabel}</Text>
      </View>

      {/* 통계 컴포넌트 렌더링 */}
      <View style={styles.contentContainer}>
        {selectedTab === 'around' && (
          <StoreAreastats locationDto={locationDto} />
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
              onPress={() => setSelectedTab(tab.id)}
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
});
