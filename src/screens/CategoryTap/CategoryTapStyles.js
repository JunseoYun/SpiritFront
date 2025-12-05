import {StyleSheet} from 'react-native';
import ColorUtil from '../../utils/ColorUtil';

const Categorystyles = StyleSheet.create({
  itemContainer: {
    width: '100%',
    borderColor: '#EDEDED',
    borderBottomWidth: 1.5,
    backgroundColor: 'white',
    paddingVertical: 15,
  },
  imageView: {
    width: '100%',
    flexDirection: 'row',
  },
  mainItemView: {
    width: 180,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImageView: {
    width: 180,
    height: 130,
    // borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
  },

  menuItemView: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuImageView: {
    width: 130,
    height: 130,
    // borderRadius: 10,
    justifyContent: 'center',
  },
  menuImg: {
    width: 130,
    height: 130,
    // borderRadius: 9,
    resizeMode: 'cover',
  },
  noneImageView: {
    width: 180,
    height: 130,
    // borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center', // 가로 중앙
    justifyContent: 'center', // 세로 중앙
    alignSelf: 'center', // 부모 기준 중앙 (ScrollView 내에서)
  },
  noneImg: {
    width: 180,
    height: 190,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 55, // 그라데이션 높이
    zIndex: 1,
  },
  menuName: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#fff',
    marginTop: 3,
    marginLeft: 5,
    textAlign: 'center',

    zIndex: 3,
  },
  menuPrice: {
    fontSize: 11,
    fontFamily: 'Pretendard-Bold',
    color: '#fff',
    marginLeft: 5,
    textAlign: 'center',
    zIndex: 3,
    marginTop: -2,
  },
  storeMainView: {
    width: 130,
    height: 130,
    //borderRadius: 10,
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEEEEE',
    marginLeft: 12,
    marginBottom: 10,
  },
  storeMainImg: {
    width: 130,
    height: 130,
    //borderRadius: 10,
    alignSelf: 'center', // 자기 자신을 중앙 정렬
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // ✅ 반투명 배경 추가
    justifyContent: 'center',
    alignItems: 'center',
    // borderRadius: 9,
  },
  semiOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0)', // ✅ 반투명 배경 추가
    alignItems: 'flex-start',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
  },
  overlayText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    lineHeight: 22,
    textAlign: 'center',
  },
  menuImageView2: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    //borderRadius: 9,
  },
  menuNoImg: {
    width: '100%',
    //borderRadius: 9,
    resizeMode: 'contain',
    justifyContent: 'center',
    position: 'absolute',
  },
  moreText: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
  infoTopView: {
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  infoTitleView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoTitleViewSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    maxWidth: '95%',
  },
  alcoholText: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#3CBBFF',
    width: '50%',
    textAlign: 'right',
  },
  infoReviewView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  infoView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    textAlign: 'center',
  },
  infoTimeView: {
    // flexDirection: 'row',
    // alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  subInfoText: {
    fontSize: 14,
    color: '#4b5563',
    fontFamily: 'Pretendard-Regular',
    textAlign: 'center',
  },
  iconStar: {
    justifyContent: 'space-between',

    height: 16,
    width: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  drinkView: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 1,
  },
  drinkText: {
    fontSize: 14,
    paddingVertical: 3,
    borderRadius: 5,
    marginRight: 9,
    color: '#6b7280',
    fontFamily: 'Pretendard-SemiBold',
  },
  imageStyle: {
    alignSelf: 'center',
    width: 15,
    height: 15,
    marginRight: 5,
  },
  mainDrinkView: {
    flexDirection: 'row',
    marginTop: 16,
  },
  drinkBadge: {
    marginRight: 7,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
  },
  drinkBadgeText: {
    color: '#121212',
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
});

export default Categorystyles;
