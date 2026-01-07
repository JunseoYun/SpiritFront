import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';
import toFileField from '../utils/toFileField';

export const PostCreate = async data => {
  const formData = new FormData();

  const make = (file, idx = 0) => toFileField(file, `post_${idx}`);

  if (data.files && data.files.length > 0) {
    data.files.forEach((file, idx) => {
      const field = make(file, idx);
      if (field) formData.append('files', field);
    });
  }

  const createPostDto = JSON.stringify(data.createPostDto);
  formData.append('createPostDto', {
    string: createPostDto,
    type: 'application/json',
  });

  try {
    const response = await axiosInstance.post('/post/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const PostGetByRecent = async ({page = 0, size = 10, sort} = {}) => {
  try {
    const response = await axiosInstance.get('/post/get-by/recent', {
      params: {
        page,
        size,
        ...(sort ? {sort} : null),
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const PostGetByStore = async ({
  storeId,
  page = 0,
  size = 10,
  sort,
} = {}) => {
  try {
    const response = await axiosInstance.get(`/post/get-by/store/${storeId}`, {
      params: {
        page,
        size,
        ...(sort ? {sort} : null),
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const PostGetById = async postId => {
  if (!postId) return null;
  try {
    const response = await axiosInstance.get(`/post/get-by/${postId}`);
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const PostGetBySaved = async ({page = 0, size = 10, sort} = {}) => {
  try {
    const response = await axiosInstance.get('/post/get-by/saved', {
      params: {
        page,
        size,
        ...(sort ? {sort} : null),
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const PostSave = async postId => {
  if (!postId) return null;
  try {
    const response = await axiosInstance.post(`/post/save/${postId}`, {});
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const PostLike = async postId => {
  if (!postId) return null;
  try {
    const response = await axiosInstance.post(`/post/like/${postId}`, {});
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const PostShare = async postId => {
  if (!postId) return null;
  try {
    const response = await axiosInstance.post(`/post/share/${postId}`, {});
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};
