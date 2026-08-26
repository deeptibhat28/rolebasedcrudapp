import axios from 'axios';
const API_URL = 'http://localhost:5000';

export const loginUser = async (username, password) => {
    const response = await axios.get(`${API_URL}/users?username=${username}&password=${password}`);
    return response.data[0];
};

export const registerUser = async (userData) => {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
};

export const getSubmissions = async () => {
    const response = await axios.get(`${API_URL}/submissions`);
    return response.data;
};

export const createSubmission = async (formData) => {
    const response = await axios.post(`${API_URL}/submissions`, formData);
    return response.data;
};

export const updateSubmission = async (id, formData) => {
    const response = await axios.put(`${API_URL}/submissions/${id}`, formData);
    return response.data;
};

export const deleteSubmission = async (id) => {
    await axios.delete(`${API_URL}/submissions/${id}`);
};

export const getUsers = async () => {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
}