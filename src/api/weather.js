import axios from 'axios';

export const getWeatherData = async location => {
  if (!location) {
    console.error('위치 정보가 없습니다.');
    return {temp: 0, condition: 'Unknown', rain_probability: 0}; // 기본값 반환
  }

  const {latitude, longitude} = location;

  console.log(location);
  // const API_KEY = 'be107a3be29e95b54b2fac69f2a42431';
  // const apiUrl = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
  // OpenWeathermap Api

  const API_KEY = '0010951218124cb79f4161946241612';
  const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${latitude},${longitude}&aqi=no`;
  // WeatherAPI Api

  try {
    const response = await axios.get(apiUrl);
    console.log(response.data.current);

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
