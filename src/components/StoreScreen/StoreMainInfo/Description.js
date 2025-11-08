import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import ColorUtil from '../../../utils/ColorUtil';

const Description = ({description, descripexpanded, toggleDescription}) => {
  const [lineCount, setLineCount] = useState(0);

  if (!description) {
    return null;
  }

  const handleTextLayout = e => {
    setLineCount(e.nativeEvent.lines.length);
  };

  return (
    <Pressable onPress={toggleDescription} style={styles.container}>
      <View>
        <Text
          style={[styles.text, styles.measure]}
          onTextLayout={handleTextLayout}>
          {description}
        </Text>
        <Text
          style={styles.text}
          numberOfLines={descripexpanded ? undefined : 2}>
          {description}
        </Text>
      </View>
      {lineCount > 2 && (
        <View style={styles.toggleIcon}>
          {descripexpanded ? (
            <Entypo name="chevron-small-up" size={20} color="#767676" />
          ) : (
            <Entypo name="chevron-small-down" size={20} color="#767676" />
          )}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 18,
  },
  text: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    lineHeight: 20,
    color: ColorUtil.subText,
    marginTop: 3,
    marginBottom: 5,
  },
  measure: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
  },
  toggleIcon: {
    marginLeft: 6,
    paddingTop: 2,
  },
});

export default Description;
