import { CNavGroup, CNavItem } from '@coreui/react';

const _nav = [
  {
    component: CNavItem,
    name: 'Trang chủ',
    to: '/admin/home',
  },
  //Quản lý nhà hàng
  {
    component: CNavGroup,
    name: 'Quản lý nhà hàng',
    items: [
      {
        component: CNavItem,
        name: 'Sản phẩm',
        to: '/admin/san-pham',
      },
      {
        component: CNavItem,
        name: 'Phòng/Bàn',
        to: '/admin/phong-ban',
      },
      {
        component: CNavItem,
        name: 'Kho hàng',
        to: '/admin/kho-hang',
      },
      {
        component: CNavItem,
        name: 'Hóa đơn nhập - xuất',
        to: '/admin/nhap-xuat',
      },
      // {
      //   component: CNavItem,
      //   name: 'Kiểm kê kho',
      //   to: '/admin/kiem-ke-kho',
      // },
      {
        component: CNavItem,
        name: 'Nhà cung cấp',
        to: '/admin/nha-cung-cap',
      },
    ],
  },
  //Quản lý Thanh toán
  {
    component: CNavItem,
    name: 'Đơn hàng',
    to: '/admin/hoa-don-thanh-toan',
  },
  {
    component: CNavItem,
    name: 'Quản lý khách hàng',
    to: '/admin/khach-hang',
  },
  {
    component: CNavItem,
    name: 'Quản lý nhân viên',
    to: '/admin/nhan-vien',
  },

  {
    component: CNavItem,
    name: 'Thông báo',
    to: '/admin/thong-bao',
  },
  
  {
    component: CNavItem,
    name: 'Thống kê',
    to: '/admin/thong-ke',
  },

  {
    component: CNavItem,
    name: 'Đánh giá chất lượng dịch vụ',
    to: '/admin/danh-gia',
  },

  // {
  //   component: CNavItem,
  //   name: 'Bếp',
  //   to: '/admin/bep',
  // },
];

export default _nav;
