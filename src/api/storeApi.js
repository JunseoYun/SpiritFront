import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';
import toFileField from '../utils/toFileField';
import {getSearchRadius} from '../storage/locationStorage';

const getRadiusParam = async providedRadius => {
  if (typeof providedRadius === 'number') return providedRadius;
  const storedRadius = await getSearchRadius();
  return typeof storedRadius === 'number' ? storedRadius : undefined;
};
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

export const StoreMainPreviewget = async storeId => {
  try {
    const response = await axiosInstance.get(
      `/store/get-by/preview/${storeId}`,
      {},
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const StoreRegister = async data => {
  const formData = new FormData();

  (data.files || []).forEach((file, idx) => {
    const f = toFileField(file, `store_${idx}`);
    if (f) formData.append('files', f);
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

  (data.files || []).forEach((file, idx) => {
    const f = toFileField(file, `suggest_${idx}`);
    if (f) formData.append('files', f);
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

export const Create_store_with_ownership = async data => {
  const formData = new FormData();
  // 사업자 등록증 이미지
  const cert = toFileField(
    data.businessRegistrationCertificateImage,
    'business_certificate',
  );
  if (cert) {
    formData.append('businessRegistrationCertificateImage', cert);
  }
  const images = Array.isArray(data.storeImages) ? data.storeImages : [];
  images.forEach((img, idx) => {
    const f = toFileField(img, `store_${idx}`);
    if (f) formData.append('storeImages', f);
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

export const Create_store_with_ownership_photoOnly = async data => {
  const formData = new FormData();
  // 사업자 등록증 이미지
  const cert = toFileField(
    data.businessRegistrationCertificateImage,
    'business_certificate',
  );
  if (cert) {
    formData.append('businessRegistrationCertificateImage', cert);
  }
  const images = Array.isArray(data.storeImages) ? data.storeImages : [];
  images.forEach((img, idx) => {
    const f = toFileField(img, `store_${idx}`);
    if (f) formData.append('storeImages', f);
  });

  formData.append('createStoreRqDto', {
    string: JSON.stringify(data.createStoreRqDto),
    type: 'application/json',
  });

  try {
    const response = await axiosInstance.post(
      '/store/create/with-ownership/photo-only',
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

export const CreateOwnership = async data => {
  const formData = new FormData();
  const cert = toFileField(data.file, 'file');

  if (cert) {
    formData.append('file', cert);
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

export const Create_ownership_photoOnly = async data => {
  const formData = new FormData();
  const cert = toFileField(data.file, 'file');

  if (cert) {
    formData.append('file', cert);
  }
  const createOwnershipPhotoOnlyDto = JSON.stringify(
    data.createOwnershipPhotoOnlyDto,
  );

  formData.append('createOwnershipPhotoOnlyDto', {
    string: createOwnershipPhotoOnlyDto,
    type: 'application/json',
  });

  try {
    const response = await axiosInstance.post(
      '/store/ownership/create/photo-only',
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
  (data || []).forEach((file, idx) => {
    const f = toFileField(file, `store_${idx}`);
    if (f) formData.append('files', f);
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
    const radius = await getRadiusParam();

    const response = await axiosInstance.get(
      `/store/get-by/keyword/${keyword}`,

      {
        // auth: false,
        params: {
          longitude,
          latitude,
          page, // page 값만 전달 초기 : 0
          radius,
        },
      },
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const Store_getby_popular = async (
  page,
  latitude,
  longitude,
  drinkType,
  priceOrder,
) => {
  try {
    const radius = await getRadiusParam();

    console.log('Store_getby_popular:', radius);
    const response = await axiosInstance.get(`/store/get-by/popular`, {
      // auth: false,
      params: {
        longitude,
        latitude,
        page, // page 값만 전달 초기 : 0
        drinkType,
        priceOrder,
        radius,
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const Store_getby_viewed = async page => {
  try {
    const response = await axiosInstance.get(`/store/get-by/viewed`, {
      // auth: false,
      params: {
        page, // page 값만 전달 초기 : 0
      },
    });
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
    const radius = await getRadiusParam();

    const response = await axiosInstance.get(`/store/get-by/distance`, {
      // auth: false,
      params: {
        page,
        latitude,
        longitude,
        radius,
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
  drinkType,
  priceOrder,
) => {
  try {
    const radius = await getRadiusParam();

    const response = await axiosInstance.get(
      `/store/get-by/category/${category}`,
      {
        params: {
          longitude,
          latitude,
          drinkType,
          page,
          priceOrder,
          radius,
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
    const radius = await getRadiusParam();

    const response = await axiosInstance.get(`/store/get-by/business-hours`, {
      // auth: false,

      params: {
        longitude,
        latitude,
        page,
        radius,
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const Store_getby_main_banner = async (latitude, longitude) => {
  try {
    const radius = await getRadiusParam();

    const response = await axiosInstance.get(`/store/get-by/main-banner`, {
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
    const response = await axiosInstance.post(`/store/share/${storeId}`);
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const get_store_manager_invitationLink = async storeId => {
  try {
    const response = await axiosInstance.post(
      `/store/manager-invitation/create/${storeId}`,
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const get_store_manager_invitation_accept =
  async managerInvitationId => {
    try {
      const response = await axiosInstance.post(
        `/store/manager-invitation/accept/${managerInvitationId}`,
      );
      return response.data.data;
    } catch (error) {
      functionError(error);
    }
  };

export const Store_getby_managers = async storeId => {
  try {
    const response = await axiosInstance.get(
      `/store/get-by/managers/${storeId}`,
    );
    return response.data.data; // 또는 response.data.url depending on backend structure
  } catch (error) {
    functionError(error);
  }
};

export const getby_manager_invitation_preview = async managerInvitationId => {
  try {
    const response = await axiosInstance.get(
      `/store/get-by/manager-invitation/preview/${managerInvitationId}`,
    );
    return response.data.data; // 또는 response.data.url depending on backend structure
  } catch (error) {
    functionError(error);
  }
};

export const store_owner_change = async storeManagerId => {
  try {
    const response = await axiosInstance.patch(
      `/store/owner/change/${storeManagerId}`,
    );
    return response.data.data; // 또는 response.data.url depending on backend structure
  } catch (error) {
    functionError(error);
  }
};

export const delete_store_manager = async storeManagerId => {
  try {
    const response = await axiosInstance.delete(
      `/store/manager/delete/${storeManagerId}`,
    );
    return response.data.data; // 또는 response.data.url depending on backend structure
  } catch (error) {
    functionError(error);
  }
};

export const StoreBoardimage = async ({files, boardType}, storeId) => {
  const formData = new FormData();

  (files || []).forEach((file, idx) => {
    const f = toFileField(file, `board_${idx}`);
    if (f) formData.append('files', f);
  });

  try {
    const response = await axiosInstance.post(
      `/store/upload-board-image/${storeId}?boardType=${boardType}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const StoreBoardimageUpdate = async (boardImageId, boardType) => {
  try {
    const response = await axiosInstance.put(
      `/store/update-board-image/type?boardImageId=${boardImageId}&boardType=${boardType}`,
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const DeleteStoreboardImage = async (storeId, images) => {
  try {
    const imgUrlList = images
      .map(img => img.url) // 여기 수정
      .filter(Boolean); // 혹시 undefined나 null 제거

    if (imgUrlList.length === 0) {
      return;
    }

    const response = await axiosInstance.delete(
      `/store/delete-board-image/${storeId}`,
      {
        data: {
          imgUrlList,
        },
      },
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const StoreBoardImageUpdateSort = async (
  storeId,
  storeImageUrlInOrderList,
) => {
  try {
    const response = await axiosInstance.put(
      `/store/update-board-image/sort-order`,
      {
        storeId,
        boardImageUrlInOrderList: storeImageUrlInOrderList,
      },
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

const normalizeConditionSearchArgs = (
  latitudeOrPayload,
  longitude,
  conditionSearchDto,
  page,
  radius,
) => {
  if (
    latitudeOrPayload &&
    typeof latitudeOrPayload === 'object' &&
    !Array.isArray(latitudeOrPayload)
  ) {
    return {
      latitude: latitudeOrPayload.latitude ?? null,
      longitude: latitudeOrPayload.longitude ?? null,
      conditionSearchDto: latitudeOrPayload.conditionSearchDto ?? null,
      page: latitudeOrPayload.page ?? null,
      radius: latitudeOrPayload.radius ?? null,
    };
  }
  return {
    latitude: latitudeOrPayload ?? null,
    longitude: longitude ?? null,
    conditionSearchDto: conditionSearchDto ?? null,
    page: page ?? null,
    radius: radius ?? null,
  };
};

const buildConditionSearchParams = payload => {
  const dto = payload.conditionSearchDto || {};
  return {
    latitude: payload.latitude ?? null,
    longitude: payload.longitude ?? null,
    page: payload.page ?? null,
    radius: payload.radius ?? null,
    category: dto.category ?? null,
    searchKeyword: dto.searchKeyword ?? null,
    hasScreen: dto.hasScreen ?? null,
    hasRoom: dto.hasRoom ?? null,
    hasOutdoor: dto.hasOutdoor ?? null,
    isGroupAvailable: dto.isGroupAvailable ?? null,
    isParkingAvailable: dto.isParkingAvailable ?? null,
    isCorkageAvailable: dto.isCorkageAvailable ?? null,
    conditionTime: dto.conditionTime ?? null,
    drinkType: dto.drinkType ?? null,
    moods: dto.moods ?? null,
    priceOrder: dto.priceOrder ?? '',
  };
};

export const Store_getby_condition_search = async (
  latitudeOrPayload,
  longitude,
  conditionSearchDto,
  page,
  reqRadius,
) => {
  try {
    const payload = normalizeConditionSearchArgs(
      latitudeOrPayload,
      longitude,
      conditionSearchDto,
      page,
      reqRadius,
    );
    const radius = await getRadiusParam(payload.radius);
    console.log('condition_search:', payload.radius);
    const params = buildConditionSearchParams({...payload, radius});

    const response = await axiosInstance.get(`/store/get-by/condition-search`, {
      params,
    });
    return response.data.data.content;
  } catch (error) {
    console.log(error);
    functionError(error);
  }
};

export const Store_getby_condition_search_markers = async (
  latitudeOrPayload,
  longitude,
  conditionSearchDto,
  reqRadius,
) => {
  try {
    const payload = normalizeConditionSearchArgs(
      latitudeOrPayload,
      longitude,
      conditionSearchDto,
      null,
      reqRadius,
    );

    const radius = await getRadiusParam(payload.radius);

    const params = buildConditionSearchParams({...payload, radius});
    const response = await axiosInstance.get(
      `/store/get-by/condition-search/markers`,
      {
        params,
      },
    );
    return response.data.data;
  } catch (error) {
    console.log(error);
    functionError(error);
  }
};
