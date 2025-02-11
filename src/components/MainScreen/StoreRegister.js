import React from 'react';
import {View, Pressable, Text, StyleSheet} from 'react-native';

const StoreRegister = ({
  storeactiveIndex,
  handlestoreItemClick,
  handlestoreItemOut,
}) => {
  const options = [
    {
      id: 0,
      title: '매장등록',
      description: '다른 사람과 공유할\n매장을 등록해 보세요!',
    },
    {
      id: 1,
      title: '매장 권한 등록',
      description: '전국의 사장님들은\n권한등록 부탁드려요!',
    },
  ];

  return (
    <View style={styles.StoreregView}>
      {options.map(option => (
        <Pressable
          key={option.id}
          style={[
            styles.StorereginnerView,
            storeactiveIndex === option.id && styles.storeactiveBorder,
          ]}
          onPress={() => handlestoreItemClick(option.id)}
          onPressOut={handlestoreItemOut}>
          <Text style={styles.StoreMainText}>{option.title}</Text>
          <Text style={styles.StoresubText}>{option.description}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  StoreregView: {
    flexDirection: 'row',
    height: 120,
    backgroundColor: '#EFF3F6',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    marginTop: 15,
  },
  StorereginnerView: {
    borderRadius: 10,
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 15,
    backgroundColor: 'white',
    width: '47%',
    alignItems: 'flex-start',
    padding: 10,
  },
  storeactiveBorder: {
    borderColor: 'skyblue',
  },
  StoreMainText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
  },
  StoresubText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 7,
    color: '#333',
  },
});

export default StoreRegister;
