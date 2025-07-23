import {userAxiosInstance} from './axiosInstance';
import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';

export const store_stats_get = async form => {
  try {
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

export const store_like_stats_get = async form => {
  try {
    const response = await axiosInstance.get(`/store/get-by/liked/stats`, {
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
    });

    return response;
  } catch (error) {
    functionError(error); // 에러 처리
    throw error;
  }
};

export const store_view_stats_get = async form => {
  try {
    const response = await axiosInstance.get(`/log/store-view/stats`, {
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
    });

    return response;
  } catch (error) {
    functionError(error); // 에러 처리
    throw error;
  }
};
