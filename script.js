// 1. SAAT VE SELAMLAMA
function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    document.getElementById('clock').innerText = now.toLocaleTimeString('tr-TR');
    let greeting = "Canım Anam";
    document.getElementById('greeting').innerText = greeting;
}
setInterval(updateClock, 1000);
updateClock();

// 2. VERİLERİ YÜKLE
window.onload = function() {
    const savedTodos = JSON.parse(localStorage.getItem('myTodos')) || [];
    savedTodos.forEach(todoText => renderTodo(todoText));
};

// 3. GÖREV EKLEME
function addTodo() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();
    
    if (text !== "") {
        const now = new Date();
        const tarihSaat = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
        const metinVeTarih = `${text} <span style="font-size: 11px; opacity: 0.5; margin-left: 8px;">(${tarihSaat})</span>`;
        
        renderTodo(metinVeTarih);
        saveTodos();
        input.value = "";
    }
}

// 4. EKRANA YAZDIRMA
function renderTodo(text) {
    const ul = document.getElementById('todo-list');
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${text}</span> 
        <button onclick="removeTodo(this)">Sil</button>
    `;
    ul.appendChild(li);
}

// 5. SİLME
function removeTodo(button) {
    button.parentElement.remove();
    saveTodos();
}

// 6. KAYDETME
function saveTodos() {
    const todos = [];
    document.querySelectorAll('#todo-list li').forEach(li => {
        todos.push(li.querySelector('span').innerHTML);
    });
    localStorage.setItem('myTodos', JSON.stringify(todos));
}

// DİNAMİK IŞIK
const isik = document.createElement('div');
isik.classList.add('epic-light');
document.body.appendChild(isik);
document.addEventListener('mousemove', (e) => {
    isik.style.left = e.clientX + 'px';
    isik.style.top = e.clientY + 'px';
});

