import React, {useState, useMemo, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {StyleSheet, View} from 'react-native';
import {StoreMainget} from '../../../api/storeApi';
import {getEventsByStore} from '../../../api/eventApi';
import {
  ParkingCircle,
  Users,
  DoorOpen,
  Sun,
  Wine,
  Tv2,
} from 'lucide-react-native';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';
import Loading from '../../../hooks/Loading';
import ManagementButton from '../../../components/StoreManage/ManagementButton';
import StoreManageActionButtons from '../../../components/StoreManage/StoreMainManage/StoreManageActionButtons';
import StoreImageManagementSection from '../../../components/StoreManage/StoreMainManage/StoreImageManagementSection';
import StoreMainInfoSection from '../../../components/StoreManage/StoreMainManage/StoreMainInfoSection';
import StoreExtraInfoSection from '../../../components/StoreManage/StoreMainManage/StoreExtraInfoSection';
import StoreLocationSection from '../../../components/StoreManage/StoreMainManage/StoreLocationSection';
import StoreHoursSection from '../../../components/StoreManage/StoreMainManage/StoreHoursSection';
import StoreEventSection from '../../../components/StoreManage/StoreMainManage/StoreEventSection';

const dayOrder = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

// Mood options
const MOOD_OPTIONS = [
  {value: 'QUIET', text: '대화하기 좋은'},
  {value: 'LIVELY', text: '활기찬'},
  {value: 'SOLO_FRIENDLY', text: '혼술'},
  {value: 'DATE', text: '데이트'},
  {value: 'PARTY_EVENT', text: '파티·이벤트'},
  {value: 'TRADITIONAL', text: '전통적인'},
  {value: 'EXOTIC', text: '이국적인'},
  {value: 'MODERN', text: '모던·깔끔한'},
  {value: 'OLD_SCHOOL', text: '노포 감성'},
  {value: 'VIEW_SPOT', text: '뷰 맛집'},
  {value: 'LOCAL_FAVORITE', text: '로컬 맛집'},
  {value: 'SECOND_ROUND', text: '2차 맛집'},
];

// Facility options

const FACILITY_OPTIONS = [
  {key: 'hasScreen', text: '스크린·TV', icon: Tv2},
  {key: 'hasRoom', text: '룸', icon: DoorOpen},
  {key: 'hasOutdoor', text: '야외 좌석·테라스', icon: Sun},
  {key: 'isGroupAvailable', text: '단체 방문 가능', icon: Users},
  {key: 'isParkingAvailable', text: '주차 가능', icon: ParkingCircle},
  {key: 'isCorkageAvailable', text: '콜키지 가능', icon: Wine},
];

const formatImageList = (list, options = {}) => {
  const {allowFallbackFields = false} = options;
  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .map(item => {
      if (typeof item === 'string') {
        return item;
      }

      if (allowFallbackFields) {
        const possibleFields = [
          'url',
          'imageUrl',
          'originUrl',
          'imgUrl',
          'thumbnailUrl',
          'path',
          'uri',
        ];
        for (const field of possibleFields) {
          if (item?.[field]) {
            return item[field];
          }
        }
      }

      return item?.url || item?.imageUrl || '';
    })
    .filter(Boolean);
};

const StoreMainManageScreen = ({
  storeId,
  storedata,
  navigation,
  onMainInfoGoBack,
}) => {
  const {translateCategory} = useCategoryTranslation();
  const {translateAlcohol} = useTranslateAlcohol();

  const [loading, setLoading] = useState(false);
  const [storeInfo, setStoreInfo] = useState(storedata);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  const storeImageUrls = useMemo(
    () =>
      formatImageList(storeInfo?.imgUrlList || [], {
        allowFallbackFields: true,
      }),
    [storeInfo],
  );
  const menuImageUrls = useMemo(
    () =>
      formatImageList(storeInfo?.boardImageDtoList || [], {
        allowFallbackFields: true,
      }),
    [storeInfo],
  );
  const refreshStoreInfo = useCallback(async () => {
    try {
      const updated = await StoreMainget(storeId);
      setStoreInfo(updated);
      return updated;
    } catch (err) {
      console.log('Failed to refresh store data', err);
      return null;
    }
  }, [storeId]);

  const fetchEvents = useCallback(async () => {
    if (!storeId) {
      setEvents([]);
      return;
    }
    setEventsLoading(true);
    try {
      const list = await getEventsByStore(storeId);
      setEvents(Array.isArray(list) ? list : []);
    } catch (error) {
      console.log('Failed to load store events', error);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, [storeId]);

  // Show the header title only after the user scrolls past the store name section

  const operationInfo = useMemo(() => {
    const infos = storeInfo?.operationInfoDtos || [];
    return infos.sort(
      (a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek),
    );
  }, [storeInfo]);

  // Translate main drinks using shared hook
  const translatedMainDrinks = useMemo(() => {
    if (!storeInfo?.mainDrinkDtos) return [];
    return storeInfo.mainDrinkDtos
      .map(drink => translateAlcohol(drink?.type))
      .filter(Boolean);
  }, [storeInfo, translateAlcohol]);

  // Translate moods using MOOD_OPTIONS
  const translatedMoods = useMemo(() => {
    if (!storeInfo?.moods) return [];
    return storeInfo.moods
      .map(
        mood =>
          (MOOD_OPTIONS.find(option => option.value === mood) || {}).text ||
          mood,
      )
      .filter(Boolean);
  }, [storeInfo]);
  const translatedCategories = useMemo(() => {
    if (!storeInfo?.categories) {
      return [];
    }
    return storeInfo.categories
      .map(cat => translateCategory(cat))
      .filter(Boolean);
  }, [storeInfo, translateCategory]);
  const enabledFacilities = useMemo(() => {
    if (!storeInfo?.facilitiesInfoDto) return [];
    return FACILITY_OPTIONS.filter(
      opt => storeInfo.facilitiesInfoDto?.[opt.key],
    ).map(opt => opt.text);
  }, [storeInfo]);
  const extraInfoItems = useMemo(() => {
    const placeholder = '등록된 정보가 없습니다.';
    return [
      {
        key: 'categories',
        label: '카테고리',
        values: translatedCategories,
        placeholder,
      },
      {
        key: 'mainDrinks',
        label: '대표 주종',
        values: translatedMainDrinks,
        placeholder,
      },
      {
        key: 'moods',
        label: '분위기',
        values: translatedMoods,
        placeholder,
      },
      {
        key: 'facilities',
        label: '편의시설',
        values: enabledFacilities,
        placeholder,
      },
    ];
  }, [
    translatedCategories,
    translatedMainDrinks,
    translatedMoods,
    enabledFacilities,
  ]);

  const actionButtons = useMemo(
    () => [
      {
        key: 'stats',
        label: '통계',
        icon: {name: 'stats-chart', size: 20, color: '#525D6F'},
        onPress: () =>
          navigation.navigate('StoreStack', {
            screen: 'ManagerStoreInfoScreen',
            params: {
              storeId: storeInfo?.id,
              storename: storeInfo?.name,
              locationDto: storeInfo?.locationDto,
            },
          }),
      },
      {
        key: 'manager',
        label: '운영진',
        icon: {name: 'person-sharp', size: 20, color: '#525D6F'},
        onPress: () =>
          navigation.navigate('StoreStack', {
            screen: 'StoreManagerScreen',
            params: {
              storeId: storeInfo?.id,
              storename: storeInfo?.name,
            },
          }),
      },
      {
        key: 'review',
        label: '리뷰',
        icon: {name: 'chatbubble-ellipses', size: 20, color: '#525D6F'},
        onPress: () =>
          navigation.navigate('StoreStack', {
            screen: 'StoreReviewScreen',
            params: {
              storeId: storeInfo?.id,
              storename: storeInfo?.name,
              isOwner: true,
            },
          }),
      },
      {
        key: 'report',
        label: '제보·신고',
        icon: {name: 'information-circle', size: 25, color: '#525D6F'},
        onPress: () =>
          navigation.navigate('StoreStack', {
            screen: 'StoreReportList',
            params: {
              storeId: storeInfo?.id,
              storename: storeInfo?.name,
            },
          }),
      },
    ],
    [navigation, storeInfo],
  );

  const imageCards = useMemo(
    () => [
      {
        key: 'storeImage',
        title: '매장 사진 관리',
        imageUrls: storeImageUrls,
        onPress: () =>
          navigation.navigate('StoreStack', {
            screen: 'StoreUpdateScreen',
            params: {
              storeId: storeInfo?.id,
              initialStoreData: storeInfo,
              type: 'image',
              onGoBack: refreshStoreInfo,
            },
          }),
      },
      {
        key: 'menuImage',
        title: '메뉴판 관리',
        imageUrls: menuImageUrls,
        onPress: () =>
          navigation.navigate('StoreStack', {
            screen: 'InfoImageEditScreen',
            params: {
              storeId,
              imgList: storeInfo?.boardImageDtoList,
            },
          }),
      },
    ],
    [
      navigation,
      storeId,
      storeImageUrls,
      menuImageUrls,
      refreshStoreInfo,
      storeInfo,
    ],
  );

  const handleEventManagerGoBack = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  // Refetch store info when screen regains focus
  useFocusEffect(
    useCallback(() => {
      refreshStoreInfo();
      fetchEvents();
    }, [refreshStoreInfo, fetchEvents]),
  );

  return (
    <View style={styles.container}>
      <StoreManageActionButtons actions={actionButtons} />
      <StoreImageManagementSection cards={imageCards} />
      <StoreMainInfoSection storeInfo={storeInfo} />
      <ManagementButton
        onPress={() =>
          navigation.navigate('StoreStack', {
            screen: 'StoreUpdateScreen',
            params: {
              storeId: storeInfo?.id,
              initialStoreData: storeInfo,
              type: 'mainInfo',
              onGoBack: async () => {
                const updated = await refreshStoreInfo();
                if (updated && onMainInfoGoBack) {
                  onMainInfoGoBack({name: updated?.name});
                }
              },
            },
          })
        }
        title={'매장 정보 관리'}
      />

      <StoreExtraInfoSection title="부가 정보" items={extraInfoItems} />
      <ManagementButton
        onPress={() =>
          navigation.navigate('StoreStack', {
            screen: 'StoreUpdateScreen',
            params: {
              storeId: storeInfo?.id,
              initialStoreData: storeInfo,
              type: 'subInfo',
              onGoBack: refreshStoreInfo,
            },
          })
        }
        title={'부가 정보 관리'}
      />

      <StoreLocationSection
        title="위치"
        location={storeInfo?.locationDto}
        storeName={storeInfo?.name}
      />
      <ManagementButton
        onPress={() =>
          navigation.navigate('StoreStack', {
            screen: 'StoreUpdateScreen',
            params: {
              storeId: storeInfo?.id,
              initialStoreData: storeInfo,
              type: 'address',
              onGoBack: refreshStoreInfo,
            },
          })
        }
        title={'위치 관리'}
      />

      <StoreHoursSection
        title="영업시간"
        operationInfo={operationInfo}
        isAlwaysOpen={storeInfo?.isAlwaysOpen}
      />
      <ManagementButton
        onPress={() =>
          navigation.navigate('StoreStack', {
            screen: 'StoreUpdateScreen',
            params: {
              storeId: storeInfo?.id,
              initialStoreData: storeInfo,
              type: 'hours',
              onGoBack: refreshStoreInfo,
            },
          })
        }
        title={'영업시간 관리'}
      />

      <View style={styles.divider} />
      <StoreEventSection
        title="이벤트"
        events={events}
        loading={eventsLoading}
        navigation={navigation}
      />
      <ManagementButton
        onPress={() =>
          navigation.navigate('StoreStack', {
            screen: 'StoreUpdateScreen',
            params: {
              storeId: storeInfo?.id,
              initialStoreData: storeInfo,
              events: events,
              type: 'event',
              onGoBack: handleEventManagerGoBack,
            },
          })
        }
        title={'이벤트 관리'}
      />
      <Loading loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFF'},
  divider: {
    backgroundColor: '#EFEFEF',
    height: 1,
    marginHorizontal: 16,
    marginVertical: 30,
  },
});

export default StoreMainManageScreen;
