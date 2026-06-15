import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';
import toFileField from '../utils/toFileField';

export const ReviewCreate = async data => {
  const formData = new FormData();

  const make = (file, idx = 0) => toFileField(file, `review_${idx}`);

  if (data.files && data.files.length > 0) {
    data.files.forEach((file, idx) => {
      const f = make(file, idx);
      if (f) formData.append('files', f);
    });
  }

  const createReviewDto = JSON.stringify(data.createReviewDto);

  formData.append('createReviewDto', {
    string: createReviewDto,
    type: 'application/json',
  });

  try {
    const response = await axiosInstance.post('/review/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // 파일 업로드는 multipart/form-data
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const ReviewStoreGet = async (storeId, page) => {
  try {
    const response = await axiosInstance.get(
      `/review/get-by/store/${storeId}`,
      {
        params: {page},
      },
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const ReviewgetbyGet = async reviewId => {
  try {
    const response = await axiosInstance.get(`/review/get-by/${reviewId}`);
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const review_set_reply = async (reviewId, reply) => {
  try {
    const response = await axiosInstance.post(
      '/review/set-reply',
      {
        reviewId: reviewId,
        reply: reply,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    functionError(error);
  }
};

export const PostMyGet = async page => {
  try {
    const response = await axiosInstance.get(`/post/get-by/my`, {
      params: {page},
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const ReviewEdit = async (reviewId, data) => {
  try {
    const response = await axiosInstance.put(
      `/review/update/${reviewId}`,
      data,
      {},
    );
    return response;
  } catch (error) {
    functionError(error);
  }
};

export const ReviewEditImage = async (reviewId, data) => {
  const formData = new FormData();
  const make = (file, idx = 0) => toFileField(file, `review_${idx}`);
  (data.files || []).forEach((file, idx) => {
    const f = make(file, idx);
    if (f) formData.append('files', f);
  });
  try {
    const response = await axiosInstance.post(
      `/review/upload-image/${reviewId}`,
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

export const ReviewDeleteImage = async (reviewId, image) => {
  try {
    const response = await axiosInstance.delete(
      `/review/delete-image/${reviewId}`,
      {
        data: {
          imgUrlList: image, // 이미지 URL을 배열로 전달
        },
      },
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const ReviewDelete = async reviewId => {
  try {
    const response = await axiosInstance.delete(`/review/delete/${reviewId}`);
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};


export const PostDelete = async postId => {
  try {
    const response = await axiosInstance.delete(`/post/delete/${postId}`);
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const PostDeleteImage = async (postId, imgUrlList) => {
  try {
    const response = await axiosInstance.delete(
      `/post/delete-image/${postId}`,
      {
        data: {
          imgUrlList: imgUrlList,
        },
      },
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const PostUpdate = async (postId, data) => {
  try {
    const response = await axiosInstance.put(
      `/post/update/${postId}`,
      data,
      {},
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const PostUploadImage = async (postId, data) => {
  const formData = new FormData();
  const make = (file, idx = 0) => toFileField(file, `post_${idx}`);
  (data.files || []).forEach((file, idx) => {
    const f = make(file, idx);
    if (f) formData.append('files', f);
  });
  try {
    const response = await axiosInstance.post(
      `/post/upload-image/${postId}`,
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

export const review_delete_reply = async reviewId => {
  try {
    const response = await axiosInstance.delete(
      `/review/delete-reply/${reviewId}`,
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};
