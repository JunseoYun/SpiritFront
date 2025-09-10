import React, {useCallback, useRef, useState} from 'react';
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
  ToastAndroid,
  BackHandler,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker';
import forbiddenWords from '../../hooks/forbiddenWords';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePickermodal from '../../hooks/ImagePickermodal';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
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
  isBottomSheetVisible,
  selectImage,
  hadleNoWrite,
  setBottomSheetVisible,
  handleGalleryPick,
}) => {
  const [contentFocused, setContentFocused] = useState(false);
  const [currentRate, setCurrentRate] = useState(0);
  const [errorcontent, setErrorcontent] = useState(false);
  const [errorrate, setErrorrate] = useState(false);
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
    if (currentRate == 0) {
      setErrorrate(true);
      setForbiddenerror(false);
      return false;
    }

    setErrorcontent(false);
    setForbiddenerror(false);
    setErrorrate(false);
    return true;
  };

  const confirmbtn = () => {
    if (validateReview()) {
      handleSubmitReview();
    }
  };

  const lastBackPressed = useRef(0);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const now = Date.now();

        if (now - lastBackPressed.current < 2000) {
          hadleNoWrite();
          return true;
        }

        lastBackPressed.current = now;
        ToastAndroid.show(
          '한 번 더 누르면 작성한 내용이 사라집니다.',
          ToastAndroid.SHORT,
        );
        return true; // 기본 동작 막기
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove(); // cleanup
    }, []),
  );

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
            <Text style={styles.rateLabel}>{rateTextMap[currentRate]}</Text>
            <View style={styles.starRow}>
              {renderStars(rate => setCurrentRate(rate))}
            </View>
            {errorrate && (
              <Text style={styles.errorMessage}>리뷰 별점을 입력해주세요!</Text>
            )}
          </View>

          {/* 리뷰 내용 */}
          <View style={[styles.section, {paddingHorizontal: 20}]}>
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
              onFocus={() => setContentFocused(true)}
              onBlur={() => setContentFocused(false)}
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
          </View>

          {/* 방문 날짜 */}
          <View style={[styles.section, {paddingHorizontal: 20}]}>
            <Text style={styles.sectionTitle}>방문 날짜를 선택해주세요!</Text>
            <TouchableOpacity
              style={styles.dateBtn}
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
          </View>

          {/* 사진 */}
          {/* 사진 */}
          <View style={[styles.section, {paddingHorizontal: 0}]}>
            <Text style={[styles.sectionTitle, {paddingHorizontal: 20}]}>
              사진을 추가해주세요! (선택)
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagesRow}>
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
                  onPress={() => setBottomSheetVisible(true)}>
                  <MaterialCommunityIcons name="plus" size={28} color="#888" />
                </Pressable>
              )}
            </ScrollView>
          </View>

          {/* 버튼 */}
        </ScrollView>
        <View style={styles.buttonView}>
          <TouchableOpacity style={styles.resetButton} onPress={hadleNoWrite}>
            <Text style={styles.resetText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={confirmbtn}>
            <Text style={styles.applyText}>작성 완료</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 17,
    fontFamily: 'Pretendard-Medium',
    marginBottom: 12,
    color: '#222',
  },
  rateLabel: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Pretendard-Medium',
    marginBottom: 10,
  },
  starRow: {
    flexDirection: 'row',
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
    width: '100%',
  },
  inputFocused: {
    borderColor: '#45C9FF',
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
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ebebeb',
    width: '100%',
  },
  dateTxt: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
  imagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 20,
  },
  imageBox: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 10, // 각 이미지 사이 간격
  },
  imageSelected: {
    borderColor: '#FF6B6B',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  addImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  buttonView: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'android' && 10,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    height: 44,
  },
  resetText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Pretendard-Medium',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#45C9FF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  applyText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Pretendard-Bold',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#EAEAEA',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
});

export default ReviewForm;
