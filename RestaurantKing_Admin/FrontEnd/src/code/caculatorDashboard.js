function calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) {
        return newValue > 0 ? '100%' : '0%';
    }
    const change = ((newValue - oldValue) / oldValue) * 100;
    return `${change.toFixed(2)}%`;
}
//'∞%'
export {calculatePercentageChange}