document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const todoColumn = document.getElementById('todo-tasks');
    const inProgressColumn = document.getElementById('in-progress-tasks');
    const doneColumn = document.getElementById('done-tasks');

    // Fonction pour appliquer la couleur en fonction de la deadline
    function getDeadlineColor(deadline) {
        const currentDate = new Date(); // Date actuelle
        const deadlineDate = new Date(deadline);

        // Comparaison des dates pour déterminer la couleur
        if (deadlineDate < currentDate) {
            return 'overdue'; // Deadline passée
        } else if ((deadlineDate - currentDate) <= 3 * 24 * 60 * 60 * 1000) { // Moins de 3 jours
            return 'urgent'; // Tâche urgente (moins de 3 jours)
        } else {
            return 'on-time'; // Tâche à temps
        }
    }

    // Fonction pour afficher les tâches en fonction de leur statut
    function displayTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        // Vider les colonnes avant de les remplir à nouveau
        todoColumn.innerHTML = '';
        inProgressColumn.innerHTML = '';
        doneColumn.innerHTML = '';

        tasks.forEach((task, index) => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item', task.status);

            // Appliquer la couleur de la tâche en fonction de la deadline
            const deadlineColor = getDeadlineColor(task.deadline);
            taskItem.classList.add(deadlineColor); // Ajouter la classe pour la couleur

            taskItem.setAttribute('draggable', 'true'); // Rendre la tâche déplaçable
            taskItem.dataset.index = index; // Ajouter l'index de la tâche pour la retrouver lors du déplacement

            const taskTitleElem = document.createElement('p');
            taskTitleElem.textContent = task.title;

            const taskStatusElem = document.createElement('span');
            taskStatusElem.textContent = task.status;
            taskStatusElem.classList.add('status');

            // Créer le select pour l'attribution de la tâche
            const assignTo = document.createElement('div');
            assignTo.classList.add('assign-to');
            assignTo.innerHTML = ` 
                <label>Attribué à :</label>
                <select class="assign-select">
                    <option value="person1" ${task.assignedTo === 'person1' ? 'selected' : ''}>
                        Angie
                    </option>
                    <option value="person2" ${task.assignedTo === 'person2' ? 'selected' : ''}>
                        Julien
                    </option>
                </select>
            `;

            // Écouter les changements dans le select d'attribution et mettre à jour le localStorage
            const assignSelect = assignTo.querySelector('.assign-select');
            assignSelect.addEventListener('change', function () {
                task.assignedTo = assignSelect.value;
                const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                tasks[index] = task;
                localStorage.setItem('tasks', JSON.stringify(tasks));
                displayTasks();
            });

            // Créer le bouton de suppression
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', function () {
                const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?');
                if (confirmed) {
                    deleteTask(index);
                }
            });

            taskItem.appendChild(taskTitleElem);
            taskItem.appendChild(taskStatusElem);
            taskItem.appendChild(assignTo);
            taskItem.appendChild(deleteButton);

            // Ajouter la tâche à la colonne appropriée
            if (task.status === 'todo') {
                todoColumn.appendChild(taskItem);
            } else if (task.status === 'in-progress') {
                inProgressColumn.appendChild(taskItem);
            } else if (task.status === 'done') {
                doneColumn.appendChild(taskItem);
            }

            // Ajouter les événements de drag-and-drop
            addDragAndDropEvents(taskItem);

            // Vérifier si la tâche est en retard et envoyer une notification si oui
            checkForDeadlineNotification(task, index);
        });

        // Ajouter les événements de drop pour chaque colonne
        [todoColumn, inProgressColumn, doneColumn].forEach(column => {
            column.addEventListener('dragover', function (e) {
                e.preventDefault();
            });

            column.addEventListener('drop', function (e) {
                e.preventDefault();
                const taskIndex = e.dataTransfer.getData('text');
                const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                const task = tasks[taskIndex];

                if (column === todoColumn) {
                    task.status = 'todo';
                } else if (column === inProgressColumn) {
                    task.status = 'in-progress';
                } else if (column === doneColumn) {
                    task.status = 'done';
                }

                tasks[taskIndex] = task;
                localStorage.setItem('tasks', JSON.stringify(tasks));
                displayTasks();
            });
        });
    }

    // Fonction pour ajouter les événements drag-and-drop
    function addDragAndDropEvents(taskItem) {
        taskItem.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text', taskItem.dataset.index);
        });
    }

    // Fonction pour vérifier la date limite et envoyer une notification
    function checkForDeadlineNotification(task, index) {
        const currentDate = new Date();
        const deadlineDate = new Date(task.deadline);

        if (deadlineDate <= currentDate && task.status !== 'done') {
            if (Notification.permission === "granted") {
                new Notification("Tâche en retard", {
                    body: `La tâche "${task.title}" est arrivée à échéance.`,
                    icon: 'assets/IMG/logo1fo.png'
                });
            }
        }
    }

    // Fonction pour supprimer une tâche
    function deleteTask(index) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks();
    }

    // Afficher les tâches au chargement
    displayTasks();

    // Ouvrir la modal
    const openModalBtn = document.getElementById('openModalBtn');
    const taskModal = document.getElementById('taskModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    openModalBtn.addEventListener('click', () => {
        taskModal.style.display = 'block';
    });

    // Fermer la modal
    closeModalBtn.addEventListener('click', () => {
        taskModal.style.display = 'none';
    });

    // Fermer la modal si l'utilisateur clique à l'extérieur de la modal
    window.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            taskModal.style.display = 'none';
        }
    });

    // Ajouter une tâche via la modal
    const taskForm = document.getElementById('taskForm');

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('taskTitle').value;
        const deadline = document.getElementById('taskDeadline').value;
        const priority = document.getElementById('taskPriority').value;

        const newTask = {
            title: title,
            status: 'todo', // Nouvelle tâche commencée comme "todo"
            deadline: deadline,
            assignedTo: 'person1', // Par défaut, attribuer à Angie
            priority: priority
        };

        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.unshift(newTask); // Ajouter la nouvelle tâche en haut de la liste

        localStorage.setItem('tasks', JSON.stringify(tasks));

        taskForm.reset(); // Réinitialiser le formulaire
        displayTasks(); // Rafraîchir l'affichage

        taskModal.style.display = 'none'; // Fermer la modal
    });
});
