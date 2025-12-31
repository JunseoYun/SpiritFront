import React, {useState, useRef, useEffect} from 'react';
import {
  Text,
  ScrollView,
  Pressable,
  View,
  StyleSheet,
  TextInput,
  Keyboard,
} from 'react-native';

import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import {review_set_reply} from '../../api/reviewApi';
import Loading from '../../hooks/Loading';
import CustomText from '../../utils/CustomText';
import CustomTextInput from '../../utils/CustomTextInput';
import ColorUtil from '../../utils/ColorUtil';

const ReviewItem = ({
  item,
  navigation,
  isOwner,
  handleDeleteReply,
  isPostItem = false,
  onReportPress,
}) => {
  const [reply, setReply] = useState(item.reply); // 현재 답글
  const [repliedAt, setRepliedAt] = useState(item.repliedAt);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState(item.reply || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.reply || '');
  const [loading, setLoading] = useState(false);
  const [overText, setOverText] = useState(false);
  // 🔥 수정 입력창 ref
  const editInputRef = useRef(null);

  // isEditing이 true가 되면 자동으로 focus
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const currentYear = new Date().getFullYear();
    return year === currentYear
      ? `${month}.${day}`
      : `${String(year).slice(-2)}.${month}.${day}`;
  };

  const formatVisitDate = dateString => {
    if (!dateString) return '방문일 정보 없음';
    const visitDate = new Date(dateString);
    const now = new Date();
    const diffTime = now.setHours(0, 0, 0, 0) - visitDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays === 2) return '그제';
    if (diffDays < 7) return `${diffDays}일전`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffDays < 30) return `${diffWeeks}주전`;
    const diffMonths =
      (now.getFullYear() - visitDate.getFullYear()) * 12 +
      (now.getMonth() - visitDate.getMonth());
    if (diffMonths < 12) return `${diffMonths}달전`;
    const diffYears = Math.floor(diffMonths / 12);
    if (diffYears === 1) return '작년';
    if (diffYears === 2) return '재작년';
    return `${diffYears}년전`;
  };

  const formattedCreatedDate = formatDate(item.createdAt);
  const formattedVisitedDate = formatVisitDate(item.visitedAt);

  const handleImagePress = index => {
    navigation.navigate('ImageViewerScreen', {images: item.imgUrlList, index});
  };

  const handleContentPress = () => {
    if (!isPostItem) {
      return;
    }
    navigation.navigate('PostDetailScreen', {postId: item.id, item});
  };

  // ✅ 답글 등록
  const handleReplySubmit = async () => {
    if (replyText.trim() === '') return;
    setLoading(true);
    try {
      await review_set_reply(item.id, replyText);
      setReply(replyText);
      setRepliedAt(new Date().toISOString());
      setIsReplying(false);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 답글 수정 저장
  const handleReplySave = async () => {
    if (editText.trim() === '') return;

    setLoading(true);
    try {
      await review_set_reply(item.id, editText);
      setReply(editText);
      setIsEditing(false);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      key={item.id ?? item.reviewId}
      onPress={Keyboard.dismiss}
      style={[styles.reviewContainer]}>
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
          <CustomText
            style={[
              styles.writerName,
              item.writerNickname === '탈퇴한 사용자' && {color: '#999'},
            ]}>
            {item.writerNickname}
          </CustomText>

          <View style={styles.infoView}>
            <FontAwesomeIcon name="star" size={17} color="#FCC104" />
            <CustomText style={styles.reviewInfo}> {item.rate}</CustomText>
          </View>
        </View>
        {!isPostItem ? (
          <CustomText style={styles.reviewDate}>
            {formattedVisitedDate} 방문
          </CustomText>
        ) : null}
      </View>

      {/* 리뷰 본문 */}
      <View style={styles.contentView}>
        <Pressable onPress={handleContentPress} disabled={!isPostItem}>
          <CustomText
            style={styles.reviewContent}
            numberOfLines={3}
            ellipsizeMode="tail">
            {item.content}
          </CustomText>
        </Pressable>
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
        <CustomText style={styles.datetimeText}>
          작성 {formattedCreatedDate}
        </CustomText>
        {isPostItem ? (
          onReportPress ? (
            <Pressable onPress={onReportPress}>
              <CustomText style={styles.datetimeText}>신고하기</CustomText>
            </Pressable>
          ) : null
        ) : (
          <Pressable
            onPress={() => {
              navigation.navigate('ReviewReportScreen', {reviewId: item.id});
            }}>
            <CustomText style={styles.datetimeText}>신고하기</CustomText>
          </Pressable>
        )}
      </View>

      {/* 답글 달기 */}
      {isOwner && !reply && (
        <>
          <Pressable
            style={styles.recommentView}
            onPress={() => setIsReplying(prev => !prev)}>
            <Feather name="corner-down-right" size={17} color="#333" />
            <CustomText style={styles.recommentText}>
              {isReplying ? '취소' : '답글달기'}
            </CustomText>
          </Pressable>

          {isReplying && (
            <View style={styles.replyForm}>
              <CustomTextInput
                style={styles.replyInput}
                placeholder="답글을 입력하세요"
                value={replyText}
                placeholderTextColor={ColorUtil.placeholderText}
                onChangeText={text => {
                  const maxChars = 2000;
                  if (text.length > maxChars) {
                    setOverText(true);
                    return; // 초과 입력 무시
                  } else {
                    setOverText(false);
                  }
                  setReplyText(text);
                }}
                multiline
              />
              {overText && (
                <CustomText style={styles.errorText}>
                  답글은 최대 2000자까지 입력 가능합니다.
                </CustomText>
              )}
              <Pressable style={styles.replyButton} onPress={handleReplySubmit}>
                <CustomText style={styles.replyButtonText}>등록</CustomText>
              </Pressable>
            </View>
          )}
        </>
      )}

      {/* 답글 UI */}
      {reply && (
        <View style={styles.repliesContainer}>
          <View style={styles.replyItem}>
            <View style={styles.shopImageView}>
              <Ionicons name="storefront-outline" size={22} color={'#333'} />
            </View>

            <View style={{flex: 1}}>
              <View style={styles.replyHeader}>
                <CustomText style={styles.replyOwnerName}>사장님</CustomText>
                <CustomText style={styles.replyDate}>
                  {formatDate(repliedAt)}
                </CustomText>
              </View>

              {isEditing ? (
                <View style={styles.editBox}>
                  <CustomTextInput
                    ref={editInputRef}
                    style={[styles.replyInput, {backgroundColor: '#fff'}]}
                    value={editText}
                    onChangeText={setEditText}
                    multiline
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: 6,
                      justifyContent: 'flex-end',
                    }}>
                    <Pressable
                      style={[styles.replyButton, {marginRight: 6}]}
                      onPress={handleReplySave}>
                      <CustomText style={styles.replyButtonText}>
                        저장
                      </CustomText>
                    </Pressable>
                    <Pressable
                      style={[styles.replyButton, {backgroundColor: '#eee'}]}
                      onPress={() => setIsEditing(false)}>
                      <CustomText
                        style={[styles.replyButtonText, {color: '#333'}]}>
                        취소
                      </CustomText>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={styles.replyBubble}>
                  {!isEditing && (
                    <>
                      <CustomText style={styles.replyText}>{reply}</CustomText>
                      {isOwner && (
                        <View style={styles.editView}>
                          <Pressable
                            style={[styles.replyButton, styles.editBtn]}
                            onPress={() => {
                              setIsEditing(true);
                              setEditText(reply);
                            }}>
                            <CustomText style={styles.actionBtnText}>
                              수정
                            </CustomText>
                          </Pressable>
                          <Pressable
                            style={[
                              styles.replyButton,
                              {backgroundColor: '#eee'},
                            ]}
                            onPress={() => {
                              handleDeleteReply(item.id);
                              setReply(null);
                              setRepliedAt(null);
                              setEditText('');
                              setReplyText('');
                              setIsEditing(false);
                              setIsReplying(false);
                            }}>
                            <CustomText
                              style={[styles.actionBtnText, {color: '#333'}]}>
                              삭제
                            </CustomText>
                          </Pressable>
                        </View>
                      )}
                    </>
                  )}

                  <View style={{display: isEditing ? 'flex' : 'none'}}>
                    <CustomTextInput
                      ref={editInputRef}
                      style={[styles.replyInput, {backgroundColor: '#fff'}]}
                      value={editText}
                      onChangeText={setEditText}
                      multiline
                    />
                    <View style={{flexDirection: 'row', marginTop: 6}}>
                      <Pressable
                        style={[styles.replyButton, {marginRight: 6}]}
                        onPress={handleReplySave}>
                        <CustomText style={styles.replyButtonText}>
                          저장
                        </CustomText>
                      </Pressable>
                      <Pressable
                        style={[styles.replyButton, {backgroundColor: '#eee'}]}
                        onPress={() => setIsEditing(false)}>
                        <CustomText
                          style={[styles.replyButtonText, {color: '#333'}]}>
                          취소
                        </CustomText>
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
      <Loading loading={loading} />
    </Pressable>
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
    borderRadius: 100,
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: ColorUtil.border,
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
  postTypeText: {
    fontSize: 13,
    color: '#777',
    fontFamily: 'Pretendard-Medium',
    marginTop: 3,
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
  imageScrollView: {
    marginTop: 7,
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
    alignSelf: 'flex-end',
    backgroundColor: '#3CBBFF',
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
    marginTop: 16,
  },
  shopImageView: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E9F5FB',
  },
  shopImage: {
    width: 25,
    height: 25,
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
  editView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    columnGap: 8, // 버튼 사이 간격
  },

  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionBtnText: {
    fontSize: 13,
    fontFamily: 'Pretendard-SemiBold',
    color: '#3CBBFF',
  },

  editBtn: {
    borderColor: '#3CBBFF',
    backgroundColor: '#E9F7FF',
  },

  deleteBtn: {
    borderColor: '#ccc',
    backgroundColor: '#F5F5F5',
  },

  replyEditText: {
    fontSize: 13,
    color: '#3CBBFF',
    fontFamily: 'Pretendard-SemiBold',
  },
  editBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF4816',
    fontSize: 14,
    marginVertical: 3,
  },
});

export default ReviewItem;
