import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';

const MenuHeader = ({storeId, navigation}) => {
  return (
    <View style={{width: '100%', alignItems: 'center'}}>
      <View style={styles.MenuaddView}>
        <Pressable
          style={styles.MenuaddButton}
          onPress={() =>
            navigation.navigate('MenuAddScreen', {storeId: storeId})
          }>
          <Text style={styles.MenuaddButtonText}>메뉴 추가하기</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  MenuaddView: {
    width: '100%',
    marginTop: 30,
    marginBottom: 20,
    paddingHorizontal: 18,
  },
  MenuaddButton: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#45C9FF',
  },
  MenuaddButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    padding: 16,
  },
});
export default MenuHeader;
