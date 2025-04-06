import {StyleSheet} from 'react-native';

const Categorystyles = StyleSheet.create({
  itemContainer: {
    width: '100%',
    borderColor: '#EDEDED',
    borderBottomWidth: 1.5,
    backgroundColor: 'white',

    paddingVertical: 15,
    // paddingBottom: 10,
  },
  imageView: {
    width: '100%',
    flexDirection: 'row',
  },
  menuItemView: {
    width: 120,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -3,
  },
  menuImageView: {
    width: 130,
    height: 130,
    justifyContent: 'flex-end',
  },

  menuImg: {
    width: 130,
    height: 130,
    borderRadius: 9,
    resizeMode: 'cover',
  },

  menuName: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#fff',
    lineHeight: 22,
    marginTop: 3,
  },
  menuPrice: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#fff',
    lineHeight: 20,
    marginBottom: 3,
  },
  storeMainView: {
    width: 130,
    height: 130,
    borderRadius: 10,
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEEEEE',
    marginLeft: 12,
    marginBottom: 10,
  },
  storeMainImg: {
    width: 130,
    height: 130,
    borderRadius: 10,
    alignSelf: 'center', // 자기 자신을 중앙 정렬
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // ✅ 반투명 배경 추가
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9,
  },
  semiOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // ✅ 반투명 배경 추가
    alignItems: 'center',
    borderRadius: 9,
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
    borderRadius: 9,
  },
  menuNoImg: {
    width: '100%',
    borderRadius: 9,
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
    marginTop: 1,

    paddingHorizontal: 18,
  },
  infoTitleView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    marginRight: 7,
  },
  alcoholText: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#45C9FF',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  subInfoText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#999',
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
    flexDirection: 'row',
  },
  drinkText: {
    fontSize: 14,
    paddingVertical: 3,

    borderRadius: 5,
    marginRight: 10,
    fontFamily: 'Pretendard-SemiBold',
    color: '#767676',
  },
});

export default Categorystyles;
