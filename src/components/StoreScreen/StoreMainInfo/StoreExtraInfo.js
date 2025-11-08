import React from 'react';
import {View, Text, StyleSheet, Pressable, Linking} from 'react-native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useCustomAlert from '../../../hooks/useCustomAlert';

const StoreExtraInfo = ({
  storeData,
  navigation,
  distance,
  unit,
  onToggleLike,
  isLiked,
  likeCount,
  likeDisabled,
}) => {
  const {showAlert, AlertComponent} = useCustomAlert();
  const storeNumber = storeData?.contact || '000-0000-0000'; // 기본 전화번호
  const resolvedIsLiked =
    typeof isLiked === 'boolean' ? isLiked : !!storeData?.isStoreLiked;
  const resolvedLikeCount =
    typeof likeCount === 'number' ? likeCount : storeData?.likeCount || 0;

  const storeNumberHandle = () => {
    if (storeNumber !== '000-0000-0000') {
      Linking.openURL(`tel:${storeNumber}`);
    } else {
      showAlert({
        title: '매장에 등록된 번호가 없습니다.',
      });
    }
  };
  const handleLikePress = () => {
    if (!onToggleLike || likeDisabled) {
      return;
    }
    onToggleLike();
  };

  return (
    <View style={styles.infoCard}>
      <View style={[styles.infoRow, {paddingTop: 20}]}>
        <Pressable style={styles.infoCol} onPress={storeNumberHandle}>
          <SimpleLineIcons name="phone" size={23} color="#333" />
          <Text style={styles.locationtext}>전화</Text>
        </Pressable>

        <Pressable
          style={styles.infoCol}
          onPress={handleLikePress}
          disabled={!onToggleLike || likeDisabled}>
          {/* 좋아요 상태 임시로 true */}
          {resolvedIsLiked ? (
            <Ionicons
              name="heart"
              size={20}
              color={'red'} // Conditional color change
            />
          ) : (
            <Ionicons
              name="heart-outline"
              size={20}
              color={'#333'} // Conditional color change
            />
          )}
          <Text style={styles.locationtext}>{resolvedLikeCount}</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            navigation.navigate('StoreStack', {
              screen: 'StoreReviewScreen',
              params: {
                storeId: storeData.id,
                storename: storeData.name,
                isOwner: storeData.isOwner,
              },
            });
          }}
          style={styles.infoCol}>
          <Ionicons name="reader-outline" size={20} color="#333" />
          <Text style={styles.locationtext}>{storeData?.reviewCount}</Text>
        </Pressable>
      </View>

      <View style={[styles.infoRow, {paddingBottom: 20}]}>
        <View style={styles.infoCol}>
          <Ionicons name="location-outline" size={23} color="#333" />
          <Text style={styles.locationtext}>
            {distance} {unit}
          </Text>
        </View>
        <View style={styles.infoCol}>
          <MaterialIcons name="group" size={23} color="#333" />
          <Text style={styles.locationtext}>
            {storeData?.isGroupAvailable == true
              ? '단체 방문 가능'
              : '소수 방문 위주'}
          </Text>
        </View>

        <View style={styles.infoCol}>
          <Feather name="tv" size={23} color="#333" />
          <Text style={styles.locationtext}>
            {storeData?.hasScreen ? '스크린 설치' : '스크린 미설치'}
          </Text>
        </View>
      </View>
      <AlertComponent />
    </View>
  );
};

export default StoreExtraInfo;

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: '#FAFAFA',
    marginHorizontal: 16,
    justifyContent: 'space-evenly',
    borderRadius: 16,
    marginVertical: 12,
  },
  infoRow: {
    paddingVertical: 10,
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
    textAlign: 'center',
  },
});
