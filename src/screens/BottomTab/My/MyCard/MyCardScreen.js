import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import CustomText from '../../../../utils/CustomText';

// Empty list UI
const MyCardScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <CustomText style={styles.headerTitle}>등록된 카드</CustomText>
        <View style={styles.countBadge}>
          <CustomText style={styles.countText}>0</CustomText>
        </View>
      </View>

      <View style={styles.emptyWrap}>
        <View style={styles.emptyCard} />
        <CustomText style={styles.emptyTitle}>자주 사용하는 카드</CustomText>
        <CustomText style={styles.emptySub}>
          카드를 등록하면 더 빠르게 결제할 수 있어요
        </CustomText>
        <TouchableOpacity
          style={styles.cta}
          onPress={() =>
            navigation.navigate('CardRegisterScreen', {mode: 'MyCard'})
          }>
          <CustomText style={styles.ctaText}>카드 등록</CustomText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MyCardScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerTitle: {fontSize: 20, fontWeight: '800', color: '#111'},
  countBadge: {
    marginLeft: 8,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countText: {fontSize: 14, color: '#475569', fontWeight: '700'},
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyCard: {
    width: 120,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#3CBBFF',
  },
  emptySub: {marginTop: 6, fontSize: 14, color: '#6B7280', textAlign: 'center'},
  cta: {
    marginTop: 16,
    backgroundColor: '#3CBBFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  ctaText: {color: '#fff', fontFamily: 'Pretendard-Medium', fontSize: 16},
});
