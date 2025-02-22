import React from 'react';
import { Dialog, Button, Paragraph } from 'react-native-paper';

function CustomDialog({ visible, onDismiss, title, content, onConfirm }) {
  return (
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Content>
        <Paragraph>{content}</Paragraph>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Hủy</Button>
        <Button onPress={onConfirm}>Xác nhận</Button>
      </Dialog.Actions>
    </Dialog>
  );
}

export default CustomDialog;
