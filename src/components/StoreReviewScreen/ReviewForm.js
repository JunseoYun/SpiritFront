import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Pressable,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ReviewForm = ({
  onChangeText,
  newReviewContent,
  visitDate,
  setVisitDate,
  isDatePickerOpen,
  setIsDatePickerOpen,
  images,
  setImages,
  selectedImageIndex,
  setSelectedImageIndex,
  renderStars,
  selectImage,
  handleImagePress,
  handleSubmitReview,
  hadleNoWrite,
}) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.writeContainer}>
        <Text style={styles.titleText}>리뷰 작성</Text>
        <TextInput
          style={[styles.textarea, {color: '#333'}]}
          multiline
          onChangeText={onChangeText}
          value={newReviewContent}
          placeholder="소중한 리뷰를 남겨주세요."
          placeholderTextColor="#999"
        />

        <Text style={styles.titleText}>별점 입력</Text>
        <View style={styles.starcontainer}>{renderStars()}</View>

        <Text style={styles.titleText}>방문 날짜</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setIsDatePickerOpen(true)}>
          <Text style={styles.dateButtonText}>
            {visitDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        <DatePicker
          modal
          open={isDatePickerOpen}
          date={visitDate}
          locale="ko"
          mode="date"
          maximumDate={new Date(new Date().setHours(23, 59, 59, 999))} // 한국 시간 기준 오늘까지 선택 가능
          onConfirm={date => {
            setVisitDate(date);
            setIsDatePickerOpen(false);
          }}
          style={{backgroundColor: 'blue', color: 'blue'}}
          onCancel={() => setIsDatePickerOpen(false)}
        />

        <Text style={styles.titleText}>리뷰 사진 추가 (최대 5장)</Text>
        <View style={styles.imageContainer}>
          {images.map((image, index) => (
            <Pressable
              key={index}
              onPress={() => handleImagePress(index)}
              style={styles.imagePressable}>
              <Image
                source={{uri: `file://${image.path}`}}
                style={[
                  styles.selectImage,
                  index === selectedImageIndex && styles.selectedEffect,
                ]}
              />
            </Pressable>
          ))}
          {images.length < 5 && (
            <Pressable onPress={selectImage}>
              <MaterialCommunityIcons
                name="image-plus"
                size={40}
                color="#333"
              />
            </Pressable>
          )}
        </View>

        <View style={styles.buttonView}>
          <TouchableOpacity style={styles.cancelbutton} onPress={hadleNoWrite}>
            <Text style={styles.canceltext}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.savebutton}
            onPress={handleSubmitReview}>
            <Text style={styles.savetext}>작성완료</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  writeContainer: {
    height: 640,
    marginBottom: 10,
    marginTop: 30,
    marginHorizontal: 18,
  },
  titleText: {
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
    marginLeft: 3,
  },
  textarea: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 30,
    height: 100,
    padding: 10,
    fontFamily: 'Pretendard-Medium',
  },
  starcontainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 30,
    color: '#F5F5F5',
  },
  buttonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  savebutton: {
    alignItems: 'center',
    borderRadius: 7,
    backgroundColor: '#45C9FF',
    paddingVertical: 10,
    width: '48%',
  },
  savetext: {
    color: 'white',
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
  },
  cancelbutton: {
    alignItems: 'center',
    borderRadius: 7,
    backgroundColor: '#fff',
    paddingVertical: 10,
    width: '48%',
    borderWidth: 2,
    borderColor: '#45C9FF',
  },
  canceltext: {
    color: '#45C9FF',
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },
  selectImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  selectedEffect: {
    borderWidth: 3,
    borderColor: '#FF6B6B', // 선택된 이미지를 강조
  },
  dateButton: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  dateButtonText: {fontSize: 16, color: '#333'},
});

export default ReviewForm;
