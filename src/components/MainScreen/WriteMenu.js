import React from 'react';
import {Animated, Platform, Pressable, StyleSheet, View} from 'react-native';
import CustomText from '../../utils/CustomText';

const WriteMenu = ({
  visible,
  bottomOffset,
  menuStyle,
  items,
  onClose,
  onItemPress,
  renderIcon,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFillObject, styles.container]}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[
          styles.menu,
          menuStyle,
          {
            bottom: bottomOffset ?? (Platform.OS === 'android' ? 40 : 50),
          },
        ]}>
        {items.map(item => (
          <Pressable
            key={item.key}
            style={styles.item}
            onPress={() => onItemPress(item.key)}>
            <View style={styles.icon}>{renderIcon(item)}</View>
            <CustomText style={styles.label}>{item.label}</CustomText>
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 6},
    elevation: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  label: {
    color: '#1B1B1B',
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    marginRight: 20,
  },
});

export default WriteMenu;
