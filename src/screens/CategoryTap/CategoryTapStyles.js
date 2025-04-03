import {StyleSheet} from 'react-native';

const Categorystyles = StyleSheet.create({
  itemContainer: {
    width: '100%',
    borderColor: '#E7E7E7',
    borderBottomWidth: 2,
    backgroundColor: 'white',
    alignItems: 'center',
    paddingTop: 20,
  },
  menuView: {
    width: '100%',
    flexDirection: 'row',
  },
  menuItemView: {
    width: 120,
    height: 180,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginRight: -3,
  },
  menuImageView: {
    width: 130,
    height: 130,
    borderRadius: 10,
    backgroundColor: '#EEEEEE',
    alignContent: 'center',
    justifyContent: 'center',
  },
  menuImg: {
    width: 130,
    height: 130,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  menuNoImg: {
    width: '100%',
    height: 70, // 추가
    borderRadius: 10,
    resizeMode: 'contain',
    justifyContent: 'center',
    position: 'absolute',
    top: '25%',
  },
  menuName: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
  menuPrice: {
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    marginTop: -5,
    color: '#333',
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
    borderRadius: 10,
  },
  overlayText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    lineHeight: 22,
    textAlign: 'center',
  },
  infoTopView: {
    width: '100%',
    height: 90,
    justifyContent: 'space-between',
    padding: 10,
    marginTop: -3,
    paddingHorizontal: 18,
  },
  infoTitleView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeName: {
    fontSize: 20,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    width: '50%',
  },
  alcoholText: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#45C9FF',
    width: '50%',
    textAlign: 'right',
  },
  infoView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
  },
  infoTimeView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Categorystyles;
