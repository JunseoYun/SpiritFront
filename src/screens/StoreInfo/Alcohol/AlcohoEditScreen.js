import React, {useState, useMemo, useLayoutEffect} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import AlcoholItem from '../../../components/StoreAlcoholScreen/AlcoholItem';
import {DrinkUpdateSort, StoreDrinkdelete} from '../../../api/drinkApi';
import useCustomAlert from '../../../hooks/useCustomAlert';
import Loading from '../../../hooks/Loading';

const BUTTON_HEIGHT = 64;

const alcoholMapping = {
  SOJU: '소주',
  BEER: '맥주',
  MAKGEOLLI: '막걸리',
  HIGHBALL: '하이볼',
  WINE: '와인',
  COCKTAIL: '칵테일',
  SAKE: '사케',
  KAOLIANG: '고량주',
  WHISKEY: '위스키',
  VODKA: '보드카',
  GIN: '진',
  TEQUILA: '데킬라',
};

const AlcoholEditScreen = ({route, navigation}) => {
  const {
    alcohols = [],
    storeId,
    onAlcoholUpdateComplete,
    onAlcoholDelete,
  } = route.params;

  const [activeTab, setActiveTab] = useState('SOJU');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const {showAlert, AlertComponent} = useCustomAlert();

  const [alcoholGroups, setAlcoholGroups] = useState(() => {
    const grouped = {};
    Object.keys(alcoholMapping).forEach(type => {
      grouped[type] = alcohols.filter(a => a.type === type);
    });
    return grouped;
  });

  const MemoizedAlcoholItem = React.memo(AlcoholItem);

  const stableItemProps = useMemo(
    () => ({
      isLast: true,
      isUpdatable: true,
      isMainEditing: true,
      onDelete: (id, name) => {
        showAlert({
          title: `${name} 삭제`,
          message: `주류를 삭제하시겠습니까?`,
          onConfirm: async () => {
            try {
              setAlcoholGroups(prev => {
                const updated = {...prev};
                Object.keys(updated).forEach(key => {
                  updated[key] = updated[key].filter(d => d.id !== id);
                });
                return updated;
              });
              await StoreDrinkdelete(id);
              onAlcoholDelete(id);
            } catch (e) {}
          },
          type: 'delete',
        });
      },
      onUpdate: updatedDrink => {
        setAlcoholGroups(prev => {
          const updated = {...prev};
          const type = updatedDrink.type;
          if (updated[type]) {
            updated[type] = updated[type].map(d =>
              d.id === updatedDrink.id ? updatedDrink : d,
            );
          }
          return updated;
        });
      },
      onTypeChange: (drinkId, newType) => {
        setAlcoholGroups(prev => {
          const updated = {...prev};
          const all = Object.values(updated).flat();
          const drink = all.find(d => d.id === drinkId);
          if (!drink) return updated;

          const oldType = drink.type;
          updated[oldType] = updated[oldType].filter(d => d.id !== drinkId);
          drink.type = newType;
          updated[newType] = [...(updated[newType] || []), drink];

          return updated;
        });
        setActiveTab(newType);
      },
    }),
    [],
  );

  const handleSave = async () => {
    const orderList = Object.values(alcoholGroups)
      .flat()
      .map(d => d.id);
    try {
      setLoading(true);
      await DrinkUpdateSort(storeId, orderList);
      onAlcoholUpdateComplete?.();
      navigation.goBack();
    } catch (e) {
      console.error('주류 순서 저장 실패', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAlcoholAdd = () => {
    navigation.navigate('AlcoholAddScreen', {storeId});
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleAlcoholAdd}>
          <Text style={styles.headerButton}>주류 추가</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const currentData = alcoholGroups[activeTab] || [];
  const setCurrentData = updated =>
    setAlcoholGroups(prev => ({...prev, [activeTab]: updated}));

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
              <MemoizedAlcoholItem alcohol={item} {...stableItemProps} />
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
      contentContainerStyle={{paddingBottom: BUTTON_HEIGHT + 32}}
      showsVerticalScrollIndicator={false}
    />
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <View pointerEvents={isDragging ? 'none' : 'auto'}>
            <View style={styles.tabContainer}>
              {Object.entries(alcoholMapping)
                .filter(([type]) => (alcoholGroups[type] || []).length > 0) // ✅ 해당 타입이 실제 존재하는 경우만 표시
                .map(([type, label]) => (
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
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
            {alcohols.length === 0 && (
              <TouchableOpacity
                style={styles.MenuaddButton}
                onPress={handleAlcoholAdd}>
                <Text style={styles.MenuaddButtonText}>+ 주류 추가하기</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.listWrapper}>
            {renderList(currentData, setCurrentData)}
          </View>

          <View
            style={styles.footer}
            pointerEvents={isDragging ? 'none' : 'auto'}>
            <Pressable onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveText}>편집 완료</Text>
            </Pressable>
          </View>

          <AlertComponent />
          <Loading loading={loading} />
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
  headerButton: {
    marginRight: 18,
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    color: '#16BBFF',
  },
  tabContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    marginVertical: 12,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#eee',
    margin: 4,
  },
  activeTabButton: {
    backgroundColor: '#16BBFF',
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    color: '#555',
  },
  activeTabText: {
    color: '#fff',
  },
  MenuaddButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  MenuaddButtonText: {
    color: '#45C9FF',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
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
  listWrapper: {
    flex: 1,
  },
  footer: {
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

export default AlcoholEditScreen;
