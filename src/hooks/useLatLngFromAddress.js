import { useState } from 'react';

const useLatLngFromAddress = () => {
  const [coords, setCoords] = useState(null); // 좌표 상태
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  const fetchLatLng = async address => {
    const apiKey = '9b09512f07cf4d2555413abbedcbcc3a'; // 카카오맵 API 키
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
      address,
    )}`;

    setIsLoading(true); // 로딩 상태 시작
    setError(null); // 기존 에러 초기화

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const data = await response.json();

      if (data.documents.length > 0) {
        const { x, y } = data.documents[0];
        const coordinates = { latitude: y, longitude: x };
        setCoords(coordinates); // 상태 업데이트
        return coordinates; // 좌표 반환
      } else {
        throw new Error('No results found');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err); // 에러 상태 업데이트
      throw err;
    } finally {
      setIsLoading(false); // 로딩 상태 종료
    }
  };

  return { coords, isLoading, error, fetchLatLng };
};

export default useLatLngFromAddress;
