/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { CTable, CTableBody, CTableHeaderCell, CTableHead, CTableRow, CTableDataCell, CCard, CCardBody, CCardHeader, CButton, CPagination, CPaginationItem, CCollapse, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CRow, CCol, CFormInput, CFormCheck, CFormSelect } from '@coreui/react';
import axios from 'axios';
import { calculateTotalAmount } from '../../code/caculatorPrice';
import formatToVND from '../../code/convertPrice';
import { formatDateTime } from '../../code/convertDate';
import { getChangeSI, getStatusInvoice } from '../../code/getData';
import { toast, ToastContainer } from 'react-toastify';

const InvoiceRow = ({ invoice, index, toggleExpand, expandedIndex, handlePaymentClick, handleAcceptedInvoice, handleCancelInvoice, tableName }) => {
  return (
    <>
      <CTableRow style={{ cursor: 'pointer' }} onClick={() => toggleExpand(index)}>
        <CTableDataCell>{invoice.code}</CTableDataCell>
        <CTableDataCell>{tableName === 'N/A' ? 'chưa nhận bàn' : tableName || 'chưa nhận bàn'}</CTableDataCell>
        <CTableDataCell>{formatToVND(calculateTotalAmount(invoice.selectedItems))}</CTableDataCell>
        <CTableDataCell>{formatDateTime(invoice.createdAt)}</CTableDataCell>
        <CTableDataCell>{getStatusInvoice(invoice.status)}</CTableDataCell>
        <CTableDataCell>
          {invoice.status === 0 ? (
            <CButton color="success" className="me-2" onClick={(e) => handlePaymentClick(e, invoice, tableName)}>
              Thanh toán
            </CButton>
          ) : invoice.status === 3 ? (
            <>
              <CButton color="primary" className="me-2" onClick={() => handleAcceptedInvoice(invoice)}>Xác nhận</CButton> {' '}
              <CButton color="primary" className="me-2" onClick={() => handleCancelInvoice(invoice)}>Từ chối</CButton>
            </>
          ) : null}
        </CTableDataCell>
      </CTableRow>
      <CTableRow>
        <CTableDataCell colSpan="6" className="p-0">
          <CCollapse visible={expandedIndex === index}>
            <div className="p-3">
              <strong>Thông tin khách hàng:</strong>
              <div><strong>Mã hóa đơn:</strong> {invoice.code}</div>
              <div><strong>Bàn:</strong> {tableName}</div>
              <div><strong>Khách hàng:</strong> {invoice.customerName}</div>
              <div><strong>Email:</strong> {invoice.customerEmail}</div>
              <div><strong>SĐT:</strong> {invoice.customerPhone}</div>
              {invoice.appointmentTime && (
                <div><strong>Thời gian nhận bàn:</strong> {formatDateTime(invoice.appointmentTime)}</div>
              )}
              <hr />
              <strong>Danh sách món:</strong>
              <CTable hover striped responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Tên món</CTableHeaderCell>
                    <CTableHeaderCell>Số lượng</CTableHeaderCell>
                    <CTableHeaderCell>Đơn giá</CTableHeaderCell>
                    <CTableHeaderCell>Biến động</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {invoice.selectedItems.map((item, itemIndex) => (
                    <CTableRow key={itemIndex}>
                      <CTableDataCell>{item.name}</CTableDataCell>
                      <CTableDataCell>{item.quantity}</CTableDataCell>
                      <CTableDataCell>{formatToVND(item.price)}</CTableDataCell>
                      <CTableDataCell>{getChangeSI(item.change)}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          </CCollapse>
        </CTableDataCell>
      </CTableRow>
    </>
  );
};

const InvoiceList = () => {
  const [tableName, setTableName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [tables, setTables] = useState([]);
  const [invoicesData, setInvoicesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const resetForm = () => {
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setSelectedTable('');
    setSearchQuery('');
    const updatedItems = availableItems.map(item => ({
      ...item,
      quantity: 1,
      isSelected: false,
    }));
    setAvailableItems(updatedItems);
  };

  useEffect(() => {
    fetchInvoices();
    fetchTables();
    fetchProducts();
  }, []);

  useEffect(() => {
    setFilteredData(invoicesData);
  }, [invoicesData]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/products/getProducts');
      const fetchedProducts = res.data.products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        isSelected: false,
      }));
      setAvailableItems(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error.message || error);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await axios.get('http://localhost:5000/tables/getTable');
      const fetchedTables = res.data || [];
      setTables(fetchedTables);
    } catch (error) {
      console.error('Error fetching products:', error.message || error);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await axios.get('http://localhost:5000/invoices/getInvoices');
      setInvoicesData(res.data);
    } catch (error) {
      console.error('Error fetching invoices:', error.message || error);
    }
  };

  const handleAcceptedInvoice = async (invoice) => {
    await setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const handleCancelInvoice = async (invoice) => {
    handleConfirmCancel(invoice);
  }

  const handleAddInvoiceClick = () => {
    setModalVisible(true);
  };

  const handlePaymentClick = (event, invoice, tableName) => {
    event.stopPropagation();
    setTableName(tableName);
    setSelectedInvoice(invoice);
    setPaymentModalVisible(true);
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleQuantityChange = (id, quantity) => {
    const updatedItems = availableItems.map((item) =>
      item.id === id ? { ...item, quantity: parseInt(quantity) || 1 } : item
    );
    setAvailableItems(updatedItems);
  };

  const handleItemSelect = (id) => {
    const updatedItems = availableItems.map((item) =>
      item.id === id ? { ...item, isSelected: !item.isSelected } : item
    );
    setAvailableItems(updatedItems);
  };

  const handleAddItems = async () => {
    const selected = availableItems.filter(item => item.isSelected);
    const data = {
      customerName,
      customerEmail,
      customerPhone,
      selectedTable,
      selectedItems: selected.map((item) => ({
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        isSelected: item.isSelected,
        change: 'added',
      })),
    };

    try {
      const response = await axios.post('http://localhost:5000/invoices/addInvoice', data);

      if (response.status === 200) {
        toast.success('Hóa đơn được tạo thành công!');
        resetForm();
      } else {
        toast.error('Tạo hóa đơn thất bại: ' + response.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tạo hóa đơn: ' + (error.message || error));
    } finally {
      fetchTables();
      fetchInvoices();
      setModalVisible(false);
    }
  };

  const processPayment = async (tableName, status, tableId, invoice) => {
    try {
      const response = await axios.put(`http://localhost:5000/invoices/payment/${invoice.id}`, { status, tableId, tableName, invoice});

      if (response.status === 200) {
        toast.success('Thanh toán thành công!');
      } else {
        toast.error('Cập nhật trạng thái hóa đơn thất bại.');
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi khi cập nhật trạng thái hóa đơn và bàn: ' + (error.response?.data?.message || error.message));
    } finally {
      fetchTables();
      fetchInvoices();
      setPaymentModalVisible(false);
    }
  };

  const handlePrintInvoice = (invoice, nameT) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    const formattedDate = new Date().toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const formattedDateWithWords = formattedDate.replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/, 'Ngày $1 tháng $2 năm $3');
    printWindow.document.write(`
    <html>
      <head>
        <title>Restaurant King</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            margin-bottom: 50px;
          }
          h1, h2 {
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
            padding: 10px;
            text-align: left;
          }
          th {
            background-color: #f3f4f7;
          }
          .total {
            font-weight: bold;
          }
          footer {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            font-size: 14px;
          }
          footer .left,
          footer .center,
          footer .right {
            width: 33.33%;
          }
          footer .right {
            text-align: right;
            padding-right: 10px;
          }
          footer p {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>Restaurant King</h1>
          <p><strong>Mã hóa đơn:</strong> ${invoice?.code}</p>
          <p><strong>Tên khách hàng:</strong> ${invoice?.customerName}</p>
          <p><strong>Email:</strong> ${invoice?.customerEmail}</p>
          <p><strong>Số điện thoại:</strong> ${invoice?.customerPhone}</p>
          <p><strong>Bàn số:</strong> ${nameT}</p>
        </header>
        <h2>Danh sách món ăn</h2>
        <table>
          <thead>
            <tr>
              <th>Tên món</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${invoice?.selectedItems.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatToVND(item.price)}</td>
                <td>${formatToVND(item.quantity * item.price)}</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="3" style="text-align: right;"><strong>Tổng tiền:</strong></td>
              <td><strong>${formatToVND(calculateTotalAmount(invoice?.selectedItems))}</strong></td>
            </tr>
          </tbody>
        </table>
        <footer>
          <div class="left"></div>
          <div class="center"></div>
          <div class="right">
            <p>${formattedDateWithWords}</p>
            <p><strong>Trân trọng,</strong></p>
            <p><strong>Restaurant King</strong></p>
          </div>
        </footer>
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleConfirmAccepted = async (data) => {
    const notification = {
      title: 'Thông báo xác nhận đặt bàn',
      body: 'Nhà hàng đã chấp nhận yêu cầu của bạn, vui lòng đến theo đúng ngày đã hẹn',
      notificationData: {
        customerName: data.customerName,
        code: data.code,
        appointmentDate: data.appointmentTime,
        type: 'accepted',
        createdAt: new Date()
      },
    };

    try {
      const updateResponse = await axios.put(`http://localhost:5000/invoices/invoice/${data.id}`, { status: 1, tableId: 'ko có' });

      if (updateResponse.status === 200) {
        toast.success('Cập nhật trạng thái hóa đơn thành công!');

        const notificationResponse = await axios.post(`http://localhost:5000/notifications/send-notification-to/${data.customerId}`, {
          title: notification.title,
          body: notification.body,
          notificationData: notification.notificationData
        });

        if (notificationResponse.status === 200) {
          toast.success('Thông báo đã được gửi tới khách hàng!');
        }
      } else {
        toast.error('Cập nhật trạng thái hóa đơn thất bại.');
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      fetchInvoices();
      setShowModal(false);
    }
  };

  const handleConfirmCancel = async (data) => {
    const notification = {
      title: 'Thông báo từ chối đặt bàn',
      body: 'Nhà hàng xin phép từ chối yêu cầu của bạn',
      notificationData: {
        customerName: data.customerName,
        code: data.code,
        type: 'cancelled',
      },
    };

    try {
      const updateResponse = await axios.put(`http://localhost:5000/invoices/invoice/${data.id}`, { status: 4, tableId: 'ko có' });

      if (updateResponse.status === 200) {
        toast.success("Cập nhật trạng thái hóa đơn thành công!");

        const response = await axios.post(`http://localhost:5000/notifications/send-notification-to/${data.customerId}`, {
          title: notification.title,
          body: notification.body,
          notificationData: notification.notificationData,
        });

        if (response.status === 200) {
          toast.success("Thông báo đã được gửi tới khách hàng!");
        }
      } else {
        toast.error("Cập nhật trạng thái hóa đơn thất bại.");
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái hoặc gửi thông báo: ' + (error.response?.data?.message || error.message));
    } finally {
      fetchInvoices();
    }
  };

  const handleDateSubmit = () => {
    if (startDate && endDate) {
      const filtered = invoicesData.filter(item => {
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
    setFilteredData(invoicesData);
    setCurrentPage(1);
  };

  const getTableName = (tableId) => {
    const tableName = tables.find(table => table.id === tableId)?.tableName || 'N/A';
    return tableName;
  }

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
          <div className="mb-3 mb-md-0">Danh sách hóa đơn</div>
          <CButton color="primary" onClick={handleAddInvoiceClick}>
            Thêm mới hóa đơn
          </CButton>
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
          <CTable bordered hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Mã hóa đơn</CTableHeaderCell>
                <CTableHeaderCell>Bàn</CTableHeaderCell>
                <CTableHeaderCell>Tổng tiền</CTableHeaderCell>
                <CTableHeaderCell>Ngày</CTableHeaderCell>
                <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                <CTableHeaderCell>Thao tác</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {currentItems.map((invoice, index) => (
                <InvoiceRow
                  key={index}
                  invoice={invoice}
                  index={index}
                  toggleExpand={toggleExpand}
                  expandedIndex={expandedIndex}
                  handlePaymentClick={handlePaymentClick}
                  handleAcceptedInvoice={handleAcceptedInvoice}
                  handleCancelInvoice={handleCancelInvoice}
                  tableName={getTableName(invoice.selectedTable)}
                />
              ))}
            </CTableBody>
          </CTable>
          {renderPagination()}
        </CCardBody>
      </CCard>

      <CModal alignment="center" fullscreen visible={modalVisible} onClose={() => { setModalVisible(false); resetForm() }}>
        <CModalHeader>
          <CModalTitle>Tạo hóa đơn mới</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                type="text"
                id="customerName"
                label="Tên khách hàng"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                type="text"
                id="customerPhone"
                label="Số điện thoại khách hàng"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                type="email"
                id="customerEmail"
                label="Email khách hàng"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormSelect
                id="selectedTable"
                label="Chọn bàn"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
              >
                <option value="">Chọn bàn</option>
                {tables.filter((table) => table.status === false).map((table) => (
                  <option key={table.id} value={table.id}>{table.tableName}</option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                type="text"
                id="searchItems"
                label="Tìm món ăn"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </CCol>
          </CRow>

          <CTable hover responsive style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Chọn</CTableHeaderCell>
                <CTableHeaderCell>Tên món</CTableHeaderCell>
                <CTableHeaderCell>Giá</CTableHeaderCell>
                <CTableHeaderCell>Số lượng</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {availableItems
                .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                  <CTableRow key={item.id}>
                    <CTableDataCell>
                      <CFormCheck
                        id={item.id}
                        checked={item.isSelected}
                        onChange={() => handleItemSelect(item.id)}
                      />
                    </CTableDataCell>
                    <CTableDataCell>{item.name}</CTableDataCell>
                    <CTableDataCell>{formatToVND(item.price)}</CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      />
                    </CTableDataCell>
                  </CTableRow>
                ))}
            </CTableBody>
          </CTable>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => {
            setModalVisible(false);
            resetForm()
          }}>
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleAddItems}>
            Thêm hóa đơn
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal alignment="center" size="lg" visible={paymentModalVisible} onClose={() => setPaymentModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Thanh toán</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol>
              <p><strong>Mã hóa đơn:</strong> {selectedInvoice?.code}</p>
              <p><strong>Tên khách hàng:</strong> {selectedInvoice?.customerName}</p>
              <p><strong>Email:</strong> {selectedInvoice?.customerEmail}</p>
              <p><strong>Số điện thoại:</strong> {selectedInvoice?.customerPhone}</p>
              <p><strong>Bàn:</strong> {tableName}</p>
              <CTable hover striped responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Tên món</CTableHeaderCell>
                    <CTableHeaderCell>Số lượng</CTableHeaderCell>
                    <CTableHeaderCell>Đơn giá</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {selectedInvoice?.selectedItems.map((item, itemIndex) => (
                    <CTableRow key={itemIndex}>
                      <CTableDataCell>{item.name}</CTableDataCell>
                      <CTableDataCell>{item.quantity}</CTableDataCell>
                      <CTableDataCell>{formatToVND(item.price)}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              <p><strong>Tổng tiền:</strong> {formatToVND(calculateTotalAmount(selectedInvoice?.selectedItems))}</p>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setPaymentModalVisible(false)}>Hủy</CButton>
          <CButton color="primary" onClick={() => {
            processPayment(tableName, 2, selectedInvoice?.selectedTable, selectedInvoice);
            handlePrintInvoice(selectedInvoice, tableName);
          }}> Xác nhận thanh toán</CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>Xác nhận hóa đơn</CModalTitle>
        </CModalHeader>
        <CModalBody>Bạn có chắc chắn muốn xác nhận yêu cầu đặt bàn này không?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>Hủy</CButton>
          <CButton color="primary" onClick={() => handleConfirmAccepted(selectedInvoice)}>Xác nhận</CButton>
        </CModalFooter>
      </CModal>
      <ToastContainer />
    </>
  );
};

export default InvoiceList;
