// StoreManageScreen.js
import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
  PixelRatio,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import StoreMainManageScreen from './StoreMainManageScreen';
import StoreMenuManageScreen from './StoreMenuManageScreen';
import StoreAlcoholManageScreen from './StoreAlcoholManageScreen';
import StoreManageHeader from '../../../components/StoreManage/StoreManageHeader';
import StoreManageTitle from '../../../components/StoreManage/StoreManageTitle';
import StoreManageTabBar from '../../../components/StoreManage/StoreManageTabBar';
import StoreMenuScreen, {MenuCategoryRadioGroup} from '../StoreMenuScreen';
import StoreAlcoholScreen, {AlcoholTypeRadioGroup} from '../StoreAlcoholScreen';
import Loading from '../../../hooks/Loading';
import useCustomAlert from '../../../hooks/useCustomAlert';
import CustomText from '../../../utils/CustomText';
const fontScale = PixelRatio.getFontScale();

const iconSize = fontScale >= 1.5 ? 22 : 16;

const StoreManageScreen = ({route, navigation}) => {
  const {storeId, storedata, storeName} = route.params || {};
  const [activeTab, setActiveTab] = useState('main');
  const insets = useSafeAreaInsets();
  const FILTER_STICKY_DELAY =
    Platform.OS === 'android' ? 100 + insets.top : 88 + insets.top; // px offset before filters stick

  // 1. Add currentStoreName state for dynamic updates
  const [currentStoreName, setCurrentStoreName] = useState(storeName);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [menuCategory, setMenuCategory] = useState('전체');
  const [menuRadioLayout, setMenuRadioLayout] = useState({y: 0, height: 0});
  const [isMenuFilterSticky, setIsMenuFilterSticky] = useState(false);
  const [alcoholFilter, setAlcoholFilter] = useState('전체');
  const [alcoholRadioLayout, setAlcoholRadioLayout] = useState({
    y: 0,
    height: 0,
  });
  const [alcoholTypes, setAlcoholTypes] = useState([]);
  const [isAlcoholFilterSticky, setIsAlcoholFilterSticky] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [hasMenuSortChanges, setHasMenuSortChanges] = useState(false);
  const [hasAlcoholSortChanges, setHasAlcoholSortChanges] = useState(false);
  const [menutopheight, setMenutopheight] = useState(0);
  const [alcoholtopheight, setAlcoholtopheight] = useState(0);

  const titleOpacity = scrollY.interpolate({
    inputRange: [35, 70],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const {showAlert, AlertComponent} = useCustomAlert();

  const handleMenuFilterLayout = useCallback(e => {
    const {y, height} = e.nativeEvent.layout;
    setMenuRadioLayout({y, height});
  }, []);

  const handleAlcoholFilterLayout = useCallback(e => {
    const {y, height} = e.nativeEvent.layout;
    setAlcoholRadioLayout({y, height});
  }, []);

  const handleMenuSortDirtyChange = useCallback(value => {
    setHasMenuSortChanges(value);
  }, []);

  const handleAlcoholSortDirtyChange = useCallback(value => {
    setHasAlcoholSortChanges(value);
  }, []);

  const handleTabPress = useCallback(
    nextTab => {
      if (nextTab === activeTab) {
        return true;
      }

      if (activeTab === 'menu' && hasMenuSortChanges) {
        showAlert({
          title: '메뉴 순서가 저장되지 않았습니다.',
          message: '뒤로 가시겠습니까?',
          onConfirm: () => {
            setHasAlcoholSortChanges(false);
            setActiveTab(nextTab);
          },
          onCancel: null,
          type: 'confirm',
        });
        return false;
      }

      if (activeTab === 'alcohol' && hasAlcoholSortChanges) {
        showAlert({
          title: '주류 순서가 저장되지 않았습니다.',
          message: '뒤로 가시겠습니까?',
          onConfirm: () => {
            setHasAlcoholSortChanges(false);
            setActiveTab(nextTab);
          },
          onCancel: null,
          type: 'confirm',
        });
        return false;
      }

      setActiveTab(nextTab);
      return true;
    },
    [
      activeTab,
      hasMenuSortChanges,
      hasAlcoholSortChanges,
      setActiveTab,
      showAlert,
    ],
  );

  useEffect(() => {
    const listenerId = scrollY.addListener(({value}) => {
      if (menuRadioLayout.y > 0 && headerHeight > 0) {
        const menuTriggerPoint = Math.max(
          menutopheight -
            headerHeight +
            (Platform.OS === 'ios' ? insets.top + 20 : insets.top + 30),
          0,
        );
        const shouldStickMenu =
          activeTab === 'menu' && value >= menuTriggerPoint;
        setIsMenuFilterSticky(prev =>
          prev === shouldStickMenu ? prev : shouldStickMenu,
        );
      } else {
        setIsMenuFilterSticky(false);
      }

      if (alcoholRadioLayout.y > 0 && headerHeight > 0) {
        const alcoholTriggerPoint = Math.max(
          alcoholtopheight -
            headerHeight +
            (Platform.OS === 'ios' ? insets.top + 20 : insets.top + 30),
          0,
        );
        const shouldStickAlcohol =
          activeTab === 'alcohol' && value >= alcoholTriggerPoint;
        setIsAlcoholFilterSticky(prev =>
          prev === shouldStickAlcohol ? prev : shouldStickAlcohol,
        );
      } else {
        setIsAlcoholFilterSticky(false);
      }
    });

    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [
    scrollY,
    headerHeight,
    menuRadioLayout.y,
    alcoholRadioLayout.y,
    activeTab,
  ]);

  const renderScreen = () => {
    switch (activeTab) {
      case 'main':
        return (
          <>
            {/* 2. Pass currentStoreName instead of storedata?.name */}
            <StoreManageTitle
              iconSize={iconSize}
              storeRate={storedata?.storeRate}
              reviewCount={storedata?.reviewCount}
              likeCount={storedata?.likeCount}
              name={currentStoreName}
              type={activeTab}
            />
            <StoreMainManageScreen
              navigation={navigation}
              storeId={storeId}
              storedata={storedata}
              // 3. Pass onGoBack for updating store name after editing
              onMainInfoGoBack={async updatedData => {
                if (updatedData?.name) setCurrentStoreName(updatedData.name);
              }}
            />
          </>
        );
      case 'menu':
        return (
          <StoreMenuManageScreen
            navigation={navigation}
            storeId={storeId}
            storeName={currentStoreName}
            onSortDirtyChange={handleMenuSortDirtyChange}>
            {({menus, loading, error, refreshMenus}) => (
              <>
                {/* <StoreManageTitle name={currentStoreName} type={activeTab} /> */}
                {error && (
                  <CustomText style={styles.errorText}>{error}</CustomText>
                )}
                <StoreMenuScreen
                  navigation={navigation}
                  storeId={storeId}
                  menus={menus}
                  loading={loading}
                  onMenuUpdateComplete={refreshMenus}
                  isUpdatable={true}
                  selectedCategory={menuCategory}
                  onCategoryChange={setMenuCategory}
                  categoryFilterProps={{
                    onLayout: handleMenuFilterLayout,
                  }}
                  onSortDirtyChange={handleMenuSortDirtyChange}
                  setMenutopheight={setMenutopheight}
                />
                <Loading loading={loading} />
              </>
            )}
          </StoreMenuManageScreen>
        );
      case 'alcohol':
        return (
          <StoreAlcoholManageScreen
            navigation={navigation}
            storeId={storeId}
            storeName={currentStoreName}
            mainDrinks={storedata?.mainDrinkDtos}
            onSortDirtyChange={handleAlcoholSortDirtyChange}>
            {({
              alcohols,
              loading,
              error,
              refreshAlcohols,
              sectionPositions,
              setSectionPositions,
            }) => (
              <>
                {/* <StoreManageTitle name={currentStoreName} type={activeTab} /> */}
                {error && (
                  <CustomText style={styles.errorText}>{error}</CustomText>
                )}
                <StoreAlcoholScreen
                  navigation={navigation}
                  storeId={storeId}
                  alcohols={alcohols}
                  mainDrinks={storedata?.mainDrinkDtos}
                  sectionPositions={sectionPositions}
                  setSectionPositions={setSectionPositions}
                  isUpdatable={true}
                  selectedType={alcoholFilter}
                  onTypeChange={setAlcoholFilter}
                  onAvailableTypesChange={setAlcoholTypes}
                  onAlcoholUpdateComplete={refreshAlcohols}
                  typeFilterProps={{
                    onLayout: handleAlcoholFilterLayout,
                  }}
                  onSortDirtyChange={handleAlcoholSortDirtyChange}
                  setAlcoholtopheight={setAlcoholtopheight}
                />
                <Loading loading={loading} />
              </>
            )}
          </StoreAlcoholManageScreen>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <StoreManageHeader
        navigation={navigation}
        iconColor="#333"
        titleOpacity={titleOpacity}
        title={currentStoreName}
        storeId={storeId}
        onLayout={e => setHeaderHeight(e.nativeEvent.layout.height)}
      />
      {isMenuFilterSticky && activeTab === 'menu' && (
        <View style={[styles.stickyFilterContainer, {top: headerHeight}]}>
          <MenuCategoryRadioGroup
            selectedCategory={menuCategory}
            onSelect={setMenuCategory}
          />
        </View>
      )}

      {isAlcoholFilterSticky && activeTab === 'alcohol' && (
        <View style={[styles.stickyFilterContainer, {top: headerHeight}]}>
          <AlcoholTypeRadioGroup
            types={alcoholTypes}
            selectedType={alcoholFilter}
            onSelect={setAlcoholFilter}
          />
        </View>
      )}

      <Animated.ScrollView
        keyboardShouldPersistTaps="handled"
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: 100 + insets.bottom},
          {
            paddingTop:
              Platform.OS === 'ios' ? insets.top + 20 : insets.top + 30,
          },
        ]}>
        {renderScreen()}
      </Animated.ScrollView>

      {/* 👇 커스텀 탭바 */}
      <StoreManageTabBar activeTab={activeTab} onTabPress={handleTabPress} />
      <AlertComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    marginHorizontal: 18,
    marginVertical: 10,
    color: '#F56C6C',
    fontFamily: 'Pretendard-Medium',
  },
  reorderButton: {
    backgroundColor: '#F1F2F3',
    padding: 12,
    marginHorizontal: 18,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  menuAddButtonText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Pretendard-Bold',
  },
  stickyFilterContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 8,
    zIndex: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tabContainer: {
    position: 'absolute',
    alignSelf: 'center',
    width: '90%',
    height: 70,
    borderRadius: 40,

    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    backgroundColor: 'transparent',
    zIndex: 100,
    overflow: 'hidden',
    borderWidth: 0.4,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  activeBox: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  label: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 11.5,
    marginTop: 3,
  },
});

export default StoreManageScreen;
