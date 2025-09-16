import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const OperatingHoursCheckbox = ({isSameEveryday, is24, toggle24Hours}) => {
  return (
    <View style={styles.checkboxHeader}>
      <Text style={styles.checkboxLabel}>영업 시간</Text>
      <Pressable
        style={[
          styles.checkboxContainer,
          isSameEveryday ? styles.enabledCheckbox : styles.disabledCheckbox,
        ]}
        onPress={toggle24Hours}
        disabled={!isSameEveryday}>
        <View style={is24 ? styles.checkedBox : styles.uncheckedBox}>
          {is24 && <MaterialIcons name="check" size={15} color="#fff" />}
        </View>
        <Text style={styles.checkboxLabel24}>24시간 영업</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  checkboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    justifyContent: 'space-between',
    marginTop: 30,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 16,
    color: '#181A1A',
    fontFamily: 'Pretendard-Medium',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
  },
  enabledCheckbox: {
    backgroundColor: '#fff',
  },
  disabledCheckbox: {
    backgroundColor: '#f0f0f0',
  },
  checkedBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#45C9FF',
    marginRight: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckedBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#45C9FF',
    marginRight: 7,
  },
  checkboxLabel24: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Pretendard-Medium',
    textAlign: 'center',
  },
});

export default OperatingHoursCheckbox;
