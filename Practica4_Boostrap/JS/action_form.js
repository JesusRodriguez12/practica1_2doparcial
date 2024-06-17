document.addEventListener('DOMContentLoaded', loadTasks);
document.getElementById('taskForm').addEventListener('submit', addTask);
document.getElementById('search').addEventListener('input', searchTasks);
document.getElementById('allTasks').addEventListener('click', () => filterTasks('all'));
document.getElementById('pendingTasks').addEventListener('click', () => filterTasks('pending'));
document.getElementById('resolvedTasks').addEventListener('click', () => filterTasks('resolved'));
document.getElementById('expiredTasks').addEventListener('click', () => filterTasks('expired'));

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => renderTask(task));
}

function addTask(e) {
    e.preventDefault();

    const taskName = document.getElementById('taskName').value;
    const taskStart = document.getElementById('taskStart').value;
    const taskEnd = document.getElementById('taskEnd').value;
    const taskResponsible = document.getElementById('taskResponsible').value;

    if (new Date(taskStart) > new Date(taskEnd)) {
        alert('La fecha de fin no puede ser anterior a la fecha de inicio.');
        return;
    }

    const task = {
        id: Date.now(),
        name: taskName,
        start: taskStart,
        end: taskEnd,
        responsible: taskResponsible,
        resolved: false
    };

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    renderTask(task);

    document.getElementById('taskForm').reset();
}

function renderTask(task) {
    const taskList = document.getElementById('taskList');

    const taskItem = document.createElement('li');
    taskItem.className = `list-group-item ${task.resolved ? 'list-group-item-success' : ''}`;
    taskItem.dataset.id = task.id;

    const taskContent = document.createElement('div');
    taskContent.className = 'd-flex justify-content-between align-items-center';

    const taskInfo = document.createElement('div');
    taskInfo.innerHTML = `<strong>${task.name}</strong> <br> Inicio: ${task.start} - Fin: ${task.end} <br> Responsable: ${task.responsible}`;
    taskInfo.className = isTaskExpired(task) ? 'text-danger' : task.resolved ? 'text-secondary' : '';

    const taskActions = document.createElement('div');

    const resolveButton = document.createElement('button');
    resolveButton.className = 'btn btn-success btn-sm mr-2';
    resolveButton.textContent = 'Resolver';
    resolveButton.onclick = () => toggleResolveTask(task.id, true);

    const unresolveButton = document.createElement('button');
    unresolveButton.className = 'btn btn-warning btn-sm mr-2';
    unresolveButton.textContent = 'Desmarcar';
    unresolveButton.onclick = () => toggleResolveTask(task.id, false);
    unresolveButton.style.display = task.resolved ? 'inline-block' : 'none';

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger btn-sm';
    deleteButton.textContent = 'Eliminar';
    deleteButton.onclick = () => deleteTask(task.id);

    if (!task.resolved && !isTaskExpired(task)) {
        taskActions.appendChild(resolveButton);
    }
    if (task.resolved) {
        taskActions.appendChild(unresolveButton);
    }
    taskActions.appendChild(deleteButton);

    taskContent.appendChild(taskInfo);
    taskContent.appendChild(taskActions);
    taskItem.appendChild(taskContent);
    taskList.appendChild(taskItem);
}

function toggleResolveTask(id, resolve) {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex > -1) {
        tasks[taskIndex].resolved = resolve;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        refreshTaskList();
    }
}

function deleteTask(id) {
    if (confirm('¿Está seguro de que desea eliminar esta tarea?')) {
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        const filteredTasks = tasks.filter(task => task.id !== id);
        localStorage.setItem('tasks', JSON.stringify(filteredTasks));
        refreshTaskList();
    }
}

function refreshTaskList() {
    document.getElementById('taskList').innerHTML = '';
    loadTasks();
}

function isTaskExpired(task) {
    return new Date(task.end) < new Date();
}

function searchTasks(e) {
    const searchTerm = e.target.value.toLowerCase();
    const tasks = document.querySelectorAll('#taskList .list-group-item');
    tasks.forEach(task => {
        const taskName = task.querySelector('strong').textContent.toLowerCase();
        if (taskName.includes(searchTerm)) {
            task.style.display = '';
        } else {
            task.style.display = 'none';
        }
    });
}

function filterTasks(filter) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    document.getElementById('taskList').innerHTML = '';
    tasks.forEach(task => {
        if (filter === 'all' ||
            (filter === 'pending' && !task.resolved && !isTaskExpired(task)) ||
            (filter === 'resolved' && task.resolved) ||
            (filter === 'expired' && isTaskExpired(task))) {
            renderTask(task);
        }
    });
}
