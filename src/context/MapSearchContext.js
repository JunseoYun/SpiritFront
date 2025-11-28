import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

// Shared search/filter state between Map and Search screens
const MapSearchContext = createContext(null);

// Exported so other screens can reset to the same defaults
export const buildInitialSelectedFilters = () => ({
  거리: '2km',
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

export const INITIAL_RADIUS_KM = 2;

export const MapSearchProvider = ({children}) => {
  // Top search text shown in MapTopBar and set from SearchScreen
  const [searchText, setSearchText] = useState('');

  // Radius in km for store fetching (0.5, 1, 2, 3, 5, ...)
  const [radiusKm, setRadiusKm] = useState(INITIAL_RADIUS_KM);

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
      selectedFilters,
      setSelectedFilters,
    }),
    [searchText, radiusKm, selectedFilters],
  );

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
