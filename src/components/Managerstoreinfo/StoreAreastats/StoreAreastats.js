import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  FlatList,
} from 'react-native';
import {store_stats_get} from '../../../api/logstats';
import StoreAreaResult from './StoreAreaResult';
import Dropdown from '../Dropdown';
import Entypo from 'react-native-vector-icons/Entypo';
import Loading from '../../../hooks/Loading';

const AGE_OPTIONS = [
  {label: '전체', value: ''},
  ...['20s', '30s', '40s', '50s', '60s', '70s'].map(age => ({
    label: age.replace('s', '대'),
    value: age,
  })),
];

const StoreAreastats = ({locationDto}) => {
  const [togglebtn, setTogglebtn] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    period: 'month',
    latitude: locationDto.latitude,
    longitude: locationDto.longitude,
    radius: '2',
    gender: '',
    ageGroup: [''],
    groupBy: ['gender', 'ageGroup'],
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, [form]);

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

      // 결과값 묶음이 하나일 때, 해당 항목을 다시 클릭 → 다른 항목으로 전환
      if (prev.groupBy.length === 1 && exists) {
        const other = type === 'gender' ? 'ageGroup' : 'gender';
        return {...prev, groupBy: [other]};
      }

      // 선택되어 있으면 제거 (단, 1개 남았을 때는 제거하지 않음)
      if (exists) {
        if (prev.groupBy.length === 1) return prev;
        return {...prev, groupBy: prev.groupBy.filter(t => t !== type)};
      }

      // 2개 이상 선택 불가, 1개면 추가
      if (prev.groupBy.length < 2) {
        return {...prev, groupBy: [...prev.groupBy, type]};
      }

      return prev;
    });
  };
  // ‘전체’가 선택됐으면 true
  const isAllSelected = form.ageGroup.includes('');

  return (
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <ScrollView contentContainerStyle={styles.container}>
          <Pressable
            onPress={() => setTogglebtn(prev => !prev)}
            style={styles.titleview}>
            <Text style={styles.title}>매장 주변 조건</Text>
            {togglebtn ? (
              <Entypo
                name="chevron-small-up"
                size={25}
                color="#333"
                style={styles.icon}
              />
            ) : (
              <Entypo
                name="chevron-small-down"
                size={25}
                color="#333"
                style={styles.icon}
              />
            )}
          </Pressable>
          {togglebtn && (
            <>
              <View style={styles.row}>
                <Dropdown
                  label="조회 기간"
                  options={[
                    {label: '일', value: 'day'},
                    {label: '주', value: 'week'},
                    {label: '월', value: 'month'},
                    {label: '년', value: 'year'},
                  ]}
                  selectedValue={form.period}
                  onValueChange={value => handleChange('period', value)}
                />
                <Dropdown
                  label="성별"
                  options={[
                    {label: '전체', value: ''},
                    {label: '남자', value: 'MALE'},
                    {label: '여자', value: 'FEMALE'},
                  ]}
                  selectedValue={form.gender}
                  onValueChange={value => handleChange('gender', value)}
                />
                <Dropdown
                  label="거리"
                  options={[
                    {label: '2KM', value: '2'},
                    {label: '3KM', value: '3'},
                    {label: '5KM', value: '5'},
                  ]}
                  selectedValue={form.radius}
                  onValueChange={value => handleChange('radius', value)}
                />
              </View>

              <Text style={styles.sectionTitle}>연령대</Text>
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
                      style={[
                        styles.chip,
                        isSelected ? styles.chipSelected : styles.chipDisabled, // 선택된건 chipSelected, 아니면 chipDisabled
                      ]}>
                      <Text
                        style={
                          isSelected
                            ? styles.chipTextSelected
                            : styles.chipTextDisabled
                        }>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                }}
              />

              <Text style={styles.sectionTitle}>결과값 묶음 *</Text>
              <View style={styles.chipGroup}>
                {['gender', 'ageGroup'].map(gb => {
                  const isSelected = form.groupBy.includes(gb);
                  return (
                    <Pressable
                      key={gb}
                      onPress={() => toggleGroupBy(gb)}
                      style={[styles.chip, isSelected && styles.chipSelected]}>
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}>
                        {gb === 'gender' ? '성별' : '연령대'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </>
          )}

          {result && (
            <View style={{marginTop: 20}}>
              <StoreAreaResult result={result} setLoading={setLoading} />
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
    padding: 20,
  },
  titleview: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    gap: 3,
    alignSelf: 'center',
  },
  icon: {
    width: 25,
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    marginVertical: 12,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
    alignSelf: 'center',
  },
  chipGroupFlatList: {
    marginBottom: 12,
  },
  chip: {
    borderColor: '#dfdfdf',
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
  },
  chipDisabled: {
    borderColor: '#dfdfdf', // 테두리는 기본색 유지
    backgroundColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: '#fff', // 클릭된 칩은 파란색 배경
    borderWidth: 1,
    borderColor: '#16BBFF',
    opacity: 1,
  },
  chipText: {
    fontFamily: 'Pretendard-Medium',
    color: '#999',
  },
  chipTextSelected: {
    color: '#16BBFF',
  },
  chipTextDisabled: {
    color: '#999',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});
