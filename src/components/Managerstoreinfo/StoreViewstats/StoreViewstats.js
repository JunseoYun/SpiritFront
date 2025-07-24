import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {store_view_stats_get} from '../../../api/logstats';
import StoreViewResult from './StoreViewResult';
import Dropdown from '../Dropdown';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Loading from '../../../hooks/Loading';

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

const UNIT_ORDER = ['day', 'week', 'month', 'year'];
const PERIOD_OPTIONS = [
  {label: '일', value: 'day'},
  {label: '주', value: 'week'},
  {label: '월', value: 'month'},
  {label: '년', value: 'year'},
];

const getShowByOptions = selectedPeriod => {
  const periodIndex = UNIT_ORDER.indexOf(selectedPeriod);
  return UNIT_ORDER.filter(
    u => u !== 'year' && UNIT_ORDER.indexOf(u) <= periodIndex,
  ).map(u => ({
    label: u === 'day' ? '일' : u === 'week' ? '주' : '월',
    value: u,
  }));
};

const StoreViewstats = ({storeId}) => {
  const [togglebtn, setTogglebtn] = useState(true);
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
        const showByIndex = UNIT_ORDER.indexOf(prev.showBy);
        const periodIndex = UNIT_ORDER.indexOf(value);
        let newShowBy = prev.showBy;
        if (showByIndex > periodIndex) {
          newShowBy = value === 'year' ? prev.showBy : value;
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

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTogglebtn(prev => !prev);
  };

  return (
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: '#f8f9fb'}}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* 헤더 */}
          <Pressable onPress={handleToggle} style={styles.header}>
            <FontAwesome5 name="sliders-h" size={16} color="#16BBFF" />
            <Text style={styles.headerTitle}>통계 조건 설정</Text>
            <Entypo
              name={togglebtn ? 'chevron-small-up' : 'chevron-small-down'}
              size={24}
              color="#333"
              style={{marginLeft: 'auto'}}
            />
          </Pressable>

          {togglebtn && (
            <View style={styles.card}>
              <View style={styles.row}>
                <Dropdown
                  label="조회 기간"
                  options={PERIOD_OPTIONS}
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
                  label="기간 단위"
                  options={getShowByOptions(form.period)}
                  selectedValue={form.showBy}
                  onValueChange={value => handleChange('showBy', value)}
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
                  const selected = form.ageGroup.includes(item.value);
                  return (
                    <Pressable
                      onPress={() => toggleAgeGroup(item.value)}
                      style={[styles.chip, selected && styles.chipSelected]}>
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelected,
                        ]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                }}
              />

              <Text style={styles.sectionTitle}>결과값 묶음 *</Text>
              <View style={styles.chipGroup}>
                {['gender', 'ageGroup'].map(gb => {
                  const sel = form.groupBy.includes(gb);
                  return (
                    <Pressable
                      key={gb}
                      onPress={() => toggleGroupBy(gb)}
                      style={[styles.chip, sel && styles.chipSelected]}>
                      <Text
                        style={[
                          styles.chipText,
                          sel && styles.chipTextSelected,
                        ]}>
                        {gb === 'gender' ? '성별' : '연령대'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>
          )}

          {result && (
            <View style={{marginTop: 20, marginHorizontal: 18}}>
              <StoreViewResult
                result={result}
                setLoading={setLoading}
                showBy={form.showBy}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerTitle: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
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
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  chip: {
    borderColor: '#dfdfdf',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  chipSelected: {
    backgroundColor: '#16BBFF22',
    borderColor: '#16BBFF',
  },
  chipText: {
    fontFamily: 'Pretendard-Medium',
    color: '#666',
    fontSize: 13,
  },
  chipTextSelected: {
    color: '#16BBFF',
    fontWeight: '600',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});
