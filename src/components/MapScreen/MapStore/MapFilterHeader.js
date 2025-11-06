import React, {useMemo, useRef, useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const MapFilterHeader = ({
  setFilterInitialTab,
  setFilterModalVisible,
  distanceLabel,
  categoryLabel,
  peopleLabel,
  alcoholLabel,
  timeActive,
  parkingLabel,
  corkageLabel,
  screenLabel,
  roomLabel,
  outdoorLabel,
  storeatmLabel,
  storeatmCount = 0,
}) => {
  return (
    <View style={styles.headerContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.headerScroll}>
        <TouchableOpacity
          style={styles.filterChip}
          onPress={() => {
            setFilterInitialTab('거리');
            setFilterModalVisible(true);
          }}>
          <MaterialCommunityIcons name="tune-variant" size={17} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, styles.filterChipActive]}
          onPress={() => {
            setFilterInitialTab('거리');
            setFilterModalVisible(true);
          }}>
          <Text style={[styles.filterText, styles.filterTextActive]}>
            {distanceLabel}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            categoryLabel !== '카테고리' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('카테고리');
            setFilterModalVisible(true);
          }}>
          <Text
            style={[
              styles.filterText,
              categoryLabel !== '카테고리' && styles.filterTextActive,
            ]}>
            {categoryLabel}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            alcoholLabel !== '주종' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('주종');
            setFilterModalVisible(true);
          }}>
          <Text
            style={[
              styles.filterText,
              alcoholLabel !== '주종' && styles.filterTextActive,
            ]}>
            {alcoholLabel}
          </Text>
        </TouchableOpacity>
        <View>
          <TouchableOpacity
            style={[
              styles.filterChip,
              storeatmCount > 0 && styles.filterChipActive,
            ]}
            onPress={() => {
              setFilterInitialTab('매장분위기');
              setFilterModalVisible(true);
            }}>
            <Text
              style={[
                styles.filterText,
                storeatmCount > 0 && styles.filterTextActive,
              ]}>
              매장분위기
            </Text>
          </TouchableOpacity>
          {storeatmCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText} allowFontScaling={false}>
                {storeatmCount}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterChip,
            timeActive !== '방문시간' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('방문시간');
            setFilterModalVisible(true);
          }}>
          <Text
            style={[
              styles.filterText,
              timeActive !== '방문시간' && styles.filterTextActive,
            ]}>
            {timeActive}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            peopleLabel !== '인원' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('인원');
            setFilterModalVisible(true);
          }}>
          <Text
            style={[
              styles.filterText,
              peopleLabel !== '인원' && styles.filterTextActive,
            ]}>
            {peopleLabel}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            parkingLabel == '가능' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('편의시설');
            setFilterModalVisible(true);
          }}>
          <Text
            style={[
              styles.filterText,
              parkingLabel == '가능' && styles.filterTextActive,
            ]}>
            주차
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            corkageLabel == '가능' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('편의시설');
            setFilterModalVisible(true);
          }}>
          <Text
            style={[
              styles.filterText,
              corkageLabel == '가능' && styles.filterTextActive,
            ]}>
            콜키지
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            screenLabel == '설치' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('편의시설');
            setFilterModalVisible(true);
          }}>
          <Text
            style={[
              styles.filterText,
              screenLabel == '설치' && styles.filterTextActive,
            ]}>
            스크린
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            roomLabel == '가능' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('편의시설');
            setFilterModalVisible(true);
          }}>
          <Text
            style={[
              styles.filterText,
              roomLabel == '가능' && styles.filterTextActive,
            ]}>
            룸
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            outdoorLabel == '가능' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('편의시설');
            setFilterModalVisible(true);
          }}>
          <Text
            style={[
              styles.filterText,
              outdoorLabel == '가능' && styles.filterTextActive,
            ]}>
            야장
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'white',
  },
  headerScroll: {
    paddingHorizontal: 12,
    columnGap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    marginVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
  },
  filterChipActive: {
    backgroundColor: '#E9F5FB',
    borderColor: '#3CBBFF',
  },
  filterText: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Pretendard-Regular',
  },
  filterTextActive: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-Bold',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3CBBFF',
    zIndex: 100,
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontFamily: 'Pretendard-Bold',
    textAlign: 'center',
  },
});

export default MapFilterHeader;
