import React from 'react';
import {StyleSheet, View, Pressable, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {normalizeFont} from '../../../hooks/normalizeFont';

const StoreManageActionButtons = ({actions = []}) => {
  if (!actions.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      {actions.map(action => (
        <View key={action.key || action.label} style={styles.buttonWrapper}>
          <Pressable style={styles.button} onPress={action.onPress}>
            <Ionicons
              name={action.icon?.name}
              size={action.icon?.size ?? 20}
              color={action.icon?.color ?? '#525D6F'}
            />
          </Pressable>
          <Text style={styles.buttonLabel}>{action.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 30,
  },
  buttonWrapper: {
    alignItems: 'center',
  },
  button: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    marginBottom: 3,
    borderColor: '#EFEFEF',
    borderWidth: 1,
  },
  buttonLabel: {
    color: '#333',
    fontSize: normalizeFont(13, 1.5),
    fontFamily: 'Pretendard-Regular',
  },
});

export default StoreManageActionButtons;
