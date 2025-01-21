import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';
import axios from 'axios';

export const user_login = async (type, id, accessToken) => {
  const data = {
    socialInfoDto: {
      type: type, // 소셜 로그인 타입 (예: KAKAO)
      id: id, // 소셜 로그인 ID
    },
    socialToken: accessToken, // 소셜 액세스 토큰
  };

  try {
    const response = await axiosInstance.post(`/auth/login`, data); // 요청 본문 전달

    return response.data.data; // 응답 데이터 반환
  } catch (error) {
    functionError(error); // 에러 처리
    throw error;
  }
};

export const user_register = async (type, id, nickname) => {
  const data = {
    socialInfoDto: {
      type: type, // 소셜 로그인 타입 (예: KAKAO)
      id: id, // 소셜 로그인 ID
    },
    nickname: nickname, // 소셜 액세스 토큰
  };

  try {
    await axiosInstance.post(`/auth/register`, data); // 요청 본문 전달
  } catch (error) {
    functionError(error); // 에러 처리
    throw error;
  }
};

export const check_nickName = async nickname => {
  try {
    const response = await axiosInstance.post(`/auth/check-nickname`, null, {
      params: {nickname}, // 쿼리 파라미터로 전달
    });

    return response.data.data; // 응답 데이터 반환
  } catch (error) {
    functionError(error); // 에러 처리
    throw error;
  }
};

export const Userdataget = async () => {
  try {
    const response = await axiosInstance.get(`/auth/get`, {});
    return response.data.data;
  } catch (error) {
    functionError(error); // 에러 처리
    throw error;
  }
};

export const Userputnickname = async nickname => {
  try {
    await axiosInstance.put(`/auth/update-nickname?nickname=${nickname}`);
  } catch (error) {
    console.log(error);
    functionError(error); // 에러 처리
    throw error;
  }
};
