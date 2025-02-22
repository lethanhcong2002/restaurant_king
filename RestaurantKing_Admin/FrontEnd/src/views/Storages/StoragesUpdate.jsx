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
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { convertDateVer1, formatDateVer2 } from '../../code/convertDate';

const StoragesUpdate = () => {
  const { id } = useParams();
  const data = useSelector(state => state.data);
  console.log(data);
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
    if (id && data) {
      const storageItem = data;
      if (storageItem) {
        setStorageData({
          ...storageItem,
          originalImportDate: storageItem.importDate,
          originalExpiryDate: storageItem.expiryDate,
        });
      }
    }
    const fetchSuppliers = async () => {
      try {
        const suppliersRes = await axios.get('http://localhost:5000/suppliers/getSuppliers');
        setSuppliers(suppliersRes.data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    fetchSuppliers();
  }, [id, data]);

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
      importDate: storageData.importDate !== storageData.originalImportDate
        ? formatDateVer2(storageData.importDate)
        : storageData.importDate,
      expiryDate: storageData.expiryDate !== storageData.originalExpiryDate
        ? formatDateVer2(storageData.expiryDate)
        : storageData.expiryDate,

      category: Number(storageData.category),
      minQuantity: Number(storageData.minQuantity),
      currentQuantity: Number(storageData.currentQuantity),
      price: Number(storageData.price),
    };

    try {
      const response = await axios.put(`http://localhost:5000/storages/storage/${id}`, formattedData);
      alert(response.data.message);
      navigate(-1);
    } catch (error) {
      console.error('Error updating storage:', error);
      alert('Error updating storage');
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
      <CCardHeader>Cập nhật Kho hàng</CCardHeader>
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
              value={storageData.supplier === "Không tồn tại" ? '' : storageData.supplier}
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
              value={convertDateVer1(storageData.importDate)}
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
              value={convertDateVer1(storageData.expiryDate)}
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

          <CButton type="submit" color="primary">Cập nhật</CButton>
        </CForm>
      </CCardBody>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader closeButton>
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
              placeholder="Nhập thời gian hoàn trả (ngày)"/>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleSaveSupplier}>Lưu</CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default StoragesUpdate;
