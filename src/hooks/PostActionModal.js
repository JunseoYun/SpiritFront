import React from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import CustomText from '../utils/CustomText';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const PostActionModal = ({visible, onClose, onEdit, onDelete}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding =
    Platform.OS === 'android' ? insets.bottom + 20 : insets.bottom + 10;
  const handleClose = () => onClose?.();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={handleClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={handleClose}>
        <View style={[styles.bottomSheet, {paddingBottom: bottomPadding}]}>
          <View style={styles.actionCard}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                handleClose();
                onEdit?.();
              }}>
              <CustomText style={styles.actionText}>수정</CustomText>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                handleClose();
                onDelete?.();
              }}>
              <CustomText style={styles.actionText}>삭제</CustomText>
            </TouchableOpacity>
          </View>
          <View style={styles.cancelCard}>
            <TouchableOpacity style={styles.actionButton} onPress={handleClose}>
              <CustomText style={styles.actionText}>취소</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  bottomSheet: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  actionCard: {
    backgroundColor: '#F1F1F1',
    borderRadius: 14,
    overflow: 'hidden',
  },
  cancelCard: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  actionText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#3cbbff',
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#D9D9D9',
  },
});

export default PostActionModal;
