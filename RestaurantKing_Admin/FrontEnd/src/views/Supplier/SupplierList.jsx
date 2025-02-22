import React, { useState, useEffect } from 'react';
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CCard, CCardBody, CButton, CContainer, CRow, CCol, CModal, CModalBody,
  CModalFooter, CModalHeader, CModalTitle, CForm, CFormInput, CFormLabel, CCollapse,
  CCardHeader,
  CFormSelect,
  CPagination,
  CPaginationItem
} from '@coreui/react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import Divider from '../../components/myComponents/Dividers';

export default function SupplierList() {
  const [visible, setVisible] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [expandedSupplierId, setExpandedSupplierId] = useState(null);
  const [suppliersData, setSuppliersData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierIdToDelete, setSupplierIdToDelete] = useState(null);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = suppliersData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(suppliersData.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/suppliers/getSuppliers');
        if (response.status === 200) {
          setSuppliersData(response.data);
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error.response?.data?.message || error.message);
      }
    };
    fetchSuppliers();
  }, []);

  const handleEdit = (supplier) => {
    setEditSupplier(supplier);
    setVisible(true);
  };

  const handleShowDeleteModal = (id) => {
    setSupplierIdToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/suppliers/supplier/${supplierIdToDelete}`);
      if (response.status === 200) {
        setSuppliersData((prevSuppliers) => prevSuppliers.filter((supplier) => supplier.id !== supplierIdToDelete));
        setShowDeleteModal(false);
        toast.success('Xóa thành công!');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error.response?.data?.message || error.message);
    }
  };

  const handleSaveSupplier = async () => {
    const supplierName = document.getElementById('supplierName').value;
    const supplierAddress = document.getElementById('supplierAddress').value;
    const supplierPhone = document.getElementById('supplierPhone').value;
    const supplierEmail = document.getElementById('supplierEmail').value;
    const supplierTaxCode = document.getElementById('supplierTaxCode').value;
    const supplierTimeRefund = document.getElementById('supplierTimeRefund').value;

    const newSupplier = {
      name: supplierName,
      address: supplierAddress,
      phone: supplierPhone,
      email: supplierEmail,
      taxCode: supplierTaxCode,
      timeRefund: Number(supplierTimeRefund),
      products: [],
    };

    try {
      if (editSupplier) {
        const response = await axios.put(`http://localhost:5000/suppliers/supplier/${editSupplier.id}`, newSupplier);
        if (response.status === 200) {
          setSuppliersData((prevSuppliers) =>
            prevSuppliers.map((supplier) =>
              supplier.id === editSupplier.id ? { ...supplier, ...newSupplier } : supplier
            )
          );
          toast.success('Cập nhật thành công!');
        }
      } else {
        const response = await axios.post('http://localhost:5000/suppliers/addSupplier', newSupplier);
        if (response.status === 200) {
          setSuppliersData((prevSuppliers) => [...prevSuppliers, { ...newSupplier, id: response.data.supplierId }]);
          toast.success('Thêm mới thành công!');
        }
      }
      setVisible(false);
      setEditSupplier(null);
    } catch (error) {
      console.error('Error saving supplier:', error.response?.data?.message || error.message);
    }
  };

  const toggleExpand = async (supplierId) => {
    if (expandedSupplierId === supplierId) {
      setExpandedSupplierId(null);
      return;
    }
    setExpandedSupplierId(supplierId);
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
    <>
      <CContainer>
        <CRow className="mb-4">
          <CCol></CCol>
        </CRow>
        <CCard>
          <CCardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
            <div className="mb-3 mb-md-0">Danh sách nhà cung cấp</div>
            <CButton color="primary" onClick={() => { setVisible(true); setEditSupplier(null); }}>
              Thêm mới
            </CButton>
          </CCardHeader>
          <CCardBody>
            <div className="row">
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
            </div>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Tên Nhà Cung Cấp</CTableHeaderCell>
                  <CTableHeaderCell>Số Điện Thoại</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Tác vụ</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentItems.map((supplier, index) => (
                  <React.Fragment key={supplier.id}>
                    <CTableRow onClick={() => toggleExpand(supplier.id)}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{supplier.name}</CTableDataCell>
                      <CTableDataCell>{supplier.phone}</CTableDataCell>
                      <CTableDataCell>{supplier.email}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(supplier); }}>
                          Chỉnh Sửa
                        </CButton>{' '}
                        <CButton color="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleShowDeleteModal(supplier.id); }}>
                          Xóa
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow>
                      <CTableDataCell colSpan="7" className="p-0">
                        <CCollapse visible={expandedSupplierId === supplier.id}>
                          <CCardBody>
                            <h6>Thông tin của {supplier.name}</h6>
                            <div>
                              <strong>Địa chỉ: </strong>{supplier.address}
                            </div>
                            <div>
                              <strong>Mã số thuế: </strong>{supplier.taxCode}
                            </div>
                            <div>
                              <strong>Hoàn trả hàng hóa: </strong>{supplier.timeRefund} ngày
                            </div>
                            <Divider text={`Sản phẩm của ${supplier.name}`} color="blue" thickness="2px" />
                            <ul>
                              {supplier.products?.map((item, idx) => (
                                <li key={idx}>{item.name}</li>
                              )) || <li>Không có sản phẩm nào.</li>}
                            </ul>
                          </CCardBody>
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

        <CModal visible={visible} onClose={() => setVisible(false)}>
          <CModalHeader onClose={() => setVisible(false)}>
            <CModalTitle>{editSupplier ? 'Chỉnh Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <div className="mb-3">
                <CFormLabel htmlFor="supplierName">Tên Nhà Cung Cấp</CFormLabel>
                <CFormInput
                  type="text"
                  id="supplierName"
                  placeholder="Nhập tên nhà cung cấp"
                  defaultValue={editSupplier?.name || ''} />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="supplierAddress">Địa Chỉ</CFormLabel>
                <CFormInput
                  type="text"
                  id="supplierAddress"
                  placeholder="Nhập địa chỉ"
                  defaultValue={editSupplier?.address || ''} />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="supplierPhone">Số Điện Thoại</CFormLabel>
                <CFormInput
                  type="text"
                  id="supplierPhone"
                  placeholder="Nhập số điện thoại"
                  defaultValue={editSupplier?.phone || ''} />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="supplierEmail">Email</CFormLabel>
                <CFormInput
                  type="email"
                  id="supplierEmail"
                  placeholder="Nhập email"
                  defaultValue={editSupplier?.email || ''} />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="supplierTaxCode">Mã Số Thuế</CFormLabel>
                <CFormInput
                  type="text"
                  id="supplierTaxCode"
                  placeholder="Nhập mã số thuế"
                  defaultValue={editSupplier?.taxCode || ''} />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="supplierTimeRefund">Thời Gian Hoàn Trả</CFormLabel>
                <CFormInput
                  type="number"
                  id="supplierTimeRefund"
                  placeholder="Nhập thời gian hoàn trả (ngày)"
                  defaultValue={editSupplier?.timeRefund || 0} />
              </div>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setVisible(false)}>
              Hủy
            </CButton>
            <CButton color="primary" onClick={handleSaveSupplier}>
              {editSupplier ? 'Lưu' : 'Thêm'}
            </CButton>
          </CModalFooter>
        </CModal>

        <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <CModalHeader closeButton>
            <CModalTitle>Xác Nhận Xóa</CModalTitle>
          </CModalHeader>
          <CModalBody>Bạn có chắc chắn muốn xóa nhà cung cấp này?</CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
              Hủy
            </CButton>
            <CButton color="danger" onClick={handleDelete}>
              Xóa
            </CButton>
          </CModalFooter>
        </CModal>
      </CContainer>

      <ToastContainer />
    </>
  );
}
