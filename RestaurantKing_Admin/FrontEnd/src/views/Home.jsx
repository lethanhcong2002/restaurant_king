import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react';
import WidgetsDropdown from './widgets/WidgetsDropdown';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { getStatusInvoice } from '../code/getData';
import formatToVND from '../code/convertPrice';

const Home = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/invoices/invoice_home')
      .then((response) => {
        setData(response.data.data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  return (
    <>
      <WidgetsDropdown className="mb-4" />
      <CRow>
        <CCol xs>
          <CCard className="mb-4" style={{ overflowY: 'auto', maxHeight: '500px' }}>
            <CCardHeader>Danh sách hóa đơn</CCardHeader>
            <CCardBody>
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap">
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary">Mã hóa đơn</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Tên khách hàng</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Trạng thái</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Tổng tiền</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {data.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{item.code}</CTableDataCell>
                      <CTableDataCell>{item.customerName}</CTableDataCell>
                      <CTableDataCell>{getStatusInvoice(item.status)}</CTableDataCell>
                      <CTableDataCell>{formatToVND(item.totalPrice) || formatToVND(0)}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default Home;
