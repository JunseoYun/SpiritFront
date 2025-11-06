import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react';

// Shared search/filter state between Map and Search screens
const MapSearchContext = createContext(null);

export const MapSearchProvider = ({children}) => {
  // Top search text shown in MapTopBar and set from SearchScreen
  const [searchText, setSearchText] = useState('');

  // Radius in km for store fetching (0.5, 1, 2, 3, 5, ...)
  const [radiusKm, setRadiusKm] = useState(1);

  // Keep filter selections in one place so Map screen and Search screen reflect the same chips
  // Note: Some keys include mojibake from original source; we keep them for compatibility
  const [selectedFilters, setSelectedFilters] = useState({
    거리: '1km',
    카테고리: '',
    주종: '',
    매장분위기: '',
    방문시간: '', // kept as-is to match existing usage (mojibake in repo)
    인원: '', // 인원 (mojibake in repo)
    주차: '',
    콜키지: '',
    스크린: '', // 스크린 (mojibake in repo)
    룸: '', // 룸 (mojibake in repo)
    야장: '', // 야장 (mojibake in repo)
  });

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
