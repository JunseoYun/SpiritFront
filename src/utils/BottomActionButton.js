import React from 'react';
import {View, Pressable, Text, StyleSheet, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ColorUtil from './ColorUtil';

/**
 * BottomActionButton (실시간 주문하기 UI + 2:8 비율)
 */
const BottomActionButton = ({
  label = '확인',
  onPress,
  disabled = false,
  cancel = false,
  cancelLabel = '취소',
  onCancel,
  type = null,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        type === 'simple' ? styles.simpleContainer : styles.container,
        {
          paddingBottom:
            Platform.OS === 'android' ? insets.bottom + 20 : insets.bottom + 10,
        },
      ]}>
      <View style={styles.row}>
        {cancel && (
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelLabel} allowFontScaling={false}>
              {cancelLabel}
            </Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.button, disabled && styles.disabledButton]}
          onPress={onPress}
          disabled={disabled}>
          <Text
            style={[styles.label, disabled && styles.disabledLabel]}
            allowFontScaling={false}>
            {label}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 10,
  },
  simpleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 16,
    zIndex: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cancelButton: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  cancelLabel: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#666',
  },
  button: {
    flex: 4,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ColorUtil.main,
    borderRadius: 9,
  },
  disabledButton: {
    backgroundColor: ColorUtil.mainDisable,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },
  disabledLabel: {
    opacity: 0.8,
  },
});

export default BottomActionButton;
