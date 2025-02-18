document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const todoColumn = document.getElementById('todo-tasks');
    const inProgressColumn = document.getElementById('in-progress-tasks');
    const doneColumn = document.getElementById('done-tasks');

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
            taskItem.setAttribute('draggable', 'true'); // Rendre la tâche déplaçable
            taskItem.dataset.index = index; // Ajouter l'index de la tâche pour la retrouver lors du déplacement

            const taskTitleElem = document.createElement('p');
            taskTitleElem.textContent = task.title;

            const taskStatusElem = document.createElement('span');
            taskStatusElem.textContent = task.status;
            taskStatusElem.classList.add('status');

            // Créer le select pour l'attribution de la tâche avec les options d'images
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
                task.assignedTo = assignSelect.value; // Mettre à jour l'attribution
                const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                tasks[index] = task; // Mettre à jour la tâche dans le tableau
                localStorage.setItem('tasks', JSON.stringify(tasks)); // Sauvegarder dans le localStorage
                displayTasks(); // Rafraîchir l'affichage
            });

            // Créer le bouton avec une icône (par exemple une icône de corbeille)
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';  // Icône corbeille de Font Awesome
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', function () {
                const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?');
                if (confirmed) {
                    deleteTask(index);
                }
            });

            taskItem.appendChild(taskTitleElem);
            taskItem.appendChild(taskStatusElem);
            taskItem.appendChild(assignTo); // Ajouter le select d'attribution
            taskItem.appendChild(deleteButton); // Ajouter le bouton de suppression

            // Ajouter la tâche à la colonne appropriée
            if (task.status === 'todo') {
                todoColumn.appendChild(taskItem);
            } else if (task.status === 'in-progress') {
                inProgressColumn.appendChild(taskItem);
            } else if (task.status === 'done') {
                doneColumn.appendChild(taskItem);
            }

            // Ajouter les événements de drag-and-drop
            taskItem.addEventListener('dragstart', function (e) {
                e.dataTransfer.setData('text', taskItem.dataset.index); // Stocker l'index de la tâche
            });
        });

        // Ajouter les événements de drop pour chaque colonne
        [todoColumn, inProgressColumn, doneColumn].forEach(column => {
            column.addEventListener('dragover', function (e) {
                e.preventDefault(); // Permettre le drop
            });

            column.addEventListener('drop', function (e) {
                e.preventDefault();
                const taskIndex = e.dataTransfer.getData('text'); // Récupérer l'index de la tâche
                const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                const task = tasks[taskIndex];

                // Mettre à jour le statut de la tâche selon la colonne cible
                if (column === todoColumn) {
                    task.status = 'todo';
                } else if (column === inProgressColumn) {
                    task.status = 'in-progress';
                } else if (column === doneColumn) {
                    task.status = 'done';
                }

                tasks[taskIndex] = task; // Mettre à jour la tâche dans le tableau
                localStorage.setItem('tasks', JSON.stringify(tasks)); // Sauvegarder dans le localStorage
                displayTasks(); // Rafraîchir l'affichage
            });
        });
    }

    // Fonction pour supprimer une tâche
    function deleteTask(index) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.splice(index, 1); // Supprimer la tâche à l'index spécifié
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Sauvegarder les tâches mises à jour
        displayTasks(); // Mettre à jour l'affichage
    }

    // Afficher les tâches au chargement
    displayTasks();

    // Gestion de la soumission du formulaire
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const taskTitle = document.getElementById('task-title').value;
        const taskStatus = document.getElementById('task-status').value;

        const newTask = {
            title: taskTitle,
            status: taskStatus,
            assignedTo: 'person1' // Par défaut, attribuer à Angie
        };

        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(newTask);

        localStorage.setItem('tasks', JSON.stringify(tasks));

        form.reset();

        displayTasks(); // Rafraîchir l'affichage
    });
});
