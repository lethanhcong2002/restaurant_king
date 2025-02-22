const calculateTotalAmount = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        return 0;
    }
    return items.reduce((total, item) => {
        const price = item.price || 0;
        const quantity = item.quantity || 1;
        return total + (price * quantity);
    }, 0);
};

export { calculateTotalAmount };
