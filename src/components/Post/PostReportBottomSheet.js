import React, {useCallback} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import CustomText from '../../utils/CustomText';

const PostReportBottomSheet = ({
  sheetRef,
  reasons,
  selectedReason,
  onSelectReason,
  onSubmit,
  title = '게시글 신고하기',
  snapPoints: snapPointsProp,
}) => {
  const insets = useSafeAreaInsets();
  const snapPoints = snapPointsProp;
  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheet}
      handleIndicatorStyle={styles.handle}>
      <BottomSheetView
        style={[styles.content, {paddingBottom: insets.bottom + 10}]}>
        <View style={styles.header}>
          <CustomText style={styles.title}>{title}</CustomText>
          <Pressable hitSlop={8} onPress={() => sheetRef?.current?.dismiss()}>
            <Ionicons name="close" size={20} color="#333" />
          </Pressable>
        </View>
        <View style={styles.list}>
          {reasons.map(reason => {
            const isActive = selectedReason === reason;
            return (
              <Pressable
                key={reason}
                style={styles.item}
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
                    styles.reasonText,
                    !isActive && styles.reasonTextInactive,
                  ]}>
                  {reason}
                </CustomText>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          style={[
            styles.submitButton,
            !selectedReason && styles.submitButtonDisabled,
          ]}
          onPress={onSubmit}
          disabled={!selectedReason}>
          <CustomText style={styles.submitText}>신고하기</CustomText>
        </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#fff',
  },
  handle: {
    backgroundColor: '#E0E0E0',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
  },
  list: {
    paddingVertical: 4,
    paddingBottom: 8,
  },
  item: {
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
  reasonText: {
    fontSize: 15,
    color: '#1f2430',
    fontFamily: 'Pretendard-SemiBold',
  },
  reasonTextInactive: {
    color: '#8A93A3',
    fontFamily: 'Pretendard-Medium',
  },
  submitButton: {
    marginTop: 6,
    backgroundColor: '#3CBBFF',
    borderRadius: 9,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#C9CFD9',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default PostReportBottomSheet;
