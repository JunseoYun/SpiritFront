import axiosInstance from "./axiosInstance";
import { functionError} from "./errorHandler";

export const userLogin = async (type, id, accessToken) => {
  const data = {
    socialInfoDto: {
      type: type, // 소셜 로그인 타입 (예: KAKAO)
      id: id,     // 소셜 로그인 ID
    },
    socialToken: accessToken, // 소셜 액세스 토큰
  };

  console.log("Request Data:", data);

  try {
    const response = await axiosInstance.post(`/auth/login`, data); // 요청 본문 전달

    // 반환되는 accessToken과 refreshToken 저장
    const { accessToken, refreshToken } = response.data.data;

    console.log("Login Response Data:", response.data.data);
    return response.data.data; // 응답 데이터 반환
  } catch (error) {
    functionError(error); // 에러 처리
    throw error;
  }
};
