import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CancelText = ({
  rightnum,
  topnum,
  paddingnum,
  handlecancel,
  size,
  centerVertical = false,
}) => {
  const positioningStyle =
    centerVertical
      ? styles.centerVertical
      : topnum !== undefined && topnum !== null
      ? {top: topnum}
      : null;

  return (
    <TouchableOpacity
      accessibilityLabel="clear name"
      style={[
        styles.container,
        {right: rightnum, padding: paddingnum},
        positioningStyle,
      ]}
      onPress={() => handlecancel('')}>
      <MaterialIcons name="cancel" size={size} color="#999" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  centerVertical: {
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CancelText;
