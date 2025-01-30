const { useState, useEffect } = React;

function TaskManager() {
    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskReminderTime, setTaskReminderTime] = useState('');
    const [notification, setNotification] = useState(null);
    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => {
        const timers = tasks.map(task => {
            if (!task.completed) {
                const timeLeft = new Date(task.reminderTime).getTime() - Date.now();
                if (timeLeft > 0) {
                    return setTimeout(() => {
                        showNotification(task.title);
                        setNotification(`Задача "${task.title}" просрочена!`);
                    }, timeLeft);
                }
            }
            return null;
        });

        return () => {
            timers.forEach(timer => timer && clearTimeout(timer));
        };
    }, [tasks]);

    const addTask = () => {
        if (!taskTitle || !taskReminderTime) {
            alert('Пожалуйста, заполните оба поля: название и время напоминания.');
            return;
        }

        const newTask = {
            id: Date.now(),
            title: taskTitle,
            reminderTime: taskReminderTime,
            completed: false // По умолчанию задача не завершена
        };

        setTasks([...tasks, newTask]);
        setTaskTitle('');
        setTaskReminderTime('');
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    const toggleComplete = (id) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const startEditing = (task) => {
        setEditingTask(task);
        setTaskTitle(task.title);
        setTaskReminderTime(task.reminderTime);
    };

    const saveTask = () => {
        if (!taskTitle || !taskReminderTime) {
            alert('Пожалуйста, заполните оба поля: название и время напоминания.');
            return;
        }

        const updatedTasks = tasks.map(task =>
            task.id === editingTask.id
                ? { ...task, title: taskTitle, reminderTime: taskReminderTime }
                : task
        );

        setTasks(updatedTasks);
        setEditingTask(null);
        setTaskTitle('');
        setTaskReminderTime('');
    };

    const dismissNotification = () => {
        setNotification(null);
    };

    const showNotification = (title) => {
        if (!("Notification" in window)) {
            alert("Ваш браузер не поддерживает уведомления.");
            return;
        }

        if (Notification.permission === "granted") {
            new Notification(`Задача "${title}" просрочена!`);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(`Задача "${title}" просрочена!`);
                }
            });
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto mt-8">
            <div className="mb-4 p-6 form-container">
                <h2 className="text-2xl font-bold mb-4 title">Менеджер задач</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="task-title" className="block text-sm font-medium text-gray-700">Название задачи</label>
                        <input
                            id="task-title"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Введите название задачи"
                        />
                    </div>
                    <div>
                        <label htmlFor="task-reminder-time" className="block text-sm font-medium text-gray-700">Время напоминания</label>
                        <input
                            id="task-reminder-time"
                            value={taskReminderTime}
                            onChange={(e) => setTaskReminderTime(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            type="datetime-local"
                        />
                    </div>
                </div>
                <button
                    onClick={editingTask ? saveTask : addTask}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md button"
                >
                    {editingTask ? 'Сохранить задачу' : 'Добавить задачу'}
                </button>
                {editingTask && (
                    <button
                        onClick={() => {
                            setEditingTask(null);
                            setTaskTitle('');
                            setTaskReminderTime('');
                        }}
                        className="mt-4 ml-2 px-4 py-2 bg-gray-500 text-white rounded-md button"
                    >
                        Отмена
                    </button>
                )}
            </div>

            <div className="p-6 border rounded-lg shadow-sm bg-white bg-opacity-90">
                <h2 className="text-2xl font-bold mb-4 title">Задачи</h2>
                {tasks.length === 0 ? (
                    <p className="text-center text-gray-500">Задач нет.</p>
                ) : (
                    <div className="task-list">
                        {tasks.map(task => (
                            <div
                                key={task.id}
                                className={`flex flex-col p-4 mb-2 task-card ${
                                    task.completed ? 'completed-task' : ''
                                }`}
                            >
                                <div className="task-content">
                                    <p className="font-semibold">{task.title}</p>
                                    <p className="text-gray-500">Время напоминания: {new Date(task.reminderTime).toLocaleString()}</p>
                                </div>
                                <div className="flex space-x-2 mt-2">
                                    {!task.completed && (
                                        <button
                                            onClick={() => toggleComplete(task.id)}
                                            className="px-2 py-1 complete-button rounded-md"
                                        >
                                            Выполнено
                                        </button>
                                    )}
                                    <button
                                        onClick={() => startEditing(task)}
                                        className={`px-2 py-1 bg-yellow-500 text-white rounded-md button ${
                                            task.completed ? 'disabled-button' : ''
                                        }`}
                                        disabled={task.completed}
                                    >
                                        Редактировать
                                    </button>
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="px-2 py-1 bg-red-500 text-white rounded-md button delete-button"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {notification && (
                <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 text-yellow-900 rounded-lg notification">
                    <div className="flex items-center justify-between">
                        <p>{notification}</p>
                        <button
                            onClick={dismissNotification}
                            className="px-2 py-1 border border-yellow-300 rounded-md hover:bg-yellow-200"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Рендерим компонент в DOM
ReactDOM.createRoot(document.getElementById('root')).render(<TaskManager />);