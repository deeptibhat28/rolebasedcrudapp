import axios from 'axios';
const API_URL = 'https://6a90168dff2484963a5db61a.mockapi.io';

export const loginUser = async (username, password) => {
    const response = await axios.get(`${API_URL}/users`);
    const users = response.data;
    const user = users.find(
        (u) => u && u.username === username && u.password === password
    );

    if (!user) {
        throw new Error("Invalid username or password");
    }

    return user;
};

export const registerUser = async (userData) => {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
};

// ONLY return actual form submissions, filtering out system activity logs (which have an 'action' field)
export const getSubmissions = async () => {
    const response = await axios.get(`${API_URL}/activity-logs`);
    return response.data.filter(item => item.fullName && !item.action);
};

export const createSubmission = async (formData) => {
    const response = await axios.post(`${API_URL}/activity-logs`, formData);
    return response.data;
};

export const updateSubmission = async (id, formData) => {
    const response = await axios.put(`${API_URL}/activity-logs/${id}`, formData);
    return response.data;
};

export const deleteSubmission = async (id) => {
    const response = await axios.delete(`${API_URL}/activity-logs/${id}`);
    return response.data;
};

export const getUsers = async () => {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
};