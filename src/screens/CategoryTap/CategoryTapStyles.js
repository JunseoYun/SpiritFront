import {StyleSheet} from 'react-native';

const Categorystyles = StyleSheet.create({
  container: {
    flexDirection: 'row', // 가로로 정렬
    flexWrap: 'wrap', // 줄바꿈 허용
    justifyContent: 'center', // 아이템 간 간격 조절
    alignItems: 'center',
    backgroundColor: 'white',
    paddingBottom: 50,
  },
  itemContainer: {
    width: '100%',
    height: 285,
    borderColor: '#E7E7E7',
    borderBottomWidth: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 10,
    paddingTop: 20,
  },
  menuView: {
    width: '100%',
    height: 170,
    marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  menuItemView: {
    width: 120,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  infoTopView: {
    width: '100%',
    height: 90,
    justifyContent: 'space-between',
    padding: 10,
    marginTop: -3,
  },
  infoTitleView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTimeView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainMenu: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 7,
    marginLeft: 7,
    backgroundColor: 'rgb(247, 180, 22)', // 글자만 배경색
    paddingHorizontal: 7, // 글자 좌우 여백
    paddingVertical: 1, // 글자 상하 여백
    borderRadius: 5, // 둥근 배경 처리
    alignSelf: 'flex-start', // 텍스트만 차지하는 공간에 제한
  },

  menuName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  menuPrice: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: -5,
    color: '#333',
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  alcoholText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16BBFF',
  },

  storeImg: {
    width: 112,
    height: 112,
    borderRadius: 10,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingtext: {
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B',
    fontSize: 20,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 40,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B',
    fontSize: 20,
    color: '#333',
  },

  storeImagetext: {
    width: 112,
    height: 112,
    borderRadius: 10,
    justifyContent: 'center', // 수직 중앙 정렬
    alignItems: 'center',
    backgroundColor: 'black',
  },
});

export default Categorystyles;
