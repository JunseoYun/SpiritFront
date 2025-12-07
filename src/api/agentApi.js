import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';

export const Agent_chat_search = async ({
  previousResponseId = null,
  latitude,
  longitude,
  userMessage,
}) => {
  try {
    const response = await axiosInstance.post('/agent/chat-search', {
      previousResponseId,
      latitude,
      longitude,
      userMessage,
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};
