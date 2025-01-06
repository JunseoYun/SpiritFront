import React from 'react';
import {Pressable, Text} from 'react-native';
import styles from './StoreStyle';

const StoreSubmitButton = ({StoreAdd}) => {
  return (
    <Pressable style={styles.savebutton} onPress={StoreAdd}>
      <Text style={styles.savebuttontext}>작성 완료</Text>
    </Pressable>
  );
};

export default StoreSubmitButton;
