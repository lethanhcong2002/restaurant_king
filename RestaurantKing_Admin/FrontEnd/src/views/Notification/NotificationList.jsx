import { useState, useEffect } from 'react';
import {
    CButton, CModal, CModalHeader, CModalBody, CModalFooter,
    CForm, CRow, CCol, CFormLabel, CFormTextarea, CFormSelect, CFormCheck, CTable,
    CCard, CCardBody, CCardHeader,
    CPaginationItem,
    CPagination
} from '@coreui/react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

function NotificationList() {
    const [modal, setModal] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notification, setNotification] = useState({ title: '', message: '', description: '', recipient: '', sendImmediately: false });
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = notifications.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(notifications.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const resetNotificationState = () => {
        setNotification({ title: '', message: '', description: '', recipient: '', sendImmediately: false });
        setEditMode(false);
    };

    const toggleModal = () => {
        if (modal) {
            resetNotificationState();
        }
        setModal(!modal);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNotification((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveNotification = async () => {
        if (notification.recipient === '') {
            alert('Vui lòng chọn đối tượng!');
            return;
        }

        if (!notification.title.trim() || !notification.message.trim()) {
            alert('Vui lòng điền đầy đủ Tiêu đề và Mô tả.');
            return;
        }

        const newNotification = {
            ...notification,
            recipient: notification.recipient === 'true' ? true : false
        };

        setLoading(true);

        try {
            if (editMode) {
                await handleEdit(newNotification);
                fetchNotifications();
            } else {
                await handleNew(newNotification);
                fetchNotifications();
            }

            if (newNotification.sendImmediately) {
                await handleSendNotification(newNotification);
            } else {
                toast.success('Điều chỉnh thông báo thành công!');
            }

            resetNotificationState();
            toggleModal();
        } catch (error) {
            console.error('Error handling notification:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditNotification = (index) => {
        setNotification(notifications[index]);
        setEditMode(true);
        toggleModal();
    };

    const handleEdit = async (notification) => {
        try {
            const response = await axios.put(`http://localhost:5000/notifications/notification/${notification.id}`, { notification });
            if (response.data.success) {
                console.log('Notification sent successfully:', response.data);
            } else {
                console.error('Failed to send notification:', response.data.error);
            }
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };

    const handleNew = async (notification) => {
        try {
            const response = await axios.post('http://localhost:5000/notifications/new-notification', { notification });
            if (response.data.success) {
                console.log('Notification sent successfully:', response.data);
            } else {
                console.error('Failed to send notification:', response.data.error);
            }
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:5000/notifications/notification/${id}`);
            if (response.status === 200) {
                toast.success('Xóa thông báo thành công!');
                fetchNotifications();
            } else {
                console.error('Failed to fetch notifications:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleSendNotification = async (notification) => {
        try {
            if (notification.recipient === true) {
                const response = await axios.post('http://localhost:5000/email/send-email-to-employees', {
                    title: notification.title, message: notification.message, description: notification.description
                });
                if (response.status === 200) {
                    toast.success('Thông báo đã được gửi cho nhân viên!');
                } else {
                    console.error('Gửi thông báo cho nhân viên thất bại:', response.data.message);
                }
            } else {
                const notificationData = {
                    createdAt: new Date(),
                    type: 'all',
                    description: notification.description
                };
                const response = await axios.post('http://localhost:5000/notifications/send-notification-to-all', {
                    title: notification.title, body: notification.message, notificationData: notificationData
                });
                if (response.status === 200) {
                    toast.success('Thông báo đã được gửi cho khách hàng!');
                } else {
                    console.error('Gửi thông báo cho khách hàng thất bại:', response.data.message);
                }
            }
        } catch (error) {
            console.error('Lỗi khi gửi thông báo:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('http://localhost:5000/notifications/getNotification');
            if (response.status === 200) {
                setNotifications(response.data);
            } else {
                console.error('Failed to fetch notifications:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pagesToShow = 5;
        const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

        const pageNumbers = [];
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="d-flex justify-content-between align-items-center px-2 mb-3">
                <span>Trang {currentPage}/{totalPages}</span>

                <div className="d-flex justify-content-center flex-grow-1">
                    <CPagination aria-label="Page navigation" className="mb-0">
                        <CPaginationItem
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                        >
                            {"<<"}
                        </CPaginationItem>

                        <CPaginationItem
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            {"<"}
                        </CPaginationItem>

                        {pageNumbers.map((pageNumber) => (
                            <CPaginationItem
                                key={pageNumber}
                                active={currentPage === pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                            >
                                {pageNumber}
                            </CPaginationItem>
                        ))}

                        <CPaginationItem
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            {">"}
                        </CPaginationItem>

                        <CPaginationItem
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            {">>"}
                        </CPaginationItem>
                    </CPagination>
                </div>
            </div>
        );
    };

    return (
        <>
            <CCard>
                <CCardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div className="mb-3 mb-md-0">Thông báo</div>
                    <CButton color="primary" onClick={toggleModal}>Thông báo</CButton>
                </CCardHeader>
                <CCardBody>
                    <CFormSelect
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        style={{ width: '80px' }}
                        className="mb-3"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                    </CFormSelect>
                    <CTable hover responsive bordered>
                        <thead>
                            <tr>
                                <th>Tiêu đề</th>
                                <th>Mô tả</th>
                                <th>Đối tượng</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((notif, index) => (
                                <tr key={index}>
                                    <td>{notif.title}</td>
                                    <td>{notif.message}</td>
                                    <td>{notif.recipient === true ? 'Nhân viên' : 'Khách hàng'}</td>
                                    <td>
                                        <CButton color="warning" onClick={() => handleEditNotification(index)} className="me-2">Chỉnh sửa</CButton>
                                        <CButton color="danger" onClick={() => handleDelete(notif.id)} className="me-2">Xóa</CButton>
                                        <CButton color="success" onClick={() => handleSendNotification(notif)} className="me-2">Gửi thông báo</CButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </CTable>
                    {renderPagination()}
                </CCardBody>
            </CCard>

            <CModal visible={modal} onClose={() => { setModal(false); resetNotificationState(); }} size='xl'>
                <CModalHeader>{editMode ? 'Edit Notification' : 'Add New Notification'}</CModalHeader>
                <CModalBody>
                    <CForm>
                        <CRow className="mb-3">
                            <CCol sm={12}>
                                <CFormLabel htmlFor="title">Tiêu đề</CFormLabel>
                                <CFormTextarea
                                    name="title"
                                    id="title"
                                    value={notification.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter notification title"
                                    rows="1"
                                    disabled={loading}
                                />
                            </CCol>
                        </CRow>
                        <CRow className="mb-3">
                            <CCol sm={12}>
                                <CFormLabel htmlFor="message">Mô tả</CFormLabel>
                                <CFormTextarea
                                    name="message"
                                    id="message"
                                    value={notification.message}
                                    onChange={handleInputChange}
                                    placeholder="Enter notification message"
                                    rows="5"
                                    disabled={loading}
                                />
                            </CCol>
                        </CRow>
                        <CRow className="mb-3">
                            <CCol sm={12}>
                                <CFormLabel htmlFor="description">Thông tin chi tiết</CFormLabel>
                                <CFormTextarea
                                    name="description"
                                    id="description"
                                    value={notification.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter notification description (optional)"
                                    rows="5"
                                    disabled={loading}
                                />
                            </CCol>
                        </CRow>
                        <CRow className="mb-3">
                            <CCol sm={12}>
                                <CFormLabel htmlFor="recipient">Đối tượng</CFormLabel>
                                <CFormSelect
                                    name="recipient"
                                    id="recipient"
                                    value={notification.recipient}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                >
                                    <option value="">Chọn đối tượng</option>
                                    <option value={true}>Nhân viên</option>
                                    <option value={false}>Khách hàng</option>
                                </CFormSelect>
                            </CCol>
                        </CRow>
                        <CRow className="mb-3">
                            <CCol sm={12}>
                                <CFormCheck
                                    type="checkbox"
                                    id="sendImmediately"
                                    name="sendImmediately"
                                    label="Gửi thông báo ngay lập tức"
                                    checked={notification.sendImmediately}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                            </CCol>
                        </CRow>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={toggleModal} disabled={loading}>Cancel</CButton>
                    <CButton color="primary" onClick={handleSaveNotification} disabled={loading}>
                        {editMode ? 'Cập nhật' : 'Lưu'}
                    </CButton>
                </CModalFooter>
            </CModal>
            <ToastContainer />
        </>
    );
}

export default NotificationList;
