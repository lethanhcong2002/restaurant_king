import { useState, useEffect } from 'react';
import {
    CContainer,
    CRow,
    CCol,
    CCard,
    CCardBody,
    CCardHeader,
    CCardFooter,
    CButton,
    CFormInput,
} from '@coreui/react';

import { cilPencil, cilLockLocked } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import formatToVND from '../../code/convertPrice';
import { getRoleAdmin } from '../../code/getData';

const Profile = () => {
    const user = useSelector((state) => state.user);

    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        salary: 0,
        role: 0,
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || 'John Doe',
                email: user.email || 'john.doe@example.com',
                phone: user.phone || '123-456-7890',
                salary: user.salary || 0,
                role: user.role || 0,
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
    };

    const handleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleCancel = () => {
        setProfileData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            salary: user.salary || 0,
            role: user.role || 0,
        });
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            const response = await axios.put(`http://localhost:5000/accounts/update-account/${user.id}`, {
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone,
                salary: profileData.salary,
                role: profileData.role,
            });

            if (response.status === 200) {
                toast.success('Cập nhật thông tin cá nhân thành công! Vui lòng thoát đăng nhập để cập nhật thông tin cho chính xác');
                setIsEditing(false);
            } else {
                toast.error('Cập nhật thất bại.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi cập nhật thông tin. Vui lòng thử lại.');
        }
    };

    const handlePasswordSave = async () => {
        if (passwordData.newPassword === passwordData.currentPassword) {
            toast.error('Mật khẩu mới không được trùng với mật khẩu cũ!');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            alert('Mật khẩu mới và xác nhận mật khẩu phải trùng khớp');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:5000/accounts/change-pass/${user.id}`, {
                passwordOld: passwordData.currentPassword,
                passwordNew: passwordData.newPassword,
            });

            if (response.status === 200) {
                toast.success('Cập nhật thành công!');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                });
                setShowPasswordForm(false);
            } else {
                toast.error('Cập nhật thất bại.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
        }
    };

    return (
        <CContainer>
            <CRow className="justify-content-center">
                <CCol xs={12} md={8}>
                    <CCard>
                        <CCardHeader>
                            <h3>Thông tin cá nhân</h3>
                        </CCardHeader>
                        <CCardBody>
                            <CRow>
                                <CCol md={12}>
                                    {isEditing ? (
                                        <>
                                            <div className="mb-3">
                                                <CFormInput
                                                    label="Họ & Tên"
                                                    name="name"
                                                    value={profileData.name}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <CFormInput
                                                    label="Email"
                                                    name="email"
                                                    value={profileData.email}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <CFormInput
                                                    label="Số điện thoại"
                                                    name="phone"
                                                    value={profileData.phone}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h4>{profileData.name}</h4>
                                            <p>Email: {profileData.email}</p>
                                            <p>Số điện thoại: {profileData.phone}</p>
                                            <p>Lương: {formatToVND(profileData.salary)}</p>
                                            <p>Vị trí: {getRoleAdmin(profileData.role)}</p>
                                        </>
                                    )}
                                </CCol>
                            </CRow>
                            <hr />
                            <CRow>
                                <CCol md={12}>
                                    <CButton
                                        color="warning"
                                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                                        className="mb-3"
                                    >
                                        {showPasswordForm ? 'Hủy' : 'Đổi mật khẩu'}
                                        <CIcon icon={cilLockLocked} className="ms-2" />
                                    </CButton>

                                    {showPasswordForm && (
                                        <>
                                            <div className="mb-3">
                                                <CFormInput
                                                    type="password"
                                                    label="Mật khẩu hiện tại"
                                                    name="currentPassword"
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <CFormInput
                                                    type="password"
                                                    label="Mật khẩu hiện tạitại"
                                                    name="newPassword"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <CFormInput
                                                    type="password"
                                                    label="Xác nhận mật khẩu"
                                                    name="confirmNewPassword"
                                                    value={passwordData.confirmNewPassword}
                                                    onChange={handlePasswordChange}
                                                />
                                            </div>
                                            <CButton color="success" onClick={handlePasswordSave}>
                                                Cập nhật mật khẩu
                                            </CButton>
                                        </>
                                    )}
                                </CCol>
                            </CRow>
                        </CCardBody>
                        <CCardFooter className="text-end">
                            {isEditing ? (
                                <>
                                    <CButton color="secondary" onClick={handleCancel} className="me-2">
                                        Hủy
                                    </CButton>
                                    <CButton color="success" onClick={handleSave}>
                                        Lưu
                                    </CButton>
                                </>
                            ) : (
                                <CButton color="primary" onClick={handleEdit}>
                                    Chỉnh sửa thông tin cá nhân
                                    <CIcon icon={cilPencil} className="ms-2" />
                                </CButton>
                            )}
                        </CCardFooter>
                    </CCard>
                </CCol>
            </CRow>
            <ToastContainer />
        </CContainer>
    );
};

export default Profile;

