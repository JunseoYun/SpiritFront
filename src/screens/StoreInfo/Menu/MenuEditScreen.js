import React, {
  useState,
  useMemo,
  useLayoutEffect,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import MenuItem from '../../../components/StoreMenuScreen/MenuItem';
import {MenuUpdateSort, StoreMenudelete} from '../../../api/menuApi';
import {useFocusEffect} from '@react-navigation/native';
import useCustomAlert from '../../../hooks/useCustomAlert';
import Loading from '../../../hooks/Loading';
import useSafeAndroidInsets from '../../../hooks/useSafeAndroidInsets';
import {normalizeFont} from '../../../hooks/normalizeFont';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useToast} from '../../../context/ToastContext';
const BUTTON_HEIGHT = 64;

const MenuEditScreen = ({route, navigation}) => {
  const {menus, storeId, onMenuUpdateComplete, onMenuDelete} = route.params;
  const {bottom} = useSafeAndroidInsets();
  const [activeTab, setActiveTab] = useState('MAIN');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingDeletes, setPendingDeletes] = useState([]);

  const {showAlert, AlertComponent} = useCustomAlert();
  const {showToast} = useToast();

  const [mainMenus, setMainMenus] = useState(
    menus.filter(m => m.menuType === 'MAIN'),
  );
  const [normalMenus, setNormalMenus] = useState(
    menus.filter(m => m.menuType === 'NORMAL'),
  );
  const [sideMenus, setSideMenus] = useState(
    menus.filter(m => m.menuType === 'SIDE'),
  );

  const MemoizedMenuItem = React.memo(MenuItem);
  const draftsRef = useRef({}); // id -> draft fields to persist in-progress edits
  const itemRefs = useRef({});
  const setItemBridge = useCallback(
    id => api => {
      if (api) itemRefs.current[id] = api;
      else delete itemRefs.current[id];
    },
    [],
  );
  const stableItemProps = useMemo(
    () => ({
      navigation: navigation,
      isLast: true,
      isMainEditing: true,
      isUpdatable: true,
      onUpdateComplete: onMenuUpdateComplete,
      storeId,
      onTypeChange: (menuId, newType) => {
        const allMenus = [...mainMenus, ...normalMenus, ...sideMenus];
        const changedMenu = allMenus.find(menu => menu.id === menuId);
        if (!changedMenu) return;

        const updatedMenu = {...changedMenu, menuType: newType};

        if (changedMenu.menuType === 'MAIN') {
          setMainMenus(prev => prev.filter(m => m.id !== menuId));
        } else if (changedMenu.menuType === 'NORMAL') {
          setNormalMenus(prev => prev.filter(m => m.id !== menuId));
        } else {
          setSideMenus(prev => prev.filter(m => m.id !== menuId));
        }

        if (newType === 'MAIN') {
          setMainMenus(prev => [...prev, updatedMenu]);
        } else if (newType === 'NORMAL') {
          setNormalMenus(prev => [...prev, updatedMenu]);
        } else {
          setSideMenus(prev => [...prev, updatedMenu]);
        }
        setActiveTab(newType);
      },
      onMenuUpdate: updatedMenu => {
        const updateList = list =>
          list.map(m => (m.id === updatedMenu.id ? updatedMenu : m));

        if (updatedMenu.menuType === 'MAIN') {
          setMainMenus(prev => updateList(prev));
        } else if (updatedMenu.menuType === 'NORMAL') {
          setNormalMenus(prev => updateList(prev));
        } else {
          setSideMenus(prev => updateList(prev));
        }
      },
    }),
    [mainMenus, normalMenus, sideMenus],
  );

  const requestMenuDelete = useCallback(
    (id, name) => {
      setMainMenus(prev => prev.filter(m => m.id !== id));
      setNormalMenus(prev => prev.filter(m => m.id !== id));
      setSideMenus(prev => prev.filter(m => m.id !== id));
      setPendingDeletes(prev => (prev.includes(id) ? prev : [...prev, id]));
      delete draftsRef.current[id];
      showToast(`${name}삭제 목록에 추가되었습니다.`);
    },
    [showToast, setMainMenus, setNormalMenus, setSideMenus, setPendingDeletes],
  );

  // Header buttons: Add, and Back with unsaved-changes guard
  useLayoutEffect(() => {
    const hasAnyEditing = () => {
      const refs = Object.values(itemRefs.current || {});
      return refs.some(r => r?.isEditing?.());
    };
    const isOrderChanged = () => {
      const currentIds = [...mainMenus, ...normalMenus, ...sideMenus].map(
        m => m.id,
      );
      const originalIds = menus.map(m => m.id);
      if (currentIds.length !== originalIds.length) return true;
      for (let i = 0; i < currentIds.length; i++) {
        if (currentIds[i] !== originalIds[i]) return true;
      }
      return false;
    };

    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleMenuAdd}>
          <Text style={styles.headerButton} allowFontScaling={false}>
            메뉴 추가
          </Text>
        </Pressable>
      ),
      headerLeft: () => (
        <Pressable
          onPress={() => {
            const changed = hasAnyEditing() || isOrderChanged();
            if (!changed) {
              navigation.goBack();
              return;
            }
            showAlert({
              title: '저장되지 않은 변경사항',
              message: '변경사항이 저장되지 않습니다. 뒤로 가시겠습니까?',
              onConfirm: () => navigation.goBack(),
              onCancel: null,
              type: 'confirm',
            });
          }}
          hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
          <Ionicons
            name="arrow-back-outline"
            size={23}
            color="#333"
            style={{paddingLeft: 12}}
          />
        </Pressable>
      ),
    });
  }, [navigation, mainMenus, normalMenus, sideMenus, menus]);

  const handleSave = async () => {
    const orderedMain = mainMenus.map(menu => menu.id);
    const orderedNormal = normalMenus.map(menu => menu.id);
    const orderedSide = sideMenus.map(menu => menu.id);

    const menuIdInOrderList = [
      ...orderedMain,
      ...orderedNormal,
      ...orderedSide,
    ];

    try {
      setLoading(true);
      // perform pending deletions first
      for (const id of pendingDeletes) {
        try {
          await StoreMenudelete(id);
        } catch (e) {}
      }
      if (menuIdInOrderList.length !== 0) {
        await MenuUpdateSort(storeId, menuIdInOrderList);
      }
      if (onMenuUpdateComplete) {
        await onMenuUpdateComplete();
      }
      navigation.popToTop();
    } catch (error) {
      console.error('순서 저장 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuAdd = () => {
    navigation.navigate('MenuAddScreen', {storeId: storeId});
  };

  const handleCompletePress = () => {
    // Start loading immediately when user taps complete
    setLoading(true);
    const refs = Object.values(itemRefs.current || {});
    const hasEditing = refs.some(r => r?.isEditing?.());

    // simple validation using current drafts to avoid closing on invalid inputs
    const validateDraft = d => {
      if (!d) return false;
      const nameOk = !!String(d.name ?? '').trim();
      const typeOk = !!String(d.type ?? '').trim();
      const isVar = !!d.isVariable;
      const priceOk = isVar || !!String(d.price ?? '').trim();
      return nameOk && typeOk && priceOk;
    };
    if (hasEditing) {
      const invalid = Object.entries(itemRefs.current || {})
        .filter(([, api]) => api?.isEditing?.())
        .some(([id]) => !validateDraft(draftsRef.current[id]));
      if (invalid) {
        showToast('필수 입력값을 확인해 주세요.');
        setLoading(false);
        return;
      }
    }
    if (hasEditing) {
      showAlert({
        title: '변경사항 저장',
        message: '변경사항을 저장하시겠습니까?',
        onConfirm: async () => {
          for (const r of refs) {
            try {
              if (r?.isEditing?.()) await r.save?.();
            } catch (e) {}
          }
          await handleSave();
        },
        onCancel: () => {
          // User canceled; stop loading and just go back
          setLoading(false);
          navigation.goBack();
        },
        type: 'confirm',
      });
    } else {
      handleSave();
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleMenuAdd}>
          <Text style={styles.headerButton} allowFontScaling={false}>
            메뉴 추가
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, handleMenuAdd]);

  const renderList = (data, setData) => (
    <DraggableFlatList
      data={data}
      onDragBegin={() => setIsDragging(true)}
      onDragEnd={({data}) => {
        setIsDragging(false);
        setData(data);
      }}
      keyExtractor={item => item.id.toString()}
      renderItem={({item, drag, isActive}) => (
        <Animated.View style={{transform: [{scale: isActive ? 1.02 : 1}]}}>
          <View style={styles.itemRow}>
            <View style={{flex: 1}}>
              <MemoizedMenuItem
                menu={item}
                expose={setItemBridge(item.id)}
                autoEdit={true}
                draft={draftsRef.current[item.id]}
                onDraftChange={(id, draft) => {
                  draftsRef.current[id] = draft;
                }}
                hideInlineActions={true}
                {...stableItemProps}
              />
            </View>
            <View style={styles.dragIconWrap}>
              <View style={styles.dragIconCenter}>
                <TouchableOpacity
                  onLongPress={drag}
                  delayLongPress={100}
                  style={styles.dragIcon}
                  hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
                  <Text style={styles.dragIconText}>☰</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => requestMenuDelete(item.id, item.name)}
                style={styles.sideDeleteBtn}
                hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
                <Text style={styles.sideDeleteText}>삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
      activationDistance={20}
      autoscrollThreshold={50}
      autoscrollSpeed={60}
      contentContainerStyle={{paddingBottom: BUTTON_HEIGHT + 32}}
      showsVerticalScrollIndicator={false}
    />
  );

  const getCurrentData = () => {
    if (activeTab === 'MAIN') return [mainMenus, setMainMenus];
    if (activeTab === 'NORMAL') return [normalMenus, setNormalMenus];
    return [sideMenus, setSideMenus];
  };

  const [currentData, setCurrentData] = getCurrentData();

  const lastBackPressed = useRef(0);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const now = Date.now();

        if (now - lastBackPressed.current < 2000) {
          navigation.goBack();
          return true;
        }

        lastBackPressed.current = now;
        ToastAndroid.show(
          '한 번 더 누르면 작성한 내용이 사라집니다.',
          ToastAndroid.SHORT,
        );
        return true; // 기본 동작 막기
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove(); // cleanup
    }, [navigation]),
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <SafeAreaView style={[styles.container, {paddingBottom: bottom}]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View pointerEvents={isDragging ? 'none' : 'auto'}>
            {menus.length > 0 && (
              <View style={styles.tabContainer}>
                {['MAIN', 'NORMAL', 'SIDE'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.tabButton,
                      activeTab === type && styles.activeTabButton,
                    ]}
                    onPress={() => setActiveTab(type)}>
                    <Text
                      allowFontScaling={false}
                      style={[
                        styles.tabText,
                        activeTab === type && styles.activeTabText,
                      ]}>
                      {type === 'MAIN'
                        ? '대표 메뉴'
                        : type === 'NORMAL'
                        ? '일반 메뉴'
                        : '사이드 메뉴'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {menus.length === 0 && (
              <TouchableOpacity
                style={styles.MenuaddButton}
                onPress={handleMenuAdd}>
                <Text style={styles.MenuaddButtonText}>+ 메뉴 추가하기</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.listWrapper}>
          {renderList(currentData, setCurrentData)}
        </View>

        <View
          style={[
            styles.storeAddTextview,
            {paddingBottom: Platform.OS === 'ios' ? 30 : 10 + bottom},
          ]}
          pointerEvents={isDragging ? 'none' : 'auto'}>
          <Pressable onPress={handleCompletePress} style={styles.saveButton}>
            <Text style={styles.saveText}>편집 완료</Text>
          </Pressable>
        </View>
        <Loading loading={loading} />
        <AlertComponent />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFD',
  },
  listWrapper: {
    flex: 1,
  },
  headerButton: {
    marginRight: 18,
    fontSize: normalizeFont(17, 1.5),
    fontFamily: 'Pretendard-SemiBold',
    color: '#3CBBFF',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  tabButton: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activeTabButton: {
    backgroundColor: '#E8F7FF', // 선택 시 배경색
    borderColor: '#3CBBFF',
  },
  tabText: {
    fontSize: normalizeFont(14, 1.7),
    fontFamily: 'Pretendard-Medium',
    color: '#555',
  },
  MenuaddButton: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 25,
  },
  MenuaddButtonText: {
    color: '#3CBBFF',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  activeTabText: {
    color: '#3CBBFF',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    borderRadius: 17,
    marginVertical: 5,
    marginHorizontal: 12,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  dragIcon: {
    paddingVertical: 8,
  },
  dragIconWrap: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'column',
    marginLeft: 7,
  },
  dragIconCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideDeleteBtn: {bottom: 25},
  sideDeleteText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#FF6347',
    fontFamily: 'Pretendard-Regular',
  },
  dragIconText: {
    textAlign: 'center',
    fontSize: 24,
    color: '#888',
  },
  storeAddTextview: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    borderTopWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 18,

    paddingTop: 10,
  },
  saveButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3CBBFF',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveText: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },
});

export default MenuEditScreen;
