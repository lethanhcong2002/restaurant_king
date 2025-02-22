const { db, bucket } = require('../firebaseConfig.cjs');
const { deleteUnwantedFiles } = require('../utils.cjs');

const addProduct = async (req, res) => {
    try {
        const { name, price, unit, type, category, notes, selectedProducts, components, images } = req.body;
        const productData = {
            name,
            price,
            unit,
            category,
            type,
            notes: notes || '',
            createdAt: new Date().toISOString(),
            status: true,
        };

        const productRef = await db.collection('products').add(productData);
        const productId = productRef.id;

        let imageUrls = [];
        if (images && images.length > 0) {
            const uploadPromises = images.map(async (base64Image, index) => {
                try {
                    const matches = base64Image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
                    if (!matches) {
                        console.error('Invalid base64 image format:', base64Image);
                        return;
                    }

                    const fileType = matches[1];
                    const fileData = matches[2];

                    const fileName = `products/${productId}/file_${Date.now()}.${fileType.split('/')[1]}`;
                    const bucketFile = bucket.file(fileName);

                    const buffer = Buffer.from(fileData, 'base64');

                    await bucketFile.save(buffer, {
                        metadata: { contentType: fileType },
                        public: true,
                    });

                    return bucketFile.publicUrl();
                } catch (error) {
                    console.error('Error uploading image:', error);
                }
            });

            imageUrls = await Promise.all(uploadPromises);
        }

        if (imageUrls.length > 0) {
            await productRef.update({ imageUrls: imageUrls });
        }

        if (selectedProducts && selectedProducts.length > 0) {
            const selectedProductPromises = selectedProducts.map(async (product) => {
                return productRef.collection('selectedProducts').add(product);
            });
            await Promise.all(selectedProductPromises);
        }

        if (components && components.length > 0) {
            const componentPromises = components.map(async (component) => {
                return productRef.collection('components').add(component);
            });
            await Promise.all(componentPromises);
        }

        res.status(200).send({
            message: 'Sản phẩm đã được thêm thành công!',
            productId: productRef.id,
        });
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error.message || error);
        res.status(500).send({ message: 'Lỗi server.', error: error.message });
    }
};

