import React, {useState, useEffect} from 'react';
import {Text} from 'react-native';

import styles from '../styles/SignUpPageStyle';

export const Timer = () => {
  const [seconds, setSeconds] = useState(300); // 5분을 초 단위로 표현

  useEffect(() => {
    const timerId = setInterval(() => {
      if (seconds > 0) {
        setSeconds(prevSeconds => prevSeconds - 1);
      } else {
        clearInterval(timerId);
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [seconds]); // seconds가 변경될 때마다 useEffect를 다시 실행

  // 분과 초를 계산하여 표시
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <Text style={styles.linkOrange}>
      {minutes < 10 ? `0${minutes}` : minutes}:
      {remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}
    </Text>
  );
};
