import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Pressable} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useToast} from '../../../context/ToastContext';
import useCustomAlert from '../../../hooks/useCustomAlert';
import {ReportMainget, completeReport} from '../../../api/reportApi';

const REPORT_TYPES = {
  report: [
    'DUPLICATE_STORE',
    'INAPPROPRIATE_LANGUAGE',
    'INAPPROPRIATE_PHOTO',
    'VIOLATION_OF_GUIDELINES',
    'ETC',
  ],
  suggestion: [
    'INCORRECT_STORE_INFO',
    'INCORRECT_MENU_INFO',
    'INCORRECT_DRINK_INFO',
    'NON_EXISTENT_STORE',
  ],
};

const StoreReportList = () => {
  const route = useRoute();
  const {storeId, storeName} = route.params;
  const [storeReport, setStoreReport] = useState([]);
  const {showToast} = useToast();
  const {showAlert, AlertComponent} = useCustomAlert();

  useEffect(() => {
    if (storeId) fetchReports(storeId);
  }, [storeId]);

  const formatDate = isoString => {
    const d = new Date(isoString);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  const fetchReports = async id => {
    try {
      const response = await ReportMainget('STORE', id);
      if (response) {
        const reports = response.map(item => ({
          reportId: item.id,
          reporterId: item.reporterId,
          description: item.description,
          reporterNickname: item.reporterNickname,
          reason: item.reportReason,
          status:
            item.reportStatus === 'PENDING'
              ? '접수됨'
              : item.reportStatus === 'COMPLETED'
              ? '처리 완료'
              : item.reportStatus === 'ARCHIVED'
              ? '보관됨'
              : '알수없음',
          date: formatDate(item.reportedAt),
        }));
        setStoreReport(reports);
      }
    } catch (error) {
      console.error('신고 조회 실패:', error);
    }
  };

  const handleComplete = async reportId => {
    showAlert({
      title: '처리 완료하시겠습니까?',
      onConfirm: async () => {
        try {
          await completeReport(reportId, 'COMPLETED');
          showToast('완료되었습니다.', 'center');
          fetchReports(storeId);
        } catch (error) {
          showToast('다시 시도해주세요.', 'center');
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
          <View key={type} style={{marginTop: 32}}>
            <Text style={styles.sectionTitle}>{type} 내역</Text>
            {reportsByType[type].length === 0 ? (
              <Text style={styles.noItemText}>내역 없음</Text>
            ) : (
              reportsByType[type].map(report => (
                <View key={report.reportId} style={styles.card}>
                  <Text style={styles.description}>{report.description}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                      신고자: {report.reporterNickname}
                    </Text>
                    <Text style={styles.metaText}>날짜: {report.date}</Text>
                  </View>
                  <View style={styles.bottomRow}>
                    <Text
                      style={[styles.status, getStatusStyle(report.status)]}>
                      {report.status}
                    </Text>
                    <Pressable
                      style={styles.button}
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
    </View>
  );
};

const getStatusStyle = status => ({
  color:
    status === '접수됨'
      ? '#DC3545'
      : status === '처리 완료'
      ? '#45C9FF'
      : '#6c757d',
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  storeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  noItemText: {
    fontSize: 14,
    color: '#999',
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
  description: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metaText: {
    fontSize: 12,
    color: '#777',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#45C9FF',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default StoreReportList;
