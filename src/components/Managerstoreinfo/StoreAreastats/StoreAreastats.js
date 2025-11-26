import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  FlatList,
  Platform,
  UIManager,
} from 'react-native';
import {store_stats_get} from '../../../api/logstats';
import StoreAreaResult from './StoreAreaResult';
import Loading from '../../../hooks/Loading';
import CustomText from '../../../utils/CustomText';

const period = [
  {label: '오늘', value: 'day'},
  {label: '최근 7일', value: 'week'},
  {label: '최근 30일', value: 'month'},
  {label: '최근 1년', value: 'year'},
];
const gender = [
  {label: '전체', value: ''},
  {label: '남자', value: 'MALE'},
  {label: '여자', value: 'FEMALE'},
];
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AGE_OPTIONS = [
  {label: '전체', value: ''},
  ...['20s', '30s', '40s', '50s', '60s', '70s'].map(age => ({
    label: age.replace('s', '대'),
    value: age,
  })),
];

const StoreAreastats = ({locationDto, radius, onScrollCloseDropdown}) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    period: 'month',
    latitude: locationDto.latitude,
    longitude: locationDto.longitude,
    // latitude: '12.34',
    // longitude: '12.34',
    radius: radius,
    gender: '',
    ageGroup: [''],
    groupBy: ['gender', 'ageGroup'],
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, [form]);

  useEffect(() => {
    setForm(prev => ({...prev, radius}));
  }, [radius]);

  const fetchStats = async () => {
    setError('');
    if (!form.groupBy || form.groupBy.length === 0) {
      setError('결과값 묶음은 최소 하나 이상 선택해야 합니다.');
      setResult(null);
      return;
    }
    try {
      setLoading(true);
      const response = await store_stats_get(form);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError('API 요청 중 오류가 발생했습니다.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm(prev => ({...prev, [key]: value}));
  };

  const toggleAgeGroup = age => {
    setForm(prev => {
      let newAgeGroup = [...prev.ageGroup];
      const isAll = age === '';
      const isSelected = newAgeGroup.includes(age);

      if (isAll) {
        return {...prev, ageGroup: ['']};
      }

      if (newAgeGroup.includes('')) {
        return {...prev, ageGroup: [age]};
      }

      if (isSelected) {
        newAgeGroup = newAgeGroup.filter(a => a !== age);
      } else {
        newAgeGroup.push(age);
      }

      if (newAgeGroup.length === 0) {
        newAgeGroup = [''];
      }

      return {...prev, ageGroup: newAgeGroup};
    });
  };

  const toggleGroupBy = type => {
    setForm(prev => {
      const exists = prev.groupBy.includes(type);

      if (prev.groupBy.length === 1 && exists) {
        const other = type === 'gender' ? 'ageGroup' : 'gender';
        return {...prev, groupBy: [other]};
      }

      if (exists) {
        if (prev.groupBy.length === 1) return prev;
        return {...prev, groupBy: prev.groupBy.filter(t => t !== type)};
      }

      if (prev.groupBy.length < 2) {
        return {...prev, groupBy: [...prev.groupBy, type]};
      }

      return prev;
    });
  };

  return (
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <ScrollView
          contentContainerStyle={styles.container}
          onScrollBeginDrag={onScrollCloseDropdown}>
          <View style={styles.card}>
            <View style={styles.periodView}>
              {period.map((per, idx) => {
                const isSelected = form.period === per.value;
                const isNextToSelected = period[idx - 1]?.value === form.period;

                return (
                  <Pressable
                    key={per.value}
                    onPress={() => handleChange('period', per.value)}
                    style={[
                      styles.periodButton,
                      idx !== period.length - 1 && {borderRightWidth: 0},

                      isSelected && styles.periodSelected,
                      isNextToSelected && {borderLeftWidth: 0},
                    ]}>
                    <CustomText
                      style={[
                        styles.periodText,
                        isSelected && styles.chipTextSelected,
                      ]}>
                      {per.label}
                    </CustomText>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.genderView}>
              {gender.map((gen, idx) => {
                const isSelected = form.gender === gen.value;
                return (
                  <Pressable
                    key={gen.value}
                    hitSlop={10}
                    style={[styles.genderButton]}
                    onPress={() => handleChange('gender', gen.value)}>
                    <View
                      style={[
                        styles.genderPoint,
                        isSelected && {backgroundColor: '#3CBBFF'},
                      ]}
                    />
                    <CustomText
                      style={[
                        styles.genderText,
                        isSelected && styles.chipTextSelected,
                      ]}>
                      {gen.label}
                    </CustomText>
                  </Pressable>
                );
              })}
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={AGE_OPTIONS}
              keyExtractor={item => item.value}
              contentContainerStyle={styles.chipGroupFlatList}
              renderItem={({item}) => {
                const isSelected = form.ageGroup.includes(item.value);
                return (
                  <Pressable
                    onPress={() => toggleAgeGroup(item.value)}
                    style={[styles.chip, isSelected && styles.chipSelected]}>
                    <CustomText
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}>
                      {item.label}
                    </CustomText>
                  </Pressable>
                );
              }}
            />

            {error ? (
              <CustomText style={styles.error}>{error}</CustomText>
            ) : null}
          </View>

          {result && (
            <View style={{marginTop: 10}}>
              <StoreAreaResult
                result={result}
                setLoading={setLoading}
                groupBy={form.groupBy}
                toggleGroupBy={toggleGroupBy}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
      <Loading loading={loading} />
    </>
  );
};

export default StoreAreastats;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
  },
  periodView: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 15,
    borderColor: '#ddd',
  },
  periodButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  periodText: {
    fontFamily: 'Pretendard-Medium',
    color: '#666',
    fontSize: 12,
  },
  periodSelected: {
    borderWidth: 1.2,
    borderRightWidth: 1.2,
    borderColor: '#3CBBFF',
  },
  genderView: {
    marginHorizontal: 16,
    flexDirection: 'row',
    marginBottom: 15,
  },
  genderButton: {
    marginLeft: 3,
    marginRight: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderPoint: {
    width: 5,
    height: 5,
    borderRadius: 30,
    backgroundColor: '#ddd',
    marginRight: 5,
  },
  genderText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#999',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    marginVertical: 12,
    color: '#333',
    marginHorizontal: 16,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  chipGroupFlatList: {
    marginTop: 5,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  chip: {
    borderColor: '#dfdfdf',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginRight: 10,
  },
  chipSelected: {
    borderColor: '#3CBBFF',
  },
  chipText: {
    fontFamily: 'Pretendard-Medium',
    color: '#666',
    fontSize: 13,
  },
  chipTextSelected: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-Bold',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});
