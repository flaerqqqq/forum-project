import api from '../api/axios';

export const registerUser = async (formData) => {
    return api.post('/auth/register', formData);
};

export const loginUser = async (formData) => {
    return api.post('/auth/login', formData);
};