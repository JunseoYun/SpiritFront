import axiosInstance from './axiosInstance';
import {userAxiosInstance} from './axiosInstance';
import {functionError} from './errorHandler';
import {getRefreshToken} from '../storage/tokenStorage';
import axios from 'axios';
import Config from 'react-native-config';
import {getGlobalShowAlert} from '../context/CustomAlertContext';
export const user_login = async (
  socialType,
  socialId,
  accessToken,
  fcmToken,
) => {
  const data = {
    socialInfoDto: {
      socialType: socialType, // 소셜 로그인 타입 (예: KAKAO)
      socialId: socialId, // 소셜 로그인 ID
    },
    socialToken: accessToken, // 소셜 액세스 토큰
    fcmToken: fcmToken,
  };

  try {
    const response = await userAxiosInstance.post(`/auth/login`, data); // 요청 본문 전달
    return response.data.data; // 응답 데이터 반환
  } catch (error) {
    functionError(error); // 에러 처리
    throw error;
  }
};

export const user_logout = async () => {
  try {
    const refreshToken = await getRefreshToken();

    const response = await axios.post(
      `https://${Config.AUTH_URL}/api/auth/logout`,
      {}, // 👈 body는 비우고
      {
        headers: {
          'x-auth-token': refreshToken, // 👈 헤더는 세 번째 인자에!
        },
      },
    );
  } catch (error) {
    console.error('❌ logout error:', error.response);
    functionError(error);
    throw error;
  }
};

export const user_register = async (
  socialType,
  socialId,
  nickname,
  mokDataId,
) => {
  const data = {
    socialInfoDto: {
      socialType: socialType, // 소셜 로그인 타입 (예: KAKAO)
      socialId: socialId, // 소셜 로그인 ID
    },
    nickname: nickname, // 소셜 액세스 토큰
    mokDataId: mokDataId,
  };

  try {
    await userAxiosInstance.post(`/auth/register`, data); // 요청 본문 전달
  } catch (error) {
    functionError(error); // 에러 처리
    throw error;
  }
};

export const user_register_tester = async (socialType, socialId, nickname) => {
  const data = {
    socialInfoDto: {
      socialType: socialType, // 소셜 로그인 타입 (예: KAKAO)
      socialId: socialId, // 소셜 로그인 ID
    },
    nickname: nickname, // 소셜 액세스 토큰
  };

  try {
    await userAxiosInstance.post(`/auth/register-tester`, data); // 요청 본문 전달
  } catch (error) {
    functionError(error); // 에러 처리
    throw error;
  }
};

export const check_nickName = async nickname => {
  try {
    const response = await userAxiosInstance.post(
      `/auth/check-nickname`,
      null,
      {
        params: {nickname}, // 쿼리 파라미터로 전달
      },
    );

    return response.data.data; // 응답 데이터 반환
  } catch (error) {
    // functionError(error); // 에러 처리
    throw error;
  }
};

export const Userdataget = async () => {
  try {
    const response = await userAxiosInstance.get(`/auth/get`, {});
    return response.data.data;
  } catch (error) {
    console.error(error.response);
    functionError(error); // 에러 처리
    throw error;
  }
};
export const user_withdraw = async () => {
  try {
    const response = await axiosInstance.delete(`/auth/withdraw`, {});
    return response.data.data;
  } catch (error) {
    functionError(error); // 에러 처리
    throw error;
  }
};

export const Userputnickname = async nickname => {
  try {
    await userAxiosInstance.put(`/auth/update-nickname?nickname=${nickname}`);
  } catch (error) {
    throw error;
  }
};

export const Userimgpost = async formData => {
  try {
    await userAxiosInstance.post(`/auth/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // 파일 업로드는 multipart/form-data
      },
    });
  } catch (error) {
    functionError(error); // 에러 처리
    throw error;
  }
};

export const Userimgdelete = async () => {
  try {
    await userAxiosInstance.delete(`/auth/delete-image`, {});
  } catch (error) {
    functionError(error); // 에러 처리
    throw error;
  }
};

export const user_personalInfo_add = async (mokDataId, accessToken) => {
  try {
    const response = await axios.post(
      `https://${Config.AUTH_URL}/api/auth/personal-info/add?mokDataId=${mokDataId}`,
      {}, // ✅ body 비우고
      {
        headers: {
          'x-auth-token': accessToken,
        },
      },
    );
  } catch (error) {
    console.error('❌ personal-info-add error:', error.response);
    functionError(error);
    throw error;
  }
};

export const user_merge = async (originalSocialInfoDto, newSocialInfoDto) => {
  const data = {
    originalSocialInfoDto,
    newSocialInfoDto,
  };

  try {
    const response = await axios.post(
      `https://${Config.BASE_URL}/api/auth/merge`,
      data, // ✅ body를 그대로 전달
    );
  } catch (error) {
    console.error(error.response);
    functionError(error);
    throw error;
  }
};

export const user_push_consent = async isAgreed => {
  try {
    await userAxiosInstance.put(`/auth/push-consent/update/${isAgreed}`);
  } catch (error) {
    throw error;
  }
};

export const user_marketing_consent = async isAgreed => {
  const showAlert = getGlobalShowAlert();
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  const nowDate = `${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`;

  try {
    await userAxiosInstance.put(`/auth/marketing-consent/update/${isAgreed}`);
    if (isAgreed) {
      // 수신 동의 시
      showAlert({
        title: '마케팅정보 앱 푸시 알림 수신 동의 안내',
        message: `전송자: 한잔할까\n동의 일시: ${nowDate}\n처리내용: 수신동의 처리 완료`,
      });
    } else {
      // 수신 거부(철회) 시
      showAlert({
        title: '마케팅정보 앱 푸시 알림 수신 거부 안내',
        message: `전송자: 한잔할까\n거부 일시: ${nowDate}\n처리내용: 수신거부 처리 완료`,
      });
    }
  } catch (error) {
    throw error;
  }
};

export const user_personalInfo_update = async mokDataId => {
  try {
    const response = await userAxiosInstance.put(
      `/auth/personal-info/update`,
      null,
      {
        params: {mokDataId},
      },
    );
  } catch (error) {
    console.error('UserInfo:', error.response);
    throw error;
  }
};
