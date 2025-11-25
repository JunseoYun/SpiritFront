import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import ColorUtil from '../../../utils/ColorUtil';
import CustomText from '../../common/CustomText';

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
        <CustomText
          style={[styles.text, styles.measure]}
          onTextLayout={handleTextLayout}>
          {description}
        </CustomText>
        <CustomText
          style={styles.text}
          numberOfLines={descripexpanded ? undefined : 2}>
          {description}
        </CustomText>
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
