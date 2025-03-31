import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Pressable, Linking, Alert} from 'react-native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useCustomAlert from '../../../hooks/useCustomAlert';
import {Storelikepost} from '../../../api/storeApi';

const StoreExtraInfo = ({storeData, navigation, distance, unit}) => {
  const {showAlert, AlertComponent} = useCustomAlert();

  const storeNumber = storeData?.contact || '000-0000-0000'; // 기본 전화번호
  const [storeLike, setStoreLike] = useState(storeData?.isStoreLiked);

  useEffect(() => {
    if (storeData?.isStoreLiked !== undefined) {
      setStoreLike(storeData.isStoreLiked); // storeData가 변경될 때 상태 업데이트
    }
  }, [storeData]);

  const StoreLike = async () => {
    try {
      await Storelikepost(storeData.id);
      setStoreLike(!storeLike);
    } catch (error) {
      showAlert({
        title: '찜 실패하였습니다',
        message: '잠시 후 다시 시도해주세요.',
      });
    }
  };

  const storeNumberHandle = () => {
    if (storeNumber !== '000-0000-0000') {
      console.log(storeNumber);
      Linking.openURL(`tel:${storeNumber}`);
    } else {
      showAlert({
        title: '매장에 등록된 번호가 없습니다.',
      });
    }
  };

  return (
    <View style={styles.infoCard}>
      <View style={styles.infoRow}>
        <Pressable style={styles.infoCol} onPress={storeNumberHandle}>
          <SimpleLineIcons name="phone" size={23} color="#181A1A" />
          <Text style={styles.locationtext}>전화</Text>
        </Pressable>

        <View style={styles.infoCol}>
          {/* 좋아요 상태 임시로 true */}
          <Ionicons name="heart" size={20} color="red" />
          <Text style={styles.locationtext}>{storeData?.likeCount}</Text>
        </View>

        <View style={styles.infoCol}>
          <Ionicons name="reader-outline" size={20} color="#333" />
          <Text style={styles.locationtext}>3</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoCol}>
          <Ionicons name="location-outline" size={23} color="#181A1A" />
          <Text style={styles.locationtext}>
            {distance} {unit}
          </Text>
        </View>
        <View style={styles.infoCol}>
          <MaterialIcons name="group" size={23} color="#181A1A" />
          <Text style={styles.locationtext}>단체 가능</Text>
        </View>

        <View style={styles.infoCol}>
          <Feather name="tv" size={23} color="#181A1A" />
          <Text style={styles.locationtext}>스크린 설치</Text>
        </View>
      </View>
    </View>
  );
};

export default StoreExtraInfo;

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: '#FAFAFA',
    marginHorizontal: 16,
    height: 150,
    justifyContent: 'space-evenly',
    borderRadius: 16,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  infoCol: {
    alignItems: 'center',
    width: 100,
  },
  locationtext: {
    marginTop: 7,
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    color: '#181A1A',
  },
});
