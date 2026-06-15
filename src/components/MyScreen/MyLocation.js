import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {getAddress, getSearchRadius} from '../../storage/locationStorage';
import CustomText from '../../utils/CustomText';
import {
  formatRadiusLabel,
  INITIAL_RADIUS_KM,
} from '../../context/MapSearchContext';

const MyLocation = ({navigation, onContentLayout}) => {
  const [address, setAddress] = useState('');
  const [radiusLabel, setRadiusLabel] = useState(
    formatRadiusLabel(INITIAL_RADIUS_KM),
  );

  const fetchLocation = async () => {
    try {
      const storageAddress = await getAddress();
      setAddress(storageAddress || '저장된 주소가 없습니다.');
      const storedRadius = await getSearchRadius();
      if (typeof storedRadius === 'number') {
        setRadiusLabel(formatRadiusLabel(storedRadius));
      } else {
        setRadiusLabel(formatRadiusLabel(INITIAL_RADIUS_KM));
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLocation();
    }, []),
  );

  const searchAddressHandle = () => {
    navigation.navigate('SetLocationScreen');
  };

  return (
    <View style={styles.container} onLayout={onContentLayout}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="location-outline" size={18} color="#64748B" />
        </View>

        <View style={styles.textWrap}>
          <CustomText style={styles.label}>현재 설정된 위치</CustomText>

          <CustomText style={styles.address} numberOfLines={2}>
            {address}
          </CustomText>

          <View style={styles.metaRow}>
            <CustomText style={styles.metaLabel}>탐색 반경</CustomText>
            <CustomText style={styles.metaValue}>{radiusLabel}</CustomText>
          </View>
        </View>
      </View>

      <Pressable
        onPress={searchAddressHandle}
        style={({pressed}) => [styles.button, pressed && styles.buttonPressed]}>
        <Feather name="crosshair" size={16} color="#111827" />
        <CustomText style={styles.buttonText}>내 위치 변경하기</CustomText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },

  textWrap: {
    flex: 1,
    paddingRight: 4,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Pretendard-Regular',
    marginBottom: 6,
  },
  address: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Pretendard-SemiBold',
    lineHeight: 20,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  metaLabel: {
    fontSize: 12.5,
    color: '#9CA3AF',
    fontFamily: 'Pretendard-Regular',
    marginRight: 8,
  },
  metaValue: {
    fontSize: 12.5,
    color: '#374151',
    fontFamily: 'Pretendard-SemiBold',
  },

  button: {
    marginTop: 14,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonText: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default MyLocation;
