import {useEffect, useState} from 'react';

const useStoreStatus = (operationInfoDtos = [], isAlwaysOpen = false) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [closed, setClosed] = useState(false);
  const [breakstart, setBreakstart] = useState(null);
  const [breakend, setBreakend] = useState(null);
  const [starttime, setStarttime] = useState(null);
  const [endtime, setEndtime] = useState(null);
  const [operationSchedule, setOperationSchedule] = useState(null);

  const formatTime = time => (time ? time.slice(0, 5) : null);

  console.log(operationInfoDtos);

  const reorderScheduleByToday = schedules => {
    const dayOrder = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];

    const dayKorMap = {
      SUNDAY: '일',
      MONDAY: '월',
      TUESDAY: '화',
      WEDNESDAY: '수',
      THURSDAY: '목',
      FRIDAY: '금',
      SATURDAY: '토',
    };

    const now = new Date();
    const now22 = new Date();
    now22.setHours(now22.getHours() + 11);
    const todayName = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      timeZone: 'Asia/Seoul',
    })
      .format(now)
      .toUpperCase();
    now.setHours(now.getHours() + 9);

    let todayIndex = dayOrder.indexOf(todayName);

    // 전날 closeTime이 자정을 넘는 경우 && 현재 시간이 그 이전이면, 배열 시작을 전날로 바꿈
    const yesterdayIndex = (todayIndex + 6) % 7;
    const yesterdayInfo = schedules.find(
      item => item.dayOfWeek === dayOrder[yesterdayIndex],
    );

    if (yesterdayInfo && yesterdayInfo.closeTime) {
      const [yCloseH, yCloseM] = yesterdayInfo.closeTime.split(':').map(Number);
      if (yCloseH < 12) {
        const yClose = new Date(now);
        yClose.setHours(yCloseH, yCloseM, 0, 0);
        yClose.setHours(yClose.getHours() + 9); // KST 보정

        if (now <= yClose) {
          todayIndex = yesterdayIndex;
        }
      }
    }

    const orderedDays = [
      ...dayOrder.slice(todayIndex),
      ...dayOrder.slice(0, todayIndex),
    ];

    const ordered = orderedDays.map(day => {
      const match = schedules.find(item => item.dayOfWeek === day);
      return {
        day: dayKorMap[day],
        open: formatTime(match?.openTime),
        close: formatTime(match?.closeTime),
        breakStart: formatTime(match?.breakStartTime),
        breakEnd: formatTime(match?.breakEndTime),
        isClosed: match?.isClosed ?? true,
      };
    });

    return ordered;
  };

  useEffect(() => {
    const checkStoreStatus = () => {
      if (isAlwaysOpen == true) {
        setIsOpen(true);
        return;
      }

      let now = new Date();
      let now22 = new Date();
      now22.setHours(now22.getHours() + 21);
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

      if (
        !todayInfo ||
        todayInfo.isClosed ||
        !todayInfo.openTime ||
        !todayInfo.closeTime
      ) {
        setClosed(true);
        setIsOpen(false);
        setIsBreak(false);
        return;
      }

      let yesterdayInfo = operationInfoDtos.find((info, index, array) => {
        let yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        let yesterdayDay = new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          timeZone: 'Asia/Seoul',
        })
          .format(yesterday)
          .toUpperCase();

        return info.dayOfWeek === yesterdayDay;
      });

      let nextdayInfo = operationInfoDtos.find((info, index, array) => {
        let nextday = new Date();
        nextday.setDate(now.getDate());
        let nextdayDay = new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          timeZone: 'Asia/Seoul',
        })
          .format(nextday)
          .toUpperCase();
        return info.dayOfWeek === nextdayDay;
      });

      let {openTime, closeTime, breakStartTime, breakEndTime, isClosed} =
        todayInfo;

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
      if (openHours && yesterdayInfo && !yesterdayInfo.isClosed) {
        let {closeTime: yCloseTime} = yesterdayInfo;
        let [yCloseHours, yCloseMinutes] = yCloseTime.split(':').map(Number);
        let yCloseDate = new Date(now);
        yCloseDate.setHours(yCloseHours, yCloseMinutes, 0, 0);
        yCloseDate.setHours(yCloseDate.getHours() + 9);
        if (yCloseHours < 12 && now <= yCloseDate) {
          todayInfo = yesterdayInfo;
          closeTime = todayInfo.closeTime;

          openDate = new Date();
          closeDate = new Date();
          let [newOpenH, newOpenM] = openTime.split(':').map(Number);
          let [newCloseH, newCloseM] = closeTime.split(':').map(Number);

          openDate.setHours(newOpenH, newOpenM, 0, 0);
          closeDate.setHours(newCloseH, newCloseM, 0, 0);
          openDate.setHours(openDate.getHours() + 9);
          closeDate.setHours(closeDate.getHours() + 9);

          if (newCloseH < newOpenH) {
            closeDate.setDate(closeDate.getDate() + 1);
          }
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
        if (yesterdayInfo == todayInfo) {
          if (!nextdayInfo.isClosed) {
            setStarttime(nextdayInfo.openTime.slice(0, 5));
          } else {
            //추가
          }
        } else {
          setStarttime(todayInfo.openTime.slice(0, 5));
        }
      }
    };

    setOperationSchedule(reorderScheduleByToday(operationInfoDtos));

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

  return {
    isOpen,
    isBreak,
    closed,
    starttime,
    endtime,
    breakstart,
    breakend,
    operationSchedule,
  };
};

export default useStoreStatus;
