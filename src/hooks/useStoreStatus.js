import {useEffect, useState} from 'react';

const useStoreStatus = (
  startTime = '00:00:00',
  endTime = '23:59:59',
  closedDays = [],
) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkStoreStatus = () => {
      const now = new Date();
      now.setHours(now.getHours() + 9);
      console.log(now);
      // 현재 시간
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentDay = now
        .toLocaleDateString('en-US', {
          weekday: 'long',
        })
        .toUpperCase();

      // 시작 시간과 끝 시간
      const [startHours, startMinutes] = startTime.split(':').map(Number);

      const [endHours, endMinutes] = endTime.split(':').map(Number);

      // 요일 조건 확인
      if (closedDays.includes(currentDay)) {
        setIsOpen(false);
        return;
      }

      // 시간 범위 계산
      const start = new Date();
      start.setHours(startHours, startMinutes, 0, 0);

      start.setHours(start.getHours() + 9);

      const end = new Date();
      end.setHours(endHours, endMinutes, 0, 0);

      end.setHours(end.getHours() + 9);

      if (
        endHours < startHours ||
        (endHours === startHours && endMinutes < startMinutes)
      ) {
        // 종료 시간이 다음 날인 경우
        if (now >= start || now <= end) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      } else {
        // 일반적인 시간 범위
        if (now >= start && now <= end) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      }
    };

    checkStoreStatus(); // 처음 실행
    const interval = setInterval(checkStoreStatus, 60 * 1000); // 1분마다 갱신

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 클리어
  }, [startTime, endTime, closedDays]);

  return isOpen;
};

export default useStoreStatus;
