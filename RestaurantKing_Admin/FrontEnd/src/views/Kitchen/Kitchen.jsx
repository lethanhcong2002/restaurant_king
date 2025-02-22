import React, { useState, useEffect } from 'react';
import {
  CTable, CTableBody, CTableHeaderCell, CTableHead, CTableRow, CTableDataCell,
  CCard, CCardBody, CCardHeader, CButton, CRow, CCol
} from '@coreui/react';

export default function KitchenInterface() {
  const [dishes, setDishes] = useState([
    { id: 1, name: 'Phở bò', quantity: 2, table: 'Bàn 1', status: 'pending' },
    { id: 2, name: 'Gà chiên', quantity: 1, table: 'Bàn 3', status: 'pending' },
  ]);

  const [preparation, setPreparation] = useState([]);

  // Function to remove completed dishes after 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setDishes(dishes.filter(dish => dish.status !== 'completed' || now - dish.timestamp < 5 * 60 * 1000));
      setPreparation(preparation.filter(dish => dish.status !== 'completed' || now - dish.timestamp < 5 * 60 * 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [dishes, preparation]);

  const handleReceive = (dish) => {
    setDishes(dishes.filter(d => d.id !== dish.id));
    setPreparation([...preparation, { ...dish, status: 'preparing', timestamp: Date.now() }]);
  };

  const handleCancel = (dish) => {
    setDishes(dishes.filter(d => d.id !== dish.id));
    alert(`Món ${dish.name} đã được thông báo hủy.`);
  };

  const handleComplete = (dish) => {
    setPreparation(preparation.filter(d => d.id !== dish.id));
    setDishes([...dishes, { ...dish, status: 'completed', timestamp: Date.now() }]);
  };

  const renderDishActions = (dish) => {
    if (dish.status === 'pending') {
      return (
        <>
          <CButton color="success" className="me-2" onClick={() => handleReceive(dish)}>
            Nhận
          </CButton>
          <CButton color="danger" onClick={() => handleCancel(dish)}>
            Thông báo hủy
          </CButton>
        </>
      );
    } else if (dish.status === 'preparing') {
      return (
        <CButton color="primary" onClick={() => handleComplete(dish)}>
          Hoàn thành
        </CButton>
      );
    }
    return null;
  };

  return (
    <div>
      <CRow>
        <CCol md={6}>
          <CCard>
            <CCardHeader>Món ăn</CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Tên món</CTableHeaderCell>
                    <CTableHeaderCell>Số lượng</CTableHeaderCell>
                    <CTableHeaderCell>Bàn</CTableHeaderCell>
                    <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                    <CTableHeaderCell>Thao tác</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {dishes.map((dish, index) => (
                    <CTableRow key={dish.id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{dish.name}</CTableDataCell>
                      <CTableDataCell>{dish.quantity}</CTableDataCell>
                      <CTableDataCell>{dish.table}</CTableDataCell>
                      <CTableDataCell>{dish.status}</CTableDataCell>
                      <CTableDataCell>
                        {renderDishActions(dish)}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6}>
          <CCard>
            <CCardHeader>Thực hiện</CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Tên món</CTableHeaderCell>
                    <CTableHeaderCell>Số lượng</CTableHeaderCell>
                    <CTableHeaderCell>Bàn</CTableHeaderCell>
                    <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                    <CTableHeaderCell>Thao tác</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {preparation.map((dish, index) => (
                    <CTableRow key={dish.id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{dish.name}</CTableDataCell>
                      <CTableDataCell>{dish.quantity}</CTableDataCell>
                      <CTableDataCell>{dish.table}</CTableDataCell>
                      <CTableDataCell>{dish.status}</CTableDataCell>
                      <CTableDataCell>
                        {renderDishActions(dish)}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  );
}
