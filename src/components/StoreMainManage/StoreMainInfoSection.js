import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ColorUtil from '../../utils/ColorUtil';

const INFO_FIELDS = [
  {key: 'name', icon: 'storefront'},
  {key: 'contact', icon: 'call'},
  {key: 'description', icon: 'chatbubble-ellipses'},
];

const StoreMainInfoSection = ({storeInfo}) => {
  return (
    <View style={styles.container}>
      {INFO_FIELDS.map(field => {
        const value = storeInfo?.[field.key];
        return (
          <View key={field.key} style={styles.row}>
            <Ionicons
              name={field.icon}
              size={19}
              color="#858B95"
              style={styles.icon}
            />
            <Text
              style={[
                styles.value,
                !value && styles.placeholderValue,
              ]}>
              {value || '등록된 정보가 없습니다.'}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    marginHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginRight: 20,
  },
  value: {
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    color: '#333',
    fontSize: 17,
  },
  placeholderValue: {
    color: ColorUtil.subText,
    fontFamily: 'Pretendard-Regular',
  },
});

export default StoreMainInfoSection;
