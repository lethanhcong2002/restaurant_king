const formatDateVer1 = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('/');
    return `${day}/${month}/${year}`;
};

const formatDateVer2 = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};

const convertDateVer1 = (dateString) => {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

function formatDateTime(isoString) {
    const date = new Date(isoString);
    const localeDateTime = date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    return localeDateTime;
}

function formatDate(isoString) {
    const date = new Date(isoString);
    const localeDate = date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return localeDate;
}

export { formatDateVer1, formatDateVer2, convertDateVer1, formatDateTime, formatDate }