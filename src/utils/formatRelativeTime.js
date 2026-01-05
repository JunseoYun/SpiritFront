const formatRelativeTime = (value, now = new Date()) => {
  if (!value) return '';
  const target = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(target.getTime())) return '';

  const diffMs = Math.max(0, now.getTime() - target.getTime());
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  const minutes = Math.floor(diffMs / minuteMs);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분전`;

  const hours = Math.floor(diffMs / hourMs);
  if (hours < 24) return `${hours}시간전`;

  const days = Math.floor(diffMs / dayMs);
  if (days < 7) return `${days}일전`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}주전`;

  const months = Math.floor(days / 30);
  if (months <= 1) return '한달전';
  if (months === 2) return '두달전';
  return `${months}달전`;
};

export default formatRelativeTime;
