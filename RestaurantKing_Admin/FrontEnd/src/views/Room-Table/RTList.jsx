import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    CCard, CCardBody, CCardHeader, CAccordion, CAccordionItem,
    CAccordionHeader, CAccordionBody, CTable, CTableBody,
    CTableDataCell, CTableRow, CButton, CModal, CModalBody,
    CModalFooter, CModalHeader, CModalTitle
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setData } from '../../action';

export default function RTList() {
    const [rooms, setRooms] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await axios.get('http://localhost:5000/tables/getTable');
                setRooms(response.data);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách bàn:', error);
            }
        };

        fetchTables();
    }, []);

    const handleNavigate = () => {
        navigate('/admin/phong-ban/them-moi');
    };

    const handleUpdateClick = (room) => {
        dispatch(setData(room));
        navigate(`/admin/phong-ban/sua/${room.id}`);
    };

    const handleDeleteClick = (room) => {
        setRoomToDelete(room);
        setModalVisible(true);
    };

    const handleConfirmDelete = async () => {
        if (roomToDelete && roomToDelete.status === false) {
            try {
                const response = await axios.delete(`http://localhost:5000/tables/deleteTable/${roomToDelete.id}`);

                alert(response.data.message);

                setRooms(prevRooms => prevRooms.filter(room => room.id !== roomToDelete.id));
                setModalVisible(false);
                setRoomToDelete(null);
            } catch (error) {
                console.error('Lỗi khi xóa bàn:', error);
                alert('Lỗi khi xóa bàn');
            }
        } else {
            alert('Bàn không thể xóa, vì trạng thái không phải là false.');
        }
    };

    return (
        <>
            <CCard>
                <CCardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
                    <div className="mb-3 mb-md-0">Danh sách phòng và bàn</div>
                    <CButton color="primary" onClick={handleNavigate}>Thêm mới bàn</CButton>
                </CCardHeader>
                <CCardBody>
                    <CAccordion alwaysOpen>
                        {rooms.map((room) => (
                            <CAccordionItem key={room.id}>
                                <CAccordionHeader>
                                    {room.tableName} - {room.status ? 'Có chỗ' : 'Trống'}
                                </CAccordionHeader>
                                <CAccordionBody>
                                    <CTable>
                                        <CTableBody>
                                            <CTableRow>
                                                <CTableDataCell style={{ width: '15%' }}>
                                                    Tên Phòng/Bàn
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {room.tableName}
                                                </CTableDataCell>
                                            </CTableRow>
                                            <CTableRow>
                                                <CTableDataCell style={{ width: '15%' }}>
                                                    Ghi chú
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {room.note}
                                                </CTableDataCell>
                                            </CTableRow>
                                        </CTableBody>
                                    </CTable>
                                    <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                                        <CButton color="primary" className="me-2" onClick={() => handleUpdateClick(room)}>
                                            Cập nhật
                                        </CButton>
                                        <CButton color="secondary" onClick={() => handleDeleteClick(room)}>
                                            Xóa
                                        </CButton>
                                    </div>
                                </CAccordionBody>
                            </CAccordionItem>
                        ))}
                    </CAccordion>
                </CCardBody>
            </CCard>

            <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Xác nhận xóa</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    Bạn có chắc chắn muốn xóa phòng/bàn <strong>{roomToDelete?.tableName}</strong> không?
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setModalVisible(false)}>
                        Hủy
                    </CButton>
                    <CButton color="danger" onClick={handleConfirmDelete}>
                        Xóa
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    );
}
