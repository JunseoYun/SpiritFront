import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  storetopview: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
  },
  storeinputview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    width: '85%',
    marginVertical: 7,
  },
  storeinputtext: {
    fontWeight: '600',
    color: 'black',
    fontSize: 16,
    marginRight: 7,
  },
  storeinput: {
    backgroundColor: '#F2F2F2',
    borderRadius: 7,
    paddingVertical: 1,
    flex: 1,
  },
  storetext: {
    fontWeight: '400',
    color: 'black',
    fontSize: 14,
    marginVertical: 5,
    marginBottom: 5,
  },
  textarea: {
    backgroundColor: '#F2F2F2',
    width: '100%',
    borderRadius: 10,
    maxHeight: 200,
    marginBottom: 10,
  },
  Pickerview: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    marginHorizontal: 5,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    textAlign: 'center',
  },
  PickerinnerView: {
    width: 10,
    color: 'red',
    fontSize: 10,
  },
  Pickeritems: {
    fontSize: 10,
    color: 'black',
    fontWeight: 'bold',
  },
  CheckBoxview: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    color: 'black',
  },
  CheckBoxtext: {
    fontWeight: 'bold',
    color: 'black',
  },

  savebutton: {
    alignItems: 'center',
    width: '80%',
    marginVertical: 7,
    backgroundColor: '#16BBFF',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 30,
  },
  savebuttontext: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  searchbutton: {
    alignItems: 'center',
    width: '20%',
    marginVertical: 7,
    backgroundColor: '#16BBFF',
    paddingVertical: 5,
    borderRadius: 10,
    marginLeft: 10,
  },
  pikertext: {
    fontWeight: '400',
    fontSize: 14,
    color: 'black',
    paddingHorizontal: 10,
  },
  ClosedDayText: {
    width: '50%',
    fontWeight: '400',
    color: 'black',
    fontSize: 14,
    marginVertical: 5,
    marginBottom: 5,
  },
  ClosedPickerview: {
    width: '30%',
    backgroundColor: '#F2F2F2',
    marginHorizontal: 5,
    borderRadius: 10,
  },
  imageview: {
    flexDirection: 'row',
    height: 80,
  },
  image: {
    marginBottom: 15,
    width: 80,
    height: 80,
    marginRight: 10,
  },
  selectimage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 10,
  },

  storeinputalcoholview: {
    alignItems: 'center',
    width: '100%',
    marginVertical: 7,
  },

  alcoholText: {
    fontWeight: '400',
    color: 'black',
    fontSize: 14,
    marginVertical: 5,
    marginRight: 10,
    marginBottom: 5,
  },
  alcoholsubText: {
    fontWeight: '600',
    color: 'gray',
    fontSize: 12,
  },

  alcoholpickerview: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },

  alcoholPicker: {
    width: '35%',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
  },

  alcoholpricetext: {
    color: 'black',
    fontSize: 14,
    textAlign: 'center',
    width: '15%',
  },
  alcoholpriceview: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '40%',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  alcoholprice: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 5,
    textAlign: 'right',
    height: 40,
  },

  alcoholunit: {
    marginLeft: 5,
    fontSize: 14,
    color: 'black',
  },
});

export default styles;
