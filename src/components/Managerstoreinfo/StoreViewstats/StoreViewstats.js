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
import {store_view_stats_get} from '../../../api/logstats';
import StoreViewResult from './StoreViewResult';
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

const UNIT_ORDER = ['day', 'week', 'month', 'year'];
const PERIOD_OPTIONS = [
  {label: '일', value: 'day'},
  {label: '주', value: 'week'},
  {label: '월', value: 'month'},
  {label: '년', value: 'year'},
];

// period에 따라 showBy 옵션 생성 (year 제외)
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
  const [togglebtn, setTogglebtn] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    storeId: storeId,
    period: 'month',
    gender: '',
    ageGroup: [''],
    groupBy: ['gender', 'ageGroup'],
    showBy: 'month', // 기본값은 사용 가능한 항목 내에서 설정
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
        // 현재 showBy 순서 인덱스
        const showByIndex = UNIT_ORDER.indexOf(prev.showBy);
        // 새로 선택된 period 인덱스
        const periodIndex = UNIT_ORDER.indexOf(value);

        let newShowBy = prev.showBy;

        // showBy가 period보다 크면 showBy를 period로 맞춤 (단, year는 showBy가 될 수 없으니 제외)
        if (showByIndex > periodIndex) {
          // 만약 period가 year라면 showBy는 바꾸지 말고 그대로 둠
          // showBy에 year는 없으니 period가 year면 유지
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

  return (
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <ScrollView contentContainerStyle={styles.container}>
          <Pressable
            onPress={() => setTogglebtn(prev => !prev)}
            style={styles.titleview}>
            <Text style={styles.title}>매장 조회 조건</Text>
            <Entypo
              name={togglebtn ? 'chevron-small-up' : 'chevron-small-down'}
              size={25}
              color="#333"
              style={styles.icon}
            />
          </Pressable>

          {togglebtn && (
            <>
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
                data={AGE_OPTIONS}
                keyExtractor={item => item.value}
                contentContainerStyle={styles.chipGroupFlatList}
                renderItem={({item}) => {
                  const selected = form.ageGroup.includes(item.value);
                  return (
                    <Pressable
                      onPress={() => toggleAgeGroup(item.value)}
                      style={[
                        styles.chip,
                        selected ? styles.chipSelected : styles.chipDisabled,
                      ]}>
                      <Text
                        style={
                          selected
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
            </>
          )}

          {result && (
            <View style={{marginTop: 20}}>
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

const styles = StyleSheet.create({
  container: {padding: 20},
  titleview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 3,
    alignSelf: 'center',
  },
  icon: {width: 25},
  title: {fontSize: 18, fontFamily: 'Pretendard-Bold'},
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    marginVertical: 12,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
    alignSelf: 'center',
  },
  chipGroupFlatList: {marginBottom: 12},
  chip: {
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    borderColor: '#dfdfdf',
  },
  chipDisabled: {backgroundColor: 'transparent'},
  chipSelected: {backgroundColor: '#fff', borderColor: '#16BBFF', opacity: 1},
  chipText: {fontFamily: 'Pretendard-Medium', color: '#999'},
  chipTextSelected: {color: '#16BBFF'},
  chipTextDisabled: {color: '#999'},
  error: {color: 'red', marginTop: 10},
});

export default StoreViewstats;
