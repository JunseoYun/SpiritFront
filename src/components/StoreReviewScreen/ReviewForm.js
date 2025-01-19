import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Pressable,
  StyleSheet,
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
    <View style={styles.writeContainer}>
      <Text style={styles.titleText}>리뷰 작성</Text>
      <TextInput
        style={[styles.textarea, {color: '#333'}]}
        multiline
        onChangeText={onChangeText}
        value={newReviewContent}
        placeholder="소중한 리뷰를 남겨주세요."
        placeholderTextColor="gray"
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
        onConfirm={date => {
          setVisitDate(date);
          setIsDatePickerOpen(false);
        }}
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
            <MaterialCommunityIcons name="image-plus" size={40} color="#333" />
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
    fontWeight: '500',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
    marginLeft: 3,
  },
  textarea: {
    backgroundColor: '#E9E9E9',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 30,
    height: 100,
    padding: 10,
  },
  starcontainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 30,
  },
  buttonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  savebutton: {
    alignItems: 'center',
    borderRadius: 7,
    backgroundColor: '#16BBFF',
    paddingVertical: 10,
    width: '48%',
  },
  savetext: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cancelbutton: {
    alignItems: 'center',
    borderRadius: 7,
    backgroundColor: '#fff',
    paddingVertical: 10,
    width: '48%',
    borderWidth: 2,
    borderColor: '#16BBFF',
  },
  canceltext: {
    color: '#16BBFF',
    fontWeight: 'bold',
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
    backgroundColor: '#E9E9E9',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  dateButtonText: {fontSize: 16, color: '#333'},
});

export default ReviewForm;
