import React from 'react';
import {View, Pressable, Text, StyleSheet} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const StoreRegister = ({storeactiveIndex, handlestoreItemClick}) => {
  const options = [
    {
      id: 0,
      title: '매장 등록',
      icon: 'plus-square',
    },
    {
      id: 1,
      title: '사장님 인증',
      icon: 'check-circle',
    },
  ];

  return (
    <View style={styles.StoreregView}>
      {options.map(option => (
        <Pressable
          key={option.id}
          style={[styles.StorereginnerView]}
          onPress={() => handlestoreItemClick(option.id)}>
          <View style={styles.iconCircle}>
            <Feather name={option.icon} size={24} color={'#16BBFF'} />
          </View>
          <View style={styles.textView}>
            <Text style={styles.StoreMainText}>{option.title}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  StoreregView: {
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: 18,
    borderRadius: 16,
    gap: 12,
  },
  StorereginnerView: {
    flex: 1,
    borderRadius: 16,
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeCard: {
    backgroundColor: '#EAF6FF',
    borderColor: '#007AFF',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
  },
  textView: {
    marginLeft: 12,
  },
  StoreMainText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#181a1a',
  },
});

export default StoreRegister;
