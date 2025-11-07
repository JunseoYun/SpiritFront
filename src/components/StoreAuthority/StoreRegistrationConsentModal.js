import React from 'react';
import {Modal, View, Pressable, Text, StyleSheet, Platform} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ColorUtil from '../../utils/ColorUtil';

const StoreRegistrationConsentModal = ({
  visible,
  onRequestClose,
  isChecked,
  onToggleChecked,
  onConfirm,
  loading,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="fade"
      transparent
      statusBarTranslucent={true}
      visible={visible}
      onRequestClose={onRequestClose}>
      <View style={styles.consentOverlay}>
        <Pressable
          style={styles.consentDim}
          android_ripple={{color: 'rgba(0,0,0,0.1)'}}
        />
        <View
          style={[
            styles.consentModal,
            {
              paddingBottom:
                Platform.OS === 'android'
                  ? insets.bottom + 20
                  : insets.bottom + 10,
            },
          ]}>
          <Text style={styles.consentTitle}>매장 등록 정보 수집 안내</Text>
          <Text style={styles.consentDescription}>
            한잔할까는 매장 등록 및 사업자 인증을 위해{'\n'}신청자의 이름,
            연락처, 사업자등록증 사본을 수집·이용합니다.{'\n'}
            해당 정보는 등록 심사와 사업자 진위 확인 외의 용도로 사용되지
            않으며, 심사 완료 후 일정 기간이 지난 후 안전하게 파기됩니다.
          </Text>

          <Pressable
            style={styles.consentCheckboxRow}
            onPress={onToggleChecked}>
            <View
              style={[
                styles.consentCheckbox,
                isChecked && styles.consentCheckboxChecked,
              ]}>
              {isChecked && (
                <Ionicons name="checkmark" size={14} color="#FFF" />
              )}
            </View>
            <Text style={styles.consentCheckboxLabel}>
              위 내용에 동의합니다. (필수)
            </Text>
          </Pressable>

          <View style={styles.consentButtonRow}>
            <Pressable
              style={[styles.consentButton, styles.consentCancelButton]}
              onPress={onRequestClose}>
              <Text style={styles.consentCancelText}>취소</Text>
            </Pressable>
            <Pressable
              style={[
                styles.consentButton,
                styles.consentConfirmButton,
                (!isChecked || loading) && styles.consentButtonDisabled,
              ]}
              onPress={onConfirm}
              disabled={!isChecked || loading}>
              <Text style={styles.consentConfirmText}>동의하고 등록</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  consentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  consentDim: {
    flex: 1,
  },
  consentModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 26,
  },
  consentTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#111',
  },
  consentDescription: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
    fontFamily: 'Pretendard-Regular',
  },
  consentCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  consentCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#FFF',
  },
  consentCheckboxChecked: {
    backgroundColor: ColorUtil.main,
    borderColor: ColorUtil.main,
  },
  consentCheckboxLabel: {
    fontSize: 15,
    color: '#222',
    fontFamily: 'Pretendard-SemiBold',
  },
  consentButtonRow: {
    flexDirection: 'row',
    marginTop: 28,
  },
  consentButton: {
    flex: 1,
    height: 50,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentCancelButton: {
    borderWidth: 1,
    borderColor: '#D0D7E2',
    marginRight: 12,
  },
  consentConfirmButton: {
    backgroundColor: ColorUtil.main,
  },
  consentButtonDisabled: {
    backgroundColor: ColorUtil.mainDisable,
  },
  consentCancelText: {
    fontSize: 15,
    color: '#415373',
    fontFamily: 'Pretendard-SemiBold',
  },
  consentConfirmText: {
    fontSize: 15,
    color: '#FFF',
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default StoreRegistrationConsentModal;
