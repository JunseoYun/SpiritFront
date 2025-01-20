import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable, Linking, Alert} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useCustomAlert from '../../hooks/useCustomAlert';
import {Storelikepost} from '../../api/storeApi';
// import styles from '../../styles/StoreMainStyle';

const StoreActions = ({storeData, navigation}) => {
  const {showAlert, AlertComponent} = useCustomAlert();

  const [isWriting, setIsWriting] = useState(false);

  const storeNumber = storeData?.storeNumber || '000-0000-0000'; // 기본 전화번호
  const [storeLike, setStoreLike] = useState(storeData?.isStoreLiked || false);
  console.log(storeLike);
  const StoreLike = async () => {
    console.log(storeData?.id + '여긴가');
    try {
      const response = await Storelikepost(storeData.id);

      console.log('API 응답:', response);
      console.log(response);
    } catch (error) {
      showAlert({
        title: '찜 실패하였습니다',
        message: '잠시 후 다시 시도해주세요.',
      });
    }
  };

  return (
    <View style={styles.CallView}>
      {/* 핸드폰 전화 넘어가기 ios => `tel://${phoneNumber}`*/}
      <Pressable onPress={() => Linking.openURL(`tel:${storeNumber}`)}>
        <View style={styles.View}>
          <Ionicons name="call-outline" size={20} color="#333" />
          <Text style={styles.CallViewtext}>전화</Text>
        </View>
      </Pressable>
      <View style={styles.separator} />
      <Pressable onPress={StoreLike}>
        <View style={styles.View}>
          <Ionicons
            name="heart-outline"
            size={20}
            color={storeLike ? 'red' : '#333'} // Conditional color change
          />
          <Text
            style={[styles.CallViewtext, {color: storeLike ? 'red' : '#333'}]}>
            찜
          </Text>
        </View>
      </Pressable>
      <View style={styles.separator} />
      <View style={styles.View}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#333" />
        <Text style={styles.CallViewtext}> 채팅</Text>
      </View>
      <AlertComponent />
    </View>
  );
};
const styles = StyleSheet.create({
  CallView: {
    width: '80%',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: 12,
  },
  View: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 70,
  },
  CallViewtext: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  separator: {
    width: 1.5, // 세로선 너비
    height: '60%', // 세로선 높이
    backgroundColor: '#E7E7E7', // 세로선 색상
    marginHorizontal: 10, // 아이템과 구분선 간격
  },
});

export default StoreActions;
