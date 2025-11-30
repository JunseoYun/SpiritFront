// -------------------- AIExploreScreen (사진 동일하게 리디자인) -----------------------

import React, {useState, useLayoutEffect} from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomText from '../../utils/CustomText';
import CustomTextInput from '../../utils/CustomTextInput';
import LinearGradient from 'react-native-linear-gradient';
import {useToast} from '../../context/ToastContext';
import ColorUtil from '../../utils/ColorUtil';
import AIMicIcon from '../../assets/svg/AIMicIcon';
import MenuIcon from '../../assets/svg/MenuIcon';

const AIExploreScreen = ({navigation}) => {
  const {showToast} = useToast();
  const [prompt, setPrompt] = useState('');

  const suggestions = [
    {keyword: '늦게까지 하는', subtext: '호프집 알려줘'},
    {keyword: '회식하기 좋은', subtext: '이자카야 추천해줘'},
    {keyword: '축구 보면서', subtext: '한잔하기 좋은 곳 알려줘'},
    {keyword: '가성비 좋은', subtext: '술집 추천해줘'},
    {keyword: '단체 가기 편한', subtext: '술집 어디 있어?'},
    {keyword: '분위기 깔끔한', subtext: '바 추천해줘'},
    {keyword: '안주 잘하는', subtext: '술집 찾아줘'},
  ];

  const submit = () => {
    if (!prompt.trim()) {
      showToast('한잔하고 싶은 술집을 입력해주세요', 'center');
      return;
    }
    showToast('AI 탐색 준비중...', 'center');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => null,
      headerShadowVisible: false,
      headerLeft: () => (
        <Pressable
          style={{marginLeft: 18}}
          hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
          <MenuIcon size={10} />
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/** ─────────── MAIN CONTENT ─────────── */}
        <View style={styles.center}>
          <CustomText style={styles.title}>
            오늘은 어디서 한잔할까요?
          </CustomText>
        </View>

        <View style={styles.suggestionWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}>
            {suggestions.map(({keyword, subtext}) => {
              const fullText = `${keyword} ${subtext}`;
              return (
                <LinearGradient
                  key={keyword}
                  colors={['#3CBBFF', '#30D4F9', '#9A6CFF']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.chipBorder}>
                  <Pressable
                    style={styles.chip}
                    onPress={() => setPrompt(fullText)}>
                    <CustomText style={styles.chipKeyword}>
                      {keyword}
                    </CustomText>
                    <CustomText style={styles.chipSubtext}>
                      {subtext}
                    </CustomText>
                  </Pressable>
                </LinearGradient>
              );
            })}
          </ScrollView>
        </View>

        {/** ─────────── INPUT FIELD ─────────── */}
        <View style={[styles.bottomInput]}>
          <View style={styles.inputBox}>
            <CustomTextInput
              placeholder="한잔하고 싶은 술집을 입력하세요"
              value={prompt}
              onChangeText={setPrompt}
              returnKeyType="send"
              onSubmitEditing={submit}
              placeholderTextColor="#b0b0b0"
              style={styles.input}
            />
            <AIMicIcon size={18} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  flex: {
    flex: 1,
  },

  // CENTER SECTION
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Pretendard-Regular',
    color: '#333',
    textAlign: 'center',
    marginBottom: 70,
  },

  chipRow: {
    paddingHorizontal: 12,
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
    fontFamily: 'Pretendard-Bold',
    lineHeight: 15 * 1.3,
    letterSpacing: 0,
  },
  chipSubtext: {
    fontSize: 14,
    color: ColorUtil.subText,
    fontFamily: 'Pretendard-Regular',
    marginTop: 2,
  },

  // INPUT SECTION
  bottomInput: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    alignItems: 'center',
    paddingTop: 12,
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  inputBox: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFF',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Pretendard-Regular',
  },
});

export default AIExploreScreen;
