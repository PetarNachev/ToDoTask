import React, { useState, useEffect } from 'react';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '../api/todoService';

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadTodos = async () => {
        setLoading(true);
        try {
            const todosData = await fetchTodos();
            setTodos(todosData);
        } catch (error) {
            console.error('Error loading todos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTodos();
    }, []);

    return (
        <div className="container">
            <h1>Todo List</h1>
            <div className="input-container">
                <input
                    type="text"
                    placeholder="Title"
                />
                <input
                    type="text"
                    placeholder="Description"
                />
                <button>Add Todo</button>
            </div>

            {loading ? (
                <div className="loading-indicator">Loading...</div>
            ) : (
                <ul>
                    {todos.map(todo => (
                        <li key={todo.id}>
                            <div>
                                <strong>Title:</strong> {todo.title}
                            </div>
                            <div className="todo-description">
                                <strong>Description:</strong> {todo.description}
                            </div>
                            <div className="last-updated">
                                <strong>Last Updated:</strong> {todo.lastUpdated ? new Date(todo.lastUpdated).toLocaleString() : 'N/A'}
                            </div>
                            <div className="todo-buttons">
                                <button >Edit</button>
                                <button >Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

};

export default TodoList;