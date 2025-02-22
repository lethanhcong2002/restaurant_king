/* eslint-disable no-unused-vars */
import path from 'path'
import React from 'react'

const Home = React.lazy(() => import('./views/Home'))
const ProductList = React.lazy(() => import('./views/Products/ProductList'))
const ProductNew = React.lazy(() => import('./views/Products/ProductNew'))
const ProductUpdate = React.lazy(() => import('./views/Products/ProductUpdate'))
const StoragesList = React.lazy(() => import('./views/Storages/StoragesList'))
const StoragesNew = React.lazy(() => import('./views/Storages/StoragesNew'))
const StoragesUpdate = React.lazy(() => import('./views/Storages/StoragesUpdate'))
const RTList = React.lazy(() => import('./views/Room-Table/RTList'))
const RTNew = React.lazy(() => import('./views/Room-Table/RTNew'))
const RTEdit = React.lazy(() => import('./views/Room-Table/RTEdit'))
const SupplierList = React.lazy(() => import('./views/Supplier/SupplierList'))
const ImportAdd = React.lazy(() => import('./views/Storages/ImportAdd'));
const ImportExportList = React.lazy(() => import('./views/Storages/ImportExportList'))
const ExportAdd = React.lazy(() => import('./views/Storages/ExportAdd'))
const InvoiceList = React.lazy(() => import('./views/Invoices/InvoiceList'))
const CustomerList = React.lazy(() => import('./views/Customers/CustomerList'))
const EmployeeList = React.lazy(() => import('./views/Employees/EmployeeList'))
const Kitchen = React.lazy(() => import('./views/Kitchen/Kitchen'))
const Notification = React.lazy(() => import('./views/Notification/NotificationList'))
const Profile = React.lazy(() => import('./views/Account&Setting/Profile'));
const Statistical = React.lazy(() => import('./views/Statistical/Statistical'));
const Evaluation = React.lazy(() => import('./views/Evaluation/Evaluation'));

const routes = [
  { path: '/admin/home', name: 'Home', element: Home },
  { path: '/admin/san-pham', name: 'Sản phẩm', element: ProductList },
  { path: '/admin/san-pham/them-moi', name: 'Thêm mới sản phẩm', element: ProductNew },
  { path: '/admin/san-pham/cap-nhat/:id', name: 'Cập nhật sản phẩm', element: ProductUpdate },
  { path: '/admin/kho-hang', name: 'Kho hàng', element: StoragesList },
  { path: '/admin/kho-hang/them-moi', name: 'Thêm mới vật tư', element: StoragesNew },
  { path: '/admin/kho-hang/cap-nhat/:id', name: 'Cập nhật vật tư', element: StoragesUpdate },
  { path: '/admin/phong-ban', name: 'Phòng-Bàn', element: RTList },
  { path: '/admin/phong-ban/them-moi', name: 'Thêm mới phòng-bàn', element: RTNew },
  { path: '/admin/phong-ban/sua/:id', name: 'Cập nhật phòng-bàn', element: RTEdit },
  { path: '/admin/nha-cung-cap', name: 'Nhà cung cấp', element: SupplierList },
  { path: '/admin/nhap-xuat/hoa-don-nhap', name: 'Hóa đơn nhập', element: ImportAdd },
  { path: '/admin/nhap-xuat', name: 'Nhập Xuất', element: ImportExportList },
  { path: '/admin/nhap-xuat/hoa-don-xuat', name: 'Hóa đơn xuất', element: ExportAdd },
  { path: '/admin/hoa-don-thanh-toan', name: 'Hóa đơn - Thanh toán', element: InvoiceList },
  { path: '/admin/khach-hang', name: 'Khách hàng', element: CustomerList },
  { path: '/admin/nhan-vien', name: 'Nhân viên', element: EmployeeList },
  { path: '/admin/bep', name: 'Bếp', element: Kitchen },
  { path: '/admin/thong-bao', name: 'Thông báo', element: Notification },
  { path: '/admin/thong-tin-ca-nhan', name: 'Thông tin cá nhân', element: Profile },
  { path: '/admin/thong-ke', name: 'Thống kê', element: Statistical},
  { path: '/admin/danh-gia', name: 'Đánh giá', element: Evaluation},
]

export default routes
