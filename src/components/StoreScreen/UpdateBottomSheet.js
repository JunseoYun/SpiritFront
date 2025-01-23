import React from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';

const UpdateBottomSheet = ({
  updatedKey,
  updatedValue,
  setUpdatedValue,
  handleUpdate,
  handleBottomClose,
  navigation,
}) => {
  const hours = Array.from({length: 24}, (_, i) =>
    i.toString().padStart(2, '0'),
  );
  const minutes = ['00', '15', '30', '45'];

  return (
    <>
      {updatedKey === 'images' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>Editing {updatedKey}</Text>
          {updatedValue && updatedValue.length > 0 ? (
            <ScrollView
              horizontal={true} // 가로 스크롤 활성화
              showsHorizontalScrollIndicator={false} // 스크롤바 표시 여부
              contentContainerStyle={styles.horizontalScrollContainer}>
              {updatedValue.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image
                    source={{uri: image.imageUrl}}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text>이미지 없음</Text>
          )}
          <Button title="Save" onPress={() => handleUpdate()} />
        </View>
      )}

      {updatedKey === 'name' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>매장 이름</Text>
          <TextInput
            style={styles.input}
            defaultValue={updatedValue}
            onChangeText={text => setUpdatedValue(text)}
            placeholder="매장 이름*"
          />
          <View style={styles.buttonView}>
            <Pressable style={styles.cancelButton} onPress={handleBottomClose}>
              <Text style={styles.buttonText}>취소</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleUpdate}>
              <Text style={[styles.buttonText, {color: '#fff'}]}>저장</Text>
            </Pressable>
          </View>
        </View>
      )}

      {updatedKey === 'categories' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>카테고리* 최대 3개</Text>
          <ScrollView>
            <View style={styles.categoryContainer}>
              {innerCategories.map((category, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.categoryItem,
                    updatedValue.includes(category.value) &&
                      styles.selectedCategory, // 선택된 경우 스타일
                  ]}
                  onPress={() => {
                    // 선택/해제 로직
                    if (updatedValue.includes(category.value)) {
                      setUpdatedValue(
                        updatedValue.filter(val => val !== category.value),
                      ); // 해제
                    } else if (updatedValue.length < 3) {
                      setUpdatedValue([...updatedValue, category.value]); // 최대 3개까지 선택
                    }
                  }}>
                  <Image
                    source={category.source}
                    style={styles.categoryImage}
                  />
                  <Text style={styles.categoryText}>{category.text}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <View style={styles.buttonView}>
            <Pressable style={styles.cancelButton} onPress={handleBottomClose}>
              <Text style={styles.buttonText}>취소</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleUpdate}>
              <Text style={[styles.buttonText, {color: '#fff'}]}>저장</Text>
            </Pressable>
          </View>
        </View>
      )}

      {updatedKey === 'mainDrinkDtos' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>대표 주종</Text>
          {updatedValue.map((drink, index) => (
            <View key={index} style={styles.alcoholRow}>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={drink.type}
                  onValueChange={value =>
                    setUpdatedValue(prev => {
                      const updatedDrinks = [...prev];
                      updatedDrinks[index] = {
                        ...updatedDrinks[index],
                        type: value,
                      };
                      return updatedDrinks;
                    })
                  }
                  style={styles.picker}
                  itemStyle={styles.pickerItem}>
                  <Picker.Item label="선택" value="" />
                  {alcohols.map(alcohol => (
                    <Picker.Item
                      key={alcohol.value}
                      label={alcohol.label}
                      value={alcohol.value}
                    />
                  ))}
                </Picker>
              </View>
              <View style={styles.priceContainer}>
                <TextInput
                  style={styles.priceInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#aaa"
                  value={drink.price?.toString() || ''}
                  onChangeText={value =>
                    setUpdatedValue(prev => {
                      const updatedDrinks = [...prev];
                      updatedDrinks[index] = {
                        ...updatedDrinks[index],
                        price: parseInt(value) || 0,
                      };
                      return updatedDrinks;
                    })
                  }
                />
                <Text style={styles.unit}>원</Text>
              </View>
            </View>
          ))}
          <View style={styles.buttonView}>
            <Pressable style={styles.cancelButton} onPress={handleBottomClose}>
              <Text style={styles.buttonText}>취소</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleUpdate}>
              <Text style={[styles.buttonText, {color: '#fff'}]}>저장</Text>
            </Pressable>
          </View>
        </View>
      )}
      {updatedKey === 'locationDto' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>매장 주소</Text>

          <TouchableOpacity
            style={styles.storeinput}
            onPress={() =>
              navigation.navigate('StoreAddressSearch', {
                onAddressSelect: selectedData =>
                  setUpdatedValue(prev => ({
                    ...prev,
                    address: selectedData.address, // 주소 데이터 반영
                    latitude: selectedData.coords.latitude, // 좌표 데이터 반영
                    longitude: selectedData.coords.longitude,
                  })),
              })
            }>
            {updatedValue.address ? (
              <>
                <Text style={styles.inputText}>{updatedValue.address}</Text>
              </>
            ) : (
              <Text style={styles.inputHideText}>매장 주소*</Text>
            )}
          </TouchableOpacity>

          <View style={styles.storeinputview}>
            {updatedValue.addressDetail && (
              <Text style={styles.storeinputtext}>상세 주소</Text>
            )}
            <TextInput
              style={[
                styles.storeinput,
                updatedValue.addressDetail && styles.focusedInput,
              ]}
              placeholder="상세 주소, 건물 층수, 호수 등"
              placeholderTextColor="#999"
              value={updatedValue.addressDetail}
              onChangeText={text =>
                setUpdatedValue(prev => ({...prev, addressDetail: text}))
              }
            />
          </View>

          <View style={styles.buttonView}>
            <Pressable style={styles.cancelButton} onPress={handleBottomClose}>
              <Text style={styles.buttonText}>취소</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleUpdate}>
              <Text style={[styles.buttonText, {color: '#fff'}]}>저장</Text>
            </Pressable>
          </View>
        </View>
      )}

      {updatedKey === 'operatingTime' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>영업 시간</Text>
          <Text style={styles.title}>
            {updatedValue?.openTime?.slice(0, 5)} -{' '}
            {updatedValue?.closeTime?.slice(0, 5)}
          </Text>
          <View style={styles.pickerSection}>
            {/* 오픈 시간 Picker */}
            <View style={styles.pickerTopView}>
              <View style={styles.pickerWrapper}>
                <Picker
                  itemStyle={styles.pickerItem}
                  selectedValue={updatedValue.openHour || '00'}
                  onValueChange={value =>
                    setUpdatedValue(prev => ({
                      ...prev,
                      openHour: value,
                      openTime: `${value}:${prev.openMinute || '00'}`,
                    }))
                  }
                  style={styles.picker}>
                  {hours.map(hour => (
                    <Picker.Item key={hour} label={hour} value={hour} />
                  ))}
                </Picker>
              </View>
              <Text style={styles.pickerColon}>:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  itemStyle={styles.pickerItem}
                  selectedValue={updatedValue.openMinute || '00'}
                  onValueChange={value =>
                    setUpdatedValue(prev => ({
                      ...prev,
                      openMinute: value,
                      openTime: `${prev.openHour || '00'}:${value}`,
                    }))
                  }
                  style={styles.picker}>
                  {minutes.map(minute => (
                    <Picker.Item key={minute} label={minute} value={minute} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* 마감 시간 Picker */}
            <View style={styles.pickerTopView}>
              <View style={styles.pickerWrapper}>
                <Picker
                  itemStyle={styles.pickerItem}
                  selectedValue={updatedValue.closeHour || '00'}
                  onValueChange={value =>
                    setUpdatedValue(prev => ({
                      ...prev,
                      closeHour: value,
                      closeTime: `${value}:${prev.closeMinute || '00'}`,
                    }))
                  }
                  style={styles.picker}>
                  {hours.map(hour => (
                    <Picker.Item key={hour} label={hour} value={hour} />
                  ))}
                </Picker>
              </View>
              <Text style={styles.pickerColon}>:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  itemStyle={styles.pickerItem}
                  selectedValue={updatedValue.closeMinute || '00'}
                  onValueChange={value =>
                    setUpdatedValue(prev => ({
                      ...prev,
                      closeMinute: value,
                      closeTime: `${prev.closeHour || '00'}:${value}`,
                    }))
                  }
                  style={styles.picker}>
                  {minutes.map(minute => (
                    <Picker.Item key={minute} label={minute} value={minute} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.buttonView}>
            <Pressable style={styles.cancelButton} onPress={handleBottomClose}>
              <Text style={styles.buttonText}>취소</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleUpdate}>
              <Text style={[styles.buttonText, {color: '#fff'}]}>저장</Text>
            </Pressable>
          </View>
        </View>
      )}

      {updatedKey === 'breakingTime' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>브레이크 타임</Text>
          <Text style={styles.title}>
            {updatedValue?.breakStartTime?.slice(0, 5) || '없음'} -{' '}
            {updatedValue?.breakEndTime?.slice(0, 5) || '없음'}
          </Text>
          {/* 초기화 버튼 */}
          <View style={styles.nullButtonView}>
            <Pressable
              style={styles.nullButton}
              onPress={() =>
                setUpdatedValue(prev => ({
                  ...prev,
                  breakStartTime: null,
                  breakEndTime: null,
                  breakStartHour: null,
                  breakStartMinute: null,
                  breakEndHour: null,
                  breakEndMinute: null,
                }))
              }>
              <Text style={styles.nullButtonText}>브레이크 타임 없음</Text>
            </Pressable>
          </View>
          <View style={styles.pickerSection}>
            {/* 오픈 시간 Picker */}
            <View style={styles.pickerTopView}>
              <View style={styles.pickerWrapper}>
                <Picker
                  itemStyle={styles.pickerItem}
                  selectedValue={updatedValue.breakStartHour || '00'}
                  onValueChange={value =>
                    setUpdatedValue(prev => ({
                      ...prev,
                      breakStartHour: value,
                      breakStartTime: `${value}:${
                        prev.breakStartMinute || '00'
                      }`,
                    }))
                  }
                  style={styles.picker}>
                  {hours.map(hour => (
                    <Picker.Item key={hour} label={hour} value={hour} />
                  ))}
                </Picker>
              </View>
              <Text style={styles.pickerColon}>:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  itemStyle={styles.pickerItem}
                  selectedValue={updatedValue.breakStartMinute || '00'}
                  onValueChange={value =>
                    setUpdatedValue(prev => ({
                      ...prev,
                      breakStartMinute: value,
                      breakStartTime: `${prev.breakStartHour || '00'}:${value}`,
                    }))
                  }
                  style={styles.picker}>
                  {minutes.map(minute => (
                    <Picker.Item key={minute} label={minute} value={minute} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* 마감 시간 Picker */}
            <View style={styles.pickerTopView}>
              <View style={styles.pickerWrapper}>
                <Picker
                  itemStyle={styles.pickerItem}
                  selectedValue={updatedValue.breakEndHour || '00'}
                  onValueChange={value =>
                    setUpdatedValue(prev => ({
                      ...prev,
                      breakEndHour: value,
                      breakEndTime: `${value}:${prev.breakEndMinute || '00'}`,
                    }))
                  }
                  style={styles.picker}>
                  {hours.map(hour => (
                    <Picker.Item key={hour} label={hour} value={hour} />
                  ))}
                </Picker>
              </View>
              <Text style={styles.pickerColon}>:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  itemStyle={styles.pickerItem}
                  selectedValue={updatedValue.breakEndMinute || '00'}
                  onValueChange={value =>
                    setUpdatedValue(prev => ({
                      ...prev,
                      breakEndMinute: value,
                      breakEndTime: `${prev.breakEndHour || '00'}:${value}`,
                    }))
                  }
                  style={styles.picker}>
                  {minutes.map(minute => (
                    <Picker.Item key={minute} label={minute} value={minute} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.buttonView}>
            <Pressable style={styles.cancelButton} onPress={handleBottomClose}>
              <Text style={styles.buttonText}>취소</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleUpdate}>
              <Text style={[styles.buttonText, {color: '#fff'}]}>저장</Text>
            </Pressable>
          </View>
        </View>
      )}

      {updatedKey === 'closedDays' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>매장 휴무일</Text>
          {/* 선택 가능한 휴무일 */}
          <View style={styles.daysContainer}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  updatedValue.includes(day.value) && styles.selectedDayButton,
                ]}
                onPress={() => {
                  // 선택 로직
                  const toggleDay = dayValue => {
                    setUpdatedValue(prev => {
                      if (dayValue === null) {
                        // "없음" 선택 시 다른 항목 해제
                        return [];
                      } else {
                        const newDays = prev.filter(d => d !== null);
                        if (newDays.includes(dayValue)) {
                          // 이미 선택된 경우 제거
                          return newDays.filter(d => d !== dayValue);
                        } else {
                          // 새로운 항목 추가
                          return [...newDays, dayValue];
                        }
                      }
                    });
                  };

                  toggleDay(day.value);
                }}>
                <Text
                  style={[
                    styles.dayText,
                    updatedValue.includes(day.value) && styles.selectedDayText,
                  ]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 하단 버튼 */}
          <View style={styles.buttonView}>
            <Pressable style={styles.cancelButton} onPress={handleBottomClose}>
              <Text style={styles.buttonText}>취소</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleUpdate}>
              <Text style={[styles.buttonText, {color: '#fff'}]}>저장</Text>
            </Pressable>
          </View>
        </View>
      )}

      {updatedKey === 'hasScreen' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>스크린 설치 여부</Text>

          {/* 스크린 설치 여부 선택 */}

          <View style={styles.storeCheckView}>
            <TouchableOpacity
              style={styles.storeCheckView}
              onPress={() => setUpdatedValue(true)}>
              <View
                style={[
                  styles.checkbox,
                  updatedValue === true && styles.checkboxSelected,
                ]}></View>
              <Text style={styles.checkboxText}>설치</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.storeCheckView}
              onPress={() => setUpdatedValue(false)}>
              <View
                style={[
                  styles.checkbox,
                  updatedValue === false && styles.checkboxSelected,
                ]}></View>
              <Text style={styles.checkboxText}>미설치</Text>
            </TouchableOpacity>
          </View>

          {/* 하단 버튼 */}
          <View style={styles.buttonView}>
            <Pressable style={styles.cancelButton} onPress={handleBottomClose}>
              <Text style={styles.buttonText}>취소</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleUpdate}>
              <Text style={[styles.buttonText, {color: '#fff'}]}>저장</Text>
            </Pressable>
          </View>
        </View>
      )}

      {updatedKey === 'isGroupAvailable' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>매장 10인 이상 가능 여부</Text>
          <View style={styles.storeCheckView}>
            <TouchableOpacity
              style={styles.storeCheckView}
              onPress={() => setUpdatedValue(true)}>
              <View
                style={[
                  styles.checkbox,
                  updatedValue === true && styles.checkboxSelected,
                ]}></View>
              <Text style={styles.checkboxText}>가능</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.storeCheckView}
              onPress={() => setUpdatedValue(false)}>
              <View
                style={[
                  styles.checkbox,
                  updatedValue === false && styles.checkboxSelected,
                ]}></View>
              <Text style={styles.checkboxText}>불가능</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonView}>
            <Pressable style={styles.cancelButton} onPress={handleBottomClose}>
              <Text style={styles.buttonText}>취소</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleUpdate}>
              <Text style={[styles.buttonText, {color: '#fff'}]}>저장</Text>
            </Pressable>
          </View>
        </View>
      )}
      {updatedKey === 'contact' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>매장 번호</Text>
          <TextInput
            style={styles.input}
            defaultValue={updatedValue}
            onChangeText={text => setUpdatedValue(text)}
          />
          <View style={styles.buttonView}>
            <Pressable style={styles.cancelButton} onPress={handleBottomClose}>
              <Text style={styles.buttonText}>취소</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleUpdate}>
              <Text style={[styles.buttonText, {color: '#fff'}]}>저장</Text>
            </Pressable>
          </View>
        </View>
      )}

      {updatedKey === 'description' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>매장 소개</Text>
          <TextInput
            multiline
            style={[
              styles.input,
              {fontSize: 15}, // 추가 스타일
            ]}
            defaultValue={updatedValue}
            onChangeText={text => setUpdatedValue(text)}
          />
          <View style={styles.buttonView}>
            <Pressable style={styles.cancelButton} onPress={handleBottomClose}>
              <Text style={styles.buttonText}>취소</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleUpdate}>
              <Text style={[styles.buttonText, {color: '#fff'}]}>저장</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    padding: 18,
    backgroundColor: '#F7F7F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  horizontalScrollContainer: {
    flexDirection: 'row',
  },
  input: {
    fontSize: 20,
    fontWeight: '500',
    borderWidth: 1,
    borderRadius: 7,
    borderColor: '#999',
    padding: 10,
    paddingVertical: 15,
  },

  imageWrapper: {
    marginRight: 10, // 이미지 간격
  },
  image: {
    width: 100, // 이미지 가로 크기
    height: 100, // 이미지 세로 크기
    borderRadius: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 5,
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: '#10BEFB',
    borderRadius: 10,
  },
  categoryImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  categoryText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  alcoholRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  pickerContainer: {
    flex: 2,
    backgroundColor: '#F2F2F2',
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    height: 60,
    overflow: 'hidden',
  },
  picker: {
    color: '#333',
  },
  pickerItem: {
    color: '#333',
    fontSize: 18,
    fontWeight: '400',
  },
  priceContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  priceInput: {
    flex: 1,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  unit: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  storeinputview: {
    marginTop: 30,
  },
  storeinputtext: {
    fontWeight: '500',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  storeinput: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 7, // 상하 간격 조절
    paddingLeft: 1,
  },
  inputHideText: {
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 1,
    paddingLeft: 1,
    color: '#999',
  },
  inputText: {
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 1,
    paddingLeft: 1,
  },
  focusedInput: {
    borderBottomColor: '#16BBFF', // 활성화 상태 색상
    borderBottomWidth: 2, // 두껍게 표시
  },
  pickerTopView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  pickerLabel: {
    fontWeight: '400',
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  pickerColon: {
    fontWeight: '600',
    fontSize: 16,
    color: '#444',
    marginHorizontal: 10,
  },
  pickerWrapper: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    overflow: 'hidden', // iOS 겹침 방지
    justifyContent: 'center',
    height: 60,
  },
  nullButtonView: {
    marginBottom: 20,
  },
  nullButton: {
    width: '45%',
    backgroundColor: '#E9E9E9',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  nullButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },

  buttonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonView: {
    paddingTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    width: '49%',
    borderRadius: 7,
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
  },
  saveButton: {
    width: '49%',
    borderRadius: 7,
    backgroundColor: '#10BEFB',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    padding: 12,
    color: '#10BEFB',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
    margin: 7,
  },
  selectedDayButton: {
    backgroundColor: '#16BBFF',
  },
  dayText: {
    fontSize: 18,
    color: '#333',
  },
  selectedDayText: {
    color: '#FFF',
  },
  selectedDaysText: {
    marginTop: 20,
    fontSize: 14,
    color: '#333',
  },
  storeCheckView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    marginHorizontal: 20,
    justifyContent: 'space-evenly',
  },
  checkbox: {
    width: 30,
    height: 30,
    backgroundColor: '#F2F2F2',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#16BBFF',
    padding: 10,
    margin: 5,
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#16BBFF',
  },
  checkboxText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '500',
    padding: 3,
  },
});

