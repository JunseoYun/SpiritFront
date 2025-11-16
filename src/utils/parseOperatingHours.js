const MINUTES_PER_DAY = 24 * 60;

const pad = value => {
  const num = Number.isFinite(value) ? value : 0;
  return String(num).padStart(2, '0');
};

const toNumber = value => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const parseTimeString = time => {
  const [hour = '0', minute = '0'] = (time || '').split(':');
  return {
    hour: toNumber(hour),
    minute: toNumber(minute),
  };
};

const buildDate = (hour, minute, dayOffset = 0) => {
  const timestamp = Date.UTC(1970, 0, 1 + dayOffset, hour, minute, 0, 0);
  return new Date(timestamp);
};

const minutesWithOffset = (hour, minute, dayOffset = 0) =>
  dayOffset * MINUTES_PER_DAY + hour * 60 + minute;

const hasValues = entry => {
  if (!entry) return false;
  const startHour =
    entry.openHour ?? entry.startHour ?? entry.beginHour ?? '';
  const startMinute =
    entry.openMinute ?? entry.startMinute ?? entry.beginMinute ?? '';
  const endHour =
    entry.closedHour ?? entry.endHour ?? entry.finishHour ?? '';
  const endMinute =
    entry.closedMinute ?? entry.endMinute ?? entry.finishMinute ?? '';
  return (
    startHour !== '' &&
    startMinute !== '' &&
    endHour !== '' &&
    endMinute !== ''
  );
};

export const calculateRangeFromEntry = (
  {
    openHour = '0',
    openMinute = '0',
    closedHour = '0',
    closedMinute = '0',
  },
  {
    referenceHour,
    referenceMinute,
    allowStartOverflow = false,
    allowEndOverflow = true,
  } = {},
) => {
  const startHourRaw = toNumber(openHour);
  const startMinuteRaw = toNumber(openMinute);
  const endHourRaw = toNumber(closedHour);
  const endMinuteRaw = toNumber(closedMinute);
  const referenceMinutes =
    referenceHour == null
      ? null
      : toNumber(referenceHour) * 60 + toNumber(referenceMinute ?? 0);

  let normalizedStartHour = startHourRaw;
  let startDayOffset = 0;
  if (allowStartOverflow && normalizedStartHour >= 24) {
    startDayOffset = Math.floor(normalizedStartHour / 24);
    normalizedStartHour = normalizedStartHour % 24;
  } else if (referenceMinutes !== null) {
    const startMinutesBase = normalizedStartHour * 60 + startMinuteRaw;
    if (startMinutesBase < referenceMinutes) {
      startDayOffset = 1;
    }
  }

  const startDate = buildDate(
    normalizedStartHour % 24,
    startMinuteRaw,
    startDayOffset,
  );

  let normalizedEndHour = endHourRaw;
  let endDayOffset = 0;
  if (allowEndOverflow && normalizedEndHour >= 24) {
    endDayOffset = Math.floor(normalizedEndHour / 24);
    normalizedEndHour = normalizedEndHour % 24;
  } else if (referenceMinutes !== null) {
    const endMinutesBase = normalizedEndHour * 60 + endMinuteRaw;
    if (endMinutesBase < referenceMinutes) {
      endDayOffset = 1;
    }
  }

  let startAbsoluteMinutes = minutesWithOffset(
    normalizedStartHour % 24,
    startMinuteRaw,
    startDayOffset,
  );
  let endAbsoluteMinutes = minutesWithOffset(
    normalizedEndHour % 24,
    endMinuteRaw,
    endDayOffset,
  );

  if (endAbsoluteMinutes <= startAbsoluteMinutes) {
    const diff = startAbsoluteMinutes - endAbsoluteMinutes;
    const extraDays = Math.floor(diff / MINUTES_PER_DAY) + 1;
    endDayOffset += extraDays;
    endAbsoluteMinutes += extraDays * MINUTES_PER_DAY;
  }

  const endDate = buildDate(
    normalizedEndHour % 24,
    endMinuteRaw,
    endDayOffset,
  );

  return {
    isNextDay: endDayOffset > startDayOffset,
    isStartNextDay: startDayOffset > 0,
    startDate,
    endDate,
    openTime: `${pad(startDate.getUTCHours())}:${pad(
      startDate.getUTCMinutes(),
    )}`,
    closeTime: `${pad(endDate.getUTCHours())}:${pad(endDate.getUTCMinutes())}`,
    startDayOffset,
    endDayOffset,
    startAbsoluteMinutes,
    endAbsoluteMinutes,
  };
};

