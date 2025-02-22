const convertImageToBase64JPG = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.readAsDataURL(file);
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                ctx.drawImage(img, 0, 0);
                
                const base64JPG = canvas.toDataURL('image/jpeg');
                resolve(base64JPG);
            };
            img.onerror = (error) => {
                reject(error);
            };
        };
        reader.onerror = (error) => {
            reject(error);
        };
    });
};

export { convertImageToBase64JPG };