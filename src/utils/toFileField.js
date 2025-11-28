const MIME_MAP = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  webp: 'image/webp',
};

const getExtension = value => {
  if (typeof value !== 'string') {
    return null;
  }
  const match = value.match(/\.([a-zA-Z0-9]+)(?:$|\?)/);
  return match ? match[1].toLowerCase() : null;
};

const normalizeUri = rawValue => {
  if (!rawValue) {
    return null;
  }
  if (
    rawValue.startsWith('file://') ||
    rawValue.startsWith('content://') ||
    rawValue.startsWith('http://') ||
    rawValue.startsWith('https://')
  ) {
    return rawValue;
  }
  // Treat every other string as a local filesystem path
  return `file://${rawValue.startsWith('/') ? rawValue : `/${rawValue}`}`;
};

const pickMime = (candidateMime, uri) => {
  if (candidateMime) {
    return candidateMime;
  }
  const ext = getExtension(uri);
  if (ext && MIME_MAP[ext]) {
    return MIME_MAP[ext];
  }
  return 'image/jpeg';
};

const pickName = (candidateName, fallbackName, uri) => {
  if (candidateName) {
    return candidateName;
  }
  const ext = getExtension(uri) || 'jpg';
  return `${fallbackName}_${Date.now()}.${ext}`;
};

// Normalize an image/file object (or path string) to a FormData-friendly field
export const toFileField = (file, fallbackName = 'image') => {
  if (!file) {
    return null;
  }

  if (typeof file === 'string') {
    const uri = normalizeUri(file);
    if (!uri) {
      return null;
    }
    return {
      uri,
      type: pickMime(null, uri),
      name: pickName(null, fallbackName, uri),
    };
  }

  const pathOrUri = file.path || file.uri;
  const uri = normalizeUri(pathOrUri);
  if (!uri) {
    return null;
  }
  return {
    uri,
    type: pickMime(file.mime || file.type, uri),
    name: pickName(file.filename || file.name, fallbackName, uri),
  };
};

export default toFileField;
