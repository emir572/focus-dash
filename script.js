// 1. SAAT VE SELAMLAMA
// 1. SAAT VE SELAMLAMA
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('tr-TR');

    // Tarihi bul ve sağ üste yazdır
    const tarih = now.toLocaleDateString('tr-TR'); 
    document.getElementById('current-date').innerText = tarih;
    
    // YENİ EKLENEN: Günü bul ve baş harfini büyüt
    let gun = now.toLocaleDateString('tr-TR', { weekday: 'long' });
    gun = gun.charAt(0).toUpperCase() + gun.slice(1).toLowerCase();
    document.getElementById('current-day').innerText = gun;

    let greeting = "To Do";
    document.getElementById('greeting').innerText = greeting;
}
setInterval(updateClock, 1000);
updateClock();

// 2. VERİLERİ YÜKLE
window.onload = function() {
    const savedTodos = JSON.parse(localStorage.getItem('myTodos')) || [];
    savedTodos.forEach(todoText => renderTodo(todoText));

    // Yapılanlar verilerini de yükle
    const savedDoneTodos = JSON.parse(localStorage.getItem('myDoneTodos')) || [];
    savedDoneTodos.forEach(todoText => renderDoneTodo(todoText));
};

// 3. GÖREV EKLEME
function addTodo() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();
    
    if (text !== "") {
        const now = new Date();
        const tarihSaat = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
        const metinVeTarih = `${text} <span class="tarih-etiketi">(${tarihSaat})</span>`;
        
        renderTodo(metinVeTarih);
        saveTodos();
        input.value = "";
    }
}

// 4. ANA EKRANA YAZDIRMA
function renderTodo(text) {
    const ul = document.getElementById('todo-list');
    const li = document.createElement('li');
    li.innerHTML = `
        <span class="gorev-metni">${text}</span> 
        <button onclick="removeTodo(this)">Sil</button>
    `;
    ul.appendChild(li);
}

// 5. ANA LİSTEDEN SİLME (YAPILANLARA TAŞIMA)
function removeTodo(button) {
    const li = button.closest('li');
    const spanEl = li.querySelector('.gorev-metni');
    
    // Sadece saf metni al (tarihi ayıkla)
    let rawText = spanEl.childNodes.length > 0 ? spanEl.childNodes[0].textContent.trim() : spanEl.textContent.trim();
    
    // Yeni silinme/tamamlanma tarihini oluştur
    const now = new Date();
    const tarihSaat = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
    const doneText = `${rawText} <span class="tarih-etiketi">(${tarihSaat})</span>`;
    
    // Yapılanlara ekle ve ana listeden kaldır
    renderDoneTodo(doneText);
    li.remove();
    
    // İki listeyi de kaydet
    saveTodos();
    saveDoneTodos();
}

// 6. YAPILANLAR LİSTESİNE YAZDIRMA
function renderDoneTodo(text) {
    const ul = document.getElementById('done-list');
    const li = document.createElement('li');
    li.innerHTML = `
        <span class="gorev-metni">${text}</span> 
        <div style="display: flex; gap: 5px;">
            <button class="btn-geri" onclick="restoreTodo(this)">Geri</button>
            <button onclick="permanentDeleteTodo(this)">Sil</button>
        </div>
    `;
    ul.appendChild(li);
}


// 7. YAPILANLARDAN GERİ YÜKLEME (SAATİ GÜNCELLEYEREK GERİ ATAR)
function restoreTodo(button) {
    const li = button.closest('li');
    const spanEl = li.querySelector('.gorev-metni');
    
    // Sadece ham metni al (eski tarih etiketini ayıkla)
    let rawText = spanEl.childNodes.length > 0 ? spanEl.childNodes[0].textContent.trim() : spanEl.textContent.trim();
    
    // YENİDEN EKLEME SAATİNİ OLUŞTUR
    const now = new Date();
    const tarihSaat = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
    const metinVeYeniTarih = `${rawText} <span class="tarih-etiketi">(${tarihSaat})</span>`;
    
    // Ana listeye yeni tarihle geri ekle
    renderTodo(metinVeYeniTarih);
    
    // Yapılanlardan tamamen sil
    li.remove();
    
    saveTodos();
    saveDoneTodos();
}

// 8. YAPILANLARDAN KALICI SİLME
function permanentDeleteTodo(button) {
    button.closest('li').remove();
    saveDoneTodos();
}

// 9. KAYDETME İŞLEMLERİ
function saveTodos() {
    const todos = [];
    document.querySelectorAll('#todo-list li').forEach(li => {
        todos.push(li.querySelector('.gorev-metni').innerHTML);
    });
    localStorage.setItem('myTodos', JSON.stringify(todos));
}

function saveDoneTodos() {
    const todos = [];
    document.querySelectorAll('#done-list li').forEach(li => {
        todos.push(li.querySelector('.gorev-metni').innerHTML);
    });
    localStorage.setItem('myDoneTodos', JSON.stringify(todos));
}

// DİNAMİK IŞIK (Aynen korundu)
const isik = document.createElement('div');
isik.classList.add('epic-light');
document.body.appendChild(isik);
document.addEventListener('mousemove', (e) => {
    isik.style.left = e.clientX + 'px';
    isik.style.top = e.clientY + 'px';
});




