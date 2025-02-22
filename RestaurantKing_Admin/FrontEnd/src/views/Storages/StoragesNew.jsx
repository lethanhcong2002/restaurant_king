import { useState, useEffect } from 'react';
import {
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CModal,
  CModalBody,
  CModalHeader,
  CModalFooter,
  CModalTitle,
} from '@coreui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { formatDateVer1 } from '../../code/convertDate';

const StoragesNew = () => {
  const [storageData, setStorageData] = useState({
    category: '',
    currentQuantity: '',
    expiryDate: '',
    importDate: '',
    minQuantity: '',
    name: '',
    notes: '',
    price: '',
    supplier: '',
    unit: '',
  });

  const [visible, setVisible] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/suppliers/getSuppliers');
        setSuppliers(response.data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStorageData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedData = {
      ...storageData,
      importDate: formatDateVer1(storageData.importDate),
      expiryDate: formatDateVer1(storageData.expiryDate),
    };

    try {
      const response = await axios.post('http://localhost:5000/storages/addStorage', formattedData);
      alert(response.data.message);
      navigate(-1);
    } catch (error) {
      console.error('Error adding storage:', error);
      alert('Error adding storage');
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
      const response = await axios.post('http://localhost:5000/suppliers/addSupplier', newSupplier);
      if (response.status === 200) {
        setSuppliers((prevSuppliers) => [...prevSuppliers, { ...newSupplier, id: response.data.supplierId }]);
      }
      setVisible(false);
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Error saving supplier');
    }
  };

  return (
    <CCard>
      <CCardHeader>Thêm mới Kho hàng</CCardHeader>
      <CCardBody>
        <CForm onSubmit={handleSubmit}>
          <div className="mb-3">
            <CFormLabel htmlFor="name">Tên Sản Phẩm</CFormLabel>
            <CFormInput
              type="text"
              id="name"
              name="name"
              value={storageData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="category">Danh mục</CFormLabel>
            <CFormSelect
              id="category"
              name="category"
              value={storageData.category}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Chọn danh mục</option>
              <option value="1">Nguyên liệu - Thực phẩm - Gia vị</option>
              <option value="2">Đồ uống</option>
              <option value="3">Thiết bị</option>
              <option value="4">Vật dụng vệ sinh</option>
            </CFormSelect>
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="supplier">Nhà Cung Cấp</CFormLabel>
            <CButton color="link" className="ml-2" onClick={() => setVisible(true)}>
              Thêm Nhà Cung Cấp
            </CButton>
            <CFormSelect
              id="supplier"
              name="supplier"
              value={storageData.supplier}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Chọn nhà cung cấp</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </CFormSelect>
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="unit">Đơn vị Tính</CFormLabel>
            <CFormInput
              type="text"
              id="unit"
              name="unit"
              value={storageData.unit}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="currentQuantity">Số lượng hiện tại</CFormLabel>
            <CFormInput
              type="number"
              id="currentQuantity"
              name="currentQuantity"
              value={storageData.currentQuantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="price">Giá nhập</CFormLabel>
            <CFormInput
              type="number"
              id="price"
              name="price"
              value={storageData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="importDate">Ngày nhập kho</CFormLabel>
            <CFormInput
              type="date"
              id="importDate"
              name="importDate"
              value={storageData.importDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="expiryDate">Ngày hết hạn</CFormLabel>
            <CFormInput
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={storageData.expiryDate}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="minQuantity">Số lượng tối thiểu</CFormLabel>
            <CFormInput
              type="number"
              id="minQuantity"
              name="minQuantity"
              value={storageData.minQuantity}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <CFormLabel htmlFor="notes">Ghi chú</CFormLabel>
            <CFormInput
              type="text"
              id="notes"
              name="notes"
              value={storageData.notes}
              onChange={handleChange}
            />
          </div>
          <CButton type="submit" color="primary">Thêm mới</CButton>
        </CForm>

        <CModal visible={visible} onClose={() => setVisible(false)}>
          <CModalHeader>
            <CModalTitle>Thêm Nhà Cung Cấp</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <div className="mb-3">
              <CFormLabel htmlFor="supplierName">Tên Nhà Cung Cấp</CFormLabel>
              <CFormInput type="text" id="supplierName" name="supplierName" />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="supplierAddress">Địa chỉ</CFormLabel>
              <CFormInput type="text" id="supplierAddress" name="supplierAddress" />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="supplierPhone">Số điện thoại</CFormLabel>
              <CFormInput type="text" id="supplierPhone" name="supplierPhone" />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="supplierEmail">Email</CFormLabel>
              <CFormInput type="email" id="supplierEmail" name="supplierEmail" />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="supplierTaxCode">Mã số thuế</CFormLabel>
              <CFormInput type="text" id="supplierTaxCode" name="supplierTaxCode" />
            </div>
            <div className="mb-3">
              <CFormLabel htmlFor="supplierTimeRefund">Thời Gian Hoàn Trả</CFormLabel>
              <CFormInput
                type="number"
                id="supplierTimeRefund"
                placeholder="Nhập thời gian hoàn trả (ngày)" />
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setVisible(false)}>Hủy</CButton>
            <CButton color="primary" onClick={handleSaveSupplier}>Lưu</CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  );
};

export default StoragesNew;
