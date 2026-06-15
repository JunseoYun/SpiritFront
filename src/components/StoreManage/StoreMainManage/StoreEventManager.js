import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {deleteEvent, getEventsByStore} from '../../../api/eventApi';
import useCustomAlert from '../../../hooks/useCustomAlert';
import StoreEventSection from './StoreEventSection';
import ManagementButton from '../ManagementButton';
import CustomText from '../../../utils/CustomText';

const StoreEventManager = ({storeId, onDirtyChange, localEvents = []}) => {
  const navigation = useNavigation();
  const [events, setEvents] = useState(
    Array.isArray(localEvents) ? localEvents : [],
  );
  const [listLoading, setListLoading] = useState(false);
  const {AlertComponent, showAlert} = useCustomAlert();

  useEffect(() => {
    onDirtyChange?.(false);
  }, [onDirtyChange]);

  useEffect(() => {
    setEvents(Array.isArray(localEvents) ? localEvents : []);
  }, [localEvents]);

  const fetchEvents = useCallback(async () => {
    if (!storeId) {
      setEvents([]);
      return;
    }
    setListLoading(true);
    try {
      const list = await getEventsByStore(storeId);
      setEvents(Array.isArray(list) ? list : []);
    } catch (error) {
    } finally {
      setListLoading(false);
    }
  }, [storeId]);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents]),
  );

  const handleNavigateToEditor = useCallback(() => {
    if (!storeId) {
      return;
    }
    navigation.navigate('StoreEventEditScreen', {
      storeId,
      mode: 'create',
      onComplete: fetchEvents,
    });
  }, [fetchEvents, navigation, storeId]);

  const handleEditEvent = useCallback(
    item => {
      if (!storeId || !item) {
        return;
      }
      navigation.navigate('StoreEventEditScreen', {
        storeId,
        mode: 'edit',
        initialEvent: item,
        onComplete: fetchEvents,
      });
    },
    [fetchEvents, navigation, storeId],
  );

  const handleDeleteEvent = useCallback(
    item => {
      if (!item?.id) {
        return;
      }
      showAlert({
        title: '이벤트를 삭제할까요?',
        message: '삭제하면 다시 복구할 수 없어요.',
        type: 'delete',
        onConfirm: async () => {
          try {
            await deleteEvent(item.id);
            fetchEvents();
          } catch (error) {
            showAlert({
              title: '삭제에 실패했어요',
              message: '잠시 후 다시 시도해주세요.',
            });
          }
        },
      });
    },
    [fetchEvents, showAlert],
  );

  return (
    <View style={styles.wrapper}>
      <ManagementButton onPress={handleNavigateToEditor} title="이벤트 추가" />
      {listLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator />
        </View>
      ) : events.length ? (
        <StoreEventSection
          title="이벤트"
          events={events}
          type="update"
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
          navigation={navigation}
        />
      ) : (
        <View style={styles.emptyState}>
          <CustomText style={styles.emptyStateText}>
            등록된 이벤트가 아직 없어요.
          </CustomText>
        </View>
      )}
      <AlertComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: 40,
  },
  loadingBox: {
    marginTop: 16,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    marginTop: 16,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E8F0',
    backgroundColor: '#fff',
    marginHorizontal: 18,
  },
  emptyStateText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#6b7280',
  },
});

export default StoreEventManager;
