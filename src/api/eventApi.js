import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';
import toFileField from '../utils/toFileField';

const defaultFormHeaders = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

const toEventFormData = ({dto, file}) => {
  const formData = new FormData();
  if (file) {
    const normalized = toFileField(file, 'event_image');
    if (normalized) {
      formData.append('file', normalized);
    }
  }
  formData.append('createEventDto', {
    string: JSON.stringify(dto),
    type: 'application/json',
  });
  return formData;
};

export const getEventsByStore = async storeId => {
  if (!storeId) {
    return [];
  }
  try {
    const response = await axiosInstance.get(`/event/get-by/store/${storeId}`);
    return response?.data?.data || [];
  } catch (error) {
    functionError(error);
    return [];
  }
};

export const getEventById = async eventId => {
  if (!eventId) {
    return null;
  }
  try {
    const response = await axiosInstance.get(`/event/get-by/${eventId}`);
    return response?.data?.data || null;
  } catch (error) {
    functionError(error);
    return null;
  }
};

export const createEvent = async payload => {
  try {
    const formData = toEventFormData({
      dto: {
        title: payload.title,
        content: payload.content,
        startAt: payload.startAt,
        endAt: payload.endAt,
        storeId: payload.storeId,
      },
      file: payload.file,
    });
    const response = await axiosInstance.post(
      '/event/create',
      formData,
      defaultFormHeaders,
    );
    return response?.data?.data;
  } catch (error) {
    functionError(error);
    throw error;
  }
};

export const updateEvent = async (eventId, payload) => {
  try {
    const response = await axiosInstance.put(
      `/event/update/${eventId}`,
      payload,
    );
    return response?.data?.data;
  } catch (error) {
    functionError(error);
    throw error;
  }
};

export const updateEventImage = async (eventId, file) => {
  try {
    const normalized = toFileField(file, 'event_image');
    if (!normalized) {
      return null;
    }
    const formData = new FormData();
    formData.append('file', normalized);
    const response = await axiosInstance.post(
      `/event/update-image/${eventId}`,
      formData,
      defaultFormHeaders,
    );
    return response?.data?.data;
  } catch (error) {
    functionError(error);
    throw error;
  }
};

export const deleteEvent = async eventId => {
  try {
    const response = await axiosInstance.delete(`/event/delete/${eventId}`);
    return response?.data?.data;
  } catch (error) {
    functionError(error);
    throw error;
  }
};

export const deleteEventImage = async eventId => {
  try {
    const response = await axiosInstance.delete(
      `/event/delete-image/${eventId}`,
    );
    return response?.data?.data;
  } catch (error) {
    functionError(error);
    throw error;
  }
};
