import { useEffect, useState } from 'react';
import {
    CTable, CTableBody, CTableHeaderCell, CTableHead, CTableRow, CTableDataCell,
    CCard, CCardBody, CCardHeader, CButton, CModal, CModalHeader, CModalTitle,
    CModalBody, CModalFooter, CRow, CCol,
    CFormSelect,
    CPaginationItem,
    CPagination
} from '@coreui/react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

export default function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = customers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(customers.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const fetchCustomers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/customers/getCustomers');
            if (response.status === 200) {
                setCustomers(response.data);
            } else {
                console.error('Failed to fetch customers:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const handleViewCustomerClick = (customer) => {
        setSelectedCustomer(customer);
    };

    const handleUpdateCustomerStatus = async (customerId, status) => {
        try {
            const response = await axios.put(`http://localhost:5000/customers/customer/${customerId}`, { status });
            if (response.status === 200) {
                toast.success(status ? 'Khôi phục tài khoản thành công' : 'Đã tạm ngưng hoạt động tài khoản');
                fetchCustomers();
            } else {
                console.error('Failed to update customer status:', response.data.message);
            }
        } catch (error) {
            console.error('Error updating customer status:', error);
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

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
        <div>
            <CCard>
                <CCardHeader className="d-flex justify-content-between align-items-center">
                    Quản lý khách hàng
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
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>#</CTableHeaderCell>
                                <CTableHeaderCell>Tên khách hàng</CTableHeaderCell>
                                <CTableHeaderCell>Số điện thoại</CTableHeaderCell>
                                <CTableHeaderCell>Email</CTableHeaderCell>
                                <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                                <CTableHeaderCell>Thao tác</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {currentItems.map((customer, index) => (
                                <CTableRow key={customer.id}>
                                    <CTableDataCell>{index + 1}</CTableDataCell>
                                    <CTableDataCell>{customer.customerName}</CTableDataCell>
                                    <CTableDataCell>{customer.customerPhone}</CTableDataCell>
                                    <CTableDataCell>{customer.customerEmail}</CTableDataCell>
                                    <CTableDataCell>{customer.status ? 'Hoạt động' : 'Tạm ngưng'}</CTableDataCell>
                                    <CTableDataCell>
                                        <CButton color="info" className="me-2" onClick={() => handleViewCustomerClick(customer)}>
                                            Xem
                                        </CButton>
                                        {customer.status ? (
                                            <CButton color="danger" onClick={() => handleUpdateCustomerStatus(customer.id, false)}>
                                                Tạm ngưng
                                            </CButton>
                                        ) : (
                                            <CButton color="success" onClick={() => handleUpdateCustomerStatus(customer.id, true)}>
                                                Khôi phục
                                            </CButton>
                                        )}
                                    </CTableDataCell>
                                </CTableRow>
                            ))}
                        </CTableBody>
                    </CTable>
                    {renderPagination()}
                </CCardBody>
            </CCard>

            {selectedCustomer && (
                <CModal visible={true} onClose={() => setSelectedCustomer(null)} size="lg">
                    <CModalHeader onClose={() => setSelectedCustomer(null)}>
                        <CModalTitle>Chi tiết khách hàng</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <CRow>
                            <CCol md={6}>
                                <strong>Tên khách hàng:</strong> {selectedCustomer.customerName}
                            </CCol>
                            <CCol md={6}>
                                <strong>Số điện thoại:</strong> {selectedCustomer.customerPhone}
                            </CCol>
                        </CRow>
                        <CRow className="mt-3">
                            <CCol md={12}>
                                <strong>Email:</strong> {selectedCustomer.customerEmail}
                            </CCol>
                        </CRow>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => setSelectedCustomer(null)}>Đóng</CButton>
                    </CModalFooter>
                </CModal>
            )}
            <ToastContainer />
        </div>
    );
}
