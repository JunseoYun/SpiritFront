import React, {useState} from 'react';
import {
  Text,
  ScrollView,
  Pressable,
  View,
  StyleSheet,
  TextInput,
} from 'react-native';

import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';

const ReviewItem = ({item, navigation, isOwner}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReplying, setIsReplying] = useState(false); // 답글 작성중
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState([]); // 답글 하나만 허용
  const [isEditing, setIsEditing] = useState(false); // 수정모드
  const [editText, setEditText] = useState(''); // 수정중 텍스트

  // 작성 날짜 포맷: 올해면 MM.DD, 아니면 YY.MM.DD
  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const currentYear = new Date().getFullYear();
    if (year === currentYear) {
      return `${month}.${day}`;
    } else {
      const shortYear = String(year).slice(-2);
      return `${shortYear}.${month}.${day}`;
    }
  };

  // 방문 날짜 포맷: 오늘/어제/n일전/n주전/n달전/n년전
  const formatVisitDate = dateString => {
    if (!dateString) return '방문일 정보 없음';

    const visitDate = new Date(dateString);
    const now = new Date();

    // 자정으로 맞춰서 일수 계산
    const diffTime = now.setHours(0, 0, 0, 0) - visitDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays === 2) return '그제';
    if (diffDays < 7) return `${diffDays}일전`;

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffDays < 30) {
      return `${diffWeeks}주전`;
    }

    const diffMonths =
      (now.getFullYear() - visitDate.getFullYear()) * 12 +
      (now.getMonth() - visitDate.getMonth());

    if (diffMonths < 12) {
      return `${diffMonths}달전`;
    }

    // 년 단위
    const diffYears = Math.floor(diffMonths / 12);
    if (diffYears === 1) return '작년';
    if (diffYears === 2) return '재작년';
    return `${diffYears}년전`;
  };

  const formattedCreatedDate = formatDate(item.createdAt);
  const formattedVisitedDate = formatVisitDate(item.visitedAt);

  const handleImagePress = index => {
    navigation.navigate('ImageViewerScreen', {
      images: item.imgUrlList,
      index,
    });
  };

  const MAX_LENGTH = 70;
  const isLongText = item.content.length > MAX_LENGTH;
  const displayedContent =
    isExpanded || !isLongText
      ? item.content
      : item.content.substring(0, MAX_LENGTH) + '...';

  // ✅ 답글 등록
  const handleReplySubmit = () => {
    if (replyText.trim() === '') return;
    const newReply = {
      id: Date.now(),
      content: replyText,
      createdAt: new Date().toISOString(),
    };
    setReplies([newReply]); // 한 번만 허용
    setReplyText('');
    setIsReplying(false);
  };

  // ✅ 답글 수정 저장
  const handleReplySave = id => {
    if (editText.trim() === '') return;
    setReplies(prev =>
      prev.map(r => (r.id === id ? {...r, content: editText} : r)),
    );
    setIsEditing(false);
  };

  return (
    <View key={item.reviewId} style={styles.reviewContainer}>
      {/* 상단 리뷰 헤더 */}
      <View style={styles.reviewHeader}>
        <FastImage
          source={
            item.writerImgUrl
              ? {uri: item.writerImgUrl, priority: FastImage.priority.normal}
              : require('../../assets/default_profile.png')
          }
          style={styles.avatar}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={styles.reviewHeaderText}>
          <Text
            style={[
              styles.writerName,
              item.writerNickname === '탈퇴한 사용자' && {color: '#999'},
            ]}>
            {item.writerNickname}
          </Text>
          <View style={styles.infoView}>
            <FontAwesomeIcon name="star" size={17} color="#FCC104" />
            <Text style={styles.reviewInfo}> {item.rate}</Text>
          </View>
        </View>
        <Text style={styles.reviewDate}>{formattedVisitedDate} 방문</Text>
      </View>

      {/* 리뷰 본문 */}
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

      {/* 리뷰 이미지 */}
      {item.imgUrlList && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageScrollView}
          contentContainerStyle={styles.imageContainer}>
          {item.imgUrlList.map((image, index) => (
            <Pressable key={index} onPress={() => handleImagePress(index)}>
              <FastImage
                source={{uri: image, priority: FastImage.priority.normal}}
                style={styles.reviewImage}
                resizeMode={FastImage.resizeMode.cover}
              />
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* 하단 날짜/신고 */}
      <View style={styles.bottomView}>
        <Text style={styles.datetimeText}>작성 {formattedCreatedDate}</Text>
        <Pressable
          onPress={() => {
            navigation.navigate('ReviewReportScreen', {reviewId: item.id});
          }}>
          <Text style={styles.datetimeText}>신고하기</Text>
        </Pressable>
      </View>

      {/* 답글 달기 (답글 없을때만 표시) */}
      {isOwner && replies.length === 0 && (
        <>
          <Pressable
            style={styles.recommentView}
            onPress={() => setIsReplying(prev => !prev)}>
            <Feather name="corner-down-right" size={17} color="#333" />
            <Text style={styles.recommentText}>
              {isReplying ? '취소' : '답글달기'}
            </Text>
          </Pressable>

          {isReplying && (
            <View style={styles.replyForm}>
              <TextInput
                style={styles.replyInput}
                placeholder="답글을 입력하세요"
                value={replyText}
                onChangeText={setReplyText}
                multiline
              />
              <Pressable style={styles.replyButton} onPress={handleReplySubmit}>
                <Text style={styles.replyButtonText}>등록</Text>
              </Pressable>
            </View>
          )}
        </>
      )}

      {/* 답글 UI */}
      {replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {replies.map(reply => (
            <View key={reply.id} style={styles.replyItem}>
              {/* 프로필 */}
              <FastImage
                source={
                  item.writerImgUrl
                    ? {
                        uri: item.writerImgUrl,
                        priority: FastImage.priority.normal,
                      }
                    : require('../../assets/owner.png')
                }
                style={styles.ownerImage}
                resizeMode={FastImage.resizeMode.cover}
              />
              <View style={{flex: 1}}>
                {/* 상단 : 닉네임 / 날짜 */}
                <View style={styles.replyHeader}>
                  <Text style={styles.replyOwnerName}>사장님</Text>
                  <Text style={styles.replyDate}>
                    {formatDate(reply.createdAt)}
                  </Text>
                </View>

                {/* 본문 (수정 중이거나 아닌 경우) */}
                {isEditing ? (
                  <View style={styles.editBox}>
                    <TextInput
                      style={[styles.replyInput, {backgroundColor: '#fff'}]}
                      value={editText}
                      onChangeText={setEditText}
                      multiline
                      editable={true}
                      autoFocus={true}
                    />
                    <View style={{flexDirection: 'row', marginTop: 6}}>
                      <Pressable
                        style={[styles.replyButton, {marginRight: 6}]}
                        onPress={() => handleReplySave(reply.id)}>
                        <Text style={styles.replyButtonText}>저장</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.replyButton, {backgroundColor: '#eee'}]}
                        onPress={() => setIsEditing(false)}>
                        <Text style={[styles.replyButtonText, {color: '#333'}]}>
                          취소
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View style={styles.replyBubble}>
                    <Text style={styles.replyText}>{reply.content}</Text>
                    {isOwner && (
                      <Pressable
                        style={{marginTop: 6}}
                        onPress={() => {
                          setIsEditing(true);
                          setEditText(reply.content);
                        }}>
                        <Text style={styles.replyEditText}>수정하기</Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  reviewContainer: {
    width: '100%',
    backgroundColor: 'white',
    paddingTop: 20,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
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
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
    color: '#181A1A',
  },
  infoView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  reviewInfo: {
    fontSize: 15,
    color: '#181A1A',
    fontFamily: 'Pretendard-Medium',
  },
  reviewDate: {
    fontSize: 14,
    color: '#767676',
    fontFamily: 'Pretendard-Medium',
    paddingBottom: 16,
  },
  contentView: {
    marginHorizontal: 18,
  },
  reviewContent: {
    fontSize: 15,
    marginVertical: 15,
    marginLeft: 3,
    color: '#181A1A',
    textAlign: 'left',
    fontFamily: 'Pretendard-Medium',
    lineHeight: 22,
  },
  moreText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 3,
    marginBottom: 7,
  },
  imageScrollView: {
    marginTop: 7,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 7,
    paddingHorizontal: 18,
  },
  reviewImage: {width: 100, height: 100, borderRadius: 7},
  bottomView: {
    marginHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datetimeText: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    marginTop: 10,
    marginLeft: 3,
  },
  recommentView: {
    marginTop: 7,
    marginHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommentText: {
    marginTop: 3,
    marginLeft: 3,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
  },
  replyForm: {
    marginHorizontal: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
  },
  replyInput: {
    minHeight: 40,
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Pretendard-Regular',
  },
  replyButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#45C9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  replyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
  },
  repliesContainer: {
    marginHorizontal: 18,
    marginTop: 12,
  },
  replyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  replyText: {
    fontSize: 14,
    color: '#444',
    fontFamily: 'Pretendard-Regular',
    marginBottom: 2,
  },
  replyDate: {
    fontSize: 12,
    color: '#aaa',
    fontFamily: 'Pretendard-Regular',
  },
  repliesContainer: {
    marginHorizontal: 18,
    marginTop: 12,
  },
  replyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  ownerImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 8,
    backgroundColor: '#eee',
    padding: 10,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  replyOwnerName: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    color: '#333',
    marginRight: 8,
  },
  replyDate: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'Pretendard-Regular',
  },
  replyBubble: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 12,
    paddingBottom: 10,
  },
  replyText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#181A1A',
    fontFamily: 'Pretendard-Regular',
  },
  replyEditText: {
    fontSize: 13,
    color: '#45C9FF',
    fontFamily: 'Pretendard-SemiBold',
  },
  editBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
});

export default ReviewItem;