const getProducts = async (req, res) => {
    try {
        const productsSnapshot = await db.collection('products').get();

        if(productsSnapshot.empty) {
            return res.status(200).send([]);
        }
        
        const products = await Promise.all(productsSnapshot.docs.map(async (doc) => {
            const productData = doc.data();

            const selectedProductSnapshot = await db.collection('products').doc(doc.id).collection('selectedProducts').get();
            const componentsSnapshot = await db.collection('products').doc(doc.id).collection('components').get();

            const selectedProduct = selectedProductSnapshot.docs.map(subDoc => subDoc.data());
            const components = componentsSnapshot.docs.map(subDoc => subDoc.data());

            return {
                id: doc.id,
                ...productData,
                selectedProduct,
                components,
            };
        }));

        products.sort((a, b) => {
            if (a.status !== b.status) {
                return a.status === true ? -1 : 1;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.status(200).send({
            message: 'Danh sách sản phẩm đã được lấy thành công!',
            products: products,
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error.message || error);
        res.status(500).send({ message: 'Lỗi server.', error: error.message });
    }
};

const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const productDoc = await db.collection('products').doc(id).get();

        if (!productDoc.exists) {
            return res.status(404).send({ message: 'Sản phẩm không tồn tại!' });
        }
        const productData = productDoc.data();
        const selectedProductSnapshot = await db.collection('products').doc(id).collection('selectedProducts').get();
        const componentsSnapshot = await db.collection('products').doc(id).collection('components').get();
        const selectedProduct = selectedProductSnapshot.docs.map(subDoc => subDoc.data());
        const components = componentsSnapshot.docs.map(subDoc => subDoc.data());

        const product = {
            id: productDoc.id,
            ...productData,
            selectedProduct,
            components,
        };

        res.status(200).send({
            message: 'Thông tin sản phẩm đã được lấy thành công!',
            product: product,
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin sản phẩm:', error.message || error);
        res.status(500).send({ message: 'Lỗi server.', error: error.message });
    }
};

// const updateProduct = async (req, res) => {
//     try {
//         const productId = req.params.id;
//         const { name, price, unit, type, notes, selectedProducts, components, images } = req.body;
//         const productData = {
//             name,
//             price,
//             unit,
//             type,
//             notes: notes || '',
//             updatedAt: new Date().toISOString(),
//         };

//         const productRef = db.collection('products').doc(productId);
//         await productRef.update(productData);

//         let imageUrls = [];

//         if (images && images.length > 0) {
//             const hasBase64Image = images.some(image => image.startsWith('data:image/'));

//             if (hasBase64Image) {
//                 await deleteAllFilesInFolder(productId);
//             }

//             const uploadPromises = images.map(async (image, index) => {
//                 try {
//                     if (image.startsWith('data:image/')) {
//                         const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
//                         if (!matches) {
//                             console.error('Invalid base64 image format:', image);
//                             return;
//                         }

//                         const fileType = matches[1];
//                         const fileData = matches[2];
//                         const fileName = `products/${productId}/file_${index + 1}_${Date.now()}.${fileType.split('/')[1]}`;
//                         const bucketFile = bucket.file(fileName);
//                         const buffer = Buffer.from(fileData, 'base64');

//                         await bucketFile.save(buffer, {
//                             metadata: { 
//                                 contentType: fileType,
//                                 cacheControl: 'no-cache',
//                              },
//                             public: true,
//                         });
//                         return bucketFile.publicUrl();
//                     } else if (image.startsWith('http')) {
//                         return image;
//                     } else {
//                         console.error('Invalid image format:', image);
//                     }
//                 } catch (error) {
//                     console.error('Error processing image:', error);
//                 }
//             });

//             imageUrls = await Promise.all(uploadPromises);
//         }

//         if (imageUrls.length > 0) {
//             await productRef.update({ imageUrls: imageUrls });
//         }

//         const selectedProductsSnapshot = await productRef.collection('selectedProducts').get();
//         const deleteSelectedProductsPromises = selectedProductsSnapshot.docs.map(doc => doc.ref.delete());
//         await Promise.all(deleteSelectedProductsPromises);

//         if (selectedProducts && selectedProducts.length > 0) {
//             const selectedProductPromises = selectedProducts.map(async (product) => {
//                 return productRef.collection('selectedProducts').add(product);
//             });
//             await Promise.all(selectedProductPromises);
//         }

//         const componentsSnapshot = await productRef.collection('components').get();
//         const deleteComponentsPromises = componentsSnapshot.docs.map(doc => doc.ref.delete());
//         await Promise.all(deleteComponentsPromises);

//         if (components && components.length > 0) {
//             const componentPromises = components.map(async (component) => {
//                 return productRef.collection('components').add(component);
//             });
//             await Promise.all(componentPromises);
//         }

//         res.status(200).send({
//             message: 'Sản phẩm đã được cập nhật thành công!',
//             productId: productId,
//         });
//     } catch (error) {
//         console.error('Lỗi khi cập nhật sản phẩm:', error.message || error);
//         res.status(500).send({ message: 'Lỗi server.', error: error.message });
//     }
// };
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, price, unit, type, category, notes, selectedProducts, components, images } = req.body;
        const productData = {
            name,
            price,
            unit,
            category,
            type,
            notes: notes || '',
            updatedAt: new Date().toISOString(),
        };

        const productRef = db.collection('products').doc(productId);
        await productRef.update(productData);

        let imageUrls = [];
        let retainedFileNames = [];

        if (images && images.length > 0) {
            retainedFileNames = images
                .filter(image => image.startsWith('http'))
                .map(image => {
                    const decodedUrl = decodeURIComponent(image);
                    return fileName = decodedUrl.split('/').pop();
                });

            await deleteUnwantedFiles(productId, retainedFileNames);

            const uploadPromises = images.map(async (image, index) => {
                try {
                    if (image.startsWith('data:image/')) {
                        const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
                        if (!matches) {
                            console.error('Invalid base64 image format:', image);
                            return;
                        }

                        const fileType = matches[1];
                        const fileData = matches[2];
                        const fileName = `products/${productId}/file_${Date.now()}.${fileType.split('/')[1]}`;
                        const bucketFile = bucket.file(fileName);
                        const buffer = Buffer.from(fileData, 'base64');

                        await bucketFile.save(buffer, {
                            metadata: {
                                contentType: fileType,
                                cacheControl: 'no-cache',
                            },
                            public: true,
                        });

                        return bucketFile.publicUrl();
                    } else if (image.startsWith('http')) {
                        return image;
                    } else {
                        console.error('Invalid image format:', image);
                    }
                } catch (error) {
                    console.error('Error processing image:', error);
                }
            });

            imageUrls = await Promise.all(uploadPromises);
        }

        if (imageUrls.length > 0) {
            await productRef.update({ imageUrls });
        }

        const selectedProductsSnapshot = await productRef.collection('selectedProducts').get();
        const deleteSelectedProductsPromises = selectedProductsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deleteSelectedProductsPromises);

        if (selectedProducts && selectedProducts.length > 0) {
            const selectedProductPromises = selectedProducts.map(async (product) => {
                return productRef.collection('selectedProducts').add(product);
            });
            await Promise.all(selectedProductPromises);
        }

        const componentsSnapshot = await productRef.collection('components').get();
        const deleteComponentsPromises = componentsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deleteComponentsPromises);

        if (components && components.length > 0) {
            const componentPromises = components.map(async (component) => {
                return productRef.collection('components').add(component);
            });
            await Promise.all(componentPromises);
        }

        res.status(200).send({
            message: 'Sản phẩm đã được cập nhật thành công!',
            productId: productId,
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error.message || error);
        res.status(500).send({ message: 'Lỗi server.', error: error.message });
    }
};

const changeProductStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const productRef = db.collection('products').doc(id);
        const docSnapshot = await productRef.get();

        if (!docSnapshot.exists) {
            return res.status(404).send({ message: 'Không tìm thấy sản phẩm.' });
        }

        await productRef.update({ status });

        const message = status ? 'Sản phẩm đã được khôi phục.' : 'Sản phẩm đã được ẩn.';
        res.status(200).send({ message });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái sản phẩm:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

module.exports = {
    addProduct,
    getProducts,
    getProductById,
    updateProduct,
    changeProductStatus,
};
