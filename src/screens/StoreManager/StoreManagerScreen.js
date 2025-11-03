import React, {useState, useEffect, lazy} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  SafeAreaView,
  Platform,
  ScrollView,
  Share,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Loading from '../../hooks/Loading';

import {useToast} from '../../context/ToastContext';
import Feather from 'react-native-vector-icons/Feather';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import useCustomAlert from '../../hooks/useCustomAlert';
import {Userdataget} from '../../api/userApi';

import {
  Store_getby_managers,
  get_store_manager_invitationLink,
  delete_store_manager,
  store_owner_change,
} from '../../api/storeApi';

const StoreManagerScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId, storename} = route.params;
  const [userdata, setUserdata] = useState('');

  const {showAlert, AlertComponent} = useCustomAlert();

  const {bottom} = useSafeAndroidInsets();
  const {showToast} = useToast();

  const [loading, setLoading] = useState(false);
  const [ownerId, setOwnerId] = useState('');
  const [managers, setManagers] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const data = await Userdataget();

        setUserdata(data);
      } catch (error) {
        if (error.response) {
        } else {
          // 네트워크 또는 다른 에러 처리
          console.error('Unexpected Error:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const ManagerList = async () => {
    setLoading(true);
    try {
      const data = await Store_getby_managers(storeId);
      setManagers([...data]);
      const owner = data.find(m => m.isOwner);
      if (owner) setOwnerId(owner.userId);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ManagerList();
  }, []);

  const onCreate_invitationLink = async () => {
    try {
      const response = await get_store_manager_invitationLink(storeId);

      if (!response?.inviteLink) {
        showToast('초대할 링크를 가져오지 못했어요.');
        return;
      }

      await Share.share({
        message: `${storename} 매장의 운영진으로 초대합니다!\n초대를 수락하고 한잔할까에서 매장을 관리하세요.\n\n${response.inviteLink}`,
        inviteLink: response.inviteLink,
      });
    } catch (error) {
      showToast('공유 도중 문제가 발생했어요.');
      console.error('onShare error:', error.response);
    }
  };

  const toggleManagerOptions = managerId => {
    if (selectedManagerId === managerId) {
      setSelectedManagerId(null); // 이미 열려있으면 닫기
    } else {
      setSelectedManagerId(managerId); // 선택한 매니저 열기
    }
  };

  const handleButton = (type, nickname) => {
    if (type === 'delete') {
      showAlert({
        title: '운영진 삭제',
        message: `${nickname} 님을 ${storename}\n운영진에서 삭제하시겠습니까?`,
        onConfirm: () => handleRemoveManager(),
        onCancel: null,
        type: 'delete',
      });
      handleRemoveManager;
    } else if (type === 'change_owner') {
      showAlert({
        title: '사장님 변경',
        message: `${nickname} 님을 ${storename}\n사장님으로 위임하시겠습니까?`,
        onConfirm: () => handleTransferOwnership(),
        onCancel: null,
        type: 'confirm',
      });
      handleRemoveManager;
    }
  };

  const handleTransferOwnership = async () => {
    if (!selectedManagerId) return;

    setLoading(true);
    try {
      await store_owner_change(selectedManagerId);
      await ManagerList();
      setSelectedManagerId(null); // 버튼 숨기기
    } catch (error) {
      showToast('잠시 후 다시 시도해주세요.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveManager = async () => {
    if (!selectedManagerId) return;

    setLoading(true);
    try {
      await delete_store_manager(selectedManagerId);

      setManagers(prev =>
        prev.filter(manager => manager.storeManagerId !== selectedManagerId),
      );
      showToast('운영진이 삭제되었습니다.');
      setSelectedManagerId(null); // 버튼 숨기기
    } catch (error) {
      showToast('잠시 후 다시 시도해주세요.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 사장님과 운영진 분리
  const owner = managers.find(m => m.isOwner);
  const staff = managers.filter(m => !m.isOwner);

  const renderManagerItem = ({item}) => (
    <View style={styles.managerItemWrap}>
      <View style={styles.managerItem}>
        <View style={styles.managerInfo}>
          <View>
            <FastImage
              source={
                item.profileImgUrl
                  ? {uri: item.profileImgUrl}
                  : require('../../assets/default_profile.png')
              }
              style={[
                styles.profileImg,
                item.userId === userdata?.id && {
                  borderColor: '#5CCEFF',
                  borderWidth: 1.5,
                },
              ]}
            />
          </View>

          <View>
            <Text style={[styles.managerName]}>{item.nickname}</Text>
            <Text style={styles.managerDate}>
              {formatDate(item.approvedAt)} ~
            </Text>
          </View>
        </View>

        {!item.isOwner && ownerId === userdata?.id && (
          <Pressable
            hitSlop={30}
            onPress={() => toggleManagerOptions(item.storeManagerId)}>
            <Text style={styles.editText}>
              {selectedManagerId === item.storeManagerId ? '취소' : '편집'}
            </Text>
          </Pressable>
        )}
      </View>
      {selectedManagerId === item.storeManagerId &&
        ownerId === userdata?.id && (
          <View style={styles.managerOptions}>
            <Pressable
              style={[styles.optionButton, {marginRight: 5}]}
              onPress={() => handleButton('change_owner', item.nickname)}>
              <Text style={styles.optionText}>사장님 위임</Text>
            </Pressable>

            <Pressable
              style={[
                styles.optionButton,
                {backgroundColor: '#FF5A5F', marginLeft: 5},
              ]}
              onPress={() => handleButton('delete', item.nickname)}>
              <Text style={[styles.optionText, {color: '#fff'}]}>
                운영진 삭제
              </Text>
            </Pressable>
          </View>
        )}
    </View>
  );

  const formatDate = isoString => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 0~11
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  return (
    <SafeAreaView style={[styles.container, , {paddingBottom: bottom}]}>
      <ScrollView
        style={styles.content}
        bounces={false} // iOS 튕김 방지
        contentContainerStyle={{flexGrow: 1}}>
        {owner && (
          <View style={styles.section}>
            <Text style={styles.title}>사장님</Text>
            {renderManagerItem({item: owner})}
          </View>
        )}

        <View style={styles.division} />

        {staff.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.title}>운영진</Text>
            <FlatList
              data={staff}
              scrollEnabled={false}
              keyExtractor={item => item.storeManagerId.toString()}
              renderItem={renderManagerItem}
              contentContainerStyle={{paddingBottom: 30}}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.invitationView}>
        <Pressable
          style={styles.invitationButton}
          onPress={onCreate_invitationLink}>
          <Text style={styles.invitationText}>운영진 초대</Text>
        </Pressable>
      </View>

      <AlertComponent />
      <Loading loading={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  division: {
    height: 1,
    backgroundColor: '#EDEDED',
    marginHorizontal: 12,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 18,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
    color: '#121212',
    marginBottom: 14,
  },
  managerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  profileImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#ddd',
    borderWidth: 0.5,
    borderColor: '#ccc',
  },
  managerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  managerName: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
    color: '#121212',
    marginBottom: 2,
  },
  managerDate: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    color: '#6B7280',
  },

  invitationButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3CBBFF',
    borderRadius: 9,
  },
  invitationText: {
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
    color: '#fff',
  },

  invitationView: {
    borderTopWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'android' && 10,
    backgroundColor: '#fff',
  },
  managerItemWrap: {
    marginBottom: 10,
  },
  editText: {
    color: '#121212',
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
  },
  managerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#121212',
  },
});

export default StoreManagerScreen;
