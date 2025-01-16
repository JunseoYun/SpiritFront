import React, {useEffect} from 'react';
import {
  Button,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  loginWithKakaoAccount,
  getProfile,
  logout,
} from '@react-native-seoul/kakao-login';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {setToken, removeToken} from '../../../storage/tokenStorage';
import {useAuth} from '../../../context/AuthContext';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {userLogin} from '../../../api/userApi';

const NicknameScreen = ({navigation}) => {
  return <SafeAreaView style={styles.background}></SafeAreaView>;
};

const styles = StyleSheet.create({});

export default NicknameScreen;
