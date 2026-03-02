import {Image} from 'react-native';

// Simple in-memory cache to avoid layout shifts after the first measurement.
const ratioCache = new Map();
const pendingCache = new Map();

const isValidRatio = ratio =>
  typeof ratio === 'number' && Number.isFinite(ratio) && ratio > 0;

export const getCachedImageRatio = uri =>
  uri && ratioCache.has(uri) ? ratioCache.get(uri) : null;

export const setCachedImageRatio = (uri, ratio) => {
  if (!uri || !isValidRatio(ratio)) {
    return;
  }
  ratioCache.set(uri, ratio);
};

export const loadImageRatio = uri => {
  if (!uri) {
    return Promise.resolve(null);
  }

  const cached = getCachedImageRatio(uri);
  if (cached) {
    return Promise.resolve(cached);
  }

  const pending = pendingCache.get(uri);
  if (pending) {
    return pending;
  }

  const loader = new Promise(resolve => {
    Image.getSize(
      uri,
      (width, height) => {
        const ratio = width && height ? width / height : null;
        if (isValidRatio(ratio)) {
          ratioCache.set(uri, ratio);
          resolve(ratio);
          return;
        }
        resolve(null);
      },
      () => resolve(null),
    );
  }).finally(() => {
    pendingCache.delete(uri);
  });

  pendingCache.set(uri, loader);
  return loader;
};

export const preloadImageRatios = uris => {
  if (!Array.isArray(uris) || uris.length === 0) {
    return;
  }
  uris.forEach(loadImageRatio);
};
