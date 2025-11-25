import React, {useEffect, useMemo, useRef} from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../common/CustomText';

const StoreOrderHeader = ({
  insets,
  navigation,
  storeName,
  activeTab,
  setActiveTab,
  totalMenuCount,
  totalAlcoholCount,
  isAlcoholTabsSticky,
}) => {
  const renderTabButton = (key, label, count) => {
    const isActive = activeTab === key;
    const displayCount = count > 99 ? '99+' : count;

    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.tabButton,
          isActive && styles.tabButtonActive,
          key === 'menu'
            ? {borderTopLeftRadius: 5, borderBottomLeftRadius: 5}
            : {borderTopRightRadius: 5, borderBottomRightRadius: 5},
        ]}
        onPress={() => setActiveTab(key)}
        activeOpacity={0.9}>
        <CustomText
          style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
          {label}
        </CustomText>
        <CustomText
          style={[styles.tabCount, isActive && styles.tabCountActive]}>
          {displayCount}
        </CustomText>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.customHeader,
        {
          paddingTop: Platform.OS === 'android' ? insets.top + 10 : insets.top,
          borderBottomWidth:
            activeTab === 'alcohol' && isAlcoholTabsSticky ? 0 : 1,
        },
      ]}>
      <TouchableOpacity
        style={styles.headerBackButton}
        onPress={() => navigation.goBack()}
        hitSlop={{top: 10, bottom: 10, left: 16, right: 16}}>
        <Ionicons name="arrow-back-outline" size={22} color="#1F2937" />
      </TouchableOpacity>
      <CustomText style={styles.storeTitle} numberOfLines={1}>
        {storeName || '한잔할까'}
      </CustomText>
      <View style={styles.headerTabsContainer}>
        {renderTabButton('menu', '메뉴', totalMenuCount)}
        {renderTabButton('alcohol', '주류', totalAlcoholCount)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBackButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  storeTitle: {
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 19,
    color: '#0F172A',
    marginRight: 7,
  },
  headerTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 130,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 7,
    borderColor: 'transparent',
    backgroundColor: '#fff',
  },
  tabButtonActive: {
    backgroundColor: '#E5E7EB',
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#555',
  },
  tabLabelActive: {
    color: '#111827',
  },
  tabCount: {
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: '#555',
  },
  tabCountActive: {
    color: '#111827',
  },
});

export default StoreOrderHeader;
