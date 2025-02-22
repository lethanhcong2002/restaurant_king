import { useEffect, useState } from 'react';
import {
    CCard,
    CCardBody,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
} from '@coreui/react';
import { CChart } from '@coreui/react-chartjs';
import WidgetsStatistical from '../widgets/WidgetsStatistical';
import axios from 'axios';

const Statistical = () => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [topItems, setTopItems] = useState([]);

    const fetchTopItems = async () => {
        try {
            const response = await axios.get('http://localhost:5000/statistical/top-10-products');
            setTopItems(response.data.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách món ăn phổ biến:', error);
        }
    };

    const fetchPopularTimeSlots = async () => {
        try {
            const response = await axios.get('http://localhost:5000/statistical/popular-time-slots');
            setTimeSlots(response.data.data.top5TimeSlots);
            setIsLoading(false);
        } catch (error) {
            console.error('Lỗi khi gọi API lấy khung giờ phổ biến:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPopularTimeSlots();
        fetchTopItems();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>; // Hiển thị khi đang tải dữ liệu
    }

    const labels = timeSlots.map(slot => `${slot.hour}:00`);
    const data = timeSlots.map(slot => slot.count);

    return (
        <div>
            <WidgetsStatistical className="mb-4" />

            <CCard className="mb-4">
                <CCardBody>
                    <h5>Khung giờ khách đến nhiều nhất</h5>
                    {timeSlots.length > 0 ? (
                        <CChart
                            type="bar"
                            data={{
                                labels,
                                datasets: [
                                    {
                                        label: 'Số lượng khách',
                                        backgroundColor: '#339af0',
                                        data,
                                    },
                                ],
                            }}
                        />
                    ) : (
                        <p>Không có dữ liệu</p> // Hiển thị khi không có dữ liệu
                    )}
                </CCardBody>
            </CCard>

            {/* Món ăn được chọn nhiều nhất */}
            <CCard className="mb-4">
                <CCardBody>
                    <h5>Món ăn được chọn nhiều nhất</h5>
                    <CTable hover>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>#</CTableHeaderCell>
                                <CTableHeaderCell>Tên món ăn</CTableHeaderCell>
                                <CTableHeaderCell>Số lần chọn</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {topItems.length > 0 ? (
                                topItems.map((item, index) => (
                                    <CTableRow key={index}>
                                        <CTableDataCell>{index + 1}</CTableDataCell>
                                        <CTableDataCell>{item.name}</CTableDataCell>
                                        <CTableDataCell>{item.count}</CTableDataCell>
                                    </CTableRow>
                                ))
                            ) : (
                                <CTableRow>
                                    <CTableDataCell colSpan="3">Không có dữ liệu</CTableDataCell>
                                </CTableRow>
                            )}
                        </CTableBody>
                    </CTable>
                </CCardBody>
            </CCard>
        </div>
    );
};

export default Statistical;
