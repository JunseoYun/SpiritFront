import React from 'react';
import {View, Text, Pressable, StyleSheet, Dimensions} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {normalizeFont} from '../../../hooks/normalizeFont';
import CustomText from '../../../utils/CustomText';
const {width} = Dimensions.get('window');
const ITEM_WIDTH = width * 0.9;
const BUTON_WIDTH = width * 0.4;

const NoneStore = ({navigation, location}) => {
  return (
    <View style={styles.noneViewContent}>
      <View style={styles.storeInfo}>
        <View style={styles.titleview}>
          <CustomText style={styles.noDataText}>
            주변에 등록된 술집이 없어요
          </CustomText>
          <View style={styles.noticeView}>
            <Ionicons
              name="information-circle-outline"
              size={15}
              color="#6B7280"
              style={{marginRight: 3}}
            />
            <CustomText maxScale={1} style={styles.noDatasubText}>
              현재 한잔할까는 강남구 중심으로 운영 중입니다.
            </CustomText>
          </View>
        </View>

        <View style={styles.noneView2}>
          <Pressable
            style={styles.button2}
            onPress={() => {
              navigation.navigate('StoreSearchScreen', {index: 0, location});
            }}>
            <CustomText maxScale={1.1} style={styles.noneText2}>
              매장 제보하기
            </CustomText>
          </Pressable>

          <Pressable
            style={styles.button}
            onPress={() => navigation.navigate('SetLocationScreen')}>
            <CustomText maxScale={1.1} style={styles.noneText}>
              위치 변경하기
            </CustomText>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  noneViewContent: {alignItems: 'center'},
  storeInfo: {
    justifyContent: 'space-between',
    width: ITEM_WIDTH,
    backgroundColor: '#FFF',
    padding: 15,
  },
  titleview: {marginTop: 2, gap: 7, width: '100%'},
  noDataText: {
    alignSelf: 'center',
    fontSize: 15,
    color: '#888',
    fontFamily: 'Pretendard-Regular',
  },
  noticeView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  noDatasubText: {
    alignSelf: 'center',
    fontSize: 14,
    color: '#888',
    fontFamily: 'Pretendard-Regular',
  },
  noneView2: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  button: {
    width: BUTON_WIDTH,
    paddingHorizontal: 17,
    paddingVertical: 17,
    borderWidth: 2,
    borderColor: '#3CBBFF',
    borderRadius: 10,
    backgroundColor: '#3CBBFF',
  },
  button2: {
    width: BUTON_WIDTH,
    paddingHorizontal: 17,
    paddingVertical: 17,
    borderWidth: 2,
    borderColor: '#3CBBFF',
    borderRadius: 10,
    backgroundColor: 'white',
  },
  noneText2: {
    alignSelf: 'center',
    color: '#3CBBFF',
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
  },
  noneText: {
    alignSelf: 'center',
    color: 'white',
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default NoneStore;
