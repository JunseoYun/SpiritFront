import React from 'react';
import {StyleSheet, Text, View, Pressable, ScrollView} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const OwnerStoreList = ({
  OWNER_STORES,
  storesRef,
  onStoresScroll,
  selectedStore,
  handleStorePress,
}) => (
  <>
    <View style={styles.storesHeaderRow}>
      <Text style={styles.storesHeaderText}>운영 매장</Text>
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      ref={storesRef}
      onScroll={onStoresScroll}
      scrollEventThrottle={16}
      contentContainerStyle={styles.storesScroll}
      style={styles.storesContainer}>
      {OWNER_STORES.map(s => {
        const selected = selectedStore?.id === s.id;
        return (
          <Pressable
            key={s.id}
            onPress={() => handleStorePress(s)}
            style={[styles.storeChip, selected && styles.storeChipActive]}
            hitSlop={8}>
            <Ionicons
              name="business-outline"
              size={14}
              color={selected ? '#45C9FF' : '#6B7280'}
              style={{marginRight: 6}}
            />
            <Text
              style={[
                styles.storeChipText,
                selected && styles.storeChipTextActive,
              ]}>
              {s.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  </>
);
const styles = StyleSheet.create({
  storesHeaderRow: {paddingHorizontal: 16, paddingTop: 10},
  storesHeaderText: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#374151',
    fontSize: 13,
  },
  storesContainer: {paddingHorizontal: 12, paddingVertical: 10},
  storesScroll: {paddingHorizontal: 4, gap: 8, paddingRight: 12},
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  storeChipActive: {backgroundColor: '#E8F7FF', borderColor: '#45C9FF'},
  storeChipText: {
    fontFamily: 'Pretendard-Medium',
    color: '#6B7280',
    fontSize: 13,
  },
  storeChipTextActive: {color: '#45C9FF', fontFamily: 'Pretendard-SemiBold'},
});

export default OwnerStoreList;
