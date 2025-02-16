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
import ReportModal from '../../../components/ReportScreen/ReportModal';

const StoreReportScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId, storeName} = route.params;

  // 신고 사유 목록
  const reasons = [
    '폐업 또는 존재하지 않음',
    '중복된 매장',
    '부적절한 언어 사용 (음란성, 욕설, 비방 등)',
    '플랫폼 가이드라인 위반 (허위 정보, 광고 등)',
    '잘못된 메뉴 정보 (가격 오류, 허위 정보 등)',
    '잘못된 주류 정보 (가격 오류, 허위 정보 등)',
    '기타 문제',
  ];

  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState(''); // 기타 문제 입력 상태
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 신고 사유 선택
  const handleSelectReason = reason => {
    // 이미 선택된 사유를 다시 누르면 해제
    if (selectedReason === reason) {
      setSelectedReason(null);
      setCustomReason(''); // "기타 문제" 입력값 초기화
    } else {
      setSelectedReason(reason);
      if (reason !== '기타 문제') {
        setCustomReason(''); // 기타 문제가 아니면 입력값 초기화
      }
    }
  };

  // 신고 확인 모달 열기
  const onSubmitReport = () => {
    if (selectedReason) {
      setIsModalVisible(true);
    }
  };

  // 신고 제출 처리
  const handleSubmitReport = () => {
    setIsModalVisible(false);
    const finalReason =
      selectedReason === '기타 문제' ? customReason : selectedReason;
    console.log(`매장 ID: ${storeId}, 신고 사유: ${finalReason}`);
    alert('신고가 접수되었습니다.');
    navigation.goBack(); // 신고 후 이전 화면으로 이동
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.storeInfo}>매장명</Text>
          <Text style={styles.title}>{storeName}</Text>
        </View>

        {/* 신고 사유 선택 */}
        <View style={styles.reasonContainer}>
          {reasons.map((reason, index) => (
            <Pressable
              key={index}
              style={[styles.reasonButton]}
              onPress={() => handleSelectReason(reason)}>
              <Text
                style={[
                  styles.reasonText,
                  selectedReason === reason && styles.selectedText,
                ]}>
                {reason}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* "기타 문제" 선택 시 텍스트 입력 */}
        {selectedReason === '기타 문제' && (
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
            (!selectedReason ||
              (selectedReason === '기타 문제' && !customReason.trim())) &&
              styles.disabledButton,
          ]}
          onPress={onSubmitReport}
          disabled={
            !selectedReason ||
            (selectedReason === '기타 문제' && !customReason.trim())
          }>
          <Text style={styles.submitButtonText}>신고 제출</Text>
        </Pressable>
        <View style={styles.reportView}>
          <Text style={styles.reportText}>
            신고 기능은 플랫폼의 건전한 운영을 위해 제공됩니다. 허위 신고,
            악의적인 반복 신고는 서비스 이용에 제한을 받을 수 있습니다. {'\n\n'}
            신고 접수 시 신고자의 정보가 저장되며, 허위 신고 또는 반복 신고가
            확인될 경우 서비스 이용이 제한될 수 있습니다. {'\n\n'}신고는 사실에
            근거하여 신중하게 제출해 주세요. {'\n\n'}다른 이용자 또는 플랫폼에
            고의적으로 피해를 주기 위한 신고는 엄격히 금지됩니다. {'\n\n'}
            반복적인 부적절한 신고는 서비스 이용 제한 및 계정 정지 등의 조치가
            취해질 수 있습니다. {'\n\n'}신고를 제출하면 운영 정책에 따라 검토 후
            처리됩니다. 거짓 신고 또는 악의적인 신고가 확인될 경우, 해당 신고는
            무효 처리되며 불이익이 있을 수 있습니다.
          </Text>
        </View>
      </ScrollView>

      {/* 신고 확인 모달 */}
      <ReportModal
        isModalVisible={isModalVisible}
        onPressModalClose={() => setIsModalVisible(false)}
        startUpdate={handleSubmitReport} // 🚀 모달 확인 버튼 클릭 시 신고 제출
      />
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
  disabledButton: {
    backgroundColor: '#f5b5b5',
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
