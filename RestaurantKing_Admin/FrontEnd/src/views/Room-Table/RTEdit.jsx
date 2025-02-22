/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef} from 'react';
import { CCard, CCardBody, CCardHeader, CForm, CFormLabel, CFormInput, CFormTextarea, CButton } from '@coreui/react';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode.react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function RTEdit() {
    const { id } = useParams();
    const data = useSelector(state => state.data);
    const [generatedId, setGeneratedId] = useState(data.generatedId || '');
    const [tableName, setTableName] = useState(data.tableName || '');
    const [note, setNote] = useState(data.note || '');
    const qrCodeRef = useRef();
    const navigate = useNavigate();

    const handleGenerateQRCode = () => {
        const newId = uuidv4();
        setGeneratedId(newId);
    };

    const handleDownloadQRCode = () => {
        if (!qrCodeRef.current) {
            console.error('QR Code reference is null');
            return;
        }

        const canvas = qrCodeRef.current.querySelector('canvas');
        if (!canvas) {
            console.error('Canvas not found in QR Code reference');
            return;
        }

        const padding = 20;
        const qrSize = canvas.width;
        const textHeight = 20;

        const newCanvas = document.createElement('canvas');
        newCanvas.width = qrSize + padding * 2;
        newCanvas.height = qrSize + textHeight + padding * 2;
        const newContext = newCanvas.getContext('2d');

        newContext.fillStyle = 'white';
        newContext.fillRect(0, 0, newCanvas.width, newCanvas.height);

        newContext.fillStyle = 'black';
        newContext.font = '16px Arial';
        newContext.textAlign = 'center';
        newContext.fillText(tableName, newCanvas.width / 2, padding + textHeight - 5);

        newContext.drawImage(canvas, padding, padding + textHeight);

        const pngUrl = newCanvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${tableName}-${generatedId}.png`;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const handlePrintQRCode = () => {
        const canvas = qrCodeRef.current.querySelector('canvas');
        const dataUrl = canvas.toDataURL('image/png');
        const newWindow = window.open();
        newWindow.document.write(`<img src="${dataUrl}" onload="window.print();window.close();" />`);
        newWindow.document.close();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!tableName || !generatedId) {
            alert('Tên bàn và mã UID là bắt buộc.');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:5000/tables/updateTable/${id}`, {
                tableName,
                note,
                generatedId,
            });

            alert(response.data.message);
            navigate(-1);
        } catch (error) {
            console.error('Error updating table:', error);
            alert('Lỗi khi chỉnh sửa bàn');
        }
    };

    return (
        <>
            <CCard style={{ marginBottom: '1rem' }}>
                <CCardHeader>
                    Chỉnh sửa bàn
                </CCardHeader>
                <CCardBody>
                    <CForm onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <CFormLabel htmlFor="tableName">Tên bàn</CFormLabel>
                            <CFormInput
                                type="text"
                                id="tableName"
                                placeholder="Nhập tên bàn"
                                value={tableName}
                                onChange={(e) => setTableName(e.target.value)}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <CFormLabel htmlFor="note">Ghi chú</CFormLabel>
                            <CFormTextarea
                                id="note"
                                rows="3"
                                placeholder="Nhập ghi chú"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <CButton color="primary" onClick={handleGenerateQRCode}>Tạo QR Code</CButton>
                        </div>

                        {generatedId && (
                            <div ref={qrCodeRef}>
                                <CFormLabel htmlFor="uid">Mã UID</CFormLabel>
                                <CFormInput type="text" id="uid" value={generatedId} readOnly />
                                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                    <h5>{tableName}</h5>
                                    <QRCode value={generatedId} />
                                </div>
                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                    <CButton color="success" onClick={handleDownloadQRCode}>Tải QR Code</CButton>
                                    <CButton color="info" onClick={handlePrintQRCode} disabled>In QR Code</CButton>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <CButton color="secondary" className="me-2" onClick={() => navigate(-1)}>Hủy</CButton>
                            <CButton color="primary" type="submit">Lưu</CButton>
                        </div>
                    </CForm>
                </CCardBody>
            </CCard>
        </>
    );
}
