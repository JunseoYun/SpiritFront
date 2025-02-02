import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import AlcoholHeader from '../../components/StoreAlcoholScreen/AlcoholHeader';
import AlcoholItem from '../../components/StoreAlcoholScreen/AlcoholItem';
import {StoreDrinkdelete} from '../../api/drinkApi';
import useCustomAlert from '../../hooks/useCustomAlert';

const StoreAlcoholScreen = ({navigation, storeId, alcohols, scrollViewRef}) => {
  const [openItemId, setOpenItemId] = useState(null); // 열려 있는 메뉴 ID 관리
  const [alcoholList, setAlcoholList] = useState(alcohols);
  const {showAlert, AlertComponent} = useCustomAlert();

  useEffect(() => {
    setAlcoholList(alcohols);
  }, [alcohols]);

  const handleOpenItem = id => {
    setOpenItemId(id); // 현재 열려 있는 항목의 ID 설정
  };

  const handleCloseAll = () => {
    setOpenItemId(null); // 모든 항목 닫기
  };

  const handleDeleteAlcohol = (id, name) => {
    handleCloseAll();
    showAlert({
      title: `${name} 삭제`,
      message: `주류를 삭제하시겠습니까?`,
      onConfirm: async () => {
        try {
          await StoreDrinkdelete(id);
          setAlcoholList(prevAlcohols =>
            prevAlcohols.filter(alcohol => alcohol.id !== id),
          );
        } catch (error) {}
      },
      onCancel: null,
      type: 'delete',
    });
  };

  const handleEditAlcohol = updatedAlcohol => {
    setAlcoholList(prevAlcohols =>
      prevAlcohols.map(alcohol =>
        alcohol.id === updatedAlcohol.id ? updatedAlcohol : alcohol,
      ),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AlcoholHeader storeId={storeId} navigation={navigation} />
      {alcoholList &&
        alcoholList.map(alcohol => (
          <AlcoholItem
            key={alcohol.id}
            alcohol={alcohol}
            isOpen={openItemId === alcohol.id}
            onOpen={() => handleOpenItem(alcohol.id)}
            onClose={handleCloseAll}
            onEdit={handleEditAlcohol}
            onDelete={() => handleDeleteAlcohol(alcohol.id, alcohol.name)}
            scrollViewRef={scrollViewRef}
          />
        ))}

      <AlertComponent />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
});

export default StoreAlcoholScreen;
