import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const OperateBottomSheetHeader = ({title, onClose}) => {
  return (
    <View style={styles.bottomSheetHeader}>
      <Text style={styles.sheetTitle}>{title}</Text>
      <Pressable onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={25} color="4B4B4B" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  closeButton: {
    padding: 5,
  },
});

export default OperateBottomSheetHeader;
