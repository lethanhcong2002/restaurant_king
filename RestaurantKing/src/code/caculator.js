const calculateTotalPrice = (selectedItems) => {
    return selectedItems.reduce((total, item) => {
        return total + item.quantity * item.price;
    }, 0);
};

export {calculateTotalPrice};