const innerCategories = [
  {
    source: require('../../assets/free-icon-barbecue-4039250.png'),
    text: '이자카야',
    value: 'IZAKAYA',
  },
  {
    source: require('../../assets/free-icon-soju-5789309.png'),
    text: '한식주점',
    value: 'KOREAN',
  },
  {
    source: require('../../assets/free-icon-pizza-3595458.png'),
    text: '양식주점',
    value: 'WESTERN',
  },
  {
    source: require('../../assets/free-icon-dumplings-6560368.png'),
    text: '중화주점',
    value: 'CHINESE',
  },
  {
    source: require('../../assets/bar-counter_3822705.png'),
    text: '감성주점',
    value: 'GAMSEONG',
  },
  {
    source: require('../../assets/free-icon-jokbal-8740559.png'),
    text: '족발 보쌈',
    value: 'JOGBO',
  },
  {
    source: require('../../assets/free-icon-soup-12404665.png'),
    text: '찜 찌개',
    value: 'STEW',
  },
  {
    source: require('../../assets/free-icon-barbecue-4039250.png'),
    text: '구이 탕',
    value: 'GRILLED',
  },
  {
    source: require('../../assets/free-icon-roast-chicken-2137000.png'),
    text: '치킨',
    value: 'CHICKEN',
  },
  {
    source: require('../../assets/mayonnaise_3376991.png'),
    text: '전 막걸리',
    value: 'JEONMAK',
  },
  {
    source: require('../../assets/free-icon-squid-12752294.png'),
    text: '마른안주',
    value: 'DRIED',
  },
  {
    source: require('../../assets/free-icon-steamed-fish-2885062.png'),
    text: '해산물',
    value: 'SEAFOOD',
  },
  {
    source: require('../../assets/free-icon-folder-3370758.png'),
    text: '룸',
    value: 'ROOM',
  },
  {
    source: require('../../assets/free-icon-disco-ball-3935116.png'),
    text: '단체 행사',
    value: 'GROUP',
  },
  {
    source: require('../../assets/beers_2302167.png'),
    text: '야장',
    value: 'OUTDOOR',
  },
  {
    source: require('../../assets/free-icon-stall-food-6734735.png'),
    text: '포차',
    value: 'POCHA',
  },
  {
    source: require('../../assets/free-icon-beer-1887156.png'),
    text: '호프',
    value: 'HOF',
  },
  {
    source: require('../../assets/free-icon-wine-6454589.png'),
    text: '와인바',
    value: 'WINE',
  },
  {
    source: require('../../assets/free-icon-cocktail-3086535.png'),
    text: '칵테일',
    value: 'COCKTAIL',
  },
  {
    source: require('../../assets/free-icon-bar-counter-4507564.png'),
    text: '펍 바',
    value: 'PUBBAR',
  },
];

const alcohols = [
  {label: '소주', value: 'SOJU'},
  {label: '맥주', value: 'BEER'},
  {label: '막걸리', value: 'MAKGEOLLI'},
  {label: '와인', value: 'WINE'},
  {label: '칵테일', value: 'COCKTAIL'},
  {label: '사케', value: 'SAKE'},
  {label: '고량주', value: 'KAOLIANG'},
  {label: '위스키', value: 'WHISKEY'},
  {label: '보드카', value: 'VODKA'},
  {label: '진', value: 'GIN'},
  {label: '럼', value: 'RUM'},
  {label: '데킬라', value: 'TEQUILA'},
];

const days = [
  {label: '월', value: 'MONDAY'},
  {label: '화', value: 'TUESDAY'},
  {label: '수', value: 'WEDNESDAY'},
  {label: '목', value: 'THURSDAY'},
  {label: '금', value: 'FRIDAY'},
  {label: '토', value: 'SATURDAY'},
  {label: '일', value: 'SUNDAY'},
  {label: '없음', value: null},
];

export default UpdateBottomSheet;
