import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';
// 매장 데이터 가져오기
export const getStore = async () => {
  try {
    const response = await axiosInstance.get(`/store/get-by/all`);
    return response.data.data; // API 응답 구조에 따라 수정
  } catch (error) {
    functionError(error);
  }
};

//매장 좋아요 api
export const Storelikepost = async storeId => {
  try {
    await axiosInstance.post(`/store/like/${storeId}`, {});
  } catch (error) {
    functionError(error);
  }
};

export const StoreUnlikepost = async storeId => {
  try {
    await axiosInstance.post(`/store/unlike/${storeId}`, {});
  } catch (error) {
    functionError(error);
  }
};

//스토어상세페이지 관련 api
export const StoreMainget = async storeId => {
  try {
    const response = await axiosInstance.get(`/store/get-by/${storeId}`, {});
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const StoreRegister = async data => {
  const formData = new FormData();

  data.files.forEach(file => {
    if (file) {
      formData.append('files', {
        uri: file.path, // 이미지 URI
        type: file.mime, // 이미지 타입 (확인 후 필요한 타입 사용)
        name: file.filename, // 파일 이름 (확장자 포함)
      });
      console.log('이미지 파일 경로:', file.path);
      console.log('이미지 파일 타입:', file.mime);
      console.log('이미지 파일 이름:', file.filename);
    } else {
      console.error('파일이 없습니다:', file);
    }
  });

  const createStoreDto = JSON.stringify(data.createStoreDto);

  formData.append('createStoreDto', {
    string: createStoreDto,
    type: 'application/json',
  });

  try {
    const response = await axiosInstance.post('/store/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // 파일 업로드는 multipart/form-data
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const UpdateStore = async (storeId, data) => {
  try {
    await axiosInstance.patch(`/store/update/${storeId}`, data); // 수정: {data}를 제거
  } catch (error) {
    throw error;
  }
};

// Store Query API

// 최근 방문(리뷰) 가게 조회 O
export const Store_getby_recent = async page => {
  try {
    const response = await axiosInstance.get(`/store/get-by/recent`, {
      params: {
        page, // page 값만 전달 초기 : 0
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

// 반경 내 가게 리스트 조회 O  - 요청시간 조금 걸림
export const Store_getby_radius = async (latitude, longitude) => {
  try {
    const response = await axiosInstance.get(`/store/get-by/radius`, {
      params: {
        longitude,
        latitude,
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

// 좋아요한 가게 리스트 조회 O
export const Store_getby_liked = async page => {
  try {
    const response = await axiosInstance.get(`/store/get-by/liked`, {
      params: {
        page, // page 값만 전달 초기 : 0
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

// 가게 검색(가게명, 메뉴명)리스트 조회 O
export const Store_getby_keyword = async (
  page,
  latitude,
  longitude,
  keyword,
) => {
  try {
    const response = await axiosInstance.get(
      `/store/get-by/keyword/${keyword}`,
      {
        params: {
          longitude,
          latitude,
          page, // page 값만 전달 초기 : 0
        },
      },
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

// 가까운 순서 가게 리스트 조회 O
export const Store_getby_distance = async (page, latitude, longitude) => {
  try {
    const response = await axiosInstance.get(`/store/get-by/distance`, {
      params: {
        longitude,
        latitude,
        page,
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

// 카테고리 가게 리스트 조회 O
export const Store_getby_category = async (
  page,
  latitude,
  longitude,
  category,
) => {
  try {
    const response = await axiosInstance.get(
      `/store/get-by/category/${category}`,
      {
        params: {
          longitude,
          latitude,
          page,
        },
      },
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

// 영업중 가게 리스트 조회
export const Store_getby_business_hours = async (page, latitude, longitude) => {
  try {
    const response = await axiosInstance.get(`/store/get-by/business-hours`, {
      params: {
        longitude,
        latitude,
        page,
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};
