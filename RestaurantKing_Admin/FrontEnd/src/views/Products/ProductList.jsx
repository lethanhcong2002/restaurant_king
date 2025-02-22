import React, { useState, useEffect } from 'react';
import {
  CTable,
  CTableBody,
  CTableHeaderCell,
  CTableHead,
  CTableRow,
  CTableDataCell,
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CCollapse,
  CTabs,
  CTabList,
  CTab,
  CTabContent,
  CTabPanel,
  CPagination,
  CPaginationItem,
  CRow,
  CCol,
  CListGroup,
  CListGroupItem,
  CFormSelect,
  CFormSwitch,
} from '@coreui/react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import formatToVND from '../../code/convertPrice';
import { formatDateTime } from '../../code/convertDate';
import { useDispatch } from 'react-redux';
import { setData } from '../../action';
import { getCategoryProduct } from '../../code/getData';
import { toast, ToastContainer } from 'react-toastify';
import '../../css/custom_switch.css';

export default function ProductList() {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getProductNameById = (id) => {
    if (!products || products.length === 0) {
      return 'Danh sách sản phẩm trống';
    }

    const product = products.find(item => item.id === id);
    return product ? product.name : 'Tên không tìm thấy';
  }
  const handleAddProductClick = () => {
    navigate("/admin/san-pham/them-moi");
  };

  const handleUpdateProduct = (item) => {
    dispatch(setData(item));
    navigate(`/admin/san-pham/cap-nhat/${item.id}`)
  }
  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/products/getProducts');
      setProducts(res.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpdateProductStatus = async (productId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await axios.put(`http://localhost:5000/products/changeProductStatus/${productId}`, {
        status: newStatus,
      });

      if (response.status === 200) {
        toast.success(newStatus ? 'Sản phẩm đã được khôi phục thành công.' : 'Sản phẩm đã tạm ngưng thành công.');

        setProducts(prevProducts => {
          return prevProducts.map(product =>
            product.id === productId ? { ...product, status: newStatus } : product
          );
        });

        console.log(`Trạng thái sản phẩm ${productId} đã được cập nhật thành ${newStatus ? 'Tạm ngưng' : 'Khôi phục'}`);
      } else {
        toast.error(`Không thể cập nhật trạng thái sản phẩm: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái sản phẩm:', error);
      toast.error('Đã xảy ra lỗi trong khi cập nhật trạng thái sản phẩm. Vui lòng thử lại.');
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
    <>
      <CCard>
        <CCardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
          <div className="mb-3 mb-md-0">Danh sách sản phẩm</div>
          <CButton color="primary" onClick={handleAddProductClick}>Thêm mới sản phẩm</CButton>
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
            <>
              <CTable hover bordered responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Tên sản phẩm</CTableHeaderCell>
                    <CTableHeaderCell>Danh mục món</CTableHeaderCell>
                    <CTableHeaderCell>Giá vốn</CTableHeaderCell>
                    <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentItems.map((product, index) => (
                    <React.Fragment key={index}>
                      <CTableRow
                        onClick={(e) => {
                          if (!e.target.closest('.custom-switch')) {
                            toggleExpand(index);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{product.name}</CTableDataCell>
                        <CTableDataCell>{getCategoryProduct(product.category)}</CTableDataCell>
                        <CTableDataCell>{formatToVND(product.price)}</CTableDataCell>
                        <CTableDataCell>
                          <CFormSwitch
                            className="custom-switch"
                            label={product.status ? 'Còn cung cấp' : 'Ngừng cung cấp'}
                            id={product.id}
                            checked={product.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleUpdateProductStatus(product.id, product.status);
                            }}
                          />
                        </CTableDataCell>
                      </CTableRow>
                      <CTableRow>
                        <CTableDataCell colSpan="6" className="p-0">
                          <CCollapse visible={expandedIndex === index}>
                            <CCardBody>
                              <CTabs activeItemKey="detail">
                                <CTabList variant="tabs">
                                  <CTab itemKey="detail">Chi tiết</CTab>
                                  <CTab itemKey="ingredient">Thành phần</CTab>
                                </CTabList>
                                <CTabContent>
                                  <CTabPanel className="p-3" itemKey="detail">
                                    <CRow>
                                      <CCol>
                                        <h5>Thông tin sản phẩm</h5>
                                        <p><strong>Tên:</strong> {product.name}</p>
                                        <p><strong>Giá bán:</strong> {formatToVND(product.price)}</p>
                                        <p><strong>Danh mục món:</strong> {getCategoryProduct(product.category)}</p>
                                        <p><strong>Loại:</strong> {product.type ? "Combo" : "Đơn"}</p>
                                        <p><strong>Đơn vị:</strong> {product.unit}</p>
                                        <p><strong>Ngày thêm:</strong> {formatDateTime(product.createdAt)}</p>
                                      </CCol>
                                    </CRow>
                                    {product.type === true && product.selectedProduct.length > 0 && (
                                      <CRow>
                                        <CCol>
                                          <h5>Danh sách sản phẩm con</h5>
                                          <CListGroup>
                                            {product.selectedProduct.map((childProduct, index) => (
                                              <CListGroupItem key={index}>
                                                {getProductNameById(childProduct.itemId)} - Số lượng: {childProduct.quantity}
                                              </CListGroupItem>
                                            ))}
                                          </CListGroup>
                                        </CCol>
                                      </CRow>
                                    )}
                                    <CRow>
                                      <CCol>
                                        <h5>Hình ảnh sản phẩm</h5>
                                        {product.imageUrls && product.imageUrls.length > 0 ? (
                                          product.imageUrls.map((url, idx) => (
                                            <img
                                              key={idx}
                                              src={url}
                                              alt={`Product Image ${idx + 1}`}
                                              style={{ width: '100px', height: '100px', marginRight: '10px' }} />
                                          ))
                                        ) : (
                                          <span>Không có hình ảnh</span>
                                        )}
                                      </CCol>
                                    </CRow>
                                  </CTabPanel>

                                  <CTabPanel className="p-3" itemKey="ingredient">
                                    <CTable striped hover responsive>
                                      <CTableHead>
                                        <CTableRow>
                                          <CTableHeaderCell>Tên thành phần</CTableHeaderCell>
                                          <CTableHeaderCell>Số lượng</CTableHeaderCell>
                                          <CTableHeaderCell>ĐVT</CTableHeaderCell>
                                        </CTableRow>
                                      </CTableHead>
                                      <CTableBody>
                                        {product.components.map((component, index) => (
                                          <CTableRow key={index}>
                                            <CTableDataCell>{component.name}</CTableDataCell>
                                            <CTableDataCell>{component.quantity}</CTableDataCell>
                                            <CTableDataCell>{component.unit}</CTableDataCell>
                                          </CTableRow>
                                        ))}
                                      </CTableBody>
                                    </CTable>
                                  </CTabPanel>
                                </CTabContent>
                              </CTabs>
                              <div className="d-flex justify-content-end mt-2">
                                <CButton color="primary" className="me-2" onClick={() => handleUpdateProduct(product)}>
                                  Sửa
                                </CButton>
                              </div>
                            </CCardBody>
                          </CCollapse>
                        </CTableDataCell>
                      </CTableRow>
                    </React.Fragment>
                  ))}
                </CTableBody>
              </CTable>
              {renderPagination()}
            </>
          )}
        </CCardBody>
      </CCard>
      <ToastContainer />
    </>
  );
}
