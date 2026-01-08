import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  ScrollView,
  Pressable,
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  findNodeHandle,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {report_create} from '../../../api/reportApi';
import {useToast} from '../../../context/ToastContext';
import Loading from '../../../hooks/Loading';
import CustomTextInput from '../../../utils/CustomTextInput';
import CustomText from '../../../utils/CustomText';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const StoreReportScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId, storeName} = route.params;

  const insets = useSafeAreaInsets();
  const {showToast} = useToast();

  const scrollRef = useRef(null);

  // ✅ 입력창 자동 스크롤용 ref
  const proposeInputRef = useRef(null);
  const reportInputRef = useRef(null);

  // 제보 사유 목록
  const proposeReasons = [
    '잘못된 가게 정보',
    '잘못된 메뉴 정보',
    '잘못된 주류 정보',
    '폐업 또는 존재하지 않음',
    '중복된 매장',
  ];

  // 신고 사유 목록
  const reportReasons = [
    '부적절한 언어 사용',
    '부적절한 사진 게시',
    '플랫폼 가이드라인 위반',
    '기타 신고 문제',
  ];

  const reasonMap = {
    '잘못된 가게 정보': 'INCORRECT_STORE_INFO',
    '잘못된 메뉴 정보': 'INCORRECT_MENU_INFO',
    '잘못된 주류 정보': 'INCORRECT_DRINK_INFO',
    '폐업 또는 존재하지 않음': 'NON_EXISTENT_STORE',
    '중복된 매장': 'DUPLICATE_STORE',
    '부적절한 언어 사용': 'INAPPROPRIATE_LANGUAGE',
    '부적절한 사진 게시': 'INAPPROPRIATE_PHOTO',
    '플랫폼 가이드라인 위반': 'VIOLATION_OF_GUIDELINES',
    '기타 신고 문제': 'ETC',
  };

  const [selectedProposeReason, setSelectedProposeReason] = useState(null);
  const [selectedReportReason, setSelectedReportReason] = useState(null);

  const [customReason, setCustomReason] = useState('');
  const [customProposeReason, setCustomProposeReason] = useState('');

  const [reportMode, setReportMode] = useState('propose');

  // ✅ 모달 상태 제거
  // const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ 포커스된 입력창이 키보드에 가리지 않게 자동 스크롤
  const scrollToInput = useCallback((inputRef, extraOffset = 90) => {
    const scroll = scrollRef.current;
    const node = inputRef?.current ? findNodeHandle(inputRef.current) : null;

    if (!scroll || !node) return;

    requestAnimationFrame(() => {
      scroll.scrollResponderScrollNativeHandleToKeyboard(
        node,
        extraOffset,
        true,
      );
    });
  }, []);

  // ✅ 키보드가 실제로 올라온 다음에도 한 번 더 보정(안정성)
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      if (reportMode === 'propose' && selectedProposeReason) {
        scrollToInput(proposeInputRef, 90);
      }
      if (
        reportMode === 'report' &&
        selectedReportReason === '기타 신고 문제'
      ) {
        scrollToInput(reportInputRef, 90);
      }
    });

    return () => sub.remove();
  }, [reportMode, selectedProposeReason, selectedReportReason, scrollToInput]);

  // 제보 사유 선택
  const handleSelectProposeReason = reason => {
    setSelectedProposeReason(prev => (prev === reason ? null : reason));
    setSelectedReportReason(null);
    setCustomReason('');
    setCustomProposeReason('');
  };

  // 신고 사유 선택
  const handleSelectReportReason = reason => {
    setSelectedReportReason(prev => (prev === reason ? null : reason));
    setSelectedProposeReason(null);
    setCustomReason('');
    setCustomProposeReason('');
  };

  const handleModeChange = mode => {
    setReportMode(mode);
    if (mode === 'propose') {
      setSelectedReportReason(null);
      setCustomReason('');
      return;
    }
    setSelectedProposeReason(null);
    setCustomProposeReason('');
  };

  // ✅ 제출 처리 (모달 없이 바로 전송)
  const handleSubmitReport = useCallback(async () => {
    // 이미 로딩중이면 중복 전송 방지
    if (loading) return;

    // 유효성: 선택 여부
    const hasSelected =
      (reportMode === 'propose' && selectedProposeReason) ||
      (reportMode === 'report' && selectedReportReason);

    if (!hasSelected) return;

    // 유효성: 신고-기타는 필수 입력(기존 로직 유지)
    if (reportMode === 'report' && selectedReportReason === '기타 신고 문제') {
      if (!customReason.trim()) {
        showToast('기타 신고 사유를 입력해주세요.');
        // 입력창으로 스크롤 + 포커스 유도(가능하면)
        setTimeout(() => scrollToInput(reportInputRef, 90), 50);
        return;
      }
    }

    // (참고) 제보 상세는 선택이라 입력 없어도 통과
    setLoading(true);

    let reportReasonCode = '';
    let descriptionText = '';
    let shouldSendDescription = false;

    if (selectedReportReason) {
      if (selectedReportReason === '기타 신고 문제') {
        reportReasonCode = 'ETC';
        descriptionText = customReason.trim();
        shouldSendDescription = descriptionText !== '';
      } else {
        reportReasonCode = reasonMap[selectedReportReason];
      }
    } else if (selectedProposeReason) {
      reportReasonCode = reasonMap[selectedProposeReason] ?? 'ETC';
      descriptionText = customProposeReason.trim();
      shouldSendDescription = descriptionText !== '';
    }

    const payloadData = {
      reportTarget: 'STORE',
      targetId: storeId,
      reportReason: reportReasonCode,
    };

    if (shouldSendDescription) {
      payloadData.description = descriptionText;
    }

    try {
      await report_create(payloadData);
      showToast(
        selectedReportReason ? '신고 완료되었습니다.' : '제보 완료되었습니다.',
      );
      navigation.goBack();
    } catch (error) {
      const code = error?.response?.data?.code;
      if (code === 27004) {
        showToast(
          selectedReportReason
            ? '이미 신고한 매장입니다.'
            : '이미 제보한 매장입니다.',
        );
      } else if (code === 27003) {
        showToast('기타 신고 사유를 입력해주세요.');
        setTimeout(() => scrollToInput(reportInputRef, 90), 50);
      } else {
        showToast('잠시 후 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    reportMode,
    selectedProposeReason,
    selectedReportReason,
    customReason,
    customProposeReason,
    reasonMap,
    storeId,
    navigation,
    showToast,
    scrollToInput,
  ]);

  const isSubmitDisabled =
    reportMode === 'propose'
      ? !selectedProposeReason
      : !selectedReportReason ||
        (selectedReportReason === '기타 신고 문제' && !customReason.trim());

  const handleClose = () => navigation.goBack();

  // ✅ Android 여백 이슈 방지:
  // - Android에서는 KeyboardAvoidingView 적용하지 않음
  // - contentContainerStyle에만 하단 여백(insets.bottom)을 둠
  const Wrapper = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
  const wrapperProps =
    Platform.OS === 'ios'
      ? {style: {flex: 1}, behavior: 'padding'}
      : {style: {flex: 1}};

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 0),
        },
      ]}>
      <View style={styles.header}>
        <Pressable
          style={{zIndex: 2}}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          onPress={handleClose}>
          <Ionicons name="close" size={24} color="#111" />
        </Pressable>
        <CustomText style={styles.headerText}>매장 신고하기</CustomText>
      </View>

      <Wrapper {...wrapperProps}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: insets.bottom + 24,
          }}>
          <View style={styles.titleheader}>
            <CustomText style={styles.storeInfo}>매장명</CustomText>
            <CustomText style={styles.title}>{storeName}</CustomText>
          </View>

          <View style={styles.reasonView}>
            <Pressable onPress={() => handleModeChange('propose')} hitSlop={6}>
              <CustomText
                style={[
                  styles.reasonTitle,
                  reportMode === 'propose' && styles.reasonTitleActive,
                ]}>
                제보
              </CustomText>
            </Pressable>
            <Pressable onPress={() => handleModeChange('report')} hitSlop={6}>
              <CustomText
                style={[
                  styles.reasonTitle,
                  reportMode === 'report' && styles.reasonTitleActive,
                ]}>
                신고
              </CustomText>
            </Pressable>
          </View>

          {reportMode === 'propose' ? (
            <>
              <View style={styles.reasonContainer}>
                {proposeReasons.map((reason, index) => {
                  const isActive = selectedProposeReason === reason;
                  return (
                    <Pressable
                      key={index}
                      style={styles.reasonItem}
                      onPress={() => handleSelectProposeReason(reason)}
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

              {/* 제보 상세 입력(선택) */}
              {selectedProposeReason && (
                <CustomTextInput
                  ref={proposeInputRef}
                  style={styles.textInput}
                  placeholder="상세 제보 내용을 입력하세요 (선택)"
                  placeholderTextColor="#aaa"
                  value={customProposeReason}
                  onChangeText={setCustomProposeReason}
                  multiline
                  onFocus={() => {
                    setTimeout(() => scrollToInput(proposeInputRef, 90), 50);
                  }}
                />
              )}
            </>
          ) : (
            <>
              <View style={styles.reasonContainer}>
                {reportReasons.map((reason, index) => {
                  const isActive = selectedReportReason === reason;
                  return (
                    <Pressable
                      key={index}
                      style={styles.reasonItem}
                      onPress={() => handleSelectReportReason(reason)}
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

              {/* 신고-기타 입력(필수) */}
              {selectedReportReason === '기타 신고 문제' && (
                <CustomTextInput
                  ref={reportInputRef}
                  style={styles.textInput}
                  placeholder="신고 사유를 입력하세요"
                  placeholderTextColor="#aaa"
                  value={customReason}
                  onChangeText={setCustomReason}
                  multiline
                  onFocus={() => {
                    setTimeout(() => scrollToInput(reportInputRef, 90), 50);
                  }}
                />
              )}
            </>
          )}

          {/* ✅ 제출 버튼: 모달 없이 바로 전송 */}
          <Pressable
            style={[
              styles.submitButton,
              (isSubmitDisabled || loading) && styles.disabledButton,
            ]}
            onPress={handleSubmitReport}
            disabled={isSubmitDisabled || loading}>
            <CustomText style={styles.submitButtonText}>
              {selectedProposeReason
                ? '제보 제출'
                : selectedReportReason
                ? '신고 제출'
                : '제출하기'}
            </CustomText>
          </Pressable>

          <View style={styles.reportView}>
            <CustomText style={styles.reportText}>
              제보·신고 기능은 플랫폼의 건전한 운영을 위해 제공됩니다. 허위
              제보·신고, 악의적인 반복 제보·신고는 서비스 이용에 제한을 받을 수
              있습니다. {'\n\n'}
              제보·신고 접수 시 제보·신고자의 정보가 저장되며, 허위 제보·신고
              또는 반복 제보·신고가 확인될 경우 서비스 이용이 제한될 수
              있습니다. {'\n\n'}제보·신고는 사실에 근거하여 신중하게 제출해
              주세요. {'\n\n'}
              다른 이용자 또는 플랫폼에 고의적으로 피해를 주기 위한 신고는
              엄격히 금지됩니다. {'\n\n'}
              반복적인 부적절한 제보·신고는 서비스 이용 제한 및 계정 정지 등의
              조치가 취해질 수 있습니다. {'\n\n'}제보·신고를 제출하면 운영
              정책에 따라 검토 후 처리됩니다. 거짓 제보·신고 또는 악의적인
              제보·신고가 확인될 경우, 해당 제보·신고는 무효 처리되며 불이익이
              있을 수 있습니다.
            </CustomText>
          </View>
        </ScrollView>
      </Wrapper>

      {/* ✅ 모달 완전 제거 */}
      <Loading loading={loading} />
    </View>
  );
};

export default StoreReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F1F1',
  },
  headerText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: '#111',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  titleheader: {
    marginLeft: 18,
    marginTop: 30,
  },
  storeInfo: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
    fontFamily: 'Pretendard-Regluar',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
  reasonView: {
    marginLeft: 18,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reasonTitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    marginRight: 7,
  },
  reasonTitleActive: {
    color: '#333',
    fontFamily: 'Pretendard-Bold',
  },
  reasonContainer: {
    marginHorizontal: 18,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
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
    fontSize: 16,
    color: '#1f2430',
    fontFamily: 'Pretendard-SemiBold',
  },
  reasonTextInactive: {
    color: '#8A93A3',
    fontFamily: 'Pretendard-Medium',
  },
  textInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    color: '#333',
    minHeight: 60,
    textAlignVertical: 'top',
    marginHorizontal: 18,
    maxHeight: 170,
  },
  submitButton: {
    backgroundColor: '#3CBBFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#C9CFD9',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
  },
  reportView: {
    marginHorizontal: 18,
    marginVertical: 30,
  },
  reportText: {
    fontSize: 14,
    color: '#777',
    fontFamily: 'Pretendard-Regluar',
  },
});
