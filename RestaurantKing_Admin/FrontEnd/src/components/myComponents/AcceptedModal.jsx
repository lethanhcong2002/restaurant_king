/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { CButton, CModal, CModalHeader, CModalBody, CModalFooter, CAlert } from '@coreui/react';
import axios from 'axios';

const AcceptedModal = ({ invoice, onCancel, visible }) => {
    const [error, setError] = useState('');

    console.log(invoice);
    const handleConfirm = () => {
        try {
            setError('');
        } catch (err) {
            setError('Failed to confirm, please try again later!');
        }
    };

    const handleSendNotification = async (notification) => {
        const { userId, title, body, notificationData } = notification;

        console.log('Sending notification:', notification);

        try {
            const response = await axios.post(`http://localhost:3000/send-notification-to/${userId}`, {
                title,
                body,
                notificationData
            });

            console.log('Response from server:', response.data);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };
    return (
        <CModal visible={visible} onClose={onCancel}>
            <CModalHeader closeButton>
                <h5>Confirm Invoice</h5>
            </CModalHeader>
            <CModalBody>
                <p>Are you sure you want to confirm this invoice?</p>
                {error && <CAlert color="danger">{error}</CAlert>}
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={onCancel}>
                    Cancel
                </CButton>
                <CButton color="primary" onClick={handleConfirm}>
                    Confirm
                </CButton>
            </CModalFooter>
        </CModal>
    );
};

export default AcceptedModal;
