import React, { useEffect, useState } from 'react';
import {
    CButton, CCard, CCardBody, CCardHeader, CCol, CRow, CBadge, CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell, CCollapse, CPagination, CPaginationItem, CModal, CModalHeader, CModalBody, CModalFooter,
    CFormInput,
    CModalTitle,
    CFormSelect,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDate } from '../../code/convertDate';
import formatToVND from '../../code/convertPrice';
import { getBadgeIE, getStatusExportIE, getStatusIE } from '../../code/getData';
import { convertImageToBase64JPG } from '../../code/convertImage';
import Divider from '../../components/myComponents/Dividers';
import { toast, ToastContainer } from 'react-toastify';

const ImportExportList = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [actualValues, setActualValues] = useState({});
    const [returnValues, setReturnValues] = useState({});
    const [selectedRecord, setSelectedRecord] = useState(null);

    const [expanded, setExpanded] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [modalRefund, setModalRefund] = useState(false);
    const navigate = useNavigate();

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchInvoiceIE = async () => {
        try {
            const res = await axios.get('http://localhost:5000/ieInvoices/invoicesIE');
            if (res.status === 200) {
                setData(res.data);
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error.message || error);
        }
    };

    useEffect(() => {
        setFilteredData(data);
    }, [data]);

    useEffect(() => {
        fetchInvoiceIE();
    }, []);

    const handleToggle = (id) => {
        setExpanded(expanded === id ? null : id);
    };

    const handleNew = () => {
        navigate('/admin/nhap-xuat/hoa-don-xuat');
    };

    const handleImport = () => {
        navigate('/admin/nhap-xuat/hoa-don-nhap');
    };

    const handleConfirm = (record) => {
        setSelectedRecord(record);
        setModalVisible(true);
    };

    const handleDelete = (record) => {
        setSelectedRecord(record);
        setModalDeleteVisible(true);
    };

    const handleRefund = (record) => {
        setSelectedRecord(record);
        setModalRefund(true);
    };

    const handleDateSubmit = () => {
        if (startDate && endDate) {
            const filtered = data.filter(item => {
                const itemDate = new Date(item.createdAt);
                const itemDateString = `${itemDate.getFullYear()}-${(itemDate.getMonth() + 1).toString().padStart(2, '0')}-${itemDate.getDate().toString().padStart(2, '0')}`;

                const start = new Date(startDate);
                const startDateString = `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')}`;

                const end = new Date(endDate);
                const endDateString = `${end.getFullYear()}-${(end.getMonth() + 1).toString().padStart(2, '0')}-${end.getDate().toString().padStart(2, '0')}`;

                return itemDateString >= startDateString && itemDateString <= endDateString;
            });
            setFilteredData(filtered);
            setCurrentPage(1);
        } else {
            alert('Vui lòng chọn đầy đủ khoảng thời gian!');
        }
    };

    const handleClear = () => {
        setStartDate('');
        setEndDate('');
        setFilteredData(data);
        setCurrentPage(1);
    };

    const handleModalConfirm = async () => {
        const logData = selectedRecord.items.map((item) => ({
            id: item.id,
            actualQuantity: Number(actualValues[item.id]?.actualQuantity) || 0,
            actualPrice: Number(actualValues[item.id]?.actualPrice) || 0,
            note: actualValues[item.id]?.note || '',
            itemId: item.itemId,
        }));

        try {
            const res = await axios.put(`http://localhost:5000/ieInvoices/updateInvoiceIE/${selectedRecord.id}`, { updatedItems: logData });

            if (res.status === 200) {
                toast.success("Cập nhật hóa đơn thành công!");
                console.log("Response:", res.data);
            }
        } catch (error) {
            toast.error("Lỗi khi cập nhật hóa đơn: " + (error.response?.data?.message || error.message));
        } finally {
            fetchInvoiceIE();
            setModalVisible(false);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            const res = await axios.delete(`http://localhost:5000/ieInvoices/deleteInvoiceIE/${selectedRecord.id}`);

            if (res.status === 200) {
                toast.success("Hóa đơn đã được xóa thành công!");
                fetchInvoiceIE();
            }
        } catch (error) {
            toast.error("Lỗi khi xóa hóa đơn: " + (error.response?.data?.message || error.message));
        } finally {
            setModalDeleteVisible(false);
        }
    };

    const isRefundAllowed = (createdAt, timeRefund) => {
        const currentDate = new Date();
        const createdDate = new Date(createdAt);

        const timeDifference = currentDate.getTime() - createdDate.getTime();
        const daysPassed = timeDifference / (1000 * 3600 * 24);

        return daysPassed <= timeRefund;
    };

    const renderModalRefund = () => {
        const handleImageSelect = async (itemId, event) => {
            const file = event.target.files[0];
            event.target.value = null;

            if (file) {
                try {
                    const base64Image = await convertImageToBase64JPG(file);

                    setReturnValues((prev) => ({
                        ...prev,
                        [itemId]: {
                            ...prev[itemId],
                            images: [...(prev[itemId]?.images || []), base64Image],
                        },
                    }));
                } catch (error) {
                    console.error('Error converting image to base64:', error);
                }
            }
        };

        const handleImageDelete = (itemId, imageIndex) => {
            setReturnValues((prev) => ({
                ...prev,
                [itemId]: {
                    ...prev[itemId],
                    images: prev[itemId].images.filter((_, index) => index !== imageIndex),
                },
            }));
        };

        const handleClose = () => {
            setReturnValues({});
            setModalRefund(false);
        };

        const handleModalReturnConfirm = async () => {
            try {
                const itemsWithBase64Images = selectedRecord.items.map((item) => ({
                    id: item.id,
                    itemId: item.itemId,
                    name: item.name,
                    refundQuantity: Number(returnValues[item.id]?.returnQuantity) || 0,
                    refundReason: returnValues[item.id]?.reason || '',
                    blobUrls: returnValues[item.id]?.images || [],
                }));

                const inputData = {
                    code: selectedRecord.code,
                    email: selectedRecord.supplierEmail,
                    items: itemsWithBase64Images,
                };

                const response = await axios.put(`http://localhost:5000/ieInvoices/refund/${selectedRecord.id}`, { updatedItems: inputData });

                if (response.status === 200) {
                    fetchInvoiceIE();
                    setModalRefund(false);
                    setReturnValues({});
                    toast.success('Hoàn trả thành công!');
                }
            } catch (error) {
                toast.error('Lỗi khi xác nhận hoàn trả: ' + (error.response?.data?.message || error.message));
            }
        };

        return (
            <CModal visible={modalRefund} onClose={() => handleClose()} fullscreen>
                <CModalHeader>Hoàn trả hàng</CModalHeader>
                <CModalBody>
                    {selectedRecord ? (
                        <CTable hover striped bordered>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Tên hàng hóa</CTableHeaderCell>
                                    <CTableHeaderCell>Đơn vị tính</CTableHeaderCell>
                                    <CTableHeaderCell>Số lượng nhận</CTableHeaderCell>
                                    <CTableHeaderCell>Số lượng hoàn trả</CTableHeaderCell>
                                    <CTableHeaderCell>Lý do hoàn trả</CTableHeaderCell>
                                    <CTableHeaderCell>Chọn ảnh</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {selectedRecord.items.map((item) => (
                                    <CTableRow key={item.id}>
                                        <CTableDataCell>{item.name}</CTableDataCell>
                                        <CTableDataCell>{item.unit}</CTableDataCell>
                                        <CTableDataCell>{item.actualQuantity}</CTableDataCell>
                                        <CTableDataCell>
                                            <CFormInput type="number"
                                                value={returnValues[item.id]?.returnQuantity || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setReturnValues((prev) => ({
                                                        ...prev,
                                                        [item.id]: {
                                                            ...prev[item.id],
                                                            returnQuantity: value,
                                                        },
                                                    }));
                                                }}
                                            />
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <CFormInput type="text"
                                                value={returnValues[item.id]?.reason || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setReturnValues((prev) => ({
                                                        ...prev,
                                                        [item.id]: {
                                                            ...prev[item.id],
                                                            reason: value,
                                                        },
                                                    }));
                                                }}
                                            />
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageSelect(item.id, e)}
                                            />
                                            <div className="mt-3">
                                                {returnValues[item.id]?.images?.map((image, index) => (
                                                    <div key={index} style={{ position: 'relative', display: 'inline-block', marginRight: '10px' }}>
                                                        <img
                                                            src={image}
                                                            alt="selected"
                                                            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }}
                                                        />
                                                        <button
                                                            style={{
                                                                position: 'absolute',
                                                                top: '-10px',
                                                                right: '-10px',
                                                                background: 'red',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '50%',
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => handleImageDelete(item.id, index)}
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                    ) : (
                        <div>Đang tải thông tin...</div>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => handleClose()}>Hủy</CButton>
                    <CButton color="primary" onClick={handleModalReturnConfirm}>Xác nhận hoàn trả</CButton>
                </CModalFooter>
            </CModal>
        );
    };

    const renderModalDelete = () => (
        <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)}>
            <CModalHeader>
                <CModalTitle>Xác nhận xóa</CModalTitle>
            </CModalHeader>
            <CModalBody>
                Bạn có chắc chắn muốn xóa phiếu nhập/xuất <strong>{selectedRecord?.code}</strong> không?
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
                    Hủy
                </CButton>
                <CButton color="danger" onClick={handleConfirmDelete}>
                    Xóa
                </CButton>
            </CModalFooter>
        </CModal>
    );

    const renderModalAccepted = () => (
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)} fullscreen>
            <CModalHeader>Xác nhận đơn hàng</CModalHeader>
            <CModalBody>
                {selectedRecord ? (
                    <CTable hover striped bordered>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>Tên hàng hóa</CTableHeaderCell>
                                <CTableHeaderCell>Đơn vị tính</CTableHeaderCell>
                                <CTableHeaderCell>Số lượng</CTableHeaderCell>
                                <CTableHeaderCell>Đơn giá</CTableHeaderCell>
                                <CTableHeaderCell>Số lượng thực tế</CTableHeaderCell>
                                <CTableHeaderCell>Đơn giá thực tế</CTableHeaderCell>
                                <CTableHeaderCell>Ghi chú</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {selectedRecord.items.map((item) => (
                                <CTableRow key={item.id}>
                                    <CTableDataCell>{item.name}</CTableDataCell>
                                    <CTableDataCell>{item.unit}</CTableDataCell>
                                    <CTableDataCell>{item.quantity}</CTableDataCell>
                                    <CTableDataCell>{formatToVND(item.price)}</CTableDataCell>
                                    <CTableDataCell>
                                        <CFormInput type="number"
                                            value={actualValues[item.id]?.actualQuantity || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setActualValues((prev) => ({
                                                    ...prev,
                                                    [item.id]: {
                                                        ...prev[item.id],
                                                        actualQuantity: value
                                                    }
                                                }));
                                            }}
                                        />
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <CFormInput type="number"
                                            value={actualValues[item.id]?.actualPrice || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setActualValues((prev) => ({
                                                    ...prev,
                                                    [item.id]: {
                                                        ...prev[item.id],
                                                        actualPrice: value
                                                    }
                                                }));
                                            }}
                                        />
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <CFormInput type="text"
                                            value={actualValues[item.id]?.note || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setActualValues((prev) => ({
                                                    ...prev,
                                                    [item.id]: {
                                                        ...prev[item.id],
                                                        note: value
                                                    }
                                                }));
                                            }}
                                        />
                                    </CTableDataCell>
                                </CTableRow>
                            ))}
                        </CTableBody>
                    </CTable>
                ) : (
                    <div>Đang tải thông tin đơn hàng...</div>
                )}
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={() => setModalVisible(false)}>Hủy</CButton>
                <CButton color="primary" onClick={handleModalConfirm}>Xác nhận</CButton>
            </CModalFooter>
        </CModal>
    );

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
        <CRow>
            <CCol>
                <CCard>
                    <CCardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                        <div className="mb-3 mb-md-0">Quản lý nhập xuất kho</div>
                        <div>
                            <CButton color="primary" onClick={handleNew}>Đơn xuất kho</CButton>{' '}
                            <CButton color="primary" onClick={handleImport}>Lập phiếu nhập hàng</CButton>
                        </div>
                    </CCardHeader>
                    <CCardBody>
                        <div className='row'>
                            <div className='col-md-2 mb-2'>
                                <CFormSelect
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="mb-3"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={20}>20</option>
                                </CFormSelect>
                            </div>

                            <div className='col-md-4 mb-2'>
                                <CFormInput
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="mb-3"
                                />
                            </div>

                            <div className='col-md-4 mb-2'>
                                <CFormInput
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="mb-3"
                                />
                            </div>
                            <div className='col-md-2 mb-2'>
                                <div className='d-flex justify-content-between'>
                                    <CButton
                                        color="primary"
                                        onClick={handleDateSubmit}
                                    >
                                        Xác nhận
                                    </CButton>
                                    <CButton
                                        color="secondary"
                                        onClick={handleClear}
                                    >
                                        Hủy
                                    </CButton>
                                </div>
                            </div>
                        </div>
                        <CTable hover striped bordered responsive>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Thông tin phiếu</CTableHeaderCell>
                                    <CTableHeaderCell>Loại phiếu</CTableHeaderCell>
                                    <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {currentItems.map((record) => (
                                    <React.Fragment key={record.id}>
                                        <CTableRow onClick={() => handleToggle(record.id)} style={{ cursor: 'pointer' }}>
                                            <CTableDataCell>
                                                <div>
                                                    <strong>Số phiếu:</strong> {record.code}
                                                </div>
                                                <div>
                                                    <strong>Ngày:</strong> {formatDate(record.createdAt)}
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                {record.type ? 'Phiếu nhập' : 'Phiếu xuất'}
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CBadge color={getBadgeIE(record.status)}>{getStatusIE(record.status)}</CBadge>
                                            </CTableDataCell>
                                        </CTableRow>
                                        <CTableRow>
                                            <CTableDataCell colSpan="3">
                                                <CCollapse visible={expanded === record.id}>
                                                    <div className="mb-3">
                                                        <strong>Ngày lập:</strong> {formatDate(record.createdAt)}
                                                    </div>
                                                    <div className="mb-3">
                                                        <strong>Người lập:</strong> {record.userName}
                                                    </div>

                                                    {record.type ? (
                                                        <>
                                                            <div className="mb-3">
                                                                <strong>Nhà cung cấp:</strong> {record.supplierName}
                                                            </div>
                                                            <div className="mb-3">
                                                                <strong>Ghi chú:</strong> {record.notes || 'Không có'}
                                                            </div>

                                                            <CTable hover striped bordered>
                                                                <CTableHead>
                                                                    <CTableRow>
                                                                        <CTableHeaderCell>Tên hàng hóa</CTableHeaderCell>
                                                                        <CTableHeaderCell>Số lượng</CTableHeaderCell>
                                                                        <CTableHeaderCell>Đơn giá</CTableHeaderCell>
                                                                        <CTableHeaderCell>Số lượng thực tế</CTableHeaderCell>
                                                                        <CTableHeaderCell>Đơn giá thực tế</CTableHeaderCell>
                                                                        <CTableHeaderCell>Đơn vị tính</CTableHeaderCell>
                                                                        <CTableHeaderCell>Tổng giá trị dự kiến</CTableHeaderCell>
                                                                        <CTableHeaderCell>Tổng giá trị thực tế</CTableHeaderCell>
                                                                    </CTableRow>
                                                                </CTableHead>
                                                                <CTableBody>
                                                                    {record.items.map((item, index) => (
                                                                        <CTableRow key={index}>
                                                                            <CTableDataCell>{item.name}</CTableDataCell>
                                                                            <CTableDataCell>{item.quantity}</CTableDataCell>
                                                                            <CTableDataCell>{formatToVND(item.price)}</CTableDataCell>
                                                                            <CTableDataCell>{item.actualQuantity || 'Chưa có'}</CTableDataCell>
                                                                            <CTableDataCell>{item.actualPrice ? formatToVND(item.actualPrice) : 'Chưa có'}</CTableDataCell>
                                                                            <CTableDataCell>{item.unit}</CTableDataCell>
                                                                            <CTableDataCell>{formatToVND(item.quantity * item.price)}</CTableDataCell>
                                                                            <CTableDataCell>
                                                                                {item.actualQuantity && item.actualPrice
                                                                                    ? formatToVND(item.actualQuantity * item.actualPrice)
                                                                                    : 'Chưa có'}
                                                                            </CTableDataCell>
                                                                        </CTableRow>
                                                                    ))}
                                                                    <CTableRow>
                                                                        <CTableDataCell colSpan="6" className="text-end">
                                                                            <strong>Tổng tiền:</strong>
                                                                        </CTableDataCell>
                                                                        <CTableDataCell>
                                                                            <strong>
                                                                                {formatToVND(
                                                                                    record.items.reduce((total, item) => total + item.quantity * item.price, 0)
                                                                                )}
                                                                            </strong>
                                                                        </CTableDataCell>
                                                                        <CTableDataCell>
                                                                            <strong>
                                                                                {formatToVND(
                                                                                    record.items.reduce((total, item) =>
                                                                                        item.actualQuantity && item.actualPrice
                                                                                            ? total + item.actualQuantity * item.actualPrice
                                                                                            : total, 0
                                                                                    )
                                                                                )}
                                                                            </strong>
                                                                        </CTableDataCell>
                                                                    </CTableRow>
                                                                </CTableBody>
                                                            </CTable>

                                                            {record.refund && (
                                                                <>
                                                                    <Divider text="Hoàn trả" color="blue" thickness="2px" />
                                                                    <h5>Thông tin hàng hóa hoàn trả</h5>
                                                                    <div className='mb-2'><strong>Ngày hoàn trả: </strong>{formatDate(record.refundDate)}</div>
                                                                    <CTable hover striped bordered>
                                                                        <CTableHead>
                                                                            <CTableRow>
                                                                                <CTableHeaderCell>Tên hàng hóa</CTableHeaderCell>
                                                                                <CTableHeaderCell>Số lượng hoàn trả</CTableHeaderCell>
                                                                                <CTableHeaderCell>Lý do hoàn trả</CTableHeaderCell>
                                                                            </CTableRow>
                                                                        </CTableHead>
                                                                        <CTableBody>
                                                                            {record.items
                                                                                .filter(item => item.refundQuantity > 0)
                                                                                .map((item, index) => (
                                                                                    <CTableRow key={index}>
                                                                                        <CTableDataCell>{item.name}</CTableDataCell>
                                                                                        <CTableDataCell>{item.refundQuantity}</CTableDataCell>
                                                                                        <CTableDataCell>{item.refundReason || 'Không có lý do'}</CTableDataCell>
                                                                                    </CTableRow>
                                                                                ))}
                                                                        </CTableBody>
                                                                    </CTable>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CTable hover striped bordered>
                                                                <CTableHead>
                                                                    <CTableRow>
                                                                        <CTableHeaderCell>Tên hàng hóa</CTableHeaderCell>
                                                                        <CTableHeaderCell>Số lượng xuất</CTableHeaderCell>
                                                                        <CTableHeaderCell>Lý do xuất kho</CTableHeaderCell>
                                                                        <CTableHeaderCell>Số lượng gốc</CTableHeaderCell>
                                                                        <CTableHeaderCell>Đơn vị tính</CTableHeaderCell>
                                                                        <CTableHeaderCell>Ghi chú</CTableHeaderCell>
                                                                    </CTableRow>
                                                                </CTableHead>
                                                                <CTableBody>
                                                                    {record.items.map((item, index) => (
                                                                        <CTableRow key={index}>
                                                                            <CTableDataCell>{item.name}</CTableDataCell>
                                                                            <CTableDataCell>{item.exportQuantity}</CTableDataCell>
                                                                            <CTableDataCell>{getStatusExportIE(item.exportReasonStatus)}</CTableDataCell>
                                                                            <CTableDataCell>{item.originalQuantity}</CTableDataCell>
                                                                            <CTableDataCell>{item.unit}</CTableDataCell>
                                                                            <CTableDataCell>{item.note}</CTableDataCell>
                                                                        </CTableRow>
                                                                    ))}
                                                                </CTableBody>
                                                            </CTable>
                                                        </>
                                                    )}

                                                    {record.status === false && record.type === true && (
                                                        <CButton color="success" variant="outline" size="sm" onClick={() => handleConfirm(record)} style={{ marginRight: '4px' }}>
                                                            Xác nhận đơn hàng
                                                        </CButton>
                                                    )}
                                                    {record.refund === false && record.status === true && isRefundAllowed(record.createdAt, record.timeRefund) && (
                                                        <CButton color="warning" variant="outline" size="sm" onClick={() => handleRefund(record)} style={{ marginRight: '4px' }}>
                                                            Hoàn trả hàng
                                                        </CButton>
                                                    )}

                                                    <CButton color="danger" variant="outline" size="sm" onClick={() => handleDelete(record)}>Xóa</CButton>
                                                </CCollapse>
                                            </CTableDataCell>
                                        </CTableRow>
                                    </React.Fragment>
                                ))}
                            </CTableBody>
                        </CTable>
                        {renderPagination()}
                    </CCardBody>
                </CCard>
            </CCol>
            {renderModalAccepted()}
            {renderModalDelete()}
            {renderModalRefund()}
            <ToastContainer />
        </CRow>
    );
};

export default ImportExportList;
