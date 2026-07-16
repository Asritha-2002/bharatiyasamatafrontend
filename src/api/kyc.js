import api from './axios.js';

export const getMyKyc = () => api.get('/kyc/me');

export const submitKyc = ({ aadhaarNumber, accountHolderName, bankAccountNumber, ifscCode, aadhaarImage, chequeImage }) => {
  const formData = new FormData();
  formData.append('aadhaarNumber', aadhaarNumber);
  formData.append('accountHolderName', accountHolderName);
  formData.append('bankAccountNumber', bankAccountNumber);
  formData.append('ifscCode', ifscCode);
  if (aadhaarImage) formData.append('aadhaarImage', aadhaarImage);
  if (chequeImage) formData.append('chequeImage', chequeImage);
  return api.post('/kyc', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};