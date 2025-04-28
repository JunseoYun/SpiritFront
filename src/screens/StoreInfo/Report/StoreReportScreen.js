import React, {useState} from 'react';
import {
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  View,
  StyleSheet,
  TextInput,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import StoreReportModal from '../../../components/ReportScreen/StoreReportModal';
import {report_create} from '../../../api/reportApi';
import {useToast} from '../../../context/ToastContext';
import Loading from '../../../hooks/Loading';

const StoreReportScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId, storeName} = route.params;

  // 신고 사유 목록
  const proposeReasons = [
    '잘못된 가게 정보',
    '잘못된 메뉴 정보',
    '잘못된 주류 정보',
    '폐업 또는 존재하지 않음',
    '중복된 매장',
  ];
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
  const {showToast} = useToast();
  const [selectedProposeReason, setSelectedProposeReason] = useState(null);
  const [selectedReportReason, setSelectedReportReason] = useState(null);
  const [customReason, setCustomReason] = useState(''); // 기타 문제 입력 상태
  const [customProposeReason, setCustomProposeReason] = useState(''); // 기타 제보 입력 상태

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // 제보 사유 선택
  const handleSelectProposeReason = reason => {
    setSelectedProposeReason(prev => (prev === reason ? null : reason));
    setSelectedReportReason(null); // 신고 사유 초기화
    setCustomReason(''); // 기타 신고 문제 입력 초기화
    setCustomProposeReason(''); // 기타 제보 사항 입력값 초기화 (이 부분 추가!)
  };

  // 신고 사유 선택
  const handleSelectReportReason = reason => {
    setSelectedReportReason(prev => (prev === reason ? null : reason));
    setSelectedProposeReason(null); // 제보 사유 초기화
    setCustomReason(''); // 기타 신고 문제 입력 초기화
    setCustomProposeReason(''); // 기타 제보 사항 입력값 초기화 (이 부분 추가!)
  };

  // 신고 확인 모달 열기
  const onSubmitReport = () => {
    if (selectedProposeReason || selectedReportReason) {
      setIsModalVisible(true);
    }
  };

  // 신고 제출 처리
  const handleSubmitReport = async () => {
    setIsModalVisible(false);
    setLoading(true);

    let reportReasonCode = '';
    let descriptionText = '';

    if (selectedReportReason) {
      if (selectedReportReason === '기타 신고 문제') {
        reportReasonCode = 'ETC';
        descriptionText = customReason; // 직접 입력한 기타 신고 내용
      } else {
        reportReasonCode = reasonMap[selectedReportReason];
        descriptionText = selectedReportReason; // 한글 그대로
      }
    } else if (selectedProposeReason) {
      if (selectedProposeReason === '기타 제보 사항') {
        reportReasonCode = 'ETC';
        descriptionText = customProposeReason; // 직접 입력한 기타 제보 내용
      } else {
        reportReasonCode = reasonMap[selectedProposeReason];
        descriptionText = selectedProposeReason; // 한글 그대로
      }
    }

    const payloadData = {
      reportTarget: 'STORE',
      targetId: storeId,
      reportReason: reportReasonCode,
      description: descriptionText,
    };
    try {
      await report_create(payloadData);
      navigation.goBack();
    } catch (error) {
      showToast('잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled =
    (!selectedProposeReason && !selectedReportReason) || // 선택된 항목이 없거나
    (selectedProposeReason === '기타 제보 사항' &&
      !customProposeReason.trim()) || // 기타 제보인데 입력값이 없는 경우
    (selectedReportReason === '기타 신고 문제' && !customReason.trim()); // 기타 신고인데 입력값이 없는 경우

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.storeInfo}>매장명</Text>
          <Text style={styles.title}>{storeName}</Text>
        </View>

        {/* 제보 */}
        <View style={styles.reasonView}>
          <Text style={styles.reasonTitle}>제보</Text>
        </View>
        <View style={styles.reasonContainer}>
          {proposeReasons.map((reason, index) => (
            <Pressable
              key={index}
              style={[styles.reasonButton]}
              onPress={() => handleSelectProposeReason(reason)}>
              <Text
                style={[
                  styles.reasonText,
                  selectedProposeReason === reason &&
                    styles.selectedProposeText,
                ]}>
                {reason}
              </Text>
            </Pressable>
          ))}
        </View>
        {/* {selectedProposeReason === '기타 제보 사항' && (
          <TextInput
            style={styles.textInput}
            placeholder="제보 내용을 입력하세요"
            placeholderTextColor="#aaa"
            value={customProposeReason}
            onChangeText={setCustomProposeReason}
            multiline
          />
        )} */}
        {/* 신고 */}
        <View style={styles.reasonView}>
          <Text style={styles.reasonTitle}>신고</Text>
        </View>
        <View style={styles.reasonContainer}>
          {reportReasons.map((reason, index) => (
            <Pressable
              key={index}
              style={[styles.reasonButton]}
              onPress={() => handleSelectReportReason(reason)}>
              <Text
                style={[
                  styles.reasonText,
                  selectedReportReason === reason && styles.selectedText,
                ]}>
                {reason}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* "기타 문제" 선택 시 텍스트 입력 */}
        {selectedReportReason === '기타 신고 문제' && (
          <TextInput
            style={styles.textInput}
            placeholder="신고 사유를 입력하세요"
            placeholderTextColor="#aaa"
            value={customReason}
            onChangeText={setCustomReason}
            multiline
          />
        )}

        {/* 신고 제출 버튼 */}
        <Pressable
          style={[
            styles.submitButton,
            isSubmitDisabled && styles.disabledButton, // 입력값이 없으면 비활성화 스타일 적용
            selectedProposeReason && !isSubmitDisabled && styles.proposeButton, // 제보 선택 시 오렌지색 버튼 (비활성 아닐 때)
          ]}
          onPress={onSubmitReport}
          disabled={isSubmitDisabled}>
          <Text style={styles.submitButtonText}>
            {selectedProposeReason
              ? '제보 제출'
              : selectedReportReason
              ? '신고 제출'
              : '제출하기'}
          </Text>
        </Pressable>
        <View style={styles.reportView}>
          <Text style={styles.reportText}>
            제보·신고 기능은 플랫폼의 건전한 운영을 위해 제공됩니다. 허위
            제보·신고, 악의적인 반복 제보·신고는 서비스 이용에 제한을 받을 수
            있습니다. {'\n\n'}
            제보·신고 접수 시 제보·신고자의 정보가 저장되며, 허위 제보·신고 또는
            반복 제보·신고가 확인될 경우 서비스 이용이 제한될 수 있습니다.{' '}
            {'\n\n'}제보·신고는 사실에 근거하여 신중하게 제출해 주세요. {'\n\n'}
            다른 이용자 또는 플랫폼에 고의적으로 피해를 주기 위한 신고는 엄격히
            금지됩니다. {'\n\n'}
            반복적인 부적절한 제보·신고는 서비스 이용 제한 및 계정 정지 등의
            조치가 취해질 수 있습니다. {'\n\n'}제보·신고를 제출하면 운영 정책에
            따라 검토 후 처리됩니다. 거짓 제보·신고 또는 악의적인 제보·신고가
            확인될 경우, 해당 제보·신고는 무효 처리되며 불이익이 있을 수
            있습니다.
          </Text>
        </View>
      </ScrollView>

      {/* 신고 확인 모달 */}

      <StoreReportModal
        isModalVisible={isModalVisible}
        onPressModalClose={() => setIsModalVisible(false)}
        startUpdate={handleSubmitReport}
        isPropose={!!selectedProposeReason} // 제보인지 여부 전달
      />
      <Loading loading={loading} />
    </SafeAreaView>
  );
};

export default StoreReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 20,
    marginLeft: 18,
    marginTop: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  storeInfo: {
    fontSize: 16,
    color: '#999',
    marginBottom: 5,
  },
  reasonView: {
    marginLeft: 18,
    marginVertical: 10,
  },
  reasonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#777',
  },
  reasonContainer: {
    marginHorizontal: 18,
  },
  reasonButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reasonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedText: {
    color: '#FF4D4D',
    fontWeight: 'bold',
    fontSize: 18,
  },
  selectedProposeText: {
    color: '#FFA500', // 주황색
    fontWeight: 'bold',
    fontSize: 18,
  },
  textInput: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    color: '#333',
    minHeight: 60,
    textAlignVertical: 'top',
    marginHorizontal: 18,
  },
  submitButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: 20,
  },
  proposeButton: {
    backgroundColor: '#FFA500',
  },
  disabledButton: {
    backgroundColor: '#9F9F9F',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reportView: {
    marginHorizontal: 18,
    marginVertical: 30,
  },
  reportText: {
    color: '#777',
    fontWeight: 500,
  },
});
