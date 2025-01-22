import React from 'react';
import {View, Text, TextInput, Button, StyleSheet} from 'react-native';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import useDayTranslation from '../../hooks/useDayTranslation';
import useCategoryTranslation from '../../hooks/useCategoryTranslation ';

const UpdateBottomSheet = ({
  updatedKey,
  updatedValue,
  setUpdatedValue,
  handleUpdate,
}) => {
  const {translateCategory} = useCategoryTranslation();
  const {translateAlcohol} = useTranslateAlcohol();
  const {translateDays} = useDayTranslation();

  return (
    <>
      {updatedKey === 'name' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>Editing {updatedKey}</Text>
          <TextInput
            style={styles.input}
            defaultValue={updatedValue}
            onChangeText={text => setUpdatedValue(text)}
          />
          <Button title="Save" onPress={() => handleUpdate()} />
        </View>
      )}

      {updatedKey === 'category' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>Editing {updatedKey}</Text>
          {Array.isArray(updatedValue) &&
            updatedValue.map((category, index) => (
              <Text key={index} style={styles.subtitle}>
                {translateCategory(category)}
              </Text>
            ))}
          <Button title="Save" onPress={() => handleUpdate()} />
        </View>
      )}

      {updatedKey === 'drink' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>Editing {updatedKey}</Text>
          {updatedValue && updatedValue.length > 0 ? (
            updatedValue.map((drink, index) => (
              <Text
                key={index}
                style={[
                  styles.subtitle,
                  {color: '#333', marginBottom: 5, marginRight: 7},
                ]}>
                {translateAlcohol(drink.type)} {drink.price.toLocaleString()}원
              </Text>
            ))
          ) : (
            <Text style={[styles.subtitle, {color: '#333'}]}>
              대표 주종 미설정
            </Text>
          )}
          <Button title="Save" onPress={() => handleUpdate()} />
        </View>
      )}

      {updatedKey === 'address' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>Editing {updatedKey}</Text>
          <Text style={styles.subtitle}>
            {updatedValue.address}, {updatedValue.addressDetail}
          </Text>
          <Button title="Save" onPress={() => handleUpdate()} />
        </View>
      )}

      {updatedKey === 'operatingTime' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>Editing {updatedKey}</Text>

          <Text style={styles.Storesubtitle}>
            {updatedValue.openTime}, {updatedValue.closeTime}
          </Text>
          <Button title="Save" onPress={() => handleUpdate()} />
        </View>
      )}
      {updatedKey === 'breakingTime' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>Editing {updatedKey}</Text>
          {updatedValue.breakStartTime ? (
            <Text style={styles.Storesubtitle}>
              {updatedValue.breakStartTime}, {updatedValue.breakEndTime}
            </Text>
          ) : (
            <Text>브레이크 타임 미설정</Text>
          )}
          <Button title="Save" onPress={() => handleUpdate()} />
        </View>
      )}

      {updatedKey === 'closedDays' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>Editing {updatedKey}</Text>
          {updatedValue ? (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.infoHidetext}>매주 </Text>
              <Text style={styles.closetext}>
                {translateDays(updatedValue)}
              </Text>
              <Text style={styles.closetext}> 휴무</Text>
            </View>
          ) : (
            <Text style={styles.infoHidetext}>휴무일 없음</Text>
          )}
          <Button title="Save" onPress={() => handleUpdate()} />
        </View>
      )}

      {updatedKey === 'hasScreen' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>Editing {updatedKey}</Text>
          {updatedValue ? (
            <Text style={styles.infoHidetext}>매장 내 스크린(TV) 설치</Text>
          ) : (
            <Text style={styles.infoHidetext}>매장 내 스크린(TV) 미설치</Text>
          )}
          <Button title="Save" onPress={() => handleUpdate()} />
        </View>
      )}

      {updatedKey === 'isGroupAvailable' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>Editing {updatedKey}</Text>
          {updatedValue ? (
            <Text style={styles.infoHidetext}>10인 이상 가능</Text>
          ) : (
            <Text style={styles.infoHidetext}>10인 이상 불가능</Text>
          )}
          <Button title="Save" onPress={() => handleUpdate()} />
        </View>
      )}
      {updatedKey === 'contact' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>Editing {updatedKey}</Text>
          <TextInput
            style={styles.input}
            defaultValue={updatedValue}
            onChangeText={text => setUpdatedValue(text)}
          />
          <Button title="Save" onPress={() => handleUpdate()} />
        </View>
      )}

      {updatedKey === 'description' && (
        <View style={styles.bottomSheetContent}>
          <Text style={styles.title}>Editing {updatedKey}</Text>
          <TextInput
            multiline
            style={styles.input}
            defaultValue={updatedValue}
            onChangeText={text => setUpdatedValue(text)}
          />
          <Button title="Save" onPress={() => handleUpdate()} />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default UpdateBottomSheet;
