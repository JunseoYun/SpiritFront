import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';

export const CommentGetByPost = async ({
  postId,
  page = 0,
  size = 20,
  sort,
} = {}) => {
  if (!postId) return null;
  try {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('size', String(size));
    if (Array.isArray(sort)) {
      sort.filter(Boolean).forEach(value => {
        params.append('sort', value);
      });
    } else if (typeof sort === 'string' && sort) {
      params.append('sort', sort);
    }
    const query = params.toString();
    const url = query
      ? `/comment/get-by/post/${postId}?${query}`
      : `/comment/get-by/post/${postId}`;
    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const CommentCreate = async ({
  postId,
  content,
  rootCommentId = null,
  taggedUserId = null,
} = {}) => {
  if (!postId || !content) return null;
  try {
    const response = await axiosInstance.post('/comment/create', {
      postId,
      content,
      rootCommentId,
      taggedUserId,
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const CommentGetByRootComment = async ({
  rootCommentId,
  page = 0,
  size = 10,
} = {}) => {
  if (!rootCommentId) return null;
  try {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('size', String(size));
    params.append('sort', 'id,ASC');
    const query = params.toString();
    const url = query
      ? `/comment/get-by/root-comment/${rootCommentId}?${query}`
      : `/comment/get-by/root-comment/${rootCommentId}`;
    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const CommentLike = async commentId => {
  if (!commentId) return null;
  try {
    const response = await axiosInstance.post(`/comment/like/${commentId}`, {});
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const CommentGetById = async commentId => {
  if (!commentId) return null;
  try {
    const response = await axiosInstance.get(
      `/comment/get-by/comment/${commentId}`,
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const CommentDelete = async commentId => {
  if (!commentId) return null;
  try {
    const response = await axiosInstance.delete(`/comment/delete/${commentId}`);
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};
