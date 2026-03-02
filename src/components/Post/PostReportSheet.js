import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomText from '../../utils/CustomText';

export const POST_REPORT_REASONS = [
  '부적절한 언어 사용',
  '부적절한 사진 게시',
  '허위 광고 및 스팸',
  '동일 내용 반복 게시',
  '저작권 침해 우려',
];

export const COMMENT_REPORT_REASONS = [
  '부적절한 언어 사용',
  '허위 광고 및 스팸',
  '동일 내용 반복 게시',
];

export const REPORT_REASON_MAP = {
  '부적절한 언어 사용': 'INAPPROPRIATE_LANGUAGE',
  '부적절한 사진 게시': 'INAPPROPRIATE_PHOTO',
  '허위 광고 및 스팸': 'SPAM_ADVERTISING',
  '동일 내용 반복 게시': 'REPETITIVE_POSTING',
  '저작권 침해 우려': 'COPYRIGHT_INFRINGEMENT',
};

const PostReportSheet = ({
  visible,
  onClose,
  onSubmit,
  selectedReason,
  onSelectReason,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.reportOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          android_ripple={{color: 'transparent'}}
        />
        <View style={[styles.reportSheet, {paddingBottom: insets.bottom + 10}]}>
          <View style={styles.reportHeader}>
            <CustomText style={styles.reportTitle}>콘텐츠 신고하기</CustomText>
            <Pressable hitSlop={8} onPress={onClose}>
              <Ionicons name="close" size={20} color="#333" />
            </Pressable>
          </View>
          <View style={styles.reportList}>
            {POST_REPORT_REASONS.map(reason => {
              const isActive = selectedReason === reason;
              return (
                <Pressable
                  key={reason}
                  style={styles.reportItem}
                  onPress={() => onSelectReason(reason)}
                  hitSlop={4}>
                  <View
                    style={[
                      styles.radioOuter,
                      isActive && styles.radioOuterActive,
                    ]}>
                    {isActive ? <View style={styles.radioInner} /> : null}
                  </View>
                  <CustomText
                    style={[
                      styles.reportReasonText,
                      !isActive && styles.reportReasonTextInactive,
                    ]}>
                    {reason}
                  </CustomText>
                </Pressable>
              );
            })}
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.reportSubmitButton,
              !selectedReason && styles.reportSubmitButtonDisabled,
            ]}
            onPress={onSubmit}
            disabled={!selectedReason}>
            <CustomText style={styles.reportSubmitText}>신고하기</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  reportOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  reportSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
  },
  reportList: {
    paddingVertical: 4,
    paddingBottom: 8,
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CDD3DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#3CBBFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#3CBBFF',
  },
  reportReasonText: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Pretendard-Medium',
  },
  reportReasonTextInactive: {
    color: '#999',
    fontFamily: 'Pretendard-Regular',
  },
  reportSubmitButton: {
    marginTop: 6,
    backgroundColor: '#3CBBFF',
    borderRadius: 9,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reportSubmitButtonDisabled: {
    backgroundColor: '#C9CFD9',
  },
  reportSubmitText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default PostReportSheet;
