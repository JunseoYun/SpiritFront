import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';

export const CommentGetByPost = async ({postId, page = 0, size = 20} = {}) => {
  if (!postId) return null;
  try {
    const response = await axiosInstance.get(`/comment/get-by/post/${postId}`, {
      params: {
        page,
        size,
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const CommentCreate = async ({
  postId,
  content,
  rootCommentId = null,
} = {}) => {
  if (!postId || !content) return null;
  try {
    const response = await axiosInstance.post('/comment/create', {
      postId,
      content,
      rootCommentId,
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
    const response = await axiosInstance.get(
      `/comment/get-by/root-comment/${rootCommentId}`,
      {
        params: {
          page,
          size,
        },
      },
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
