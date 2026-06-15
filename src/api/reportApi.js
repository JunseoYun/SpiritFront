import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';

export const report_create = async data => {
  try {
    const response = await axiosInstance.post('/report/create', data, {
      headers: {
        'Content-Type': 'application/json', // 그냥 json 보내면 됩니다
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const ReportMainget = async (target, targetId) => {
  try {
    const response = await axiosInstance.get(
      `/report/get-by/store-manager/${targetId}`, // 경로 수정
      {
        params: {
          target: target, // query로 target 보내기
        },
      },
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const completeReport = async reportId => {
  try {
    const response = await axiosInstance.patch(
      `/report/complete/store-manager/${reportId}`,
      {},
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
