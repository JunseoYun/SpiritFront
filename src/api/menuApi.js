import axiosInstance from './axiosInstance';

export const StoreMenuget = async storeId => {
  try {
    const response = await axiosInstance.get(
      `/menu/getByStoreId/${storeId}`,
      {},
    );
    return response.data.data;
  } catch (error) {
    functionerror(error);
  }
};

export const StoreMenudelete = async selectedMenuId => {
  try {
    const response = await axiosInstance.delete(
      `/menu/delete/${selectedMenuId}`,
      {},
    );
    return response.data.data;
  } catch (error) {
    functionerror(error);
  }
};

function functionerror(error) {
  if (error.response) {
    const {status, data, headers} = error.response;
    console.error('서버 에러 상세:', {
      status,
      data,
      headers,
    });

    if (status === 500) {
      console.error('서버 내부 오류 (500):', data?.message || 'Unknown error');
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

  throw error;
}
