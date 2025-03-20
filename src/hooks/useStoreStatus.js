import {useEffect, useState} from 'react';

const useStoreStatus = (operationInfoDtos = []) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [closed, setClosed] = useState(false);
  const [breakstart, setBreakstart] = useState(null);
  const [breakend, setBreakend] = useState(null);
  const [starttime, setStarttime] = useState(null);
  const [endtime, setEndtime] = useState(null);

  useEffect(() => {
    const checkStoreStatus = () => {
      let now = new Date();
      let currentDay = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        timeZone: 'Asia/Seoul',
      })
        .format(now)
        .toUpperCase();

      now.setHours(now.getHours() + 9);

      let todayInfo = operationInfoDtos.find(
        info => info.dayOfWeek === currentDay,
      );
      let yesterdayInfo = operationInfoDtos.find((info, index, array) => {
        let yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        let yesterdayDay = yesterday
          .toLocaleDateString('en-US', {weekday: 'long'})
          .toUpperCase();
        return info.dayOfWeek === yesterdayDay;
      });

      if (!todayInfo) return;

      let {openTime, closeTime, breakStartTime, breakEndTime, isClosed} =
        todayInfo;

      if (isClosed) {
        setIsOpen(false);
        setIsBreak(false);
        setClosed(true);
        return;
      }

      let [openHours, openMinutes] = openTime.split(':').map(Number);
      let [closeHours, closeMinutes] = closeTime.split(':').map(Number);
      let [breakStartHours, breakStartMinutes] = breakStartTime
        ? breakStartTime.split(':').map(Number)
        : [null, null];
      let [breakEndHours, breakEndMinutes] = breakEndTime
        ? breakEndTime.split(':').map(Number)
        : [null, null];

      let openDate = new Date();
      openDate.setHours(openHours, openMinutes, 0, 0);
      openDate.setHours(openDate.getHours() + 9);
      let closeDate = new Date();
      closeDate.setHours(closeHours, closeMinutes, 0, 0);
      closeDate.setHours(closeDate.getHours() + 9);

      if (closeHours < openHours) {
        closeDate.setDate(closeDate.getDate() + 1); // 영업 종료가 다음 날인 경우
      }

      let breakStartDate = breakStartTime ? new Date() : null;
      if (breakStartDate) {
        breakStartDate.setHours(breakStartHours, breakStartMinutes, 0, 0);
        breakStartDate.setHours(breakStartDate.getHours() + 9);
        setBreakstart(breakStartTime.slice(0, 5));
      }

      let breakEndDate = breakEndTime ? new Date() : null;
      if (breakEndDate) {
        breakEndDate.setHours(breakEndHours, breakEndMinutes, 0, 0);
        breakEndDate.setHours(breakEndDate.getHours() + 9);
        setBreakend(breakEndTime.slice(0, 5));
      }

      // 현재 시간이 00:00~closeTime (예: 02:00) 구간이라면, 전날 정보를 유지해야 함
      if (openHours && yesterdayInfo) {
        let {closeTime: yCloseTime} = yesterdayInfo;
        let [yCloseHours, yCloseMinutes] = yCloseTime.split(':').map(Number);
        let yCloseDate = new Date();
        yCloseDate.setHours(yCloseHours, yCloseMinutes, 0, 0);
        yCloseDate.setHours(yCloseDate.getHours() + 9);
        if (yCloseHours < 12 && now <= yCloseDate) {
          todayInfo = yesterdayInfo;
          openTime = todayInfo.openTime;
          closeTime = todayInfo.closeTime;
        }
      }

      setStarttime(openTime.slice(0, 5));
      setEndtime(closeTime.slice(0, 5));

      if (now >= openDate && now <= closeDate) {
        if (
          breakStartDate &&
          breakEndDate &&
          now >= breakStartDate &&
          now <= breakEndDate
        ) {
          setIsBreak(true);
          setIsOpen(true);
        } else {
          setIsBreak(false);
          setIsOpen(true);
        }
      } else {
        setIsOpen(false);
        setIsBreak(false);
      }
    };

    checkStoreStatus();
    const interval = setInterval(checkStoreStatus, 60 * 1000);
    return () => clearInterval(interval);
  }, [operationInfoDtos]);

  // isOpen => 영업중인지 판별
  // isBreak => 브레이크 타임 판별
  // closed => 휴무일 판별
  // starttime => 영업 시작 시간
  // endtime => 영업 종료 시간
  // breakstart => 브레이크 시작 시간
  // breakend => 브레이크 종료 시간

  return {isOpen, isBreak, closed, starttime, endtime, breakstart, breakend};
};

export default useStoreStatus;
