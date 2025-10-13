import React from 'react';
import {StyleSheet, Text, View, Pressable, ScrollView} from 'react-native';

const TABS = ['신규 요청', '결제/대기', '준비 중', '완료', '취소/거절/환불'];

const OwnerHeaderTabs = ({
  tabsRef,
  onTabsScroll,
  activeTab,
  handleTabPress,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    ref={tabsRef}
    onScroll={onTabsScroll}
    scrollEventThrottle={16}
    contentContainerStyle={styles.tabsScroll}
    style={styles.tabsContainer}>
    <View style={styles.tabsRow}>
      {TABS.map((label, idx) => {
        const selected = idx === activeTab;
        return (
          <Pressable
            key={label}
            onPress={() => handleTabPress(idx)}
            style={[styles.tab, selected && styles.tabActive]}
            hitSlop={8}>
            <Text style={[styles.tabText, selected && styles.tabTextActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </ScrollView>
);
const styles = StyleSheet.create({
  tabsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  tabsScroll: {alignItems: 'center'},
  tabsRow: {flexDirection: 'row', marginRight: 12},
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    marginRight: 10,
  },
  tabActive: {backgroundColor: '#E8F7FF', borderColor: '#45C9FF'},
  tabText: {fontFamily: 'Pretendard-Medium', color: '#6B7280', fontSize: 13},
  tabTextActive: {color: '#45C9FF'},
});

export default OwnerHeaderTabs;
