const MOOD_LABELS = {
  QUIET: '대화하기 좋은',
  LIVELY: '활기찬',
  SOLO_FRIENDLY: '혼술',
  DATE: '데이트',
  PARTY_EVENT: '파티·이벤트',
  TRADITIONAL: '전통적인',
  EXOTIC: '이국적인',
  MODERN: '모던·깔끔한',
  OLD_SCHOOL: '노포 감성',
  VIEW_SPOT: '뷰 맛집',
  LOCAL_FAVORITE: '로컬 맛집',
  SECOND_ROUND: '2차 맛집',
};

const normalizeMoodEntries = raw => {
  if (!raw) {
    return [];
  }
  if (typeof raw === 'string') {
    return [raw];
  }
  const arr = Array.isArray(raw)
    ? raw
    : typeof raw === 'object' && raw !== null
    ? Object.values(raw)
    : [];
  return arr
    .map(item => {
      if (!item) {
        return null;
      }
      if (typeof item === 'string') {
        return item;
      }
      if (typeof item === 'object') {
        return (
          item?.label ||
          item?.text ||
          item?.name ||
          item?.displayName ||
          item?.value ||
          item?.type ||
          item?.moodType ||
          item?.key
        );
      }
      return null;
    })
    .filter(Boolean);
};

export const formatMoodDescription = moods => {
  const entries = normalizeMoodEntries(moods);
  if (entries.length === 0) {
    return '';
  }

  const deduped = [];
  const seen = new Set();
  entries.forEach(entry => {
    const trimmed = String(entry).trim();
    if (!trimmed) {
      return;
    }
    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    const label = MOOD_LABELS[trimmed.toUpperCase()] || trimmed;
    deduped.push(label);
  });

  if (deduped.length === 0) {
    return '';
  }

  const formatted = deduped
    .map(label => {
      const clean = label.replace(/^#/, '').trim();
      return clean ? `#${clean}` : '';
    })
    .filter(Boolean);

  return formatted.join(' ');
};

export default formatMoodDescription;
