import React from 'react';
import {Animated, Pressable, ScrollView, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomText from '../../utils/CustomText';
import ColorUtil from '../../utils/ColorUtil';

const AIExploreSuggestions = ({
  showChips,
  showRecordingUI,
  chipAnim,
  chipBottomSpacing,
  suggestions,
  onSelectSuggestion,
}) => {
  if (!showChips || showRecordingUI) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.suggestionWrap,
        {
          opacity: chipAnim,
          marginBottom: chipBottomSpacing,
        },
      ]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chipRow]}>
        {suggestions.map(({keyword, subtext}) => {
          const fullText = `${keyword} ${subtext}`;
          return (
            <LinearGradient
              key={keyword}
              colors={['#3CBBFF', '#30D4F9', '#9A6CFF']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.chipBorder}>
              <Pressable style={styles.chip} onPress={() => onSelectSuggestion(fullText)}>
                <CustomText style={styles.chipKeyword}>{keyword}</CustomText>
                <CustomText style={styles.chipSubtext}>{subtext}</CustomText>
              </Pressable>
            </LinearGradient>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  suggestionWrap: {
    alignSelf: 'stretch',
  },
  chipRow: {
    paddingHorizontal: 12,
    marginBottom: 2,
  },
  chipBorder: {
    marginHorizontal: 6,
    borderRadius: 16,
  },
  chip: {
    borderRadius: 14.5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    margin: 1.5,
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipKeyword: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Pretendard-Medium',
    lineHeight: 15 * 1.3,
    letterSpacing: 0,
  },
  chipSubtext: {
    fontSize: 14,
    color: ColorUtil.subText,
    fontFamily: 'Pretendard-Regular',
    marginTop: 2,
  },
});

export default AIExploreSuggestions;
