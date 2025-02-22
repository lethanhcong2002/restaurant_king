import { Alert } from "react-native";

const errorTranslations = {
    'Network Error': 'Lỗi kết nối mạng. Vui lòng kiểm tra lại kết nối của bạn.',
    'Request failed with status code 404': 'Không tìm thấy tài nguyên. Vui lòng thử lại sau.',
    'Request failed with status code 500': 'Lỗi máy chủ. Vui lòng thử lại sau.',
    'Timeout exceeded': 'Hết thời gian yêu cầu. Vui lòng thử lại sau.',
    'Failed to fetch': 'Không thể tải dữ liệu. Vui lòng kiểm tra kết nối mạng.',
    'User ID is required.': 'Yêu cầu mã người dùng.',
    'Permission denied': 'Bạn không có quyền truy cập vào tài nguyên này.',
    'Invalid email address': 'Địa chỉ email không hợp lệ. Vui lòng nhập lại.',
    'Password is too short': 'Mật khẩu quá ngắn. Vui lòng nhập mật khẩu có ít nhất 8 ký tự.',
    'Failed to authenticate': 'Xác thực không thành công. Vui lòng thử lại.',
    'Document not found': 'Không tìm thấy tài liệu.',
    'Firebase: Error (auth/user-not-found).': 'Người dùng không tồn tại. Vui lòng kiểm tra lại thông tin.',
    'Firebase: Error (auth/wrong-password).': 'Mật khẩu không đúng. Vui lòng thử lại.',
    'Firebase: Error (auth/email-already-in-use).': 'Email này đã được sử dụng. Vui lòng chọn email khác.',
    'Failed to fetch invoices': 'Không thể lấy danh sách hóa đơn. Vui lòng thử lại sau.',
    'An unexpected error occurred': 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.',
    'Validation failed': 'Xác thực không thành công. Vui lòng kiểm tra lại thông tin.',
};

const translateError = (errorMessage) => {
    const message = errorTranslations[errorMessage] || 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.';

    Alert.alert('Thông báo lỗi', message, [
        { text: 'OK' },
    ]);
};

export default translateError;
