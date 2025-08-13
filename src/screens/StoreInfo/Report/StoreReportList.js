import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Pressable} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useToast} from '../../../context/ToastContext';
import useCustomAlert from '../../../hooks/useCustomAlert';
import {ReportMainget, completeReport} from '../../../api/reportApi';
import Loading from '../../../hooks/Loading';

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
            <Text style={styles.sectionTitle}>{type} 내역</Text>
            {reportsByType[type].length === 0 ? (
              <Text style={styles.noItemText}>{type} 내역이 없습니다.</Text>
            ) : (
              reportsByType[type].map(report => (
                <View key={report.reportId} style={styles.card}>
                  <Text style={styles.descriptionTitle}>{type} 사유</Text>
                  <Text style={styles.descriptionText}>
                    {report.description}
                  </Text>
                  <View style={styles.metaContainer}>
                    <Text style={styles.metaText}>{report.date}</Text>
                    <Pressable
                      style={({pressed}) => [
                        styles.button,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={() => handleComplete(report.reportId)}>
                      <Text style={styles.buttonText}>처리 완료</Text>
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
    backgroundColor: '#f9faff',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },
  noItemText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#aaa',
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
  },
  tagContainer: {
    marginBottom: 6,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6f0ff',
    color: '#3a86ff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  descriptionTitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  button: {
    backgroundColor: '#45C9FF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});

export default StoreReportList;
