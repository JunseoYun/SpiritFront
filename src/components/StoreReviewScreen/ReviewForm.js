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
import DatePicker from 'react-native-date-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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
  selectImage,
  handleSubmitReview,
  hadleNoWrite,
  setIsWriting,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [rateSelected, setRateSelected] = useState(false);

  const handleReviewNext = () => {
    if (!newReviewContent || !newReviewContent.trim()) return; // 빈 값이면 넘어가지 않음
    setCurrentStep(2);
  };

  const handleRateNext = () => {
    setCurrentStep(3);
  };

  const handleDateNext = () => {
    setCurrentStep(4);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{padding: 20}}>
        {/* STEP 1 : 리뷰 내용 */}
        <Text style={styles.sectionTitle}>
          {storeName}을(를) 방문한 이야기를 적어주세요!
        </Text>
        <TextInput
          style={styles.textarea}
          multiline
          value={newReviewContent}
          onChangeText={onChangeText}
          placeholder="내용을 입력하세요."
          placeholderTextColor="#999"
        />
        {currentStep === 1 && (
          <View>
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => setIsWriting(false)}>
              <Text style={styles.nextTxt}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextBtn} onPress={handleReviewNext}>
              <Text style={styles.nextTxt}>다음</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2 : 별점 */}
        {currentStep >= 2 && (
          <View style={{marginTop: 30}}>
            <Text style={styles.sectionTitle}>별점을 선택해주세요!</Text>
            <View style={styles.starRow}>{renderStars()}</View>
            {currentStep === 2 && (
              <View>
                <TouchableOpacity
                  style={styles.nextBtn}
                  onPress={() => setIsWriting(false)}>
                  <Text style={styles.nextTxt}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.nextBtn}
                  onPress={() => {
                    setRateSelected(true);
                    handleRateNext();
                  }}>
                  <Text style={styles.nextTxt}>다음</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* STEP 3 : 방문 날짜 */}
        {currentStep >= 3 && (
          <View style={{marginTop: 30}}>
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
            {currentStep === 3 && (
              <View>
                <TouchableOpacity
                  style={styles.nextBtn}
                  onPress={() => setIsWriting(false)}>
                  <Text style={styles.nextTxt}>취소</Text>
                </TouchableOpacity>
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
            <Text style={styles.sectionTitle}>사진을 추가해주세요! (선택)</Text>
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
                <Pressable style={styles.addImage} onPress={selectImage}>
                  <MaterialCommunityIcons name="plus" size={28} color="#888" />
                </Pressable>
              )}
            </View>

            {/* STEP 5 : 버튼 */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  hadleNoWrite();
                  setIsWriting(false);
                }}>
                <Text style={styles.cancelTxt}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => {
                  handleSubmitReview();
                  setIsWriting(false);
                }}>
                <Text style={styles.submitTxt}>작성 완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
  },
  textarea: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  nextBtn: {
    marginTop: 10,
    alignSelf: 'flex-end',
    backgroundColor: '#45C9FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  nextTxt: {color: '#fff', fontWeight: '700', fontSize: 16},
  starRow: {flexDirection: 'row', marginBottom: 10},
  dateBtn: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
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
});

export default ReviewForm;
