import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Dimensions,
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {height} = Dimensions.get('window');

const MyManagerItem = ({sotreInfo, onPress, width}) => {
  const {
    storeName,
    locationDto,
    mainImgUrl,
    storeRate,
    reviewCount,
    likeCount,
    normalReportCount,
    priorityReportCount,
  } = sotreInfo || {};

  return (
    <Pressable style={[styles.card, {width}]} onPress={onPress}>
      <ImageBackground
        source={
          mainImgUrl ? {uri: mainImgUrl} : require('../../assets/store.png')
        }
        style={styles.image}
        imageStyle={{borderRadius: 16}}>
        <View style={styles.gradientOverlay} />
        <View style={styles.overlayContent}>
          <Text style={styles.name} numberOfLines={1}>
            {storeName || '상호명 없음'}
          </Text>
          <Text style={styles.address} numberOfLines={1}>
            {locationDto?.address || '주소 정보 없음'}
            {locationDto?.addressDetail ? `, ${locationDto.addressDetail}` : ''}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <FontAwesomeIcon name="star" size={16} color="#FFD700" />
              <Text style={styles.statText}>{storeRate ?? 0}</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="chatbubble-ellipses" size={16} color="#4FC3F7" />
              <Text style={styles.statText}>{reviewCount ?? 0}</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="heart" size={16} color="#FF6B6B" />
              <Text style={styles.statText}>{likeCount ?? 0}</Text>
            </View>
          </View>

          <View style={styles.reportRow}>
            <Text style={[styles.reportBadge, styles.normalReport]}>
              제보 {normalReportCount ?? 0}
            </Text>
            <Text style={[styles.reportBadge, styles.priorityReport]}>
              신고 {priorityReportCount ?? 0}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    height: height * 0.47,
    marginTop: 18,
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  overlayContent: {
    padding: 12,
  },
  name: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
    marginBottom: 6,
  },
  address: {
    color: '#ddd',
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 4,
    fontFamily: 'Pretendard-Medium',
  },
  reportRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  reportBadge: {
    fontSize: 14,
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 6,
    overflow: 'hidden',
    fontFamily: 'Pretendard-SemiBold',
  },
  normalReport: {
    backgroundColor: 'rgba(255,165,0,0.25)',
    color: '#FFA500',
  },
  priorityReport: {
    backgroundColor: 'rgba(255,77,79,0.25)',
    color: '#FF4D4F',
  },
});

export default MyManagerItem;
