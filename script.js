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
        const now = new Date(); // 'now' değişkenini tanımladık
        // Hem tarih (gün.ay.yıl) hem saat (00:00) bilgisini alıyoruz
        const tarihSaat = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
        
        const fullText = `${text} <span class="tarih-etiketi">(${tarihSaat})</span>`;
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

// 7. YAPILANLARDAN GERİ YÜKLEME (TARİH VE SAATİ KORUYARAK GERİ ATAR)
function restoreTodo(button) {
    const li = button.closest('li');
    const spanEl = li.querySelector('.gorev-metni');
    
    // Sadece ham metni al (İçindeki <span> (tarih) kısmını temizle)
    // cloneNode kullanıyoruz ki orijinal yapı bozulmadan metni çekebilelim
    const tempSpan = spanEl.cloneNode(true);
    const dateSpan = tempSpan.querySelector('.tarih-etiketi');
    if (dateSpan) dateSpan.remove(); // Tarih kısmını at, sadece yazı kalsın
    
    let rawText = tempSpan.innerText.trim();
    
    // YENİDEN EKLEME TARİHİNİ OLUŞTUR (GÜN.AY.YIL SAAT:DAKİKA)
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
