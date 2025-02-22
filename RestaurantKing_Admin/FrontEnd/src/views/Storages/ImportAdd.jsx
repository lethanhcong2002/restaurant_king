/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CForm,
    CFormLabel,
    CFormInput,
    CButton,
    CTable,
    CTableBody,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableDataCell,
    CFormSelect,
    CFormCheck,
} from '@coreui/react';
import axios from 'axios';
import formatToVND from '../../code/convertPrice';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const ImportAdd = () => {
    const navigate = useNavigate();

    const user = useSelector((state) => state.user);
    const [suppliersData, setSuppliersData] = useState([]);
    const [supplierProducts, setSupplierProducts] = useState([]);
    const [supplier, setSupplier] = useState({
        supplierId: '',
        supplierName: '',
        supplierPhone: '',
        supplierEmail: '',
        timeRefund: 0,
    });

    const [note, setNote] = useState('');


    const [selectedProducts, setSelectedProducts] = useState({});
    const [loading, setLoading] = useState(false);

    const totalAmount = supplierProducts.reduce((total, product) => {
        if (selectedProducts[product.id]) {
            return total + (product.quantity * product.price);
        }
        return total;
    }, 0);

    const totalPayment = totalAmount;

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const res = await axios.get('http://localhost:5000/suppliers/getSuppliers');
                if (res.status === 200) {
                    setSuppliersData(res.data);
                    console.log(res.data);
                }
            } catch (error) {
                console.error('Error fetching suppliers:', error.message || error);
            }
        };

        fetchSuppliers();
    }, []);

    const handleSupplierChange = (e) => {
        const selectedSupplierName = e.target.value;
        const selectedSupplier = suppliersData.find(sup => sup.name === selectedSupplierName);

        if (selectedSupplier) {
            setSupplier({
                supplierId: selectedSupplier.id,
                supplierName: selectedSupplier.name,
                supplierPhone: selectedSupplier.phone,
                supplierEmail: selectedSupplier.email,
                timeRefund: selectedSupplier.timeRefund,
            });

            setSupplierProducts(selectedSupplier.products || []);
        } else {
            setSupplier({
                supplierName: '',
                supplierPhone: '',
                supplierEmail: '',
                timeRefund: 0,
            });
            setSupplierProducts([]);
        }
    };


    const handleQuantityChange = (index, value) => {
        const updatedProducts = [...supplierProducts];
        updatedProducts[index].quantity = Math.max(0, value);
        setSupplierProducts(updatedProducts);
    };

    const handleCheckboxChange = (id) => {
        setSelectedProducts((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const selectedItems = supplierProducts
            .filter((product) => selectedProducts[product.id])
            .map((product) => ({
                itemId: product.id,
                name: product.name,
                quantity: product.quantity,
                unit: product.unit,
                price: product.price,
            }));

        if (selectedItems.length === 0) {
            toast.error('vui lòng nhập đầy đủ thông tin');
            return;
        }

        const invoiceData = {
            supplier: {
                supplierId: supplier.supplierId,
                timeRefund: supplier.timeRefund,
                supplierName: supplier.supplierName,
                supplierPhone: supplier.supplierPhone,
                supplierEmail: supplier.supplierEmail,
            },
            selectedItems: selectedItems,
            userId: user.id,
            userName: user.name,
            notes: note,
        };
        console.log(invoiceData);
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/ieInvoices/addInvoiceImport', invoiceData);

            const itemsList = selectedItems.map(item => `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 10px;">${item.name}</td>
                    <td style="border: 1px solid #ddd; padding: 10px;">${item.quantity}</td>
                    <td style="border: 1px solid #ddd; padding: 10px;">${item.unit}</td>
                </tr>
            `).join('');

            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 75%; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 20px; padding: 20px; background-color: #f7f7f7;">
                        <h1 style="color: #3498DB;">HÓA ĐƠN ĐẶT HÀNG</h1>
                        <p style="font-size: 16px;">Tên Nhà Cung Cấp: <strong>${supplier.supplierName}</strong></p>
                        <p style="font-size: 16px;">Số Điện Thoại: <strong>${supplier.supplierPhone}</strong></p>
                        <p style="font-size: 16px;">Email: <strong>${supplier.supplierEmail}</strong></p>
                    </div>
                    <hr style="border: 1px solid #3498DB;">
                    <p style="margin-top: 20px; font-size: 16px;">Chúng tôi xin gửi yêu cầu đặt hàng với các sản phẩm sau:</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <thead>
                            <tr style="background-color: #3498DB; color: white;">
                                <th style="border: 1px solid #ddd; padding: 10px;">Tên Sản Phẩm</th>
                                <th style="border: 1px solid #ddd; padding: 10px;">Số Lượng</th>
                                <th style="border: 1px solid #ddd; padding: 10px;">Đơn Vị Tính</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsList}
                        </tbody>
                    </table>

                    <h5 style="margin-top: 20px; font-size: 16px;">Ghi chú:</h5>
                    <p style="font-size: 16px;">${note ? note : "Không có ghi chú."}</p>

                    <p style="margin-top: 20px; font-size: 16px;">Cảm ơn bạn đã xem xét yêu cầu này!</p>
                    <footer style="margin-top: 30px; text-align: center; font-size: 12px; color: gray;">
                        <p>Công ty XYZ</p>
                        <p>Địa chỉ: 123 Đường ABC, Thành phố XYZ</p>
                        <p>Điện thoại: 0123-456-789</p>
                    </footer>
                </div>
                `;

            await axios.post('http://localhost:5000/email/send-email', {
                to: supplier.supplierEmail,
                subject: 'Yêu Cầu Đặt Hàng',
                text: 'This is a plain text message',
                html: emailHtml,
            });
        } catch (error) {
            console.error('Failed to create invoice or send email:', error);
            alert(`Failed to create invoice or send email: ${error.response?.data || error.message}`);
        } finally {
            setLoading(false);
            navigate(-1);
        }
    };

    return (
        <>
            <CCard>
                <CCardHeader>Quản lý nhập xuất kho - Lập hóa đơn nhập hàng</CCardHeader>
                <CCardBody>
                    <CForm onSubmit={handleSubmit}>
                        <h5>Thông tin nhà cung cấp</h5>
                        <div className="mb-3">
                            <CFormLabel>Tên nhà cung cấp</CFormLabel>
                            <CFormSelect
                                value={supplier.supplierName}
                                onChange={handleSupplierChange}
                            >
                                <option value="">Chọn nhà cung cấp</option>
                                {suppliersData.map((sup, index) => (
                                    <option key={index} value={sup.name}>{sup.name}</option>
                                ))}
                            </CFormSelect>
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Số điện thoại liên hệ</CFormLabel>
                            <CFormInput
                                value={supplier.supplierPhone}
                                readOnly />
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Email</CFormLabel>
                            <CFormInput
                                value={supplier.supplierEmail}
                                readOnly />
                        </div>

                        <h5>Danh sách sản phẩm</h5>
                        <CTable striped>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Chọn</CTableHeaderCell>
                                    <CTableHeaderCell>Tên Sản Phẩm</CTableHeaderCell>
                                    <CTableHeaderCell>Đơn Vị Tính</CTableHeaderCell>
                                    <CTableHeaderCell>Số Lượng</CTableHeaderCell>
                                    <CTableHeaderCell>Đơn Giá</CTableHeaderCell>
                                    <CTableHeaderCell>Thành Tiền</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {supplierProducts.length > 0 ? (
                                    supplierProducts.map((product, index) => (
                                        <CTableRow key={index}>
                                            <CTableDataCell>
                                                <CFormCheck
                                                    inline
                                                    checked={!!selectedProducts[product.id]}
                                                    onChange={() => handleCheckboxChange(product.id)} />
                                            </CTableDataCell>
                                            <CTableDataCell>{product.name}</CTableDataCell>
                                            <CTableDataCell>{product.unit}</CTableDataCell>
                                            <CTableDataCell>
                                                <CFormInput
                                                    type="number"
                                                    value={product.quantity || 0}
                                                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                                                    min="0"
                                                    placeholder="Nhập số lượng" />
                                            </CTableDataCell>
                                            <CTableDataCell>{formatToVND(product.price)}</CTableDataCell>
                                            <CTableDataCell>
                                                {formatToVND((selectedProducts[product.id] ? (product.quantity || 0) : 0) * product.price)}
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))
                                ) : (
                                    <CTableRow>
                                        <CTableDataCell colSpan="6" className="text-center">Không có sản phẩm nào</CTableDataCell>
                                    </CTableRow>
                                )}
                            </CTableBody>
                        </CTable>

                        <div className="d-flex justify-content-end">
                            <div className="mr-4">
                                <p><strong>Tổng thanh toán:</strong> {formatToVND(totalPayment)}</p>
                            </div>
                        </div>

                        <h5>Ghi chú bổ sung</h5>
                        <div className="mb-3">
                            <CFormLabel>Ghi chú</CFormLabel>
                            <CFormInput
                                component="textarea"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Nhập ghi chú ở đây..."
                                rows={3} />
                        </div>

                        <CButton color="primary" type="submit" disabled={loading}>
                            {loading ? 'Đang xử lý, vui lòng chờ...' : 'Lưu hóa đơn'}
                        </CButton> {' '}
                        <CButton color="secondary" onClick={() => navigate(-1)}>
                            Quay lại
                        </CButton>
                    </CForm>
                </CCardBody>
            </CCard>
            <ToastContainer />
        </>
    );
};

export default ImportAdd;
