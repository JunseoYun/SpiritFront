import React from 'react';
import {StyleSheet, Text, View, Pressable, ScrollView} from 'react-native';
import CustomText from '../../../utils/CustomText';

const TABS = [
  '접수 진행중',
  '결제 요청',
  '접수 완료',
  '방문 완료',
  '취소/환불',
];

const UserHeaderTabs = ({activeTab, tabsRef, onTabsScroll, handleTabPress}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    ref={tabsRef}
    onScroll={onTabsScroll}
    scrollEventThrottle={16}
    style={styles.tabsContainer}
    contentContainerStyle={styles.tabsScroll}>
    <View style={styles.tabsRow}>
      {TABS.map((label, idx) => {
        const selected = idx === activeTab;
        return (
          <Pressable
            key={label}
            onPress={() => handleTabPress(idx)}
            style={[styles.tab, selected && styles.tabActive]}
            hitSlop={8}>
            <CustomText
              style={[styles.tabText, selected && styles.tabTextActive]}>
              {label}
            </CustomText>
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
    marginTop: 20,
    marginBottom: 15,
  },
  tabsScroll: {alignItems: 'center'},
  tabsRow: {
    flexDirection: 'row',
    marginRight: 12,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    marginRight: 10,
  },
  tabActive: {backgroundColor: '#E8F7FF', borderColor: '#3CBBFF'},
  tabText: {fontFamily: 'Pretendard-Medium', color: '#6B7280', fontSize: 12},
  tabTextActive: {color: '#3CBBFF'},
});

export default UserHeaderTabs;
