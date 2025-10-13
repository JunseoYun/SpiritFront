import React from 'react';
import {StyleSheet, Text, View, Pressable} from 'react-native';

const OwnerModeBtn = ({setManualMode, manualMode}) => (
  <View style={styles.modeRow}>
    <Text style={styles.modeLabel}>확인 모드</Text>
    <View style={styles.modeSegment}>
      <Pressable
        onPress={() => setManualMode(true)}
        style={[styles.modeBtn, manualMode && styles.modeBtnActive]}
        hitSlop={8}>
        <Text
          style={[styles.modeBtnText, manualMode && styles.modeBtnTextActive]}>
          수동 확인
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setManualMode(false)}
        style={[styles.modeBtn, !manualMode && styles.modeBtnActive]}
        hitSlop={8}>
        <Text
          style={[styles.modeBtnText, !manualMode && styles.modeBtnTextActive]}>
          자동 확인
        </Text>
      </Pressable>
    </View>
  </View>
);
const styles = StyleSheet.create({
  modeRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeLabel: {fontFamily: 'Pretendard-SemiBold', color: '#374151'},
  modeSegment: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
  },
  modeBtn: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8},
  modeBtnActive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modeBtnText: {
    fontFamily: 'Pretendard-Medium',
    color: '#6B7280',
    fontSize: 12,
  },
  modeBtnTextActive: {color: '#111827', fontFamily: 'Pretendard-SemiBold'},
});

export default OwnerModeBtn;
