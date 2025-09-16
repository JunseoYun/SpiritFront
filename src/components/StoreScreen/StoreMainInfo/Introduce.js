import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

const Introduce = ({
  isUpdate,
  storedata,
  handleEdit,
  toggleDescription,
  descripexpanded,
}) => {
  const [descLineCount, setDescLineCount] = useState(0);

  const handleTextLayout = e => {
    setDescLineCount(e.nativeEvent.lines.length);
  };

  return (
    <View style={styles.introduceview}>
      {isUpdate ? (
        <TouchableOpacity
          style={styles.infoHideView}
          onPress={
            isUpdate
              ? () => handleEdit('hasScreen', storedata?.hasScreen)
              : null
          }>
          <Feather name="tv" size={20} color="#333" />

          {storedata?.hasScreen ? (
            <Text style={styles.infoHidetext}>매장 내 스크린(TV) 설치</Text>
          ) : (
            <Text style={styles.infoHidetext}>매장 내 스크린(TV) 미설치</Text>
          )}
          <View style={{right: 30, position: 'absolute', alignSelf: 'center'}}>
            <Entypo name="chevron-small-right" size={25} color="#333" />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.infoHideView}>
          <Feather name="tv" size={20} color="#333" />

          {storedata?.hasScreen ? (
            <Text style={styles.infoHidetext}>매장 내 스크린(TV) 설치</Text>
          ) : (
            <Text style={styles.infoHidetext}>매장 내 스크린(TV) 미설치</Text>
          )}
        </View>
      )}

      {isUpdate ? (
        <TouchableOpacity
          style={styles.infoHideView}
          onPress={
            isUpdate
              ? () =>
                  handleEdit('isGroupAvailable', storedata?.isGroupAvailable)
              : null
          }>
          <MaterialIcons name="group" size={20} color="#333" />

          {storedata?.isGroupAvailable ? (
            <Text style={styles.infoHidetext}>단체 방문 가능</Text>
          ) : (
            <Text style={styles.infoHidetext}>소수 방문 위주</Text>
          )}
          <View style={{right: 30, position: 'absolute', alignSelf: 'center'}}>
            <Entypo name="chevron-small-right" size={25} color="#333" />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.infoHideView}>
          <MaterialIcons name="group" size={20} color="#333" />

          {storedata?.isGroupAvailable ? (
            <Text style={styles.infoHidetext}>단체 방문 가능</Text>
          ) : (
            <Text style={styles.infoHidetext}>소수 방문 위주</Text>
          )}
        </View>
      )}
      {isUpdate ? (
        <TouchableOpacity
          style={styles.infoHideView}
          onPress={
            isUpdate ? () => handleEdit('contact', storedata?.contact) : null
          }>
          <SimpleLineIcons name="phone" size={20} color="#333" />
          {storedata?.contact ? (
            <Text style={styles.infoHidetext}>{storedata?.contact}</Text>
          ) : (
            <Text style={styles.infoHidetext}>등록된 매장 번호가 없습니다</Text>
          )}
          <View style={{right: 30, position: 'absolute', alignSelf: 'center'}}>
            <Entypo name="chevron-small-right" size={25} color="#333" />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.infoHideView}>
          <SimpleLineIcons name="phone" size={20} color="#333" />
          {storedata?.contact ? (
            <Text style={styles.infoHidetext}>{storedata?.contact}</Text>
          ) : (
            <Text style={styles.infoHidetext}>등록된 매장 번호가 없습니다</Text>
          )}
        </View>
      )}
      {isUpdate ? (
        <TouchableOpacity
          style={styles.infoHideView}
          onPress={
            isUpdate
              ? () => handleEdit('description', storedata?.description)
              : null
          }>
          <AntDesign name="profile" size={20} color="#333" />
          {storedata?.description ? (
            <Text style={styles.infoHidetext}>{storedata?.description}</Text>
          ) : (
            <Text style={styles.infoHidetext}>등록된 매장 소개가 없습니다</Text>
          )}
          <View style={{right: 30, position: 'absolute', alignSelf: 'center'}}>
            <Entypo name="chevron-small-right" size={25} color="#333" />
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={toggleDescription}
          style={styles.infoHideView}>
          <AntDesign name="profile" size={20} color="#333" />

          {storedata?.description ? (
            <View>
              <Text
                style={styles.infoHidetext}
                ellipsizeMode="clip"
                onTextLayout={handleTextLayout}
                numberOfLines={descripexpanded ? undefined : 2}>
                {storedata?.description}
              </Text>
            </View>
          ) : (
            <Text style={styles.infoHidetext}>등록된 매장 소개가 없습니다</Text>
          )}
          {descLineCount > 2 && (
            <View style={styles.togglebtn}>
              {descripexpanded ? (
                <Entypo name="chevron-small-up" size={20} color="#5F5F5F" />
              ) : (
                <Entypo name="chevron-small-down" size={20} color="#5F5F5F" />
              )}
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  introduceview: {
    width: '100%',
    marginHorizontal: 18,
    marginTop: 12,
  },
  infoHideView: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  infoHidetext: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    paddingLeft: 10,
  },
  togglebtn: {
    right: 15,
    position: 'absolute',
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
  },
});

export default Introduce;
