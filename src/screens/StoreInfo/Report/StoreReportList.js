import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Pressable} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useToast} from '../../../context/ToastContext';
import useCustomAlert from '../../../hooks/useCustomAlert';
import {ReportMainget, completeReport} from '../../../api/reportApi';
import Loading from '../../../hooks/Loading';
import CustomText from '../../../utils/CustomText';

const REPORT_TYPES = {
  report: [
    'INAPPROPRIATE_LANGUAGE',
    'INAPPROPRIATE_PHOTO',
    'VIOLATION_OF_GUIDELINES',
    'ETC',
  ],
  suggestion: [
    'DUPLICATE_STORE',
    'INCORRECT_STORE_INFO',
    'INCORRECT_MENU_INFO',
    'INCORRECT_DRINK_INFO',
    'NON_EXISTENT_STORE',
  ],
};

const StoreReportList = () => {
  const route = useRoute();
  const {storeId} = route.params;
  const [storeReport, setStoreReport] = useState([]);
  const {showToast} = useToast();
  const {showAlert, AlertComponent} = useCustomAlert();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (storeId) fetchReports(storeId);
  }, [storeId]);

  const formatDate = isoString => {
    const d = new Date(isoString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(
      2,
      '0',
    )}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const fetchReports = async id => {
    try {
      setLoading(true);
      const response = await ReportMainget('STORE', id);
      if (response) {
        const reports = response.map(item => ({
          reportId: item.id,
          reporterId: item.reporterId,
          description: item.description,
          reporterNickname: item.reporterNickname,
          reason: item.reportReason,
          date: formatDate(item.reportedAt),
        }));
        setStoreReport(reports);
      }
    } catch (error) {
      console.error('신고 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = reportId => {
    showAlert({
      title: '처리 완료하시겠습니까?',
      onConfirm: async () => {
        try {
          setLoading(true);
          await completeReport(reportId, 'COMPLETED');
          showToast('완료되었습니다.', 'center');
          fetchReports(storeId);
        } catch (error) {
          showToast('다시 시도해주세요.', 'center');
        } finally {
          setLoading(false);
        }
      },
      onCancel: null,
      type: 'confirm',
    });
  };

  const reportsByType = {
    신고: storeReport.filter(r => REPORT_TYPES.report.includes(r.reason)),
    제보: storeReport.filter(r => REPORT_TYPES.suggestion.includes(r.reason)),
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        {['신고', '제보'].map(type => (
          <View key={type} style={styles.section}>
            <CustomText style={styles.sectionTitle}>{type} 내역</CustomText>
            {reportsByType[type].length === 0 ? (
              <CustomText style={styles.noItemText}>
                {type} 내역이 없습니다.
              </CustomText>
            ) : (
              reportsByType[type].map(report => (
                <View key={report.reportId} style={styles.card}>
                  <CustomText style={styles.descriptionTitle}>
                    {type} 사유
                  </CustomText>
                  <CustomText style={styles.descriptionText}>
                    {report.description}
                  </CustomText>
                  <View style={styles.metaContainer}>
                    <CustomText style={styles.metaText}>
                      {report.date}
                    </CustomText>
                    <Pressable
                      style={({pressed}) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={() => handleComplete(report.reportId)}>
                      <CustomText style={styles.buttonText}>
                        처리 완료
                      </CustomText>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>
        ))}
      </ScrollView>
      <AlertComponent />
      <Loading loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#121212',
    marginBottom: 16,
  },
  noItemText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    paddingVertical: 20,
    fontFamily: 'Pretendard-Medium',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
  },

  descriptionTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Pretendard-Regular',
  },
  descriptionText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#121212',
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Pretendard-Regular',
  },
  button: {
    backgroundColor: '#3CBBFF',
    borderRadius: 7,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    fontSize: 13,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },
});

export default StoreReportList;
