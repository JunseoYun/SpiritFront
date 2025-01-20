import {useCallback} from 'react';

/**
 * 위도와 경도로 두 지점 간의 직선 거리를 계산하는 훅
 * @returns {Function} - 두 좌표를 받아 거리를 반환하는 함수
 */
const useDistance = () => {
  /**
   * Haversine 공식을 사용하여 두 지점 간 거리를 계산
   * @param {number} lat1 - 첫 번째 지점의 위도
   * @param {number} lon1 - 첫 번째 지점의 경도
   * @param {number} lat2 - 두 번째 지점의 위도
   * @param {number} lon2 - 두 번째 지점의 경도
   * @returns {number} - 두 지점 간의 거리 (단위: 킬로미터)
   */
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const toRadians = degree => (degree * Math.PI) / 180; // 각도를 라디안으로 변환
    const R = 6371; // 지구 반지름 (단위: 킬로미터)

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 거리 반환 (단위: 킬로미터)
  }, []);

  return calculateDistance;
};

export default useDistance;
