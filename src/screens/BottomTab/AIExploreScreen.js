import React, {useMemo, useState} from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomText from '../../utils/CustomText';
import ColorUtil from '../../utils/ColorUtil';
import {useToast} from '../../context/ToastContext';

const AIExploreScreen = () => {
  const {showToast} = useToast();
  const insets = useSafeAreaInsets();
  const [prompt, setPrompt] = useState('');

  const suggestions = useMemo(
    () => [
      '늦게까지 열려있는 포차 알려줘',
      '회식하기 좋은 이자카야 알려줘',
      '축구 보면서 한잔하기 좋은 곳?',
    ],
    [],
  );

  const handleSubmit = () => {
    const trimmed = prompt.trim();
    if (!trimmed.length) {
      showToast?.('한잔하고 싶은 순간을 입력해주세요', 'center');
      return;
    }
    showToast?.('AI 탐색을 준비 중입니다', 'center');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable style={styles.menuButton} hitSlop={10}>
              <Ionicons name="menu-outline" size={26} color="#1a1a1a" />
            </Pressable>
          </View>

          <View style={styles.content}>
            <CustomText maxScale={1.2} style={styles.question}>
              오늘은 어디서 한잔할까요?
            </CustomText>
            <View style={styles.chipWrap}>
              {suggestions.map(text => (
                <Pressable
                  key={text}
                  style={styles.chip}
                  onPress={() => setPrompt(text)}>
                  <CustomText maxScale={1.05} style={styles.chipText}>
                    {text}
                  </CustomText>
                </Pressable>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.promptBar,
              {paddingBottom: Math.max(insets.bottom, 12)},
            ]}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="한잔하고 싶은 순간을 입력하세요"
                placeholderTextColor={ColorUtil.placeholderText}
                value={prompt}
                onChangeText={setPrompt}
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
              />
            </View>
            <Pressable style={styles.sendButton} onPress={handleSubmit}>
              <LinearGradient
                colors={['#3CBBFF', '#30D4F9', '#9A6CFF']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.sendButtonGradient}>
                <Ionicons name="sparkles-outline" size={20} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 6,
    paddingBottom: 8,
    alignItems: 'flex-start',
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 4},
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ColorUtil.border,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  question: {
    fontSize: 19,
    fontFamily: 'Pretendard-SemiBold',
    color: ColorUtil.textPrimary,
    marginBottom: 26,
    textAlign: 'center',
  },
  chipWrap: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    marginHorizontal: 6,
    marginVertical: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3CBBFF',
    backgroundColor: '#F5FBFF',
    shadowColor: '#3CBBFF',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  chipText: {
    fontSize: 13,
    color: '#0F1522',
    fontFamily: 'Pretendard-Medium',
  },
  promptBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  inputContainer: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: ColorUtil.placeholderBorder,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: ColorUtil.textPrimary,
    padding: 0,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    overflow: 'hidden',
    marginLeft: 10,
  },
  sendButtonGradient: {
    flex: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AIExploreScreen;
AIExploreScreen;
