import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
} from 'react-native';
import ActionButtons from './ActionButtons'; // 분리된 ActionButtons 컴포넌트

const UpdateStoreCategory = ({
  innerCategories,
  updatedValue,
  setUpdatedValue,
  onCancel,
  onSave,
}) => {
  return (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.title}>카테고리* 최대 3개</Text>
      <ScrollView>
        <View style={styles.categoryContainer}>
          {innerCategories.map((category, index) => (
            <Pressable
              key={index}
              style={[
                styles.categoryItem,
                updatedValue.includes(category.value) &&
                  styles.selectedCategory,
              ]}
              onPress={() => {
                if (updatedValue.includes(category.value)) {
                  setUpdatedValue(
                    updatedValue.filter(val => val !== category.value),
                  );
                } else if (updatedValue.length < 3) {
                  setUpdatedValue([...updatedValue, category.value]);
                }
              }}>
              <Image source={category.source} style={styles.categoryImage} />
              <Text style={styles.categoryText}>{category.text}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <ActionButtons onCancel={onCancel} onSave={onSave} />
    </View>
  );
};

export default UpdateStoreCategory;

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    padding: 18,
    backgroundColor: '#F7F7F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '18%',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 5,
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: '#10BEFB',
    borderRadius: 10,
  },
  categoryImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  categoryText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});
