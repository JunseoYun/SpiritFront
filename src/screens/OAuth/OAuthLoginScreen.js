import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  login,
  getProfile,
  loginWithKakaoAccount,
} from '@react-native-seoul/kakao-login';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {appleAuth} from '@invertase/react-native-apple-authentication';

import {log_access_create, user_login} from '../../api/userApi';
import {useAuth} from '../../context/AuthContext';
import Config from 'react-native-config';
import FastImage from 'react-native-fast-image';
import {useToast} from '../../context/ToastContext';
import {getFcmToken} from '../../hooks/notification/useNotificationPermission';
import Loading from '../../hooks/Loading';
import CustomText from '../../utils/CustomText';

const OAuthLoginScreen = ({navigation, isTestEnabled}) => {
  const {loginauth} = useAuth();
  const {showToast} = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
      iosClientId: Config.GOOGLE_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  /** ======================= 🔥 공통 로그인 로직 ======================= **/
  const handleLogin = async ({
    socialType,
    socialId,
    identityToken,
    tester,
    authorizationCode,
  }) => {
    setLoading(true);
    const fcmToken = await getFcmToken();

    try {
      const response = await user_login(
        socialType,
        socialId,
        identityToken,
        fcmToken,
        authorizationCode,
      );

      // 🔹 인증 미완료 → 본인인증
      if (!response.isVerified) {
        navigation.navigate('IdentityScreen', {
          socialType,
          socialId,
          identityToken,
          authorizationCode,
          beforeScreen: 'Login',
          token: response,
          fcmToken,
        });
      } else {
        await loginauth(
          response.accessToken,
          response.refreshToken,
          response.marketingConsent,
        );
        await log_access_create();
      }
    } catch (error) {
      if (error.response?.status === 404) {
        navigation.navigate('AgreeScreen', {
          socialType,
          socialId,
          identityToken,
          authorizationCode,
          fcmToken,
          isTestEnabled: tester,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /** ======================= 🟡 Kakao Login ======================= **/
  const handleKaKaoLogin = async () => {
    try {
      let token = await login().catch(() => loginWithKakaoAccount());
      const profile = await getProfile();
      handleLogin({
        socialType: 'KAKAO',
        socialId: profile.id,
        identityToken: token.accessToken,
      });
    } catch (_) {}
  };

  /** ======================= 🔵 Google Login ======================= **/
  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      handleLogin({
        socialType: 'GOOGLE',
        socialId: userInfo.data.user.id,
        identityToken: userInfo.data.idToken,
        authorizationCode: userInfo.data.serverAuthCode,
      });
    } catch (error) {
      if (error.code === '7')
        showToast('인터넷 연결을 확인해 주세요.', 'center');
    }
  };

  /** ======================= ⚪ Apple Login ======================= **/
  const handleAppleSignIn = async (tester = false) => {
    if (Platform.OS !== 'ios') return;

    try {
      const res = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      if (
        (await appleAuth.getCredentialStateForUser(res.user)) ===
        appleAuth.State.AUTHORIZED
      ) {
        handleLogin({
          socialType: 'APPLE',
          socialId: res.user,
          identityToken: res.identityToken,
          authorizationCode: res.authorizationCode,
          tester,
        });
      }
    } catch (_) {}
  };

  /** ======================= UI ======================= **/
  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'android' && (
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      )}

      {/* ============= TOP LOGO ============= */}
      <View style={styles.logoArea}>
        <FastImage
          source={require('../../assets/AppName.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <CustomText style={styles.subtitle}>
          한잔하고 싶은 당신을 위한 서비스
        </CustomText>
      </View>

      {/* ============= LOGIN BUTTONS ============= */}
      <View style={styles.buttonSection}>
        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <CustomText style={styles.dividerText}>다음으로 로그인</CustomText>
          <View style={styles.divider} />
        </View>

        {/* Kakao */}
        <TouchableOpacity
          onPress={handleKaKaoLogin}
          style={[styles.btn, {backgroundColor: '#FEE500'}]}>
          <FastImage
            source={require('../../assets/kakao-symbol.png')}
            style={styles.icon}
          />
          <CustomText style={styles.btnText}>카카오로 로그인</CustomText>
        </TouchableOpacity>

        {/* Google */}
        <TouchableOpacity onPress={handleGoogleSignIn} style={styles.btn}>
          <FastImage
            source={require('../../assets/g-logo.png')}
            style={styles.icon}
          />
          <CustomText style={styles.btnText}>Google 로그인</CustomText>
        </TouchableOpacity>

        {/* Apple */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            onPress={() => handleAppleSignIn(false)}
            style={[styles.btn, {gap: 1}]}>
            <FastImage
              source={require('../../assets/appleLogo.png')}
              style={styles.appleIcon}
            />
            <CustomText style={[styles.btnText, styles.appleText]}>
              Apple 로그인
            </CustomText>
          </TouchableOpacity>
        )}

        {/* Tester Button */}
        {isTestEnabled && Platform.OS === 'ios' && (
          <TouchableOpacity
            onPress={() => handleAppleSignIn(true)}
            style={{marginTop: 10}}>
            <CustomText
              style={{
                color: '#555',
                fontFamily: 'Pretendard-SemiBold',
                alignSelf: 'center',
              }}>
              APPLE TESTER
            </CustomText>
          </TouchableOpacity>
        )}
      </View>

      {loading && <Loading loading />}
    </SafeAreaView>
  );
};

/* ======================= 🎨 DESIGN STYLE ======================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logoArea: {
    // marginTop: 120,
    alignItems: 'center',
    position: 'absolute',
    top: '25%',
  },
  logo: {
    width: 210,
    height: 75,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    color: '#333',
    opacity: 0.8,
    lineHeight: 26,
    fontFamily: 'Pretendard-Medium',
  },

  buttonSection: {
    width: '100%',
    paddingHorizontal: 24,
    position: 'absolute',
    bottom: '15%',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  divider: {
    flex: 1,
    height: 0.8,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 15,
    color: '#444',
    fontFamily: 'Pretendard-SemiBold',
  },

  btn: {
    height: 54,
    borderRadius: 14,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 1.5,
  },

  icon: {width: 18, height: 18},
  appleIcon: {width: 40, height: 40},

  btnText: {
    fontSize: 15.5,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
  },
  appleText: {
    marginRight: 15,
  },
});

export default OAuthLoginScreen;
