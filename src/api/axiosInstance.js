import axios from 'axios';
import {functionError} from './errorHandler';

import {getAccessToken} from '../storage/tokenStorage';
// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: 'http://43.203.91.148:8080/api', // 공통 URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 10초 타임아웃
});

// 요청 인터셉터 설정
axiosInstance.interceptors.request.use(
  async config => {
    try {
      // AsyncStorage에서 토큰 가져오기
      const token = await getAccessToken();
      if (token) {
        // 'x-auth-token' 헤더에 토큰 설정
        config.headers['x-auth-token'] = token;
      }
    } catch (error) {
      functionError(error); // 에러 처리
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
