import {userAxiosInstance} from './axiosInstance';
import {functionError} from './errorHandler';

export const store_stats_get = async form => {
  try {
    console.log(form, 'form');
    const response = await userAxiosInstance.get(
      `/log/access/store-area/stats`,
      {
        params: {
          ...form,
        },
        paramsSerializer: params => {
          const query = [];
          for (const key in params) {
            if (Array.isArray(params[key])) {
              params[key].forEach(v => {
                if (v)
                  query.push(
                    `${encodeURIComponent(key)}=${encodeURIComponent(v)}`,
                  );
              });
            } else if (params[key]) {
              query.push(
                `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
              );
            }
          }
          return query.join('&');
        },
      },
    );

    return response;
  } catch (error) {
    functionError(error); // 에러 처리
    throw error;
  }
};
