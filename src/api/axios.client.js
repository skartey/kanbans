import axios from "axios";

const api = axios.create({
    baseURL: 'https://todo-list.edu-playground.ru/api/v1',
})

export default api;