export const deserializeOperatingTime = ({openTime, closeTime}) => {
  const {hour: openHour, minute: openMinute} = parseTimeString(openTime);
  const {hour: closeHour, minute: closeMinute} = parseTimeString(closeTime);

  const range = calculateRangeFromEntry(
    {
      openHour,
      openMinute,
      closedHour: closeHour,
      closedMinute: closeMinute,
    },
    {allowEndOverflow: true},
  );

  return {
    openHour: pad(range.startDate.getUTCHours()),
    openMinute: pad(range.startDate.getUTCMinutes()),
    closedHour: pad(
      range.endDate.getUTCHours() + range.endDayOffset * 24,
    ),
    closedMinute: pad(range.endDate.getUTCMinutes()),
    range,
  };
};

export const deserializeBreakingTime = ({
  startTime,
  endTime,
  referenceOpenTime,
}) => {
  const {hour: startHour, minute: startMinute} = parseTimeString(startTime);
  const {hour: endHour, minute: endMinute} = parseTimeString(endTime);
  const {hour: refHour, minute: refMinute} = parseTimeString(
    referenceOpenTime || startTime,
  );

  const range = calculateRangeFromEntry(
    {
      openHour: startHour,
      openMinute: startMinute,
      closedHour: endHour,
      closedMinute: endMinute,
    },
    {
      referenceHour: refHour,
      referenceMinute: refMinute,
      allowEndOverflow: true,
    },
  );

  return {
    startHour: pad(range.startDate.getUTCHours()),
    startMinute: pad(range.startDate.getUTCMinutes()),
    endHour: pad(
      range.endDate.getUTCHours() + range.endDayOffset * 24,
    ),
    endMinute: pad(range.endDate.getUTCMinutes()),
    range,
  };
};

export const normalizeOperatingEntry = entry => {
  if (!hasValues(entry)) {
    return {...entry};
  }

  const range = calculateRangeFromEntry(entry, {allowEndOverflow: true});
  return {
    openHour: pad(range.startDate.getUTCHours()),
    openMinute: pad(range.startDate.getUTCMinutes()),
    closedHour: pad(
      range.endDate.getUTCHours() + range.endDayOffset * 24,
    ),
    closedMinute: pad(range.endDate.getUTCMinutes()),
  };
};

export const normalizeOperatingHoursMap = (operatingHours = {}) =>
  Object.keys(operatingHours).reduce((acc, day) => {
    acc[day] = normalizeOperatingEntry(operatingHours[day] || {});
    return acc;
  }, {});

export const normalizeBreakingHoursMap = (
  operatingHours = {},
  breakingHours = {},
) =>
  Object.keys(breakingHours || {}).reduce((acc, day) => {
    const entry = breakingHours?.[day] || {};
    if (!hasValues(entry)) {
      acc[day] = {...entry};
      return acc;
    }

    const range = calculateRangeFromEntry(
      {
        openHour: entry.startHour,
        openMinute: entry.startMinute,
        closedHour: entry.endHour,
        closedMinute: entry.endMinute,
      },
      {
        referenceHour: operatingHours?.[day]?.openHour,
        referenceMinute: operatingHours?.[day]?.openMinute,
        allowEndOverflow: true,
      },
    );

    acc[day] = {
      startHour: pad(range.startDate.getUTCHours()),
      startMinute: pad(range.startDate.getUTCMinutes()),
      endHour: pad(
        range.endDate.getUTCHours() + range.endDayOffset * 24,
      ),
      endMinute: pad(range.endDate.getUTCMinutes()),
    };

    return acc;
  }, {});

export const formatTimeFromDate = date =>
  `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
