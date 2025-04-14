import api from '../api/axios';

export const registerUser = async (formData) => {
    return api.post('/auth/register', formData); // make sure this matches your backend route
};

export const loginUser = async (formData) => {
    return api.post('/auth/login', formData); // make sure this matches your backend route
};