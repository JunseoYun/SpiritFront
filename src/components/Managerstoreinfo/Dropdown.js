import React, {useState} from 'react';
import {View, Text, Pressable, StyleSheet, ScrollView} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

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

      <Pressable
        style={[styles.button, open && styles.buttonSelected]}
        onPress={() => setOpen(prev => !prev)}>
        <View style={styles.buttonInner}>
          <Text style={styles.buttonText}>{selectedLabel}</Text>
          {open ? (
            <Entypo
              name="chevron-small-up"
              size={25}
              color="#333"
              style={styles.icon}
            />
          ) : (
            <Entypo
              name="chevron-small-down"
              size={25}
              color="#333"
              style={styles.icon}
            />
          )}
        </View>
      </Pressable>

      {open && (
        <View style={[styles.dropdown, options.length > 4 && {maxHeight: 160}]}>
          <ScrollView>
            {options.map(item => (
              <Pressable
                key={item.value}
                style={styles.item}
                onPress={() => onSelect(item.value)}>
                <Text
                  style={[
                    styles.itemText,
                    item.value === selectedValue && styles.itemTextSelected,
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
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
    marginBottom: 4,
    color: '#333',
    fontWeight: '600',
  },
  button: {
    height: 44,
    borderRadius: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#fff', // 흰색 배경
    borderWidth: 1, // 기본 테두리 추가
    borderColor: '#ccc', // 기본 테두리 색상 (연한 회색)
    width: '100%',
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
    color: '#000',
  },
  icon: {
    width: 20,
    textAlign: 'right',
  },
  dropdown: {
    position: 'absolute',
    top: 65,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#16BBFF',
    borderRadius: 6,
    backgroundColor: '#fff',
    zIndex: 1000,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#000',
  },
  itemTextSelected: {
    color: '#16BBFF',
    fontWeight: 'bold',
  },
});
