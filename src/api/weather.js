import axios from 'axios';

export const getWeatherData = async location => {
  if (!location) {
    return {temp: 0, condition: 'Unknown', rain_probability: 0}; // 기본값 반환
  }

  const {latitude, longitude} = location;

  const API_KEY = '0010951218124cb79f4161946241612';
  const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${latitude},${longitude}&aqi=no`;
  // WeatherAPI Api

  try {
    const response = await axios.get(apiUrl);

    // 데이터 추출
    const temp = response.data.current?.temp_c || 0;
    const condition = response.data.current?.condition.text || 'Unknown';
    const icon = response.data.current?.condition.icon || 'Unknown';
    const rain_probability = response.data.current?.precip_mm || 0;
    return {temp, condition, icon, rain_probability};
  } catch (error) {
    // 서버에서 반환된 에러 메시지 로깅
    console.error(
      'Error fetching weather data:',
      error.response?.data || error.message,
    );
    return {temp: 0, condition: 'Unknown', rain_probability: 0}; // 기본값 반환
  }
};
