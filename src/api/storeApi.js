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
  } catch (error) {}
};

export const StoreSuggestion = async data => {
  const formData = new FormData();

  data.files.forEach(file => {
    if (file) {
      formData.append('files', {
        uri: file.path, // 이미지 URI
        type: file.mime, // 이미지 타입 (확인 후 필요한 타입 사용)
        name: file.filename, // 파일 이름 (확장자 포함)
      });
    }
  });

  const createStoreDto = JSON.stringify(data.createStoreDto);

  formData.append('suggestStoreDto', {
    string: createStoreDto,
    type: 'application/json',
  });
  try {
    const response = await axiosInstance.post(
      '/store/suggestion/create',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data', // 파일 업로드는 multipart/form-data
        },
      },
    );
    return response;
  } catch (error) {
    console.error(error.response);
  }
};

export const CreateOwnership = async data => {
  const formData = new FormData();

  if (data.file) {
    formData.append('file', {
      uri: data.file.path,
      type: data.file.mime,
      name: data.file.filename,
    });
  }

  const createOwnershipRqDto = JSON.stringify(data.createOwnershipRqDto);

  formData.append('createOwnershipRqDto', {
    string: createOwnershipRqDto,
    type: 'application/json',
  });

  try {
    const response = await axiosInstance.post(
      '/store/ownership/create',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data', // 파일 업로드는 multipart/form-data
        },
      },
    );

    return response;
  } catch (error) {
    functionError(error);
  }
};

export const Create_store_with_ownership = async data => {
  const formData = new FormData();

  if (data.businessRegistrationCertificateImage) {
    formData.append('businessRegistrationCertificateImage', {
      uri: data.businessRegistrationCertificateImage.path,
      type: data.businessRegistrationCertificateImage.mime,
      name: data.businessRegistrationCertificateImage.filename,
    });
  }

  data.storeImages.forEach(storeImage => {
    if (storeImage) {
      formData.append('storeImages', {
        uri: storeImage.path, // 이미지 URI
        type: storeImage.mime, // 이미지 타입 (확인 후 필요한 타입 사용)
        name: storeImage.filename, // 파일 이름 (확장자 포함)
      });
    }
  });

  formData.append('createStoreWithOwnershipRqDto', {
    string: JSON.stringify({
      createStoreRqDto: data.createStoreRqDto,
      createOwnershipRqDto: data.createOwnershipRqDto,
    }),
    type: 'application/json',
  });

  try {
    const response = await axiosInstance.post(
      '/store/create/with-ownership',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data', // 파일 업로드는 multipart/form-data
        },
      },
    );

    return response;
  } catch (error) {
    functionError(error);
  }
};

export const UpdateStore = async (storeId, data) => {
  try {
    await axiosInstance.patch(`/store/update/${storeId}`, data); // 수정: {data}를 제거
  } catch (error) {
    console.error('PATCH 실패:', error?.response || error.message);
    throw error;
  }
};

export const UpdateStoreImage = async (storeId, data) => {
  const formData = new FormData();
  data.forEach(file => {
    if (file.path) {
      formData.append('files', {
        uri: file.path, // 이미지 URI
        type: file.mime, // 이미지 타입
        name: file.filename, // 파일 이름
      });
    }
  });
  try {
    const response = await axiosInstance.post(
      `/store/upload-image/${storeId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data', // 파일 업로드는 multipart/form-data
        },
      },
    );
    return response.data.data.imgUrlList;
  } catch (error) {
    throw error;
  }
};

export const DeleteStoreImage = async (storeId, image) => {
  try {
    const response = await axiosInstance.delete(
      `/store/delete-image/${storeId}`,
      {
        data: {
          imgUrlList: image.map(img => img.imageUrl), // 이미지 URL을 배열로 전달
        },
      },
    );
    return response.data.data.imgUrlList;
  } catch (error) {
    functionError(error);
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
export const Store_getby_radius = async (latitude, longitude, radius) => {
  try {
    const response = await axiosInstance.get(`/store/get-by/radius`, {
      // auth: false,
      params: {
        longitude,
        latitude,
        radius,
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
    return response.data.data.content;
  } catch (error) {
    functionError(error);
  }
};

// 가게 검색(가게명, 메뉴명)리스트 조회
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
        // auth: false,
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

// 가게 검색(가게명)리스트 조회
export const Store_getby_store = async (page, keyword) => {
  try {
    const response = await axiosInstance.get(
      `/store/get-by/keyword/all/${keyword}`,
      {
        // auth: false,
        params: {
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
      // auth: false,
      params: {
        page,
        latitude,
        longitude,
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
  size = 10, // ← 기본값 설정
) => {
  try {
    const response = await axiosInstance.get(
      `/store/get-by/category/${category}`,
      {
        params: {
          longitude,
          latitude,
          page,
          size, // ← size 파라미터 추가
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
      // auth: false,

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

export const Store_getby_condition_search = async requestData => {
  const {latitude, longitude, page, conditionSearchDto} = requestData;

  try {
    // 기본 필수 파라미터
    const params = {
      latitude,
      longitude,
      page,
    };

    // 선택 파라미터는 값이 있을 때만 추가
    if (conditionSearchDto.category) {
      params.category = conditionSearchDto.category;
    }
    if (
      conditionSearchDto.isGroupAvailable !== undefined &&
      conditionSearchDto.isGroupAvailable !== ''
    ) {
      params.isGroupAvailable = conditionSearchDto.isGroupAvailable;
    }
    if (conditionSearchDto.conditionTime) {
      params.conditionTime = conditionSearchDto.conditionTime;
    }
    if (conditionSearchDto.alcoholType) {
      params.drinkType = conditionSearchDto.alcoholType;
    }

    const response = await axiosInstance.get(`/store/get-by/condition-search`, {
      params,
    });

    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const Store_getby_main_banner = async (latitude, longitude) => {
  try {
    const response = await axiosInstance.get(`/store/get-by/main-banner`, {
      // auth: false,
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

//관리 중인 매장 리스트 조회
export const Store_getby_managed = async page => {
  try {
    const response = await axiosInstance.get(`/store/get-by/managed`, {
      params: {
        page: page,
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const StoreImageUpdateSort = async (
  storeId,
  storeImageUrlInOrderList,
) => {
  try {
    const response = await axiosInstance.put(`/store/update-image/sort-order`, {
      storeId,
      storeImageUrlInOrderList,
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const get_store_share = async storeId => {
  try {
    const response = await axiosInstance.get(`/store/share/${storeId}`);
    return response.data; // 또는 response.data.url depending on backend structure
  } catch (error) {
    functionError(error);
  }
};
