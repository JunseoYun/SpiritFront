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
import {store_like_stats_get} from '../../../api/logstats';
import Dropdown from '../Dropdown';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import StoreLikeResult from './StoreLikeResult';
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

const StoreLikestats = ({storeId}) => {
  const [togglebtn, setTogglebtn] = useState(true);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    storeId,
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
      const response = await store_like_stats_get(form);
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
                  label="성별"
                  options={[
                    {label: '전체', value: ''},
                    {label: '남자', value: 'MALE'},
                    {label: '여자', value: 'FEMALE'},
                  ]}
                  selectedValue={form.gender}
                  onValueChange={value => handleChange('gender', value)}
                />
              </View>

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
                      style={[styles.chip, isSelected && styles.chipSelected]}>
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                }}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>
          )}

          {result && (
            <View style={{marginTop: 20, marginHorizontal: 18}}>
              <StoreLikeResult result={result} setLoading={setLoading} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
      <Loading loading={loading} />
    </>
  );
};

export default StoreLikestats;

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
