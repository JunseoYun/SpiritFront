import axiosInstance from './axiosInstance';
import {userAxiosInstance} from './axiosInstance';
import {functionError} from './errorHandler';
import {getRefreshToken} from '../storage/tokenStorage';
import axios from 'axios';
import Config from 'react-native-config';

export const user_login = async (socialType, socialId, accessToken) => {
  const data = {
    socialInfoDto: {
      socialType: socialType, // 소셜 로그인 타입 (예: KAKAO)
      socialId: socialId, // 소셜 로그인 ID
    },
    socialToken: accessToken, // 소셜 액세스 토큰
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
    console.log('🔐 refreshToken:', refreshToken);

    const response = await axios.post(
      `https://${Config.AUTH_URL}/api/auth/logout`,
      {}, // 👈 body는 비우고
      {
        headers: {
          'x-auth-token': refreshToken, // 👈 헤더는 세 번째 인자에!
        },
      },
    );
    console.log('✅ logout response', response.data);
  } catch (error) {
    console.error('❌ logout error:', error.response?.data || error.message);
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
  console.log(socialType, socialId, nickname, mokDataId);
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

export const user_merge = async (originalSocialInfoDto, newSocialInfoDto) => {
  console.log(originalSocialInfoDto, newSocialInfoDto);
  const data = {
    originalSocialInfoDto,
    newSocialInfoDto,
  };

  try {
    const response = await axios.post(
      `https://${Config.BASE_URL}/api/auth/merge`,
      data, // ✅ body를 그대로 전달
    );
    console.log(response);
  } catch (error) {
    console.error(error.response);
    functionError(error);
    throw error;
  }
};
