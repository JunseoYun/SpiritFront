import React, {useEffect, useState} from 'react';
import {
  View,
  Platform,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';
import ImagePickermodal from '../../hooks/ImagePickermodal';
import BottomActionButton from '../../utils/BottomActionButton';
import ImageAddButton from '../../utils/ImageAddButton';
import FastImage from 'react-native-fast-image';
import ColorUtil from '../../utils/ColorUtil';
import CustomText from '../../utils/CustomText';
import CustomTextInput from '../../utils/CustomTextInput';
const rateTextMap = {
  0: '어땠나요?',
  1: '별로예요',
  2: '그저 그래요',
  3: '보통이에요',
  4: '좋았어요',
  5: '최고예요!',
};

const ReviewForm = ({
  newReviewContent,
  onChangeText,
  renderStars,
  visitDate,
  setVisitDate,
  isDatePickerOpen,
  setIsDatePickerOpen,
  images,
  selectedImageIndex,
  handleImagePress,
  handleSubmitReview,
  isBottomSheetVisible,
  selectImage,
  hadleNoWrite,
  setBottomSheetVisible,
  handleGalleryPick,
  submitLabel = '작성 완료',
  showCancelButton = true,
  initialRate = 0,
}) => {
  const [contentFocused, setContentFocused] = useState(false);
  const [currentRate, setCurrentRate] = useState(initialRate || 0);
  const [errorcontent, setErrorcontent] = useState(false);
  const [errorrate, setErrorrate] = useState(false);
  const [overText, setOverText] = useState(false);

  useEffect(() => {
    setCurrentRate(initialRate || 0);
  }, [initialRate]);

  const validateReview = () => {
    const hasContent = newReviewContent && newReviewContent.trim();

    if (!hasContent) {
      setErrorcontent(true);
      return false;
    }

    if (currentRate == 0) {
      setErrorrate(true);
      return false;
    }

    setErrorcontent(false);
    setErrorrate(false);
    return true;
  };

  const confirmbtn = () => {
    if (validateReview()) {
      handleSubmitReview();
    }
  };

  const resolveImageUri = image => {
    if (!image) {
      return '';
    }

    const candidate = image.uri || image.path;

    if (!candidate) {
      return '';
    }

    if (
      candidate.startsWith('file://') ||
      candidate.startsWith('content://') ||
      candidate.startsWith('ph://') ||
      candidate.startsWith('assets-library://') ||
      candidate.startsWith('http://') ||
      candidate.startsWith('https://')
    ) {
      return candidate;
    }

    return `file://${candidate}`;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{flex: 1}}>
        <ScrollView
          bounces={false}
          contentContainerStyle={{
            paddingVertical: 20,
          }}
          showsVerticalScrollIndicator={false}>
          {/* 별점 */}
          <View style={[styles.section, {paddingHorizontal: 20}]}>
            <CustomText style={styles.rateLabel}>
              {rateTextMap[currentRate]}
            </CustomText>
            <View style={styles.starRow}>
              {renderStars(rate => setCurrentRate(rate))}
            </View>
            {errorrate && (
              <CustomText style={styles.errorMessage}>
                리뷰 별점을 입력해주세요!
              </CustomText>
            )}
          </View>

          {/* 리뷰 내용 */}
          <View style={[styles.section, {paddingHorizontal: 20}]}>
            <CustomTextInput
              style={[
                styles.textarea,
                contentFocused && styles.inputFocused,
                errorcontent && styles.errorFocused,
              ]}
              multiline
              value={newReviewContent}
              onChangeText={text => {
                const maxChars = 2000;
                if (text.length > maxChars) {
                  setOverText(true);
                  return; // 초과 입력 무시
                } else {
                  setOverText(false);
                }
                onChangeText(text);
              }}
              placeholder="리뷰 별점 이유를 작성해 주세요!"
              placeholderTextColor="#999"
              onFocus={() => setContentFocused(true)}
              onBlur={() => setContentFocused(false)}
            />
            {errorcontent && (
              <CustomText style={styles.errorMessage}>
                리뷰 별점 이유를 작성해 주세요!
              </CustomText>
            )}
            {overText && (
              <CustomText style={styles.errorMessage}>
                리뷰는 최대 2000자까지 입력 가능합니다.
              </CustomText>
            )}
          </View>

          {/* 방문 날짜 */}
          <View style={[styles.section, {paddingHorizontal: 20}]}>
            <CustomText style={styles.sectionTitle}>
              방문 날짜를 선택해주세요!
            </CustomText>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setIsDatePickerOpen(true)}>
              <CustomText style={styles.dateTxt}>
                {visitDate.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </CustomText>
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={20}
                color="#666"
              />
            </TouchableOpacity>
            <DatePicker
              modal
              open={isDatePickerOpen}
              date={visitDate}
              locale="ko"
              mode="date"
              maximumDate={new Date(new Date().setHours(23, 59, 59, 999))}
              title="방문 날짜 선택"
              confirmText="완료"
              cancelText="취소"
              onConfirm={date => {
                setVisitDate(date);
                setIsDatePickerOpen(false);
              }}
              onCancel={() => setIsDatePickerOpen(false)}
            />
          </View>

          {/* 사진 */}
          {/* 사진 */}
          <View style={[styles.section]}>
            <CustomText style={[styles.sectionTitle, {paddingHorizontal: 20}]}>
              사진을 추가해주세요!{' '}
              <CustomText
                style={{
                  color: '#999',
                  fontSize: 13,
                  fontFamily: 'Pretendard-Regular',
                }}>
                (선택)
              </CustomText>
            </CustomText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagesRow}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <View
                    style={[
                      styles.imageBox,
                      index === selectedImageIndex && styles.imageSelected,
                    ]}>
                    {resolveImageUri(image) !== '' && (
                      <FastImage
                        source={{uri: resolveImageUri(image)}}
                        style={styles.image}
                      />
                    )}
                  </View>
                  <Pressable
                    style={styles.imageDeleteButton}
                    onPress={() => handleImagePress(index)}
                    hitSlop={{top: 8, right: 8, bottom: 8, left: 8}}>
                    <MaterialCommunityIcons
                      name="close"
                      size={18}
                      color="#fff"
                    />
                  </Pressable>
                </View>
              ))}
              {images.length < 5 && (
                <ImageAddButton
                  currentCount={images.length}
                  maxCount={5}
                  onPress={() => setBottomSheetVisible(true)}
                />
              )}
            </ScrollView>
          </View>

          {/* 버튼 */}
        </ScrollView>

        <BottomActionButton
          label={submitLabel}
          cancel={showCancelButton}
          onPress={confirmbtn}
          onCancel={hadleNoWrite}
        />
        <ImagePickermodal
          isBottomSheetVisible={isBottomSheetVisible}
          setBottomSheetVisible={setBottomSheetVisible}
          handleCameraPick={selectImage}
          handleGalleryPick={handleGalleryPick}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // 전체 스크린 배경
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  Title: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#222',
    flex: 1,
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',

    marginVertical: 7,
    color: '#222',
  },
  rateLabel: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 10,
  },
  starRow: {
    flexDirection: 'row',
  },
  textarea: {
    backgroundColor: '#fff',
    minHeight: 130,
    maxHeight: 150,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ebebeb',
    width: '100%',
    ...Platform.select({
      ios: {
        paddingTop: 16,
        paddingBottom: 16,
      },
    }),
  },
  inputFocused: {
    borderColor: '#333',
  },
  errorFocused: {
    borderColor: '#FF4816',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'Pretendard-Medium',
    alignSelf: 'flex-start',
  },
  dateBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E3E3',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 7,
  },
  dateTxt: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
  },
  imagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  imageBox: {
    borderRadius: 9,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: ColorUtil.border,
  },
  imageSelected: {
    borderColor: '#FF6B6B',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  imageDeleteButton: {
    position: 'absolute',
    top: -7,
    right: -10,
    width: 20,
    height: 20,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    elevation: 4,
  },
});

export default ReviewForm;
