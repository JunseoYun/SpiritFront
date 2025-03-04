import React, {useState} from 'react';
import {Menu, Button} from 'react-native-paper';

const PrivacyMenu = ({selected, onSelect}) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      style={{marginTop: 20}}
      anchor={
        <Button
          mode="outlined"
          onPress={openMenu}
          style={{
            borderColor: '#999',
            borderWidth: 1,
            borderRadius: 8,
            marginHorizontal: 18,
            marginTop: 20,
          }}
          labelStyle={{
            color: '#333',
            fontSize: 14,
            fontWeight: '600',
          }}>
          {selected}
        </Button>
      }>
      <Menu.Item
        onPress={() => {
          onSelect('[현행] 2025년 4월 1일 시행안');
          closeMenu();
        }}
        title="[현행] 2025년 4월 1일 시행안"
      />
      {/* <Divider style={{backgroundColor: '#cccccc', height: 1}} />
      <Menu.Item
        onPress={() => {
          onSelect('2024년 12월 26일 시행안');
          closeMenu();
        }}
        title="2024년 12월 26일 시행안"
      /> */}
    </Menu>
  );
};

export default PrivacyMenu;
