/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CCard, CCardBody, CButton, CCollapse, CContainer, CModal, CModalHeader, CModalBody,
  CModalFooter, CFormCheck, CCardHeader, CPagination, CPaginationItem, CInputGroup, CFormInput,
  CCardFooter,
  CFormSelect
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilTrash } from '@coreui/icons';
import formatToVND from '../../code/convertPrice';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDate, formatDateVer1 } from '../../code/convertDate';
import { useDispatch } from 'react-redux';
import { setData } from '../../action';
import { toast, ToastContainer } from 'react-toastify';

export default function StorageList() {
  const [expandedRow, setExpandedRow] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [excelModal, setExcelModal] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [storageData, setStorageData] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const categoryMap = {
    1: "Nguyên liệu - Thực phẩm - Gia vị",
    2: "Đồ uống",
    3: "Thiết bị",
    4: "Vật dụng vệ sinh",
    "Nguyên liệu - Thực phẩm - Gia vị": 1,
    "Đồ uống": 2,
    "Thiết bị": 3,
    "Vật dụng vệ sinh": 4
  };

  const [columns, setColumns] = useState({
    name: { visible: true, label: 'Tên' },
    category: { visible: true, label: 'Danh mục' },
    supplier: { visible: false, label: 'Nhà cung cấp' },
    unit: { visible: true, label: 'Đơn vị' },
    quantity: { visible: true, label: 'Số lượng' },
    purchasePrice: { visible: true, label: 'Giá mua' },
    importDate: { visible: true, label: 'Ngày nhập' },
    expiryDate: { visible: false, label: 'Hạn sử dụng' },
    minQuantity: { visible: false, label: 'Số lượng tối thiểu' },
    status: { visible: true, label: 'Trạng thái' }
  });

  const filteredData = storageData.filter((item) => 
    (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (categoryMap[item.category] && categoryMap[item.category].toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.supplierData?.name && item.supplierData.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.unit && item.unit.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  useEffect(() => {
    const fetchStorageData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/storages/getStorage');
        setStorageData(response.data);
      } catch (error) {
        console.error('Error fetching storage data:', error);
      }
    };

    fetchStorageData();
  }, []);

  const handlePageChange = (page) => {setCurrentPage(page);};
  const toggleExpand = (id) => {setExpandedRow(expandedRow === id ? null : id);};
  const handleColumnToggle = (column) => {setColumns((prevColumns) => ({...prevColumns,[column]: {...prevColumns[column], visible: !prevColumns[column].visible,},}));};

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: [
          "Tên Sản Phẩm",
          "Danh mục",
          "Nhà Cung Cấp",
          "Đơn vị Tính",
          "Số lượng hiện tại",
          "Giá nhập",
          "Ngày nhập kho",
          "Ngày hết hạn",
          "Số lượng tối thiểu",
          "Ghi chú",
        ],
        range: 1,
      });
      setExcelData(jsonData);
    };

    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const row of excelData) {
        const supplierName = row["Nhà Cung Cấp"];
        const supplierExists = Array.isArray(storageData.supplierData) && storageData.supplierData.some(supplier => supplier.name === supplierName);

        const categoryString = row["Danh mục"];
        const categoryValue = categoryMap[categoryString] || 0;

        const formattedData = {
          name: row["Tên Sản Phẩm"],
          category: categoryValue,
          currentQuantity: row["Số lượng hiện tại"],
          minQuantity: row["Số lượng tối thiểu"],
          price: row["Giá nhập"],
          supplier: supplierExists ? supplierName : "Không tồn tại",
          unit: row["Đơn vị Tính"],
          importDate: formatDateVer1(row["Ngày nhập kho"]),
          expiryDate: formatDateVer1(row["Ngày hết hạn"]),
          notes: supplierExists
            ? row["Ghi chú"]
            : (row["Ghi chú"] + ', ' || '') + `Nhà cung cấp "${supplierName}" không tồn tại trong hệ thống`,
        };

        const response = await axios.post('http://localhost:5000/storages/addStorage', formattedData);
      }
      toast.success('Tất cả mục đã được thêm thành công!');
      handleExcelModalClose();
    } catch (error) {
      console.error('Error adding storage:', error.response ? error.response.data : error.message);
      toast.error('Lỗi khi thêm kho hàng. Vui lòng thử lại.');
    }
  };

  const handleExcelModalClose = () => {
    setExcelData([]);
    setExcelModal(false);
  };

  const handleDeleteRow = (index) => {
    const newData = [...excelData];
    newData.splice(index, 1);
    setExcelData(newData);
  };

  const handleNew = () => {navigate('/admin/kho-hang/them-moi');};

  const handleEditStorage = (item) => {
    dispatch(setData(item));
    navigate(`/admin/kho-hang/cap-nhat/${item.id}`);
  };

  const handleUpdateStorageStatus = async (id, name, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await axios.put(`http://localhost:5000/storages/updateStorageStatus/${id}`, { status: newStatus });

      if (response.status === 200) {
        toast.success(`Trạng thái của vật tư ${name} đã được ${newStatus ? 'Khôi phục' : 'Tạm ngưng'}`);

        setStorageData((prevStorage) =>
          prevStorage.map((storage) =>
            storage.id === id ? { ...storage, status: newStatus } : storage
          )
        );
      } else {
        toast.error(`Không thể cập nhật trạng thái kho hàng: ${response.statusText}`);
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi khi cập nhật trạng thái kho hàng. Vui lòng thử lại.');
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

  const renderModalShowCol = () => {
    return (
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <h5>Hiển thị/Ẩn các cột</h5>
        </CModalHeader>
        <CModalBody>
          {Object.keys(columns).map((column) => (
            <CFormCheck
              key={column}
              id={column}
              label={columns[column].label}
              checked={columns[column].visible}
              onChange={() => handleColumnToggle(column)}
            />
          ))}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>Đóng</CButton>
        </CModalFooter>
      </CModal>
    );
  }

  const renderExcelModal = () => {
    return (
      <CModal visible={excelModal} onClose={handleExcelModalClose} fullscreen>
        <CModalHeader>Upload Excel File</CModalHeader>
        <CModalBody>
          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
          {excelData.length > 0 && (
            <div className="table-container mt-4">
              <CTable responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Tên Sản Phẩm</CTableHeaderCell>
                    <CTableHeaderCell>Danh mục</CTableHeaderCell>
                    <CTableHeaderCell>Nhà Cung Cấp</CTableHeaderCell>
                    <CTableHeaderCell>Đơn vị Tính</CTableHeaderCell>
                    <CTableHeaderCell>Số lượng hiện tại</CTableHeaderCell>
                    <CTableHeaderCell>Giá nhập</CTableHeaderCell>
                    <CTableHeaderCell>Ngày nhập kho</CTableHeaderCell>
                    <CTableHeaderCell>Ngày hết hạn</CTableHeaderCell>
                    <CTableHeaderCell>Số lượng tối thiểu</CTableHeaderCell>
                    <CTableHeaderCell>Ghi chú</CTableHeaderCell>
                    <CTableHeaderCell></CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {excelData.map((row, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{row["Tên Sản Phẩm"]}</CTableDataCell>
                      <CTableDataCell>{row["Danh mục"]}</CTableDataCell>
                      <CTableDataCell>{row["Nhà Cung Cấp"]}</CTableDataCell>
                      <CTableDataCell>{row["Đơn vị Tính"]}</CTableDataCell>
                      <CTableDataCell>{row["Số lượng hiện tại"]}</CTableDataCell>
                      <CTableDataCell>{row["Giá nhập"]}</CTableDataCell>
                      <CTableDataCell>{row["Ngày nhập kho"]}</CTableDataCell>
                      <CTableDataCell>{row["Ngày hết hạn"]}</CTableDataCell>
                      <CTableDataCell>{row["Số lượng tối thiểu"]}</CTableDataCell>
                      <CTableDataCell>{row["Ghi chú"]}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="danger" variant="outline" onClick={() => handleDeleteRow(index)}>
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleSubmit}>
            Xác nhận
          </CButton>
          <CButton color="secondary" onClick={handleExcelModalClose}>
            Đóng
          </CButton>
        </CModalFooter>
      </CModal>
    )
  }

  return (
    <CContainer>
      <CCard>
        <CCardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
          <div className="mb-3 mb-md-0">Danh sách kho hàng</div>
          <div className="d-flex">
            <CButton color="primary" onClick={() => setExcelModal(true)} style={{ marginRight: 15 }}>
              Thêm mới từ Excel
            </CButton>
            <CButton color="success" onClick={handleNew}>
              Thêm mới
            </CButton>
          </div>
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
            <div className="col-md-8 mb-2">
              <CInputGroup>
                <CFormInput
                  type="text"
                  placeholder="Tìm kiếm theo tên sản phẩm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CInputGroup>
            </div>
            <div className="col-md-2 mb-2">
              <CButton
                color="info"
                onClick={() => setModalVisible(true)}>
                Hiển thị/Ẩn các cột
              </CButton>
            </div>
          </div>

          <CTable hover responsive="sm" bordered>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                {columns.name.visible && (<CTableHeaderCell>Tên Sản Phẩm</CTableHeaderCell>)}
                {columns.category.visible && (<CTableHeaderCell>Danh mục</CTableHeaderCell>)}
                {columns.supplier.visible && (<CTableHeaderCell>Nhà Cung Cấp</CTableHeaderCell>)}
                {columns.unit.visible && (<CTableHeaderCell>Đơn vị Tính</CTableHeaderCell>)}
                {columns.quantity.visible && (<CTableHeaderCell>Số lượng hiện tại</CTableHeaderCell>)}
                {columns.purchasePrice.visible && (<CTableHeaderCell>Giá nhập</CTableHeaderCell>)}
                {columns.importDate.visible && (<CTableHeaderCell>Ngày nhập kho</CTableHeaderCell>)}
                {columns.expiryDate.visible && (<CTableHeaderCell>Ngày hết hạn</CTableHeaderCell>)}
                {columns.minQuantity.visible && (<CTableHeaderCell>Số lượng tối thiểu</CTableHeaderCell>)}
                {columns.status.visible && (<CTableHeaderCell>Trạng thái</CTableHeaderCell>)}
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {paginatedData.map((item, index) => (
                <React.Fragment key={item.id}>
                  <CTableRow onClick={() => toggleExpand(item.id)}>
                    <CTableDataCell>{index + 1}</CTableDataCell>
                    {columns.name.visible && <CTableDataCell>{item.name}</CTableDataCell>}
                    {columns.category.visible && <CTableDataCell>{categoryMap[item.category]}</CTableDataCell>}
                    {columns.supplier.visible && <CTableDataCell>{item.supplierData?.name || 'N/A'}</CTableDataCell>}
                    {columns.unit.visible && <CTableDataCell>{item.unit}</CTableDataCell>}
                    {columns.quantity.visible && <CTableDataCell>{item.currentQuantity}</CTableDataCell>}
                    {columns.purchasePrice.visible && <CTableDataCell>{formatToVND(item.price)}</CTableDataCell>}
                    {columns.importDate.visible && <CTableDataCell>{formatDate(item.importDate)}</CTableDataCell>}
                    {columns.expiryDate.visible && <CTableDataCell>{formatDate(item.expiryDate)}</CTableDataCell>}
                    {columns.minQuantity.visible && <CTableDataCell>{item.minQuantity}</CTableDataCell>}
                    {columns.status.visible && <CTableDataCell>{item.status ? 'Còn sử dụng' : 'Hết sử dụng'}</CTableDataCell>}
                  </CTableRow>
                  <CTableRow>
                    <CTableDataCell colSpan={Object.keys(columns).length} className="p-0">
                      <CCollapse visible={expandedRow === item.id}>
                        <CCard>
                          <CCardHeader>
                            <h6>Thông tin thêm của {item.name}:</h6>
                          </CCardHeader>
                          <CCardBody>
                            <p>Loại hàng: {categoryMap[item.category]}</p>
                            <p>Nhà cung cấp: {item.supplierData?.name || 'Không tồn tại trong hệ thống'}</p>
                            <p>Đơn vị tính: {item.unit}</p>
                            <p>Giá nhập: {formatToVND(item.price)}</p>
                            <p>Số lượng hiện tại: {item.currentQuantity}</p>
                            <p>Ngày nhập: {formatDate(item.importDate)}</p>
                            <p>Ngày hết hạn: {formatDate(item.expiryDate)}</p>
                            <p>Số lượng tối thiểu: {item.minQuantity}</p>
                            <p>Trạng thái: {item.status ? 'Còn sử dụng' : 'Hết sử dụng'}</p>
                            <p>Ghi chú: {item.notes}</p>
                          </CCardBody>
                          <CCardFooter>
                            <CButton color="warning" onClick={() => handleEditStorage(item)}>Sửa</CButton>{' '}
                            <CButton
                              color={item.status ? "danger" : "success"}
                              className="me-2"
                              onClick={() => handleUpdateStorageStatus(item.id, item.name , item.status)}>
                              {item.status ? "Xóa" : "Khôi phục"}
                            </CButton>
                          </CCardFooter>
                        </CCard>
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
      {renderModalShowCol()}
      {renderExcelModal()}
      <ToastContainer />
    </CContainer>
  );
}