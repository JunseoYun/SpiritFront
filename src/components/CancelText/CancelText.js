import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {normalizeFont} from '../../hooks/normalizeFont';

const CancelText = ({rightnum, topnum, paddingnum, handlecancel, size}) => {
  return (
    <TouchableOpacity
      accessibilityLabel="clear name"
      style={{
        position: 'absolute',
        right: rightnum,
        top: topnum,
        padding: paddingnum,
      }}
      onPress={() => handlecancel('')}>
      <MaterialIcons name="cancel" size={size} color="#999" />
    </TouchableOpacity>
  );
};

export default CancelText;
