const convertImageToJPG = (file) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onloadend = () => {
            img.src = reader.result;
        };

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to convert image to JPG'));
                }
            }, 'image/jpeg');
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const splitContent = (content, chunkSize = 1000 * 1000) => {
    const chunks = [];
    for (let i = 0; i < content.length; i += chunkSize) {
        chunks.push(content.substring(i, i + chunkSize));
    }
    return chunks;
};

export { convertImageToJPG, splitContent };
