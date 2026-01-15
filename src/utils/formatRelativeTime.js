const formatRelativeTime = (value, now = new Date(), withSuffix = true) => {
  if (!value) return '';
  const target = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(target.getTime())) return '';

  const diffMs = Math.max(0, now.getTime() - target.getTime());
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  const suffix = withSuffix ? '전' : '';

  const minutes = Math.floor(diffMs / minuteMs);
  if (minutes < 1) return `방금 ${suffix}`;
  if (minutes < 60) return `${minutes}분${suffix}`;

  const hours = Math.floor(diffMs / hourMs);
  if (hours < 24) return `${hours}시간${suffix}`;

  const days = Math.floor(diffMs / dayMs);
  if (days < 7) return `${days}일${suffix}`;

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks}주${suffix}`;
  }

  const months = Math.floor(days / 30);
  if (months <= 1) return `한달${suffix}`;
  if (months === 2) return `두달${suffix}`;
  return `${months}달${suffix}`;
};

export default formatRelativeTime;
