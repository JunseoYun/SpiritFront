import React, {useState, useMemo, useLayoutEffect, useEffect} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import MenuItem from '../../../components/StoreMenuScreen/MenuItem';
import {MenuUpdateSort, StoreMenudelete} from '../../../api/menuApi';

import useCustomAlert from '../../../hooks/useCustomAlert';
import Loading from '../../../hooks/Loading';
const BUTTON_HEIGHT = 64;

const MenuEditScreen = ({route, navigation}) => {
  const {menus, storeId, onMenuUpdateComplete, onMenuDelete} = route.params;

  const [activeTab, setActiveTab] = useState('MAIN');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const {showAlert, AlertComponent} = useCustomAlert();

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
  const stableItemProps = useMemo(
    () => ({
      isLast: true,
      isMainEditing: true,
      isUpdatable: true,
      onUpdateComplete: onMenuUpdateComplete,
      onDelete: (id, name) => {
        showAlert({
          title: `${name} 삭제`,
          message: `메뉴를 삭제하시겠습니까?`,
          onConfirm: async () => {
            try {
              await StoreMenudelete(id);
              setMainMenus(prev => prev.filter(m => m.id !== id));
              setNormalMenus(prev => prev.filter(m => m.id !== id));
              setSideMenus(prev => prev.filter(m => m.id !== id));
              onMenuDelete(id);
            } catch (error) {}
          },
          onCancel: null,
          type: 'delete',
        });
      },
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
      if (menuIdInOrderList.length !== 0) {
        await MenuUpdateSort(storeId, menuIdInOrderList);
        onMenuUpdateComplete?.();
      }
      navigation.goBack();
    } catch (error) {
      console.error('순서 저장 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuAdd = () => {
    navigation.navigate('MenuAddScreen', {storeId: storeId});
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleMenuAdd}>
          <Text style={styles.headerButton}>메뉴 추가</Text>
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
              <MemoizedMenuItem menu={item} {...stableItemProps} />
            </View>
            <TouchableOpacity
              onLongPress={drag}
              delayLongPress={100}
              style={styles.dragIcon}
              hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
              <Text style={styles.dragIconText}>☰</Text>
            </TouchableOpacity>
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
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

          <View style={styles.listWrapper}>
            {renderList(currentData, setCurrentData)}
          </View>

          <View
            style={styles.storeAddTextview}
            pointerEvents={isDragging ? 'none' : 'auto'}>
            <Pressable onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveText}>편집 완료</Text>
            </Pressable>
          </View>
          <Loading loading={loading} />
          <AlertComponent />
        </SafeAreaView>
      </TouchableWithoutFeedback>
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
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    color: '#16BBFF',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  activeTabButton: {
    backgroundColor: '#16BBFF',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#555',
  },
  MenuaddButton: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 25,
  },
  MenuaddButtonText: {
    color: '#45C9FF',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  activeTabText: {
    color: '#fff',
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
    marginLeft: 10,
    paddingVertical: 20,
  },
  dragIconText: {
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
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    paddingTop: 10,
  },
  saveButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#45C9FF',
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
