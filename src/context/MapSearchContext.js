import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import {
  DEFAULT_SEARCH_RADIUS_KM,
  getSearchRadius,
} from '../storage/locationStorage';

// Shared search/filter state between Map and Search screens
const MapSearchContext = createContext(null);

// Exported so other screens can reset to the same defaults
export const INITIAL_RADIUS_KM = DEFAULT_SEARCH_RADIUS_KM;

export const formatRadiusLabel = radiusKm => {
  if (radiusKm === 0.5) return '500m';
  if (typeof radiusKm === 'number') return `${radiusKm}km`;
  return `${INITIAL_RADIUS_KM}km`;
};

export const buildInitialSelectedFilters = (
  radiusKm = INITIAL_RADIUS_KM,
) => ({
  거리: formatRadiusLabel(radiusKm),
  카테고리: '',
  주종: '',
  가격순: '',
  매장분위기: '',
  방문시간: '',
  인원: '',
  주차: '',
  콜키지: '',
  스크린: '',
  룸: '',
  야장: '',
});

export const MapSearchProvider = ({children}) => {
  // Top search text shown in MapTopBar and set from SearchScreen
  const [searchText, setSearchText] = useState('');

  // Radius in km for store fetching (0.5, 1, 2, 3, 5, ...)
  const [radiusKm, setRadiusKm] = useState(INITIAL_RADIUS_KM);
  // Persisted radius from storage; used to decide when filters differ from saved defaults
  const [storedRadiusKm, setStoredRadiusKm] = useState(INITIAL_RADIUS_KM);

  // Keep filter selections in one place so Map screen and Search screen reflect the same chips
  // Note: Some keys include mojibake from original source; we keep them for compatibility
  const [selectedFilters, setSelectedFilters] = useState(
    () => buildInitialSelectedFilters(),
  );

  const value = useMemo(
    () => ({
      searchText,
      setSearchText,
      radiusKm,
      setRadiusKm,
      storedRadiusKm,
      setStoredRadiusKm,
      selectedFilters,
      setSelectedFilters,
    }),
    [searchText, radiusKm, storedRadiusKm, selectedFilters],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const storedRadius = await getSearchRadius();
        if (cancelled || typeof storedRadius !== 'number') {
          return;
        }
        setStoredRadiusKm(storedRadius);
        setRadiusKm(storedRadius);
        setSelectedFilters(prev => {
          const filters = prev || {};
          const keys = Object.keys(filters);
          const distanceKey =
            keys.find(key =>
              (key || '').replace(/\s/g, '').includes('거리'),
            ) || '거리';
          return {
            ...filters,
            [distanceKey]: formatRadiusLabel(storedRadius),
          };
        });
      } catch (e) {
        // ignore storage errors and keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MapSearchContext.Provider value={value}>
      {children}
    </MapSearchContext.Provider>
  );
};

export const useMapSearch = () => {
  const ctx = useContext(MapSearchContext);
  if (!ctx)
    throw new Error('useMapSearch must be used within MapSearchProvider');
  return ctx;
};
