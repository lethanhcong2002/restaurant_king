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
    CButton,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CFormSelect,
    CPagination,
    CPaginationItem,
    CCardHeader
} from '@coreui/react';
import axios from 'axios';
import { formatDateTime } from '../../code/convertDate';

const Evaluation = () => {

    const [evaluations, setEvaluations] = useState([]);


    const fetchEvaluation = async () => {
        try {
            const response = await axios.get('http://localhost:5000/evaluation/getEvaluation');
            setEvaluations(response.data.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách món ăn phổ biến:', error);
        }
    };

    useEffect(() => {
        fetchEvaluation();
    }, []);
    
    const [selectedEvaluation, setSelectedEvaluation] = useState(null); // evaluation đang được chọn
    const [visible, setVisible] = useState(false); // Điều khiển modal
    const [itemsPerPage, setItemsPerPage] = useState(5); // Số lượng item hiển thị trên mỗi trang
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại

    const totalPages = Math.ceil(evaluations.length / itemsPerPage); // Tính số trang tổng cộng

    // Xử lý mở modal với evaluation chi tiết
    const handleViewDetail = (evaluation) => {
        setSelectedEvaluation(evaluation);
        setVisible(true);
    };

    // Đóng modal
    const handleCloseModal = () => {
        setVisible(false);
        setSelectedEvaluation(null);
    };

    // Xử lý thay đổi trang
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Render phân trang
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

    const currentEvaluations = evaluations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div>
            <CCard className="mb-4">
                <CCardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div className="mb-3 mb-md-0">Đánh giá chất lượng dịch vụ</div>
                </CCardHeader>
                <CCardBody>

                    <div className='col-md-2 mb-2'>
                        <CFormSelect
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="mb-3"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </CFormSelect>
                    </div>

                    <CTable hover>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>#</CTableHeaderCell>
                                <CTableHeaderCell>Mã hóa đơn</CTableHeaderCell>
                                <CTableHeaderCell>Ngày</CTableHeaderCell>
                                <CTableHeaderCell>Điểm</CTableHeaderCell>
                                <CTableHeaderCell>Thao tác</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {currentEvaluations.map((evaluation, index) => (
                                <CTableRow key={evaluation.id}>
                                    <CTableDataCell>{(currentPage - 1) * itemsPerPage + index + 1}</CTableDataCell>
                                    <CTableDataCell>{evaluation.code}</CTableDataCell>
                                    <CTableDataCell>{formatDateTime(evaluation.createdAt)}</CTableDataCell>
                                    <CTableDataCell>{evaluation.score}</CTableDataCell>
                                    <CTableDataCell>
                                        <CButton color="info" onClick={() => handleViewDetail(evaluation)}>
                                            Xem chi tiết
                                        </CButton>
                                    </CTableDataCell>
                                </CTableRow>
                            ))}
                        </CTableBody>
                    </CTable>

                    {renderPagination()}
                </CCardBody>
            </CCard>

            {selectedEvaluation && (
                <CModal visible={visible} onClose={handleCloseModal}>
                    <CModalHeader>
                        <CModalTitle>Chi tiết đánh giá</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <p><strong>Mã hóa đơn:</strong> {selectedEvaluation.code}</p>
                        <p><strong>Ngày:</strong> {formatDateTime(selectedEvaluation.createdAt)}</p>
                        <p><strong>Điểm số:</strong> {selectedEvaluation.score}</p>
                        <p><strong>Nội dung đánh giá:</strong> {selectedEvaluation.evaluate}</p>
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={handleCloseModal}>
                            Đóng
                        </CButton>
                    </CModalFooter>
                </CModal>
            )}
        </div>
    );
};

export default Evaluation;
