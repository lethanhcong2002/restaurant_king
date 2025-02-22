import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';  // Import useDispatch
import { setUser } from '../action';  // Import action creator
import {
    CButton,
    CCard,
    CCardBody,
    CCardGroup,
    CCol,
    CContainer,
    CForm,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import 'react-toastify/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!username || !password) {
            toast.error('Tên tài khoản và mật khẩu không được để trống.');
            return;
        }

        console.log(username + password);
        try {
            const response = await axios.post('http://localhost:5000/accounts/login', {
                username: username,
                password: password 
            });

            if (response.status === 200) {
                toast.success('Đăng nhập thành công!');
                dispatch(setUser(response.data.user))
                navigate('/admin/home');
            } else {
                toast.error(response.data.message || 'Đăng nhập thất bại.');
            }
            navigate('/admin/home');
        } catch (error) {
            console.error('Error during login:', error);
            toast.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        }
    };

    return (
        <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
            <CContainer>
                <CRow className="justify-content-center">
                    <CCol md={6}>
                        <CCardGroup>
                            <CCard className="p-4">
                                <CCardBody>
                                    <CForm>
                                        <h1>Đăng nhập</h1>
                                        <CInputGroup className="mb-3">
                                            <CInputGroupText>
                                                <CIcon icon={cilUser} />
                                            </CInputGroupText>
                                            <CFormInput 
                                                placeholder="Tên tài khoản" 
                                                autoComplete="username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                            />
                                        </CInputGroup>
                                        <CInputGroup className="mb-4">
                                            <CInputGroupText>
                                                <CIcon icon={cilLockLocked} />
                                            </CInputGroupText>
                                            <CFormInput
                                                type="password"
                                                placeholder="Mật khẩu"
                                                autoComplete="current-password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </CInputGroup>
                                        <CRow className="d-flex justify-content-center">
                                            <CCol xs="auto">
                                                <CButton color="success" className="px-4" onClick={handleLogin}>
                                                    Đăng nhập
                                                </CButton>
                                            </CCol>
                                        </CRow>
                                    </CForm>
                                </CCardBody>
                            </CCard>
                        </CCardGroup>
                    </CCol>
                </CRow>
            </CContainer>
            <ToastContainer />
        </div>
    );
};

export default Login;
