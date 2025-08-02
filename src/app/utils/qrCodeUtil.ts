import QRCode from 'qrcode';

export async function generateQRCode(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, { errorCorrectionLevel: 'H' });
    return dataUrl;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw error;
  }
}
