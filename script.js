// 1. SAAT VE SELAMLAMA
function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    document.getElementById('clock').innerText = now.toLocaleTimeString('tr-TR');
    
    let greeting = hours < 12 ? "Canım Anam" : hours < 18 ? "Canım Anam" : "Canım Anam";
    document.getElementById('greeting').innerText = greeting;
}
setInterval(updateClock, 1000);
updateClock();

// 2. VERİLERİ YÜKLE (Sayfa açıldığında çalışır)
window.onload = function() {
    const savedTodos = JSON.parse(localStorage.getItem('myTodos')) || [];
    savedTodos.forEach(todoText => {
        renderTodo(todoText);
    });
};

// 3. GÖREV EKLEME FONKSİYONU
function addTodo() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();
    
    if (text !== "") {
        renderTodo(text);
        saveTodos(); // Listeyi kaydet
        input.value = "";
    }
}

// 4. EKRANA YAZDIRMA (Render)
function renderTodo(text) {
    const ul = document.getElementById('todo-list');
    const li = document.createElement('li');
    li.innerHTML = `
        ${text} 
        <button onclick="removeTodo(this)" style="margin-left:10px; background:red; border-radius:3px; color:white; border:none; cursor:pointer;">Sil</button>
    `;
    ul.appendChild(li);
}

// 5. SİLME VE GÜNCELLEME
function removeTodo(button) {
    button.parentElement.remove();
    saveTodos(); // Sildikten sonra güncel listeyi kaydet
}

// 6. LOCALSTORAGE'A KAYDETME
function saveTodos() {
    const todos = [];
    document.querySelectorAll('#todo-list li').forEach(li => {
        // "Sil" butonunun metnini temizleyip sadece görev metnini alıyoruz
        const text = li.innerText.replace('Sil', '').trim();
        todos.push(text);
    });
    localStorage.setItem('myTodos', JSON.stringify(todos));

}
