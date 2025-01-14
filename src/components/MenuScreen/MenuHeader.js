import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
// import styles from '../../styles/MenuStyle';

const MenuHeader = ({storeId, navigation}) => {
  return (
    <View style={{width: '100%', alignItems: 'center'}}>
      <View style={styles.MenuaddView}>
        <Pressable
          style={styles.MenuaddButton}
          onPress={() =>
            navigation.navigate('MenuaddPage', {storeId: storeId})
          }>
          <Text style={styles.MenuaddButtonText}>메뉴 추가하기</Text>
        </Pressable>
      </View>
      <View style={styles.SignatureTextView}>
        <Text style={styles.SignatureText}>대표메뉴</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  MenuaddView: {
    width: '100%',
    marginVertical: 20,
    paddingHorizontal: 18,
  },
  MenuaddButton: {
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 10,
    borderColor: 'rgba(16, 190, 251, 0.7)',
    paddingVertical: 6,
  },
  MenuaddButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  SignatureTextView: {
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 18,
  },
  SignatureText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    paddingLeft: 3,
  },
});
export default MenuHeader;
