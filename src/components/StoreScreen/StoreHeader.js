import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, Pressable, StyleSheet } from 'react-native';
import CategoryTranslator from '../../hooks/Categorytrans';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
// import styles from '../../styles/StoreMainStyle';
import StoreActions from './StoreActions';

const testCategories = [
  "한식",
  "중식",
  "야장"
];
const StoreHeader = ({ storedata = {}, onModalOpen, navigation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const [isOpen, setIsOpen] = useState(false);
  const [formattedCloseHour, setFormattedCloseHour] = useState('');
  const [formattedOpenHour, setFormattedOpenHour] = useState('');


  useEffect(() => {
    const checkStoreStatus = () => {
      if (!storedata.closeHour || !storedata.openHour) return; // openHour 또는 closeHour가 없으면 종료

      const currentTime = new Date(); // 현재 시간
      const closeHour = storedata.closeHour; // 서버에서 받은 closeHour
      const openHour = storedata.openHour; // 서버에서 받은 openHour

      const closeTime = new Date();
      const openTime = new Date();

      // closeHour가 올바른 형식인지 확인 (HH:mm:ss 형식)
      if (closeHour && closeHour.includes(':')) {
        const [closeHours, closeMinutes] = closeHour.split(':').map(Number);
        closeTime.setHours(closeHours, closeMinutes, 0, 0); // closeHour를 Date 객체로 변환
        setFormattedCloseHour(
          `${closeHours}:${String(closeMinutes).padStart(2, '0')}`,
        );
      }

      // openHour가 올바른 형식인지 확인 (HH:mm:ss 형식)
      if (openHour && openHour.includes(':')) {
        const [openHours, openMinutes] = openHour.split(':').map(Number);
        openTime.setHours(openHours, openMinutes, 0, 0); // openHour를 Date 객체로 변환
        setFormattedOpenHour(
          `${openHours}:${String(openMinutes).padStart(2, '0')}`,
        );
      }

      // 현재 시간과 openHour, closeHour를 비교하여 영업 중인지 여부를 판단
      if (currentTime >= openTime && currentTime < closeTime) {
        setIsOpen(true); // 영업 중
      } else {
        setIsOpen(false); // 영업 종료
      }
    };

    checkStoreStatus(); // 상태 확인
  }, [storedata.closeHour, storedata.openHour]); // openHour, closeHour 변경 시마다 실행

  return (
    <View style={styles.StoreTopView}>
      <View style={styles.Storetitleview}>
        {/* <Text style={styles.Storetitle}>{storedata.storeName}</Text> */}
        <Text style={styles.Storetitle}>가게 이름</Text>
        <Pressable onPress={onModalOpen} style={styles.updateicons}>
          <MaterialCommunityIcons
            name="dots-vertical"
            size={30}
            color="black"
          />
        </Pressable>
      </View>
      <View
        style={[
          styles.Storesubtitleview,
          Array.isArray(storedata.categories) &&
            storedata.categories.length === 1
            ? { justifyContent: 'center' }
            : null,
        ]}>
        {/* {storedata.categories &&
          storedata.categories.map((category, index) => (
            <Text key={index} style={styles.Storesubtitle}>
              <CategoryTranslator categories={[category]} />
            </Text>
          ))} */}
        {testCategories &&
          testCategories.map((category, index) => (
            <Text key={index} style={styles.Storesubtitle}>
              {category}
            </Text>
          ))}

      </View>
      <View style={styles.RiviewView}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="star" size={20} color="yellow" />
          {/* <Text style={styles.riviewtext}>{storedata.storeRate}</Text> */}
          <Text style={styles.riviewtext}>4.2</Text>
        </View>
        {/* <Text style={styles.riviewtext}>고객 리뷰 {storedata.reviewCount}</Text> */}
        <Text style={styles.riviewtext}>고객 리뷰 1,321</Text>
        {/* <Text style={styles.riviewtext}>찜 {storedata.storeLikeCount}</Text> */}
        <Text style={styles.riviewtext}>찜 142</Text>
      </View>
      <View style={styles.titlefoodview}>
        <Text style={styles.riviewtext}>대표요리 : 파스타</Text>
      </View>
      <StoreActions />
      <View style={styles.locationview}>
        {/* <Text style={styles.locationtext}>{storedata.address}</Text> */}
        <Text style={styles.locationtext}>경기도 용인시 기흥구 강남로 11</Text>
      </View>
      <View style={styles.timeview}>
        <Text
          style={[
            styles.timetextnow,
            isOpen ? { color: 'green' } : { color: 'red' }, // 영업 중은 초록색, 영업 종료는 빨간색
          ]}>
          {isOpen ? '영업 중' : '영업 종료'}
        </Text>
        <Text style={styles.timetext}>
          {isOpen
            // ? `영업 종료 - ${formattedCloseHour}`
            ? `영업 종료 - 12:00`
            // : `영업 시작 - ${formattedOpenHour}`}
            : `영업 시작 - 18:30`}
        </Text>
      </View>
      <View style={styles.introduceview}>
        <Pressable onPress={toggleExpand}>
          <Text
            style={styles.locationtext}
            numberOfLines={isExpanded ? null : 2}>
            {storedata.storeContent}
          </Text>
        </Pressable>
      </View>
      <View style={styles.resbuttonview}>
        <View style={styles.resbutton}>
          <MaterialCommunityIcons
            name={'calendar-check-outline'}
            size={20}
            color={'black'}
          />
          <Text>예약</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  StoreTopView: {
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
    borderTopWidth: 0,
    borderRadius: 10,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  backimage: {
    width: '100%',
    height: 180,
  },
  backimagestyle: {
    resizeMode: 'cover',
  },
  MainIconsView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  Storetitleview: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 5,
    marginBottom: 10,
    justifyContent: 'center', // 텍스트를 중앙에 배치
    position: 'relative',
  },
  Storetitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  updateicons: {
    position: 'absolute',
    right: 10,
  },
  Storesubtitleview: {
    width: '45%',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  Storesubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5F5F5F',
  },
  RiviewView: {
    width: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  riviewtext: {
    fontWeight: '600',
    fontSize: 11,
    color: '#5F5F5F',
  },
  titlefoodview: {
    marginTop: 10,
  },
  locationview: {
    width: '80%',
    marginTop: 20,
  },
  locationtext: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5F5F5F',
  },
  timeview: {
    flexDirection: 'row',
    width: '80%',
    marginTop: 10,
  },
  timetextnow: {
    fontSize: 13,
    fontWeight: '500',
    color: 'green',
  },
  timetext: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5F5F5F',
    marginLeft: 5,
  },
  introduceview: {
    width: '80%',
    marginTop: 10,
  },
  resbuttonview: {
    width: '80%',
    alignItems: 'center',
    marginVertical: 12,
  },
  resbutton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5F5F5F',
    marginBottom: 2,
  },

});

export default StoreHeader;
