import axiosInstance from './axiosInstance';
import {userAxiosInstance} from './axiosInstance';
import {functionError} from './errorHandler';
import {getRefreshToken} from '../storage/tokenStorage';
import axios from 'axios';
import Config from 'react-native-config';

export const get_mokToken = async () => {
  try {
    const response = await userAxiosInstance.get(`/mok/get-token`, {});
    return response.data.data.mokDataId;
  } catch (error) {
    functionError(error); // 에러 처리
    throw error;
  }
};

export const request_mok = async data => {
  console.log(mokData);
  const mokData = {
    mokDataId: data.mokDataId,
    providerId: data.providerId,
    userName: data.userName,
    userPhone: data.userPhone,
    userBirthDay: data.userBirthDay,
    userRegistSingleNumber: data.userRegistSingleNumber,
  };

  try {
    await userAxiosInstance.post(`/mok/request-mok`, mokData); // 요청 본문 전달
  } catch (error) {
    functionError(error); // 에러 처리
    throw error;
  }
};

export const confirm_request = async (data, isUpdate = false) => {
  const confirmData = {
    mokDataId: data.mokDataId,
    authNumber: data.authNumber,
    isUpdate: isUpdate, // isUpdate 값 그대로 전달
  };
  console.log(confirmData);
  try {
    const response = await userAxiosInstance.post(
      `/mok/confirm-request`,
      confirmData,
    ); // 요청 본문 전달
    return response.data.data;
  } catch (error) {
    functionError(error); // 에러 처리
    throw error;
  }
};
