import axiosInstance from "./axiosInstance";

// 매장 데이터 가져오기
export const getStore = async () => {
  try {
    const response = await axiosInstance.get(
      `/store/get`,
    );
    return response.data.data; // API 응답 구조에 따라 수정
  } catch (error) {
    // 에러 처리
    if (error.response) {
      const {status, data, headers} = error.response;
      console.error('서버 에러 상세:', {
        status,
        data,
        headers,
      });

      if (status === 500) {
        console.error(
          '서버 내부 오류 (500):',
          data?.message || 'Unknown error',
        );
        alert('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        console.error(
          `API 요청 실패: 상태 코드 ${status}`,
          data?.message || 'Unknown error',
        );
        alert(`요청 중 문제가 발생했습니다. 상태 코드: ${status}`);
      }
    } else if (error.request) {
      console.error('서버 응답 없음:', error.request);
      alert('서버에서 응답이 없습니다. 네트워크 상태를 확인해주세요.');
    } else {
      console.error('요청 생성 중 에러 발생:', error.message);
      alert('요청 처리 중 문제가 발생했습니다. 다시 시도해주세요.');
    }

    // 기본값 반환 (null 또는 빈 배열 등)
    return null;
  }
};