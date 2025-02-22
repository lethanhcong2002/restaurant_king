/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { CModal, CModalHeader, CModalTitle, CModalBody, CRow, CCol, CFormSelect, CFormInput, CListGroup, CListGroupItem, CCard, CCardBody, CFormCheck, CModalFooter, CButton } from '@coreui/react';
import React from 'react';

export default function NewInvoice({ visible, onCancel, data, setData, availableItems, handleItemSelect, handleQuantityChange, handleAddItems }) {
    const { tables, customerName, customerPhone, selectedItems, selectedTable } = data;

    const updateDataField = (field, value) => {
        setData({
            ...data,
            [field]: value
        });
    };

    return (
        <CModal visible={visible} onClose={onCancel} size="xl" fullscreen>
            <CModalHeader onClose={onCancel}>
                <CModalTitle>Thêm mới hóa đơn</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <CRow>
                    <CCol md={4} className="pe-3">
                        <div
                            style={{
                                borderRight: '2px solid #dee2e6',
                                height: '100%',
                                paddingRight: '1rem',
                            }}
                        >
                            <CFormSelect
                                value={selectedTable}
                                onChange={(e) => updateDataField('selectedTable', e.target.value)}
                            >
                                <option value="">Chọn bàn</option>
                                {tables.length > 0 ? (
                                    tables
                                        .filter(table => table.status === false)
                                        .map((table) => (
                                            <option key={table.id} value={table.id}>
                                                {table.tableName}
                                            </option>
                                        ))
                                ) : (
                                    <option value="">Không có bàn</option>
                                )}
                            </CFormSelect>

                            <h5 className="mt-3">Thông tin khách hàng</h5>
                            <CFormInput
                                label="Tên khách hàng"
                                placeholder="Nhập tên"
                                value={customerName}
                                onChange={(e) => updateDataField('customerName', e.target.value)}
                            />

                            <CFormInput
                                label="Số điện thoại"
                                placeholder="Nhập SĐT"
                                value={customerPhone}
                                onChange={(e) => updateDataField('customerPhone', e.target.value)}
                            />

                            <h5 className="mt-3">Món đã chọn</h5>
                            <CListGroup>
                                {selectedItems.map((item, index) => (
                                    <CListGroupItem key={index}>
                                        {item.name} - {item.quantity} x {item.price}
                                    </CListGroupItem>
                                ))}
                            </CListGroup>
                        </div>
                    </CCol>

                    <CCol md={8}>
                        <CRow>
                            {availableItems.map((item, index) => (
                                <CCol key={index} sm={6} md={3}>
                                    <CCard className="mb-3">
                                        <CCardBody className="d-flex align-items-center">
                                            <CFormCheck
                                                checked={item.isSelected}
                                                onChange={() => handleItemSelect(item.id)}
                                            />
                                            <div className="ms-3 flex-grow-1">
                                                <h6>{item.name}</h6>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <CFormInput
                                                        type="number"
                                                        value={item.quantity}
                                                        min="1"
                                                        style={{ width: '60px' }}
                                                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                    />
                                                    <span>{item.price}</span>
                                                </div>
                                            </div>
                                        </CCardBody>
                                    </CCard>
                                </CCol>
                            ))}
                        </CRow>
                    </CCol>
                </CRow>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={() => onCancel(false)}>Hủy</CButton>
                <CButton color="primary" onClick={handleAddItems}>Thêm món vào hóa đơn</CButton>
            </CModalFooter>
        </CModal>
    )
}
