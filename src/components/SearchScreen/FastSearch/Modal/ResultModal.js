import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ResultModalItem from './ResultModalItem';

const ResultModal = ({
  visible,
  onClose,
  selectedCategory,
  selectedPeople,
  selectedHour,
  selectedMinute,
  fastSearchStores,
  navigation,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.fastSearchModalBackground}>
        <View style={styles.fastSearchModalContainer}>
          <Image
            source={require('../../../../assets/todaylogo.png')}
            style={styles.fastSearchModaltopimage}
          />
          <View style={styles.searchModaltopview}>
            <Pressable
              onPress={onClose}
              style={styles.fastSearchModalcloseButton}>
              <AntDesign name="arrowleft" size={25} color={'black'} />
            </Pressable>
          </View>
          <View style={styles.fastSearchTextView}>
            <Text style={styles.fastSearchText}>{selectedCategory}</Text>
            <Text style={styles.fastSearchText}>{selectedPeople}</Text>
            <Text style={styles.fastSearchText}>
              {selectedHour}:{selectedMinute}
            </Text>
          </View>
          <ScrollView contentContainerStyle={styles.fastSearchModalScrollView}>
            {fastSearchStores.map(store => (
              <ResultModalItem
                key={store.storeId}
                store={store}
                navigation={navigation}
                onClose={onClose}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fastSearchModalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  fastSearchModalContainer: {
    width: '90%',
    height: '85%',
    paddingVertical: 5,
    paddingTop: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  fastSearchModaltopimage: {
    width: 120,
    resizeMode: 'contain',
    height: 120,
    marginTop: -25,
  },
  searchModaltopview: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -75,
  },
  fastSearchModalcloseButton: {
    alignItems: 'center',
  },
  fastSearchTextView: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  fastSearchText: {
    color: '#16BBFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  fastSearchModalScrollView: {
    marginTop: 1,
    paddingBottom: 50,
  },
});

export default ResultModal;
