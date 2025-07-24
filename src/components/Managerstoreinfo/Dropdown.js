import React, {useState} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Entypo';

const Dropdown = ({label, options, selectedValue, onValueChange}) => {
  const [open, setOpen] = useState(false);

  const selectedLabel =
    options.find(item => item.value === selectedValue)?.label || '선택';

  const onSelect = value => {
    onValueChange(value);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {/* 버튼 */}
      <TouchableOpacity
        style={[styles.button, open && styles.buttonSelected]}
        onPress={() => setOpen(prev => !prev)}>
        <View style={styles.buttonInner}>
          <Text
            style={[
              styles.buttonText,
              open && {color: '#16BBFF', fontFamily: 'Pretendard-SemiBold'},
            ]}>
            {selectedLabel}
          </Text>
          <Entypo
            name={open ? 'chevron-small-up' : 'chevron-small-down'}
            size={22}
            color={open ? '#16BBFF' : '#333'}
            style={styles.icon}
          />
        </View>
      </TouchableOpacity>

      {/* 드롭다운 리스트 */}
      {open && (
        <View
          style={[
            styles.dropdown,
            options.length > 4 && {maxHeight: 180},
            Platform.select({
              ios: styles.shadowIos,
              android: styles.shadowAndroid,
            }),
          ]}>
          <ScrollView>
            {options.map(item => {
              const isSelected = item.value === selectedValue;
              return (
                <Pressable
                  key={item.value}
                  style={({pressed}) => [
                    styles.item,
                    pressed && {backgroundColor: '#f4f9ff'},
                    isSelected && styles.itemSelected,
                  ]}
                  onPress={() => onSelect(item.value)}>
                  <Text
                    style={[
                      styles.itemText,
                      isSelected && styles.itemTextSelected,
                    ]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default Dropdown;

const styles = StyleSheet.create({
  container: {
    width: '30%',
    position: 'relative',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
    textAlign: 'center',
  },
  button: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  buttonSelected: {
    borderColor: '#16BBFF',
  },
  buttonInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonText: {
    flexShrink: 1,
    fontSize: 14,
    color: '#333',
    fontFamily: 'Pretendard-Medium',
  },
  icon: {
    marginLeft: 8,
  },
  dropdown: {
    position: 'absolute',
    top: 65,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginTop: 4,
    overflow: 'hidden',
    zIndex: 1000,
  },
  // iOS/Android 그림자 스타일
  shadowIos: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  shadowAndroid: {
    elevation: 3,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  itemSelected: {
    backgroundColor: '#f0faff',
  },
  itemText: {
    fontSize: 14,
    color: '#333',
  },
  itemTextSelected: {
    color: '#16BBFF',
    fontFamily: 'Pretendard-SemiBold',
  },
});
