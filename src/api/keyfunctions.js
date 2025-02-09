import functions from '@react-native-firebase/functions';

export const fetchKakaoScheme = async () => {
  try {
    const response = await functions().httpsCallable('getKakaoScheme')({
      platform: 'kakao',
    });
    if (response.data.error) {
      console.error('Error fetching scheme:', response.data.error);
      return null;
    }
    return response.data.scheme;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};
