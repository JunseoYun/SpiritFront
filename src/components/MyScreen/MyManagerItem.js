import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import StoreInfo from '../StoreAddScreen/StoreInfo';

const exampleStoreInfo = {
  id: 8,
  storeId: 8,
  storeName: '친구포차',
  approvedAt: '2024-09-01T10:30:00Z',
  mainImgUrl:
    'https://spirit19-bucket.s3.ap-northeast-2.amazonaws.com/dev/store/8/6c67a18f-8a69-4395-b9c5-99a05fe48cff0e6691dc-f1f6-4883-989c-391a483db717.jpg',
  locationDto: {
    address: '서울 서초구 서초동 1374',
  },
  reviewCount: 1,
  storeRate: 5,
  operationInfoDtos: [
    {
      dayOfWeek: 'MONDAY',
      isClosed: false,
      openTime: '07:05:00',
      closeTime: '17:00:00',
    },
    {dayOfWeek: 'TUESDAY', isClosed: true},
  ],
  reportCount: 3,
  reportDetails: [
    {id: 1, reason: '위생 문제', date: '2024-06-01'},
    {id: 2, reason: '소음 신고', date: '2024-06-02'},
    {id: 3, reason: '불친절', date: '2024-06-03'},
  ],
};

const MyManagerItem = ({navigation, sotreInfo}) => {
  // const sotreInfo = exampleStoreInfo;

  console.log(sotreInfo, 'sotreInfo');

  // const today = new Date()
  //   .toLocaleDateString('en-US', {weekday: 'long'})
  //   .toUpperCase();
  // const todayInfo = sotreInfo.operationInfoDtos.find(
  //   info => info.dayOfWeek === today,
  // );
  // const openStatus =
  //   todayInfo && !todayInfo.isClosed
  //     ? `영업중 (${todayInfo.openTime} ~ ${todayInfo.closeTime})`
  //     : '휴무';

  const [showReports, setShowReports] = useState(false);

  // 확인 버튼 클릭 핸들러
  const handleConfirm = reportId => {
    console.log(`신고 ${reportId} 확인됨`);
  };

  return (
    <View style={styles.cardWrapper}>
      <Pressable
        style={styles.card}
        onPress={() => {
          navigation &&
            navigation.navigate('StoreStack', {
              screen: 'StoreMainScreen',
              params: {storeId: sotreInfo.storeId},
            });
        }}>
        <Image
          source={
            sotreInfo?.mainImgUrl
              ? {uri: sotreInfo.mainImgUrl}
              : require('../../assets/store.png')
          }
          style={styles.image}
        />
        <View style={styles.content}>
          <Text style={styles.storeName}>{sotreInfo.storeName}</Text>
          <Text style={styles.address}>{sotreInfo.locationDto.address}</Text>
          {/* <Text style={styles.openStatus}>{openStatus}</Text> */}
          <Text style={styles.rating}>
            ⭐ {sotreInfo.storeRate} ({sotreInfo.reviewCount} 리뷰)
          </Text>
        </View>
      </Pressable>

      <TouchableOpacity
        // onPress={() => setShowReports(!showReports)}
        style={styles.reportToggle}>
        <Text style={styles.reportToggleText}>
          🚨 신고 {sotreInfo.normalReportCount + sotreInfo.priorityReportCount}
          건 {showReports ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
      {/* 
      {showReports && (
        <View style={styles.reportList}>
          {sotreInfo.reportDetails.map(report => (
            <View key={report.id} style={styles.reportItem}>
              <View style={styles.reportInfo}>
                <Text style={styles.reportReason}>사유: {report.reason}</Text>
                <Text style={styles.reportDate}>날짜: {report.date}</Text>
              </View>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => handleConfirm(report.id)}>
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 12,
    marginHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#D6F3FF',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  image: {
    width: 90,
    height: 90,
    resizeMode: 'center',
    margin: 10,
  },
  content: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#181A1A',
  },
  address: {
    fontSize: 12,
    color: '#767676',
  },
  openStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  rating: {
    fontSize: 12,
    color: '#FF9900',
  },
  reportToggle: {
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#D6F3FF',
  },
  reportToggleText: {
    fontSize: 12,
    color: '#FF4D4F',
    textAlign: 'center',
  },
  reportList: {
    backgroundColor: '#F9F9F9',
    padding: 8,
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportInfo: {},
  reportReason: {
    fontSize: 12,
    color: '#333',
  },
  reportDate: {
    fontSize: 10,
    color: '#888',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  confirmButtonText: {
    fontSize: 10,
    color: '#fff',
  },
});

export default MyManagerItem;
