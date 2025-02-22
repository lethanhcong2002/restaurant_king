const express = require('express');
const cors = require('cors');
const accountRoutes = require('./routes/accountRoutes.cjs');
const tableRoutes = require('./routes/tableRoutes.cjs');
const storageRoutes = require('./routes/storageRoutes.cjs');
const ieRoutes = require('./routes/ieInvoiceRoutes.cjs');
const supplierRoutes = require('./routes/supplierRoutes.cjs');
const productRoutes = require('./routes/productRoutes.cjs');
const invoiceRoutes = require('./routes/invoiceRoutes.cjs');
const emailRoutes = require('./routes/emailRoutes.cjs');
const notificationRoutes = require('./routes/notificationRoutes.cjs');
const customerRoutes = require('./routes/customerRoutes.cjs');
const statisticalRoutes = require('./routes/StatisticalRoutes.cjs');
const evaluationRoutes = require('./routes/evaluationRoutes.cjs');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());

app.use('/accounts', accountRoutes);
app.use('/tables', tableRoutes);
app.use('/storages', storageRoutes);
app.use('/ieInvoices', ieRoutes);
app.use('/suppliers', supplierRoutes);
app.use('/products', productRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/email', emailRoutes);
app.use('/notifications', notificationRoutes);
app.use('/customers', customerRoutes);
app.use('/statistical', statisticalRoutes);
app.use('/evaluation', evaluationRoutes);

//server
app.listen(5000, () => {
  console.log('Server đang chạy trên cổng 5000');
});
