import React, {useEffect, useRef, useState} from 'react';
import {View, Pressable, Text, StyleSheet, Animated} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

const AppInfo = ({scrollRef, navigation}) => {
  const [toggle, setToggle] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  const handleAgreeScreen = screen => {
    if (screen === 'terms') {
      navigation.navigate('OAuthStack', {
        screen: 'TermsAgreeScreen',
      });
    } else if (screen === 'privacy') {
      navigation.navigate('OAuthStack', {
        screen: 'PrivacyAgreeScreen',
      });
    } else if (screen === 'location') {
      navigation.navigate('OAuthStack', {
        screen: 'LocationAgreeScreen',
      });
    }
  };

  useEffect(() => {
    if (toggle) {
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 100, // 내용 높이 (필요시 맞게 조정)
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // 펼쳐진 후 스크롤
        // setTimeout(() => {
        //   scrollRef?.current?.scrollToEnd({animated: true});
        // }, 50);
      });
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
  }, [toggle, scrollRef]);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setToggle(prev => !prev)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 5,
        }}>
        <Text style={[styles.toggletext, {marginRight: 1}]}>
          스피릿 사업자 정보
        </Text>
        {!toggle && (
          <Entypo name="chevron-small-right" size={20} color="#777" />
        )}
        {toggle && <Entypo name="chevron-small-up" size={20} color="#777" />}
      </Pressable>

      <Animated.View
        style={{
          overflow: 'hidden',
          height: animatedHeight,
          opacity: animatedOpacity,
        }}>
        <Text style={styles.buttonText}>사업자: 스피릿</Text>
        <Text style={styles.buttonText}>대표자: 윤준서 김경모 김민</Text>
        <Text style={styles.buttonText}>
          주소: 경기 용인시 기흥구 사은로 126번길 48
        </Text>
        <Text style={styles.buttonText}>연락처: team19spirit@gmail.com</Text>
      </Animated.View>

      <View style={{flexDirection: 'row'}}>
        <Pressable onPress={() => handleAgreeScreen('terms')}>
          <Text style={styles.buttonText}>서비스 이용약관</Text>
        </Pressable>
        <View style={styles.divider} />
        <Pressable onPress={() => handleAgreeScreen('privacy')}>
          <Text style={styles.buttonText}>개인정보 처리방침</Text>
        </Pressable>
        <View style={styles.divider} />
        <Pressable onPress={() => handleAgreeScreen('location')}>
          <Text style={styles.buttonText}>위치정보 이용약관</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 20,
    width: '100%',
  },
  toggletext: {
    fontSize: 12,
    color: '#777',
  },
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
