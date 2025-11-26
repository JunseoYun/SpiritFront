import React, {useEffect, useRef, useState} from 'react';
import {View, Pressable, Text, StyleSheet, Animated} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import {normalizeFont} from '../../hooks/normalizeFont';
import CustomText from '../../utils/CustomText';

const AppInfo = ({scrollRef, navigation}) => {
  const [toggle, setToggle] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  const handleAgreeScreen = screen => {
    navigation.navigate('OAuthStack', {
      screen:
        screen === 'terms'
          ? 'TermsAgreeScreen'
          : screen === 'privacy'
          ? 'PrivacyAgreeScreen'
          : 'LocationAgreeScreen',
    });
  };

  // 토글 애니메이션
  useEffect(() => {
    if (toggle) {
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: contentHeight || 100, // 높이 아직 측정 안됐으면 임시값
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [toggle, contentHeight]);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setToggle(prev => !prev)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 5,
        }}>
        <CustomText style={[styles.toggletext, {marginRight: 1}]}>
          스피릿 사업자 정보
        </CustomText>
        {!toggle ? (
          <Entypo name="chevron-small-right" size={20} color="#777" />
        ) : (
          <Entypo name="chevron-small-down" size={20} color="#777" />
        )}
      </Pressable>

      <Animated.View
        style={{
          overflow: 'hidden',
          height: animatedHeight,
          opacity: animatedOpacity,
        }}>
        {/* 높이 측정용 뷰 */}
        <View
          style={{opacity: 0, position: 'absolute'}}
          onLayout={event => {
            const {height} = event.nativeEvent.layout;
            if (contentHeight === 0) setContentHeight(height);
          }}>
          <CustomText style={styles.buttonText}>사업자: 스피릿</CustomText>
          <CustomText style={styles.buttonText}>
            대표자: 윤준서 김경모 김민
          </CustomText>
          <CustomText style={styles.buttonText}>
            주소: 경기 용인시 기흥구 사은로 126번길 48
          </CustomText>
          <CustomText style={styles.buttonText}>
            연락처: team19spirit@gmail.com
          </CustomText>
        </View>

        {/* 실제 보이는 뷰 */}
        <View>
          <CustomText style={styles.buttonText}>사업자: 스피릿</CustomText>
          <CustomText style={styles.buttonText}>
            대표자: 윤준서 김경모 김민
          </CustomText>
          <CustomText style={styles.buttonText}>
            주소: 경기 용인시 기흥구 사은로 126번길 48
          </CustomText>
          <CustomText style={styles.buttonText}>
            연락처: team19spirit@gmail.com
          </CustomText>
        </View>
      </Animated.View>

      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        <Pressable onPress={() => handleAgreeScreen('terms')}>
          <CustomText style={styles.buttonText}>서비스 이용약관</CustomText>
        </Pressable>
        <View style={styles.divider} />
        <Pressable onPress={() => handleAgreeScreen('privacy')}>
          <CustomText style={styles.buttonText}>개인정보 처리방침</CustomText>
        </Pressable>
        <View style={styles.divider} />
        <Pressable onPress={() => handleAgreeScreen('location')}>
          <CustomText style={styles.buttonText}>위치정보 이용약관</CustomText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    width: '100%',
  },
  toggletext: {fontSize: 12, color: '#777'},
  buttonText: {
    fontSize: 12,
    color: '#777',
    paddingVertical: 5,
  },
  divider: {
    width: 1,
    backgroundColor: '#777',
    height: 10,
    alignSelf: 'center',
    marginHorizontal: 10,
  },
});

export default AppInfo;
