import axios from 'axios';

const API_ENDPOINT = 'https://t337uvx41k.execute-api.eu-north-1.amazonaws.com/prod/';


export const fetchTodos = async () => {
    try {
        const response = await axios.get(`${API_ENDPOINT}/todos`);
        return response.data;
    } catch (error) {
        console.error('Error fetching todos:', error);
        throw error;
    }
};

