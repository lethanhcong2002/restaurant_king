const { db, bucket } = require('../firebaseConfig.cjs');

const getPopularTimeSlots = async (req, res) => {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const invoicesSnapshot = await db.collection('invoices').get();
        const invoices = invoicesSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        }));

        const timeSlots = new Array(24).fill(0);

        invoices.forEach(invoice => {
            let timeKey = null;

            if (invoice.appointmentTime) {
                const appointmentDate = new Date(invoice.appointmentTime);

                if (appointmentDate.getMonth() === currentMonth && appointmentDate.getFullYear() === currentYear) {
                    timeKey = appointmentDate.getHours();
                }
            } else if (invoice.createdAt) {
                const createdAtDate = new Date(invoice.createdAt);

                if (createdAtDate.getMonth() === currentMonth && createdAtDate.getFullYear() === currentYear) {
                    timeKey = createdAtDate.getHours();
                }
            }

            if (timeKey !== null) {
                timeSlots[timeKey]++;
            }
        });

        const timeSlotsWithCounts = timeSlots.map((count, hour) => ({
            hour,
            count,
        }));

        const sortedTimeSlots = timeSlotsWithCounts.sort((a, b) => b.count - a.count);

        const top5TimeSlots = sortedTimeSlots.slice(0, 5);

        res.status(200).json({
            success: true,
            data: {
                top5TimeSlots,
            },
        });
    } catch (error) {
        console.error('Error in /popular_times:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách khung giờ phổ biến',
            error: error.message,
        });
    }
};

const getTop10ItemsFromInvoices = async (req, res) => {
    try {
        const invoicesSnapshot = await db.collection('invoices').where('status', '==', 2).get();

        const itemCallCount = {};

        for (const invoiceDoc of invoicesSnapshot.docs) {
            const invoiceId = invoiceDoc.id;

            const selectedItemsSnapshot = await db.collection('invoices')
                .doc(invoiceId)
                .collection('selectedItems')
                .get();

            selectedItemsSnapshot.docs.forEach(itemDoc => {
                const { itemId, name } = itemDoc.data();

                if (itemCallCount[itemId]) {
                    itemCallCount[itemId].count++;
                } else {
                    itemCallCount[itemId] = {
                        count: 1,
                        name,
                    };
                }
            });
        }

        const productsSnapshot = await db.collection('products').get();
        const products = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
        }));

        const matchedItems = [];

        for (const [itemId, itemData] of Object.entries(itemCallCount)) {
            const matchedProduct = products.find(product => product.id === itemId && product.name === itemData.name);
            if (matchedProduct) {
                matchedItems.push({
                    name: matchedProduct.name,
                    count: itemData.count,
                });
            }
        }

        const top10Items = matchedItems
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        res.status(200).json({
            success: true,
            data: top10Items,
        });
    } catch (error) {
        console.error('Error in /top10-items:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách món ăn phổ biến',
            error: error.message,
        });
    }
};

module.exports = {
    getPopularTimeSlots,
    getTop10ItemsFromInvoices,
};
