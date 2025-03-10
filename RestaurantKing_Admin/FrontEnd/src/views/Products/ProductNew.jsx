/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { CCard, CCardBody, CCardHeader, CButton, CFormInput, CFormTextarea, CFormCheck, CTabs, CTabList, CTab, CTabContent, CTabPanel, CForm, CRow, CCol, CInputGroup, CInputGroupText, CFormSelect, CFormLabel, CModal, CModalHeader, CModalBody, CModalFooter } from '@coreui/react';
import { convertImageToBase64JPG } from '../../code/convertImage';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getCategoryProduct } from '../../code/getData';

const ImageManager = ({ productImages, handleDragStart, handleDrop, handleDragOver, removeImage, draggedIndex, hoveredIndex }) => (
    <CRow className="mt-4">
        {productImages.map((image, index) => (
            <CCol
                md={4}
                key={index}
                className={`text-center position-relative mb-4 ${draggedIndex === index ? 'dragging' : ''} ${hoveredIndex === index ? 'hovered' : ''}`}
                onDragStart={() => handleDragStart(index)}
                onDrop={() => handleDrop(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                draggable
                style={{
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
            >
                <img
                    src={image}
                    alt={`upload-${index}`}
                    className="img-fluid rounded shadow-sm"
                    style={{
                        maxWidth: '100%',
                        height: '300px',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        transform: draggedIndex === index ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: draggedIndex === index ? '0 10px 20px rgba(0,0,0,0.2)' : 'none',
                    }}
                />
                <div
                    onClick={() => removeImage(index)}
                    className="position-absolute start-50 translate-middle-x mb-2"
                    style={{ zIndex: 10, top: '-10px' }}
                >
                    <CButton
                        color="danger"
                        size="sm"
                        className="rounded-circle"
                        style={{
                            width: '30px',
                            height: '30px',
                            padding: '0',
                            fontSize: '18px',
                            fontWeight: 'bold',
                        }}
                    >
                        X
                    </CButton>
                </div>
            </CCol>
        ))}
    </CRow>
);

export default function ProductNew() {
    const [storageData, setStorageData] = useState([]);
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productUnit, setProductUnit] = useState('');
    const [productType, setProductType] = useState('0');
    const [productCategory, setProductCategory] = useState('0');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [productImages, setProductImages] = useState([]);
    const [productNotes, setProductNotes] = useState('');
    const [components, setComponents] = useState([]);
    const [activeTab, setActiveTab] = useState('info');
    const [showModal, setShowModal] = useState(false);
    const [selectedComponentIndex, setSelectedComponentIndex] = useState(null);
    const [productData, setProductData] = useState([]);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedProductQuantities, setSelectedProductQuantities] = useState({});
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        const fetchStorageData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/storages/getStorage');
                setStorageData(response.data);
                const res = await axios.get('http://localhost:5000/products/getProducts');
                setProductData(res.data.products || []);
            } catch (error) {
                console.error('Error fetching storage data:', error);
            }
        };
        fetchStorageData();
    }, []);

    const handleDragStart = (index) => setDraggedIndex(index);
    const handleDrop = (index) => {
        if (draggedIndex !== null && draggedIndex !== index) {
            const newImages = [...productImages];
            const draggedItem = newImages[draggedIndex];
            newImages[draggedIndex] = newImages[index];
            newImages[index] = draggedItem;
            setProductImages(newImages);
        }
        setDraggedIndex(null);
        setHoveredIndex(null);
    };
    const handleDragOver = (event, index) => {
        event.preventDefault();
        setHoveredIndex(index);
    };
    const removeImage = (index) => setProductImages((prevImages) => prevImages.filter((_, i) => i !== index));
    const handleImageChange = async (event) => {
        const files = Array.from(event.target.files);
        event.target.value = null;
        try {
            const convertedImages = await Promise.all(
                files.map(async (file) => {
                    const base64Image = await convertImageToBase64JPG(file);
                    return base64Image;
                })
            );
            setProductImages((prevImages) => [...prevImages, ...convertedImages]);

        } catch (error) {
            console.error('Lỗi khi chuyển đổi tệp:', error);
        }
    };

    const getProductNameById = (id) => {
        if (!productData || productData.length === 0) {
            return 'Danh sách sản phẩm trống';
        }

        const product = productData.find(item => item.id === id);
        return product ? product.name : 'Tên không tìm thấy';
    }

    const handleProductSelection = (id, isChecked) => {
        setSelectedProducts(prev => {
            if (isChecked) {
                return [...prev, { id, quantity: selectedProductQuantities[id] || 0 }];
            } else {
                return prev.filter(product => product.id !== id);
            }
        });
        if (!isChecked) {
            setSelectedProductQuantities(prev => {
                const newQuantities = { ...prev };
                delete newQuantities[id];
                return newQuantities;
            });
        }
    };

    const handleQuantityChange = (productId, quantity) => {
        setSelectedProductQuantities(prev => ({
            ...prev,
            [productId]: quantity,
        }));
    };
    const toggleProductModal = (index) => {
        setShowProductModal(!showProductModal);
    }

    const navigate = useNavigate();

    const handleTypeChange = (event) => {
        setProductType(event.target.value);
    };

    const handleCategoryChange = (event) => {
        setProductCategory(event.target.value);
    };

    const toggleModal = (index) => {
        setSelectedComponentIndex(index);
        setShowModal(!showModal);
    };

    const addNewComponentRow = () => {
        setComponents(prevComponents => [...prevComponents, { itemId: '', name: '', quantity: '', unit: '' }]);
    };

    const handleComponentChange = (index, field, value) => {
        const updatedComponents = [...components];
        updatedComponents[index] = { ...updatedComponents[index], [field]: value };
        setComponents(updatedComponents);
    };

    const handleComponentNameClick = (index) => {
        toggleModal(index);
    };

    const handleSelectComponent = (selectedItem) => {
        if (selectedComponentIndex !== null) {
            const updatedComponents = [...components];

            const exists = updatedComponents.some((component, index) => {
                return component.name === selectedItem.name && index !== selectedComponentIndex;
            });

            if (exists) {
                alert("Thành phần này đã được chọn trong một dòng khác!");
                return;
            }

            updatedComponents[selectedComponentIndex] = {
                ...updatedComponents[selectedComponentIndex],
                itemId: selectedItem.id,
                name: selectedItem.name,
            };
            setComponents(updatedComponents);
        }
        toggleModal(null);
    };

    const handleDeleteComponent = (index) => {
        const updatedComponents = components.filter((_, i) => i !== index);
        setComponents(updatedComponents);
    };

    const saveProduct = async () => {
        const productData = {
            name: productName,
            price: Number(productPrice),
            unit: productUnit,
            category: Number(productCategory),
            type: productType === "0" ? false : true,
            notes: productNotes,
            selectedProducts: selectedProducts,
            components: components.map(component => ({
                itemId: component.itemId,
                name: component.name,
                quantity: component.quantity,
                unit: component.unit,
            })),
            images: productImages,
        };

        console.log(productData);
        try {
            const response = await axios.post('http://localhost:5000/products/addProduct', productData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            alert('Sản phẩm đã được thêm thành công!');
            navigate(-1);
        } catch (error) {
            console.error('Error adding product:', error.response.data);
            alert('Có lỗi xảy ra khi thêm sản phẩm.');
        }
    };

    return (
        <>
            <CCard>
                <CCardHeader>
                    Nhập thông tin sản phẩm
                </CCardHeader>
                <CCardBody>
                    <CTabs activeItemKey={activeTab} onActiveTabChange={setActiveTab}>
                        <CTabList variant='tabs'>
                            <CTab itemKey="info">Thông tin cơ bản</CTab>
                            <CTab itemKey="components">Các thành phần</CTab>
                        </CTabList>
                        <CTabContent>
                            <CTabPanel itemKey="info">
                                <CForm className='mt-2'>
                                    <CRow className="mb-3">
                                        <CCol md={12} className="mb-3">
                                            <CFormLabel htmlFor="productName">Tên sản phẩm</CFormLabel>
                                            <CFormInput
                                                id="productName"
                                                type="text"
                                                value={productName}
                                                onChange={(e) => setProductName(e.target.value)}
                                                required
                                            />
                                        </CCol>
                                        <CCol md={12} className="mb-3">
                                            <CFormLabel htmlFor="productPrice">Giá sản phẩm</CFormLabel>
                                            <CInputGroup>
                                                <CInputGroupText>₫</CInputGroupText>
                                                <CFormInput
                                                    id="productPrice"
                                                    type="text"
                                                    value={productPrice}
                                                    onChange={(e) => setProductPrice(e.target.value)}
                                                    required
                                                />
                                            </CInputGroup>
                                        </CCol>
                                        <CCol md={12} className="mb-3">
                                            <CFormLabel htmlFor="productUnit">Đơn vị tính</CFormLabel>
                                            <CFormInput
                                                id="productUnit"
                                                type="text"
                                                value={productUnit}
                                                onChange={(e) => setProductUnit(e.target.value)}
                                            />
                                        </CCol>
                                        <CCol md={12} className="mb-3">
                                            <CFormLabel htmlFor="productCategory">Loại sản phẩm</CFormLabel>
                                            <CFormSelect
                                                id="productCategory"
                                                aria-label="Chọn loại sản phẩm"
                                                value={productCategory}
                                                onChange={handleCategoryChange}
                                            >
                                                <option value="0">Món khai vị</option>
                                                <option value="1">Món chính</option>
                                                <option value="2">Đồ tráng miệng</option>
                                                <option value="3">Nước</option>
                                                <option value="4">Tất cả</option>
                                            </CFormSelect>
                                        </CCol>
                                        <CCol md={12} className="mb-3">
                                            <CFormLabel htmlFor="productType">Loại</CFormLabel>
                                            <CFormSelect
                                                id="productType"
                                                aria-label="Chọn loại"
                                                value={productType}
                                                onChange={handleTypeChange}
                                            >
                                                <option value="0">Đơn thể</option>
                                                <option value="1">Combo</option>
                                            </CFormSelect>
                                        </CCol>
                                        {productType === '1' && (
                                            <CCol md={12} className="mb-3">
                                                <CButton color="primary" onClick={toggleProductModal}>
                                                    Thêm món
                                                </CButton>
                                                {selectedProducts.length > 0 ? (
                                                    <table className="table table-striped mt-3">
                                                        <thead>
                                                            <tr>
                                                                <th>Tên sản phẩm</th>
                                                                <th>Số lượng</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {selectedProducts.map((product, index) => (
                                                                <tr key={index}>
                                                                    <td>{getProductNameById(product.id)}</td>
                                                                    <td>{product.quantity}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <p>Không có sản phẩm nào được chọn.</p>
                                                )}

                                            </CCol>
                                        )}
                                        <CCol md={12}>
                                            <CFormLabel htmlFor="productImages">Chọn hình ảnh sản phẩm</CFormLabel>
                                            <CFormInput
                                                id="productImages"
                                                type="file"
                                                onChange={handleImageChange}
                                            />
                                            <ImageManager
                                                productImages={productImages}
                                                handleDragStart={handleDragStart}
                                                handleDrop={handleDrop}
                                                handleDragOver={handleDragOver}
                                                removeImage={removeImage}
                                                draggedIndex={draggedIndex}
                                                hoveredIndex={hoveredIndex}
                                            />
                                        </CCol>
                                        <CCol md={12} className="mb-3">
                                            <CFormLabel htmlFor="productNotes">Ghi chú</CFormLabel>
                                            <CFormTextarea
                                                id="productNotes"
                                                value={productNotes}
                                                onChange={(e) => setProductNotes(e.target.value)}
                                                rows="4"
                                            />
                                        </CCol>
                                    </CRow>
                                </CForm>
                            </CTabPanel>
                            <CTabPanel itemKey="components">
                                <CForm className='mt-2'>
                                    <CRow>
                                        <CCol md={12}>
                                            <table className="table table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>Mã thành phần</th>
                                                        <th>Tên thành phần</th>
                                                        <th>Số lượng</th>
                                                        <th>Đơn vị tính</th>
                                                        <th>Chức năng</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {components.map((component, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                <CFormInput
                                                                    type="text"
                                                                    value={component.id || ''}
                                                                    onChange={(e) => handleComponentChange(index, 'itemId', e.target.value)}
                                                                    readOnly
                                                                />
                                                            </td>
                                                            <td>
                                                                <CFormInput
                                                                    type="text"
                                                                    value={component.name || ''}
                                                                    onClick={() => handleComponentNameClick(index)}
                                                                    onChange={(e) => handleComponentChange(index, 'name', e.target.value)}
                                                                />

                                                            </td>
                                                            <td>
                                                                <CFormInput
                                                                    type="number"
                                                                    onChange={(e) => handleComponentChange(index, 'quantity', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <CFormInput
                                                                    type="text"
                                                                    onChange={(e) => handleComponentChange(index, 'unit', e.target.value)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <CButton
                                                                    color="danger"
                                                                    onClick={() => handleDeleteComponent(index)}
                                                                >
                                                                    Xóa
                                                                </CButton>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </CCol>
                                    </CRow>
                                    <CButton color="primary" onClick={addNewComponentRow} className='mb-4'>
                                        Thêm dòng
                                    </CButton>
                                </CForm>
                            </CTabPanel>
                        </CTabContent>
                    </CTabs>
                    <div className="d-flex justify-content-start">
                        <CButton color="primary" className="me-2" onClick={saveProduct}>
                            Lưu
                        </CButton>
                        <CButton color="secondary" onClick={() => navigate(-1)}>
                            Quay lại
                        </CButton>
                    </div>
                </CCardBody>
            </CCard>
            {showModal && (
                <CModal visible={showModal} onClose={() => toggleModal(null)}>
                    <CModalHeader closeButton>Chọn thành phần</CModalHeader>
                    <CModalBody>
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Tên</th>
                                </tr>
                            </thead>
                            <tbody>
                                {storageData.map((item, index) => (
                                    <tr key={index} onClick={() => handleSelectComponent(item)}>
                                        <td>{item.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CModalBody>
                </CModal>
            )}
            {showProductModal && (
                <CModal visible={showProductModal} onClose={() => toggleProductModal(null)} fullscreen>
                    <CModalHeader closeButton>Chọn sản phẩm</CModalHeader>
                    <CModalBody style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: '0 0 10%', marginBottom: '1rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <CFormInput
                                    type="text"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <CFormSelect
                                    aria-label="Chọn loại sản phẩm"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="">Tất cả loại</option>
                                    <option value="0">Món khai vị</option>
                                    <option value="1">Món chính</option>
                                    <option value="2">Đồ tráng miệng</option>
                                    <option value="3">Nước</option>
                                    <option value="4">Tất cả</option>
                                </CFormSelect>
                            </div>
                        </div>

                        <div style={{ flex: '1 1 90%', overflowY: 'auto' }}>
                            <div style={{ maxHeight: '100%', overflowY: 'auto' }}>
                                <style>
                                    {`
                                        div::-webkit-scrollbar {
                                            display: none;
                                        }
                                    `}
                                </style>

                                <table className="table table-hover" style={{ position: 'relative', height: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                                        <tr>
                                            <th>Tên</th>
                                            <th>Loại món</th>
                                            <th>Số lượng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productData
                                            .filter((item) => {
                                                const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
                                                const matchesCategory = selectedCategory ? item.category === parseInt(selectedCategory) : true;
                                                return matchesSearch && matchesCategory;
                                            })
                                            .map((item) => {
                                                const isChecked = selectedProducts.some(product => product.id === item.id);
                                                return (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <CFormCheck
                                                                type="checkbox"
                                                                id={`product-${item.id}`}
                                                                label={item.name}
                                                                checked={isChecked}
                                                                onChange={(e) => handleProductSelection(item.id, e.target.checked)}
                                                            />
                                                        </td>
                                                        <td>{getCategoryProduct(item.category)}</td>
                                                        <td>
                                                            <CFormInput
                                                                type="number"
                                                                placeholder="Số lượng"
                                                                value={isChecked ? (selectedProductQuantities[item.id] || '') : ''}
                                                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                                disabled={!isChecked}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => toggleProductModal(null)}>
                            Đóng
                        </CButton>
                        <CButton color="primary" onClick={() => {
                            const selectedWithQuantities = selectedProducts.map(product => ({
                                itemId: product.id,
                                quantity: selectedProductQuantities[product.id] || 0,
                            }));
                            setSelectedProducts(selectedWithQuantities);
                            toggleProductModal(null);
                        }}>
                            Xác nhận
                        </CButton>
                    </CModalFooter>
                </CModal>
            )}
        </>
    );
}
