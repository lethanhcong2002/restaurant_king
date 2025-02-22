/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
const getBadgeIE = (status) => {
    switch (status) {
        case false: return 'warning';
        case true: return 'success';
        default: return 'primary';
    }
};

const getStatusIE = (status) => {
    switch (status) {
        case false: return 'Chờ nhận hàng';
        case true: return 'Đã xong';
        default: return 'Unknown';
    }
};

const getStatusExportIE = (status) => {
    switch (status) {
        case 1: return 'Nguyên liệu sử dụng';
        case 2: return 'Nguyên liệu hỏng';
        case 3: return 'Hết hạn';
        case 4: return 'Kiểm kê sai';
        default: return 'Unknown';
    }
}

const getCategoryProduct = (status) => {
    switch (status) {
        case 0: return 'Món khai vị';
        case 1: return 'Món chính';
        case 2: return 'Tráng miệng';
        case 3: return 'Nước';
        case 4: return 'Trọn bộ';
        default: return 'Unknown';
    }
}

const getStatusInvoice = (status) => {
    switch (status) {
        case 0: return 'Chưa thanh toán';
        case 1: return 'Chờ nhận bàn';
        case 2: return 'Đã thanh toán';
        case 3: return 'Chờ xác nhận';
        case 4: return 'Đã hủy';
        default: return 'Unknown';
    }
}

const getRoleAdmin = (status) => {
    switch (status) {
        case 1: return 'Phục vụ';
        case 2: return 'Đầu bếp';
        case 3: return 'Quản lý';
        case 4: return 'Admin tổng';
        default: return 'Trống';
    }
}

const getChangeSI = (input) => {
    if (input === null || input === undefined) {
        return ''; 
    }

    if (typeof input !== 'string') {
        return 'Không hợp lệ';
    }

    switch (true) {
        case input === 'added':
            return 'mới';

        case input.startsWith('increased by'):
            const increaseValue = parseInt(input.split(' ')[2], 10);
            return `tăng ${increaseValue}`;

        case input.startsWith('decreased by'):
            const decreaseValue = parseInt(input.split(' ')[2], 10);
            return `giảm ${decreaseValue}`;

        default:
            return 'Không hợp lệ';
    }
};

export { getBadgeIE, getStatusIE, getStatusExportIE, getStatusInvoice, getRoleAdmin, getChangeSI, getCategoryProduct }