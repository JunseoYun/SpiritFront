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
import {store_view_stats_get} from '../../../api/logstats';
import StoreViewResult from './StoreViewResult';
import Loading from '../../../hooks/Loading';
import CustomText from '../../common/CustomText';

const period = [
  {label: '오늘', value: 'day'},
  {label: '최근 7일', value: 'week'},
  {label: '최근 30일', value: 'month'},
  {label: '최근 1년', value: 'year'},
];

const UNIT_ORDER = ['day', 'week', 'month', 'year'];

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

const getShowByOptions = selectedPeriod => {
  const periodIndex = UNIT_ORDER.indexOf(selectedPeriod);
  return UNIT_ORDER.filter(u => {
    if (selectedPeriod === 'year') return u !== 'day' && u !== 'year';
    return u !== 'year' && UNIT_ORDER.indexOf(u) <= periodIndex;
  }).map(u => ({
    label: u === 'day' ? '일간' : u === 'week' ? '주간' : '월간',
    value: u,
  }));
};

const StoreViewstats = ({storeId}) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    storeId: storeId,
    period: 'month',
    gender: '',
    ageGroup: [''],
    groupBy: ['gender', 'ageGroup'],
    showBy: 'month',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const valid = getShowByOptions(form.period).map(o => o.value);
    if (valid.includes(form.showBy)) {
      fetchStats();
    }
  }, [
    form.period,
    form.gender,
    JSON.stringify(form.ageGroup),
    JSON.stringify(form.groupBy),
    form.showBy,
  ]);

  const fetchStats = async () => {
    setError('');
    if (!form.groupBy || form.groupBy.length === 0) {
      setError('결과값 묶음은 최소 하나 이상 선택해야 합니다.');
      setResult(null);
      return;
    }
    try {
      setLoading(true);
      const response = await store_view_stats_get(form);
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
    if (key === 'period') {
      setForm(prev => {
        const wasNotYear = prev.period !== 'year';
        const isNowYear = value === 'year';
        let newShowBy = prev.showBy;

        if (wasNotYear && isNowYear) {
          newShowBy = 'month'; // ✅ 'year'로 처음 바뀌었을 때만 'month'로
        } else {
          const showByIndex = UNIT_ORDER.indexOf(prev.showBy);
          const periodIndex = UNIT_ORDER.indexOf(value);
          if (showByIndex > periodIndex) {
            newShowBy = value;
          }
        }

        return {...prev, period: value, showBy: newShowBy};
      });
    } else {
      setForm(prev => ({...prev, [key]: value}));
    }
  };

  const toggleAgeGroup = age => {
    setForm(prev => {
      let arr = [...prev.ageGroup];
      if (age === '') return {...prev, ageGroup: ['']};
      if (arr.includes('')) arr = [age];
      else if (arr.includes(age)) arr = arr.filter(a => a !== age);
      else arr.push(age);
      if (arr.length === 0) arr = [''];
      return {...prev, ageGroup: arr};
    });
  };

  const toggleGroupBy = type => {
    setForm(prev => {
      const exists = prev.groupBy.includes(type);
      if (prev.groupBy.length === 1 && exists) {
        return {...prev, groupBy: [type === 'gender' ? 'ageGroup' : 'gender']};
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
        <ScrollView contentContainerStyle={styles.container}>
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
                const selected = form.ageGroup.includes(item.value);
                return (
                  <Pressable
                    onPress={() => toggleAgeGroup(item.value)}
                    style={[styles.chip, selected && styles.chipSelected]}>
                    <CustomText
                      style={[
                        styles.chipText,
                        selected && styles.chipTextSelected,
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
              <StoreViewResult
                key={`${form.period}-${form.gender}-${form.ageGroup.join(
                  ',',
                )}-${form.groupBy.join(',')}-${form.showBy}`}
                result={result}
                setLoading={setLoading}
                showBy={form.showBy}
                showByOptions={getShowByOptions(form.period)} // ✅ 전달
                onShowByChange={value => handleChange('showBy', value)} // ✅ 전달
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

export default StoreViewstats;

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
  periodSelected: {
    borderWidth: 1.2,
    borderRightWidth: 1.2,
    borderColor: '#3CBBFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 8,
    marginHorizontal: 16,
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
