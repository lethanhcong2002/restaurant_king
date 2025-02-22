import { useEffect, useState } from 'react';
import { CCard, CCardBody, CCardHeader, CFormInput, CButton, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CFormSelect, CFormTextarea, CSpinner } from '@coreui/react';
import axios from 'axios';
import formatToVND from '../../code/convertPrice';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ExportAdd = () => {
    const navigate = useNavigate();

    const user = useSelector((state) => state.user);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [productList, setProductList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const res = await axios.get('http://localhost:5000/storages/getStorage');
                if (res.status === 200) {
                    setProductList(res.data);
                }
            } catch (error) {
                console.error('Error fetching suppliers:', error.message || error);
            }
        };

        fetchSuppliers();
    }, []);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleAddProduct = (product) => {
        setSelectedProducts([...selectedProducts, {
            ...product,
            exportQuantity: '',
            exportReasonStatus: '',
            description: '',
            errors: {}
        }]);
    };

    const handleProductChange = (index, e) => {
        const updatedProducts = [...selectedProducts];
        const { name, value } = e.target;

        updatedProducts[index] = {
            ...updatedProducts[index],
            [name]: value
        };

        setSelectedProducts(updatedProducts);
    };

    const handleRemoveProduct = (index) => {
        const updatedProducts = selectedProducts.filter((_, i) => i !== index);
        setSelectedProducts(updatedProducts);
    };

    const filteredProducts = productList.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleConfirm = async () => {
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');
        let valid = true;
        let updatedProducts = [...selectedProducts];

        updatedProducts = updatedProducts.map((product) => {
            let errors = {};
            console.log(product);
            if (!product.exportQuantity || product.exportQuantity <= 0 || product.exportQuantity > product.currentQuantity) {
                errors.exportQuantity = 'Vui lòng nhập số lượng hợp lệ và không vượt quá tồn kho!';
                valid = false;
            }

            if (!product.exportReasonStatus) {
                errors.exportReasonStatus = 'Vui lòng chọn lý do & tình trạng!';
                valid = false;
            }

            return { ...product, errors };
        });

        setSelectedProducts(updatedProducts);

        if (valid) {
            const invoiceData = {
                selectedItems: updatedProducts.map((product) => ({
                    itemId: product.id,
                    name: product.name,
                    originalQuantity: product.currentQuantity,
                    exportQuantity: product.exportQuantity,
                    unit: product.unit,
                    exportReasonStatus: Number(product.exportReasonStatus),
                    description: product.description,
                })),
                userId: user.id,
                userName: user.name,
            };

            try {
                const response = await axios.post(
                    'http://localhost:5000/ieInvoices/addInvoiceExport',
                    invoiceData
                );
                setSuccessMessage('Xuất kho thành công!');
            } catch (error) {
                console.error('Error creating invoice:', error);
                setErrorMessage('Có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại.');
            } finally {
                navigate(-1);
                setLoading(false);
            }
        } else {
            setErrorMessage('Vui lòng nhập tất cả thông tin yêu cầu.');
            setLoading(false);
        }
    };

    return (
        <>
            <CCard>
                <CCardHeader>Danh sách sản phẩm trong kho</CCardHeader>
                <CCardBody>
                    <CFormInput
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <div style={{ maxHeight: '300px', overflowY: 'scroll' }}>
                        <CTable striped>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>Tên sản phẩm</CTableHeaderCell>
                                    <CTableHeaderCell style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>Số lượng tồn kho</CTableHeaderCell>
                                    <CTableHeaderCell style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>Đơn giá</CTableHeaderCell>
                                    <CTableHeaderCell style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>Thao tác</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {filteredProducts.map((product) => (
                                    <CTableRow key={product.id}>
                                        <CTableDataCell>{product.name}</CTableDataCell>
                                        <CTableDataCell>{product.currentQuantity}</CTableDataCell>
                                        <CTableDataCell>{formatToVND(product.price)}</CTableDataCell>
                                        <CTableDataCell>
                                            <CButton color="primary" onClick={() => handleAddProduct(product)}>
                                                Thêm
                                            </CButton>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                    </div>
                </CCardBody>
            </CCard>
            <CCard className="my-4">
                <CCardHeader>Thông tin xuất kho</CCardHeader>
                <CCardBody>
                    {errorMessage && <div className="text-danger mb-3">{errorMessage}</div>}
                    {successMessage && <div className="text-success mb-3">{successMessage}</div>}
                    <CTable striped>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>Tên sản phẩm</CTableHeaderCell>
                                <CTableHeaderCell style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>Số lượng xuất</CTableHeaderCell>
                                <CTableHeaderCell style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>Đơn vị tính</CTableHeaderCell>
                                <CTableHeaderCell style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>Lý do & Tình trạng</CTableHeaderCell>
                                <CTableHeaderCell style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>Mô tả</CTableHeaderCell>
                                <CTableHeaderCell style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>Thao tác</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {selectedProducts.map((product, index) => (
                                <CTableRow key={product.id}>
                                    <CTableDataCell>{product.name}</CTableDataCell>
                                    <CTableDataCell>
                                        <CFormInput
                                            type="number"
                                            name="exportQuantity"
                                            value={product.exportQuantity}
                                            onChange={(e) => handleProductChange(index, e)}
                                            placeholder="Nhập số lượng xuất"
                                            invalid={product.errors?.exportQuantity ? true : false}
                                        />
                                        {product.errors?.exportQuantity && <div className="text-danger">{product.errors.exportQuantity}</div>}
                                    </CTableDataCell>
                                    <CTableDataCell>{product.unit}</CTableDataCell>
                                    <CTableDataCell>
                                        <CFormSelect
                                            name="exportReasonStatus"
                                            value={product.exportReasonStatus}
                                            onChange={(e) => handleProductChange(index, e)}
                                            invalid={product.errors?.exportReasonStatus ? true : false}
                                        >
                                            <option value="">Chọn lý do & tình trạng</option>
                                            <option value="1">Nguyên liệu sử dụng</option>
                                            <option value="2">Nguyên liệu hỏng</option>
                                            <option value="3">Hết hạn</option>
                                        </CFormSelect>
                                        {product.errors?.exportReasonStatus && <div className="text-danger">{product.errors.exportReasonStatus}</div>}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <CFormTextarea
                                            name="description"
                                            value={product.description}
                                            onChange={(e) => handleProductChange(index, e)}
                                            placeholder="Nhập mô tả nếu cần"
                                        />
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <CButton color="danger" onClick={() => handleRemoveProduct(index)}>
                                            Xóa
                                        </CButton>
                                    </CTableDataCell>
                                </CTableRow>
                            ))}
                        </CTableBody>
                    </CTable>
                    <CButton
                        color="primary"
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading && <CSpinner size="sm" />} Xác nhận xuất kho
                    </CButton>
                </CCardBody>
            </CCard>
        </>
    );
};

export default ExportAdd;
