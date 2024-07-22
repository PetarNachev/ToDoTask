import React, { useState, useEffect } from 'react';
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '../api/todoService';

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newTodo, setNewTodo] = useState({ title: '', description: '' });
    const [editingTodo, setEditingTodo] = useState(null);

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

    const handleAddTodo = async () => {
        if (!newTodo.title.trim() || !newTodo.description.trim()) {
            alert("Both title and description are required.");
            return;
        }
        setLoading(true);
        try {
            await createTodo(newTodo);
            await loadTodos();
            setNewTodo({ title: '', description: '' });
        } catch (error) {
            console.error('Error adding todo:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditDialog = (todo) => {
        setEditingTodo(todo);
    };

    const handleCloseEditDialog = () => {
        setEditingTodo(null);
    };

    const handleUpdateTodo = async () => {
        if (!editingTodo.title.trim() || !editingTodo.description.trim()) {
            alert("Both title and description are required.");
            return;
        }
        try {
            const updatedTodo = await updateTodo(editingTodo.id, editingTodo);
            setTodos(todos.map(todo => (todo.id === editingTodo.id ? updatedTodo : todo)));
            handleCloseEditDialog();
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };

    const handleDeleteTodo = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this todo?");
        if (!confirmed) {
            return;
        }
        try {
            await deleteTodo(id);
            setTodos(todos.filter(todo => todo.id !== id));
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    return (
        <div className="container">
            <h1>Todo List</h1>
            <div className="input-container">
                <input
                    type="text"
                    placeholder="Title"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                />
                <button className="add-todo-button" onClick={handleAddTodo}>Add Todo</button>
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
                                <button onClick={() => handleOpenEditDialog(todo)}>Edit</button>
                                <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {editingTodo && (
                <dialog open className="dialog">
                    <h2>Edit Todo</h2>
                    <input
                        type="text"
                        placeholder="Title"
                        value={editingTodo.title}
                        onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={editingTodo.description}
                        onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                    />
                    <button onClick={handleUpdateTodo}>Update</button>
                    <button onClick={handleCloseEditDialog}>Cancel</button>
                </dialog>
            )}
        </div>
    );

};

export default TodoList;