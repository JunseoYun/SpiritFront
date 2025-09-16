// Normalize an image/file object to FormData-friendly field
// Expected input shape: from react-native-image-crop-picker { path, mime, filename }
// Falls back safely if some fields are missing
export const toFileField = (file, fallbackName = 'image') => {
  if (!file) return null;
  const uri = file.path?.startsWith('file://')
    ? file.path
    : `file://${file.path}`;
  const type = file.mime || 'image/jpeg';
  const name = file.filename || `${fallbackName}_${Date.now()}.jpg`;
  return {uri, type, name};
};

export default toFileField;
