import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Pressable,
  StyleSheet,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import forbiddenWords from '../../hooks/forbiddenWords';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const rateTextMap = {
  0: '어땠나요?',
  1: '별로예요',
  2: '그저 그래요',
  3: '보통이에요',
  4: '좋았어요',
  5: '최고예요!',
};
const ReviewForm = ({
  storeName,
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
  hadleNoWrite,
  setIsWriting,
  setBottomSheetVisible,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [rateSelected, setRateSelected] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);
  const [currentRate, setCurrentRate] = useState(0);
  const [errorcontent, setErrorcontent] = useState(false);

  const [forbiddenerror, setForbiddenerror] = useState(false);

  const validateReview = () => {
    const containsForbiddenWord = forbiddenWords.some(word =>
      newReviewContent.includes(word),
    );

    if (containsForbiddenWord) {
      setErrorcontent(false);
      setForbiddenerror(true);
      return false;
    }

    if (!newReviewContent || !newReviewContent.trim()) {
      setErrorcontent(true);
      setForbiddenerror(false);
      return false;
    }

    setErrorcontent(false);
    setForbiddenerror(false);
    return true;
  };

  const handleRateNext = () => {
    if (currentStep >= 2) return;
    setCurrentStep(2);
  };

  const handleReviewNext = () => {
    if (validateReview()) {
      setCurrentStep(3);
    }
  };

  const handleDateNext = () => {
    setCurrentStep(4);
  };

  const confirmbtn = () => {
    if (validateReview()) {
      handleSubmitReview();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{paddingVertical: '30%'}}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        {/* STEP 1 : 리뷰 내용 */}
        <View
          style={{
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 12,
          }}>
          <View
            style={{
              flexDirection: 'row',
              marginBottom: 12,
            }}>
            <Text style={styles.Title}>{storeName}</Text>
            <Pressable style={styles.deleteButton} onPress={hadleNoWrite}>
              <Ionicons name="close" size={25} color="#999" />
            </Pressable>
          </View>
          <View
            style={{
              paddingTop: 5,
              backgroundColor: '#fff',
              alignItems: 'center',
            }}>
            {currentRate >= 0 && (
              <Text style={styles.rateLabel}>{rateTextMap[currentRate]}</Text>
            )}
            <View style={styles.starRow}>
              {renderStars(rate => {
                setCurrentRate(rate); // ⭐ 현재 별점 상태 저장
                setRateSelected(true);
                handleRateNext();
              })}
            </View>
          </View>
          {currentStep >= 2 && (
            <>
              <TextInput
                style={[
                  styles.textarea,
                  contentFocused && styles.inputFocused,
                  (errorcontent || forbiddenerror) && styles.errorFocused,
                ]}
                multiline
                value={newReviewContent}
                onChangeText={onChangeText}
                placeholder="리뷰 별점 이유를 작성해 주세요!"
                placeholderTextColor="#999"
                returnKeyType="next"
                onFocus={() => setContentFocused(true)}
                onBlur={() => {
                  setContentFocused(false);
                }}
              />
              {errorcontent && (
                <Text style={styles.errorMessage}>
                  리뷰 별점 이유를 작성해 주세요!
                </Text>
              )}
              {forbiddenerror && (
                <Text style={styles.errorMessage}>
                  비속어 및 이용 약관에 위배되는 내용이 포함되어 있습니다.
                </Text>
              )}
              {currentStep === 2 && (
                <View style={styles.btnview}>
                  {/* <TouchableOpacity
                    style={styles.nextcanBtn}
                    onPress={() => hadleNoWrite()}>
                    <Text style={styles.nextcanTxt}>취소</Text>
                  </TouchableOpacity> */}

                  <TouchableOpacity
                    style={styles.nextBtn}
                    onPress={handleReviewNext}>
                    <Text style={styles.nextTxt}>다음</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
          {/* STEP 3 : 방문 날짜 */}
          {currentStep >= 3 && (
            <View style={{marginTop: 30}}>
              <Text style={styles.sectionTitle}>방문 날짜를 선택해주세요!</Text>
              <TouchableOpacity
                style={[
                  styles.dateBtn,
                  isDatePickerOpen && styles.datefocusBtn,
                ]}
                onPress={() => setIsDatePickerOpen(true)}>
                <Text style={styles.dateTxt}>
                  {visitDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              <DatePicker
                modal
                open={isDatePickerOpen}
                date={visitDate}
                locale="ko"
                mode="date"
                maximumDate={new Date(new Date().setHours(23, 59, 59, 999))}
                onConfirm={date => {
                  setVisitDate(date);
                  setIsDatePickerOpen(false);
                }}
                onCancel={() => setIsDatePickerOpen(false)}
              />
              {currentStep === 3 && (
                <View style={styles.btnview}>
                  {/* <TouchableOpacity
                    style={styles.nextcanBtn}
                    onPress={() => hadleNoWrite()}>
                    <Text style={styles.nextcanTxt}>취소</Text>
                  </TouchableOpacity> */}
                  <TouchableOpacity
                    style={styles.nextBtn}
                    onPress={handleDateNext}>
                    <Text style={styles.nextTxt}>다음</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          {/* STEP 4 : 사진 추가 */}
          {currentStep >= 4 && (
            <View style={{marginTop: 30}}>
              <Text style={styles.sectionTitle}>
                사진을 추가해주세요! (선택)
              </Text>
              <View style={styles.imagesRow}>
                {images.map((image, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleImagePress(index)}
                    style={[
                      styles.imageBox,
                      index === selectedImageIndex && styles.imageSelected,
                    ]}>
                    <Image
                      source={{uri: `file://${image.path}`}}
                      style={styles.image}
                    />
                  </Pressable>
                ))}
                {images.length < 5 && (
                  <Pressable
                    style={styles.addImage}
                    onPress={() => {
                      setBottomSheetVisible(true);
                    }}>
                    <MaterialCommunityIcons
                      name="plus"
                      size={28}
                      color="#888"
                    />
                  </Pressable>
                )}
              </View>

              {/* STEP 5 : 버튼 */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    hadleNoWrite();
                  }}>
                  <Text style={styles.cancelTxt}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={() => {
                    confirmbtn();
                  }}>
                  <Text style={styles.submitTxt}>작성 완료</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  Title: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#222',
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Pretendard-Medium',
    marginBottom: 12,
    color: '#222',
    backgroundColor: '#fff',
  },
  textarea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ebebeb',
    marginTop: 20,
  },
  inputFocused: {
    borderColor: '#45C9FF',
  },
  errorFocused: {
    borderColor: '#FF4816',
  },
  btnview: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  nextcanBtn: {
    marginTop: 10,
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#45C9FF',
  },
  nextBtn: {
    marginTop: 10,
    alignSelf: 'flex-end',
    backgroundColor: '#45C9FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  nextcanTxt: {color: '#45C9FF', fontFamily: 'Pretendard-Medium', fontSize: 16},
  nextTxt: {color: '#fff', fontFamily: 'Pretendard-Medium', fontSize: 16},
  starRow: {flexDirection: 'row', marginBottom: 10},
  rateLabel: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Pretendard-Medium',
    textAlign: 'center',
    marginBottom: 10,
  },
  dateBtn: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  datefocusBtn: {
    borderColor: '#45C9FF',
  },
  dateTxt: {fontSize: 18, fontWeight: '600', color: '#333'},
  imagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  imageBox: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  imageSelected: {borderColor: '#FF6B6B'},
  image: {width: 90, height: 90, borderRadius: 8},
  addImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {flexDirection: 'row', justifyContent: 'space-between'},
  cancelBtn: {
    flex: 1,
    backgroundColor: '#EAEAEA',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelTxt: {color: '#555', fontSize: 17, fontWeight: '600'},
  submitBtn: {
    flex: 1,
    backgroundColor: '#45C9FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitTxt: {color: '#fff', fontSize: 17, fontWeight: '700'},
  errorMessage: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: 5,
    marginHorizontal: 5,
    fontFamily: 'Pretendard-Medium',
  },
});

export default ReviewForm;
