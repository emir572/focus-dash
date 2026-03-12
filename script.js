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
        // O anki tarih ve saati alıyoruz
        const now = new Date();
        const tarihSaat = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
        
        // Asıl metnin yanına küçük, soluk ve boşluklu bir şekilde tarihi ekliyoruz
        const metinVeTarih = `${text} <span style="font-size: 12px; opacity: 0.5; margin-left: 8px;">(${tarihSaat})</span>`;
        
        renderTodo(metinVeTarih);
        saveTodos(); // Listeyi kaydet
        input.value = "";
    }
}

// 4. EKRANA YAZDIRMA (Render)
function renderTodo(text) {
    const ul = document.getElementById('todo-list');
    const li = document.createElement('li');
    // Hizalama (Flexbox) bozulmasın diye yazıyı bir <span> kılıfına aldık. Butonun stiline hiç dokunmadık!
    li.innerHTML = `
        <span>${text}</span> 
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
        // Sayfa yenilendiğinde tarihlerin stili kaybolmasın diye sadece o kılıfın (span) içini kaydediyoruz
        const textHTML = li.querySelector('span').innerHTML;
        todos.push(textHTML);
    });
    localStorage.setItem('myTodos', JSON.stringify(todos));
}

// Epic.net tarzı fareyi takip eden dinamik ışığı oluşturalım
const isik = document.createElement('div');
isik.classList.add('epic-light');
document.body.appendChild(isik);

// Fare ekranda her hareket ettiğinde ışığın konumu güncellenir
document.addEventListener('mousemove', function(olay) {
    // Işığı tam farenin ucuna yerleştiriyoruz
    isik.style.left = olay.clientX + 'px';
    isik.style.top = olay.clientY + 'px';
});
