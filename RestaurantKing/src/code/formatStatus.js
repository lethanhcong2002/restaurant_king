import { COLORS } from './color';

function getStatusText(status) {
    switch (status) {
        case 0:
            return 'Chờ thanh toán';
        case 1:
            return 'Chờ nhận bàn';
        case 2:
            return 'Đã thanh toán';
        case 3:
            return 'Chờ xác nhận';
        case 4:
            return 'Hủy';
        default:
            return 'Unknown Status';
    }
}

function getCategoryDishes(status) {
    switch (status) {
        case 0:
            return 'Khai vị';
        case 1:
            return 'Món chính';
        case 2:
            return 'Tráng miệng';
        case 3:
            return 'Nước - Bia';
        case 4:
            return 'Combo';
        default:
            return 'Unknown Status';
    }
}

function getPriceRange(price) {
    switch (price) {
        case 'low':
            return 'Dưới 50k';
        case 'medium':
            return '50k - 100k';
        case 'high':
            return 'Trên 100k';
        default:
            return 'Unknown Status';
    }
}

function getStatusColor(status) {
    switch (status) {
        case 0:
            return COLORS.pendingPayment;
        case 1:
            return COLORS.waitingForTable;
        case 2:
            return COLORS.primary;
        case 3:
            return COLORS.waitingForConfirmation;
        case 4:
            return COLORS.cancelled;
        default:
            return COLORS.default;
    }
}

export {getStatusColor, getStatusText, getCategoryDishes, getPriceRange};
