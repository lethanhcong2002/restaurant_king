/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import {
  CTable, CTableBody, CTableHeaderCell, CTableHead, CTableRow, CTableDataCell,
  CCard, CCardBody, CCardHeader, CButton, CModal, CModalHeader, CModalTitle,
  CModalBody, CModalFooter, CFormInput, CRow, CCol, CFormSelect, CAlert,
  CPagination,
  CPaginationItem
} from '@coreui/react';
import formatToVND from '../../code/convertPrice';
import axios from 'axios';
import { getRoleAdmin } from '../../code/getData';
import { toast, ToastContainer } from 'react-toastify';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ phone: '', email: '', role: '', salary: '' });
  const [accountCount, setAccountCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = employees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/accounts/getAdmins');
      const fetchedTables = res.data || [];
      setEmployees(fetchedTables);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch employee data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEmployeeClick = () => {
    setNewEmployee({ phone: '', email: '', role: '', salary: '' });
    setIsEditMode(false);
    setAccountCount(1);
    setModalVisible(true);
  };

  const handleEditEmployeeClick = (employee) => {
    setNewEmployee({ ...employee });
    setIsEditMode(true);
    setModalVisible(true);
  };

  const handleSaveEmployee = async () => {
    if (isEditMode) {
      if (!newEmployee.name || !newEmployee.phone || !newEmployee.email || newEmployee.role === 0) {
        setError('Please fill in all fields.');
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await axios.put(`http://localhost:5000/accounts/update-account/${newEmployee.id}`, {
          name: newEmployee.name,
          phone: newEmployee.phone,
          email: newEmployee.email,
          salary: newEmployee.salary,
          role: newEmployee.role,
        });

        toast.success('Thông tin nhân viên đã được cập nhật thành công!');
      } catch (error) {
        toast.error('Lỗi khi cập nhật nhân viên: ' + (error.message || error));
        setError('Failed to update employee. Please try again.');
      } finally {
        setLoading(false);
        fetchData();
        setModalVisible(false);
      }
    } else {
      try {
        setLoading(true);
        setError('');
        const response = await axios.post('http://localhost:5000/accounts/create-accounts', {
          quantity: accountCount,
          password: '123456789',
        });

        toast.success('Tạo tài khoản nhân viên thành công!');
      } catch (error) {
        toast.error('Lỗi khi tạo tài khoản: ' + (error.message || error));
        setError('Failed to create accounts. Please try again.');
      } finally {
        setLoading(false);
        fetchData();
        setModalVisible(false);
      }
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn sa thải nhân viên này?');

    if (confirmDelete) {
      setLoading(true);
      setError('');
      try {
        const res = await axios.put(`http://localhost:5000/accounts/reset-account/${employeeId}`);
        toast.success('Nhân viên đã được sa thải!');
      } catch (error) {
        toast.error('Lỗi khi xóa nhân viên: ' + (error.message || error));
        setError('Failed to fetch employee data. Please try again later.');
      } finally {
        fetchData();
        setLoading(false);
      }
    }
  };


  const handleViewEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setViewModalVisible(true);
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

  const renderNewEdit = () => {
    return (
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg">
        <CModalHeader onClose={() => setModalVisible(false)}>
          <CModalTitle>{isEditMode ? 'Chỉnh sửa thông tin' : 'Tạo tài khoản mới'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {isEditMode ? (
            <>
              <CRow>
                <CCol md={6}>
                  <CFormInput
                    label="Họ và tên"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    label="Số điện thoại"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mt-3">
                <CCol md={6}>
                  <CFormInput
                    label="Email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    placeholder="Nhập email"
                    required
                  />
                </CCol>
                <CCol md={6}>
                  <CFormSelect
                    label="Vai trò"
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: Number(e.target.value) })}
                    required
                  >
                    <option value="0" disabled>Chọn vai trò</option>
                    <option value="1">Phục vụ</option>
                    <option value="2">Đầu bếp</option>
                    <option value="3">Quản lý</option>
                    <option value="4">Admin tổng</option>
                  </CFormSelect>
                </CCol>
              </CRow>
              <CRow className="mt-3">
                <CCol md={6}>
                  <CFormInput
                    label="Lương"
                    type="number"
                    value={newEmployee.salary || 0}
                    onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                    placeholder="Nhập lương"
                    required
                  />
                </CCol>
              </CRow>
            </>
          ) : (
            <CRow>
              <CCol md={6}>
                <CFormInput
                  label="Số lượng tài khoản"
                  type="number"
                  value={accountCount}
                  onChange={(e) => setAccountCount(Number(e.target.value))}
                  placeholder="Nhập số lượng tài khoản"
                  min="1"
                  required
                />
              </CCol>
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>Hủy</CButton>
          <CButton color="primary" onClick={handleSaveEmployee} disabled={loading}>
            {isEditMode ? 'Lưu thay đổi' : 'Thêm mới'}
          </CButton>
        </CModalFooter>
      </CModal>
    );
  }

  const renderDetail = () => {
    return (
      <CModal visible={viewModalVisible} onClose={() => setViewModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Chi tiết nhân viên</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedEmployee && (
            <div>
              <p><strong>Tên tài khoản:</strong> {selectedEmployee.username}</p>
              <p><strong>Họ và tên:</strong> {selectedEmployee.name}</p>
              <p><strong>Số điện thoại:</strong> {selectedEmployee.phone}</p>
              <p><strong>Email:</strong> {selectedEmployee.email}</p>
              <p><strong>Vai trò:</strong> {getRoleAdmin(selectedEmployee.role)}</p>
              <p><strong>Lương:</strong> {formatToVND(selectedEmployee.salary)}</p>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setViewModalVisible(false)}>Đóng</CButton>
        </CModalFooter>
      </CModal>
    );
  }
  
  return (
    <div>
      {error && <CAlert color="danger">{error}</CAlert>}
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <div>Quản lý nhân viên</div>
          <CButton color="primary" onClick={handleAddEmployeeClick} disabled={loading}>Tạo tài khoản</CButton>
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
          {loading ? (
            <div>Loading...</div>
          ) : (
            <CTable hover responsive bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Tên tài khoản</CTableHeaderCell>
                  <CTableHeaderCell>Chủ sở hữu</CTableHeaderCell>
                  <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                  <CTableHeaderCell>Thao tác</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentItems.map((employee, index) => (
                  <CTableRow key={employee.id}>
                    <CTableDataCell>{index + 1}</CTableDataCell>
                    <CTableDataCell>{employee.username}</CTableDataCell>
                    <CTableDataCell>{employee.name}</CTableDataCell>
                    <CTableDataCell>{employee.status ? 'Đang sử dụng' : 'Trống'}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="info" className="me-2" onClick={() => handleViewEmployeeClick(employee)}>
                        Xem
                      </CButton>
                      <CButton color="warning" className="me-2" onClick={() => handleEditEmployeeClick(employee)}>
                        Sửa
                      </CButton>
                      {employee.status ? (
                        <>
                          <CButton color="danger" onClick={() => handleDeleteEmployee(employee.id)}>
                            Sa thải
                          </CButton>
                        </>
                      ) : null}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
        {renderPagination()}
        {renderNewEdit()}
        {renderDetail()}
        <ToastContainer />
      </CCard>
    </div>
  );
}
