import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

import LoginStyles from './LoginStyles';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  const handleEmailChange = text => {
    setEmail(text);
  };

  const handlePasswordChange = text => {
    setPassword(text);
  };

  const Login = () => { };

  return (
    <SafeAreaView>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={LoginStyles.container}>
          <View style={LoginStyles.box1}>
            <Image
              source={require('../../../assets/todaylogo.png')}
              style={LoginStyles.imageStyle}
            />
          </View>
          <View>
            <TextInput
              style={
                focusedInput === 'email'
                  ? [LoginStyles.input, LoginStyles.inputFocused]
                  : LoginStyles.input
              }
              value={email}
              onChangeText={handleEmailChange}
              placeholder="email"
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
            />
            <TextInput
              style={
                focusedInput === 'password'
                  ? [LoginStyles.input, LoginStyles.inputFocused]
                  : LoginStyles.input
              }
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="비밀번호"
              secureTextEntry
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
          <View style={LoginStyles.linksContainertext}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Pressable onPress={() => navigation.navigate('SignUpScreen')}>
                <Text style={LoginStyles.link}>회원가입</Text>
              </Pressable>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={LoginStyles.separator}></Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Pressable onPress={() => navigation.navigate('FindPwdScreen')}>
                <Text style={LoginStyles.link}>비밀번호 찾기</Text>
              </Pressable>
            </View>
          </View>
          <View>
            <Pressable style={LoginStyles.LoginButton} onPress={Login}>
              <Text style={LoginStyles.LoginButtonText}>로그인</Text>
            </Pressable>
          </View>

          <View>
            <Pressable style={LoginStyles.LoginButton} onPress={() => navigation.navigate('OAuthScreen')}>
              <Text style={LoginStyles.LoginButtonText}>소셜 로그인</Text>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default LoginScreen;
