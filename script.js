function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('tr-TR');
    document.getElementById('current-date').innerText = now.toLocaleDateString('tr-TR');
    
    let gun = now.toLocaleDateString('tr-TR', { weekday: 'long' });
    document.getElementById('current-day').innerText = gun.charAt(0).toUpperCase() + gun.slice(1).toLowerCase();
}
setInterval(updateClock, 1000);
updateClock();

window.onload = function() {
    const savedTodos = JSON.parse(localStorage.getItem('myTodos')) || [];
    savedTodos.forEach(t => renderTodo(t));
    const savedDone = JSON.parse(localStorage.getItem('myDoneTodos')) || [];
    savedDone.forEach(t => renderDoneTodo(t));
};

function addTodo() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();
    if (text !== "") {
        const tarih = new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
        const fullText = `${text} <span class="tarih-etiketi">(${tarih})</span>`;
        renderTodo(fullText);
        saveTodos();
        input.value = "";
    }
}

function renderTodo(text) {
    const ul = document.getElementById('todo-list');
    const li = document.createElement('li');
    li.innerHTML = `<span class="gorev-metni">${text}</span><button onclick="removeTodo(this)">Sil</button>`;
    ul.appendChild(li);
}

function removeTodo(btn) {
    const li = btn.parentElement;
    renderDoneTodo(li.querySelector('.gorev-metni').innerHTML);
    li.remove();
    saveTodos();
    saveDoneTodos();
}

function renderDoneTodo(text) {
    const ul = document.getElementById('done-list');
    const li = document.createElement('li');
    li.innerHTML = `<span class="gorev-metni">${text}</span><div><button class="btn-geri" onclick="restoreTodo(this)">Geri</button><button onclick="this.parentElement.parentElement.remove();saveDoneTodos();">Sil</button></div>`;
    ul.appendChild(li);
}

function restoreTodo(btn) {
    const li = btn.parentElement.parentElement;
    renderTodo(li.querySelector('.gorev-metni').innerText.split('(')[0]);
    li.remove();
    saveTodos();
    saveDoneTodos();
}

function saveTodos() {
    const todos = [];
    document.querySelectorAll('#todo-list li .gorev-metni').forEach(s => todos.push(s.innerHTML));
    localStorage.setItem('myTodos', JSON.stringify(todos));
}

function saveDoneTodos() {
    const todos = [];
    document.querySelectorAll('#done-list li .gorev-metni').forEach(s => todos.push(s.innerHTML));
    localStorage.setItem('myDoneTodos', JSON.stringify(todos));
}

const isik = document.createElement('div');
isik.classList.add('epic-light');
document.body.appendChild(isik);
document.addEventListener('mousemove', (e) => {
    isik.style.left = e.clientX + 'px';
    isik.style.top = e.clientY + 'px';
});
