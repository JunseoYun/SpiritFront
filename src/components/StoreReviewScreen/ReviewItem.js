import React, {useState} from 'react';
import {
  Text,
  ScrollView,
  Pressable,
  View,
  StyleSheet,
  Image,
} from 'react-native';

import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const ReviewItem = ({item, navigation}) => {
  const [isExpanded, setIsExpanded] = useState(false); // 더보기 상태 관리

  const formatDate = dateString => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();

    return year === currentYear
      ? `${date.getMonth() + 1}.${date.getDate()}`
      : `${year}.${date.getMonth() + 1}.${date.getDate()}`;
  };

  const formattedCreatedDate = formatDate(item.createdAt);
  const formattedVisitedDate = formatDate(item.visitedAt);

  // 최대 3줄까지만 표시 (그 이상이면 '...더보기' 버튼 활성화)
  const MAX_LENGTH = 70; // 100글자 기준으로 줄이기
  const isLongText = item.content.length > MAX_LENGTH;
  const displayedContent =
    isExpanded || !isLongText
      ? item.content
      : item.content.substring(0, MAX_LENGTH) + '...';

  return (
    <View key={item.reviewId} style={styles.reviewContainer}>
      <View style={styles.reviewHeader}>
        <Image
          source={
            item.writerAvatar
              ? {uri: item.writerAvatar}
              : require('../../assets/default_profile.png')
          }
          style={styles.avatar}
        />
        <View style={styles.reviewHeaderText}>
          <Text style={styles.writerName}>{item.writerNickname}</Text>
          <View style={styles.infoView}>
            <FontAwesomeIcon name="star" size={17} color="#FCC104" />
            <Text style={styles.reviewInfo}> {item.rate}</Text>
          </View>
        </View>
        <Text style={styles.reviewDate}>{formattedVisitedDate} 방문</Text>
      </View>
      <View style={styles.contentView}>
        <Text style={styles.reviewContent}>{displayedContent}</Text>
        {isLongText && (
          <Pressable onPress={() => setIsExpanded(!isExpanded)}>
            <Text style={styles.moreText}>
              {isExpanded ? '간략히 보기' : '더보기'}
            </Text>
          </Pressable>
        )}
      </View>
      {item.imgUrlList && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageScrollView}
          contentContainerStyle={styles.imageContainer}>
          {item.imgUrlList.map((image, index) => (
            <Image
              key={image || index}
              source={image ? {uri: image} : null}
              style={styles.reviewImage}
            />
          ))}
        </ScrollView>
      )}
      <View style={styles.bottomView}>
        <Text style={styles.datetimeText}>작성 {formattedCreatedDate}</Text>
        <Pressable
          onPress={() => {
            navigation.navigate('ReviewReportScreen', {
              reviewId: item.id,
            });
          }}>
          <Text style={styles.datetimeText}>신고하기</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reviewContainer: {
    width: '100%',
    textAlign: 'center',
    backgroundColor: 'white',
    paddingTop: 20,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderColor: '#E7E7E7',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 40,
    marginRight: 10,
  },
  reviewHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  writerName: {
    fontWeight: '600',
    fontSize: 17,
    color: '#333',
  },
  infoView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  reviewInfo: {
    fontSize: 15,
    color: '#616161',
    fontWeight: '500',
  },
  reviewDate: {
    fontSize: 14,
    color: '#828282',
    fontWeight: '500',
    paddingBottom: 16,
  },
  contentView: {
    marginHorizontal: 18,
  },
  reviewContent: {
    fontSize: 15,
    marginVertical: 15,
    marginLeft: 3,
    color: '#333',
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontWeight: '500',
    lineHeight: 22, // 가독성을 위해 줄 간격 추가
  },
  moreText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 3,
    marginBottom: 7,
  },
  imageScrollView: {
    marginTop: 7, // 위 여백 추가
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 7,
    paddingHorizontal: 18,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 7,
  },
  bottomView: {
    marginHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datetimeText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
    marginLeft: 3,
  },
});

export default ReviewItem;
