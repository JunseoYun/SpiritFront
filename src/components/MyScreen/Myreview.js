import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const Myreview = () => {
  return (
    <View style={{marginBottom: 20}}>
      <View style={styles.reviewtopview}>
        <View style={styles.titletopview}>
          <View style={styles.titleinnerview}>
            <Text style={styles.titletext}>땀땀 신논현점</Text>
            <Text style={styles.categorytext}>이자카야</Text>
          </View>
          <Text style={styles.categorytext}>24.07.18</Text>
        </View>
        <View style={styles.iconsview}>
          <FontAwesomeIcon name="star" size={15} color="#FCC104" />
          <FontAwesomeIcon name="star" size={15} color="#FCC104" />
          <FontAwesomeIcon name="star" size={15} color="#FCC104" />
          <FontAwesomeIcon name="star" size={15} color="#FCC104" />
          <FontAwesomeIcon name="star" size={15} color="#FCC104" />
        </View>
        <Text style={styles.subtext}>
          맛있게 잘 먹었어요! 간단하게 회식갈때 좋은 것 같아요! 다음에 또 재방문
          할께요 ㅎㅎ
        </Text>
        <View style={styles.deleteview}>
          <Text style={styles.deletetext}>삭제</Text>
        </View>
      </View>
      <View style={styles.reviewtopview}>
        <View style={styles.titletopview}>
          <View style={styles.titleinnerview}>
            <Text style={styles.titletext}>비어룸</Text>
            <Text style={styles.categorytext}>호프</Text>
          </View>
          <Text style={styles.categorytext}>24.05.17</Text>
        </View>
        <View style={styles.iconsview}>
          <FontAwesomeIcon name="star" size={15} color="#FCC104" />
          <FontAwesomeIcon name="star" size={15} color="#FCC104" />
          <FontAwesomeIcon name="star" size={15} color="#FCC104" />
          <FontAwesomeIcon name="star" size={15} color="#FCC104" />
        </View>
        <Text style={styles.subtext}>
          안주 가성비 좋았어요 장소는 조금 시끄러웠지만 안주는 good 맥주 종류
          다양 시켰던 메뉴 굿
        </Text>
        <Image
          source={require('../../assets/kim.png')}
          style={styles.reviewimg}
        />
        <View style={styles.deleteview}>
          <Text style={styles.deletetext}>삭제</Text>
        </View>
      </View>
      <View style={styles.reviewtopview}>
        <View style={styles.titletopview}>
          <View style={styles.titleinnerview}>
            <Text style={styles.titletext}>비어룸</Text>
            <Text style={styles.categorytext}>호프</Text>
          </View>
          <Text style={styles.categorytext}>24.05.17</Text>
        </View>
        <View style={styles.iconsview}>
          <FontAwesomeIcon name="star" size={15} color="#FCC104" />
          <FontAwesomeIcon name="star" size={15} color="#FCC104" />
          <FontAwesomeIcon name="star" size={15} color="#FCC104" />
          <FontAwesomeIcon name="star" size={15} color="#FCC104" />
        </View>
        <Text style={styles.subtext}>
          안주 가성비 좋았어요 장소는 조금 시끄러웠지만 안주는 good 맥주 종류
          다양 시켰던 메뉴 굿
        </Text>
        <Image
          source={require('../../assets/kim.png')}
          style={styles.reviewimg}
        />
        <View style={styles.deleteview}>
          <Text style={styles.deletetext}>삭제</Text>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  reviewtopview: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'lightgray',
  },
  titletopview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 15,
  },
  titleinnerview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titletext: {
    fontWeight: 'bold',
    fontSize: 17,
    color: 'black',
    marginRight: 8,
  },
  categorytext: {
    fontWeight: '600',
    fontSize: 13,
  },
  iconsview: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 5,
  },
  subtext: {
    width: '80%',
    marginTop: 5,
    marginLeft: 15,
    fontWeight: '600',
    color: 'black',
  },
  reviewimg: {
    resizeMode: 'contain',
    marginLeft: 15,
    marginTop: 10,
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  deleteview: {
    alignItems: 'flex-end',
    marginRight: 15,
    marginBottom: 10,
  },
  deletetext: {
    borderWidth: 1,
    borderRadius: 6,
    borderColor: 'gray',
    paddingHorizontal: 8,
    paddingVertical: 2,
    color: 'gray',
    fontWeight: '600',
  },
});
export default Myreview;
