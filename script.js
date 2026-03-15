// Firebase'i Başlat (Config bilgilerini config.js'den alır)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- OTURUM YÖNETİMİ (TASARIMI BOZMAYAN YENİ MANTIK) ---
auth.onAuthStateChanged(user => {
    const loginCont = document.getElementById('login-container');
    const doneSec = document.getElementById('done-sec');
    const todoSec = document.getElementById('todo-sec');

    if (user) {
        if(loginCont) loginCont.style.display = 'none';
        if(doneSec) doneSec.style.display = 'flex'; // Orijinal CSS düzenin için flex
        if(todoSec) todoSec.style.display = 'block'; 
        loadTodosFromCloud();
    } else {
        if(loginCont) loginCont.style.display = 'block';
        if(doneSec) doneSec.style.display = 'none';
        if(todoSec) todoSec.style.display = 'none';
    }
});

async function handleSignUp() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    try {
        await auth.createUserWithEmailAndPassword(email, pass);
    } catch (error) { document.getElementById('auth-error').innerText = "Hata: " + error.message; }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    try {
        await auth.signInWithEmailAndPassword(email, pass);
    } catch (error) { document.getElementById('auth-error').innerText = "Hata: " + error.message; }
}

function handleLogout() { auth.signOut(); }

// --- ANA TODO FONKSİYONLARI ---

async function addTodo() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();
    const user = auth.currentUser;

    if (text !== "" && user) {
        const now = new Date();
        const tarihSaat = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
        const fullText = `${text} <span class="tarih-etiketi">(${tarihSaat})</span>`;
        
        await db.collection("users").doc(user.uid).collection("todos").add({
            content: fullText,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        input.value = "";
        loadTodosFromCloud();
    }
}

async function loadTodosFromCloud() {
    const user = auth.currentUser;
    if (!user) return;

    // Bekleyen Görevler
    const todoSnap = await db.collection("users").doc(user.uid).collection("todos").orderBy("createdAt", "desc").get();
    const ulTodo = document.getElementById('todo-list');
    if(ulTodo) {
        ulTodo.innerHTML = "";
        todoSnap.forEach(doc => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="gorev-metni">${doc.data().content}</span><button onclick="removeTodo(this, '${doc.id}')">Gönder</button>`;
            ulTodo.appendChild(li);
        });
    }

    // Yapılanlar
    const doneSnap = await db.collection("users").doc(user.uid).collection("done").orderBy("doneAt", "desc").get();
    const ulDone = document.getElementById('done-list');
    if(ulDone) {
        ulDone.innerHTML = "";
        doneSnap.forEach(doc => {
            const li = document.createElement('li');
            // GERİ AL BUTONU BURAYA EKLENDİ
            li.innerHTML = `<span class="gorev-metni">${doc.data().content}</span><div class="islem-butonlari"><button onclick="restoreTodo('${doc.id}', this)">Geri Al</button><button class="btn-sil" onclick="finalDelete('${doc.id}')">Sil</button></div>`;
            ulDone.appendChild(li);
        });
    }
}

async function removeTodo(btn, docId) {
    const user = auth.currentUser;
    const text = btn.parentElement.querySelector('.gorev-metni').innerHTML;

    // Önce "done" (Yapılanlar) koleksiyonuna ekle
    await db.collection("users").doc(user.uid).collection("done").add({
        content: text,
        doneAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Sonra "todos" (Bekleyenler) koleksiyonundan sil
    await db.collection("users").doc(user.uid).collection("todos").doc(docId).delete();
    
    // Listeyi yenile
    loadTodosFromCloud();
}

// YENİ EKLENEN GERİ AL FONKSİYONU
async function restoreTodo(docId, btn) {
    const user = auth.currentUser;
    const text = btn.closest('li').querySelector('.gorev-metni').innerHTML;

    // "todos" (Bekleyenler) koleksiyonuna geri ekle
    await db.collection("users").doc(user.uid).collection("todos").add({
        content: text,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // "done" (Yapılanlar) koleksiyonundan sil
    await db.collection("users").doc(user.uid).collection("done").doc(docId).delete();
    
    // Listeyi yenile
    loadTodosFromCloud();
}

async function finalDelete(docId) {
    const user = auth.currentUser;
    // Yapılanlardan tamamen sil
    await db.collection("users").doc(user.uid).collection("done").doc(docId).delete();
    
    // Listeyi yenile
    loadTodosFromCloud();
}

// --- SAAT VE TARİH ---
function updateClock() {
    const now = new Date();
    const clockElement = document.getElementById('clock');
    const dateElement = document.getElementById('current-date');
    const dayElement = document.getElementById('current-day');

    if(clockElement) clockElement.innerText = now.toLocaleTimeString('tr-TR');
    if(dateElement) dateElement.innerText = now.toLocaleDateString('tr-TR');
    
    let gun = now.toLocaleDateString('tr-TR', { weekday: 'long' });
    if(dayElement) dayElement.innerText = gun.charAt(0).toUpperCase() + gun.slice(1).toLowerCase();
}

setInterval(updateClock, 1000);
updateClock();

// --- FARENİN UCUNDAKİ IŞIK (EPIC LIGHT) EFEKTİ ---
const isik = document.createElement('div');
isik.classList.add('epic-light');
document.body.appendChild(isik);
document.addEventListener('mousemove', (e) => {
    isik.style.left = e.clientX + 'px';
    isik.style.top = e.clientY + 'px';
});
