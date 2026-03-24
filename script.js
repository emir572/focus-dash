// --- 1. FIREBASE VE OTURUM YÖNETİMİ ---
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(user => {
    const loginCont = document.getElementById('login-container');
    const doneSec = document.getElementById('done-sec'); 
    const todoSec = document.getElementById('todo-sec');
    const rightSidebar = document.getElementById('right-sidebar'); 

    if (user) {
        if(loginCont) loginCont.style.display = 'none';
        if(doneSec) doneSec.style.display = 'flex'; 
        if(todoSec) todoSec.style.display = 'block'; 
        if(rightSidebar) {
            rightSidebar.style.display = 'flex'; 
            fetchWeatherForCity(0); // Hava Durumunu Çek
        }
        loadTodosFromCloud();
    } else {
        if(loginCont) loginCont.style.display = 'block';
        if(doneSec) doneSec.style.display = 'none';
        if(todoSec) todoSec.style.display = 'none';
        if(rightSidebar) rightSidebar.style.display = 'none'; 
    }
});

async function handleSignUp() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    try { await auth.createUserWithEmailAndPassword(email, pass); } catch (error) { document.getElementById('auth-error').innerText = "Hata: " + error.message; }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    try { await auth.signInWithEmailAndPassword(email, pass); } catch (error) { document.getElementById('auth-error').innerText = "Hata: " + error.message; }
}

function handleLogout() { auth.signOut(); }

// --- 2. TODO SİSTEMİ ---
async function addTodo() {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();
    const user = auth.currentUser;
    if (text !== "" && user) {
        const now = new Date();
        const tarihSaat = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
        const fullText = `${text} <span class="tarih-etiketi">(${tarihSaat})</span>`;
        await db.collection("users").doc(user.uid).collection("todos").add({ content: fullText, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        input.value = ""; loadTodosFromCloud();
    }
}

async function loadTodosFromCloud() {
    const user = auth.currentUser; if (!user) return;
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
    const doneSnap = await db.collection("users").doc(user.uid).collection("done").orderBy("doneAt", "desc").get();
    const ulDone = document.getElementById('done-list');
    if(ulDone) {
        ulDone.innerHTML = "";
        doneSnap.forEach(doc => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="gorev-metni">${doc.data().content}</span><div class="islem-butonlari"><button onclick="restoreTodo('${doc.id}', this)">Geri Al</button><button class="btn-sil" onclick="finalDelete('${doc.id}')">Sil</button></div>`;
            ulDone.appendChild(li);
        });
    }
}

async function removeTodo(btn, docId) {
    const user = auth.currentUser; const text = btn.parentElement.querySelector('.gorev-metni').innerHTML;
    await db.collection("users").doc(user.uid).collection("done").add({ content: text, doneAt: firebase.firestore.FieldValue.serverTimestamp() });
    await db.collection("users").doc(user.uid).collection("todos").doc(docId).delete(); loadTodosFromCloud();
}

async function restoreTodo(docId, btn) {
    const user = auth.currentUser; const text = btn.closest('li').querySelector('.gorev-metni').innerHTML;
    await db.collection("users").doc(user.uid).collection("todos").add({ content: text, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    await db.collection("users").doc(user.uid).collection("done").doc(docId).delete(); loadTodosFromCloud();
}

async function finalDelete(docId) { const user = auth.currentUser; await db.collection("users").doc(user.uid).collection("done").doc(docId).delete(); loadTodosFromCloud(); }

// --- 4. HAVA DURUMU SİSTEMİ ---
const weatherDistricts = [
    {name: 'Sarıyer', lat: 41.1667, lon: 29.0500}, {name: 'Beşiktaş', lat: 41.0430, lon: 29.0068},
    {name: 'Kadıköy', lat: 40.9904, lon: 29.0292}, {name: 'Pendik', lat: 40.8752, lon: 29.2335},
    {name: 'Beylikdüzü', lat: 40.9902, lon: 28.6413}, {name: 'Yenikapı', lat: 41.0047, lon: 28.9515},
    {name: 'Arnavutköy', lat: 41.1853, lon: 28.7397}
];
let currentCityIdx = 0; let weatherCache = {};

async function fetchWeatherForCity(index) {
    const city = weatherDistricts[index];
    document.getElementById('w-city-name').innerText = city.name;
    updateWeatherDots(index);
    if (weatherCache[index]) { updateWeatherDOM(weatherCache[index]); return; }
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&hourly=temperature_2m,windspeed_10m,weathercode&timezone=Europe%2FIstanbul&forecast_days=1`;
        const res = await fetch(url); const data = await res.json();
        const currentHour = new Date().getHours();
        const weatherData = {
            morning: Math.round(data.hourly.temperature_2m[8]),
            noon: Math.round(data.hourly.temperature_2m[13]),
            evening: Math.round(data.hourly.temperature_2m[20]),
            wind: Math.round(data.hourly.windspeed_10m[currentHour]),
            desc: (data.hourly.weathercode[currentHour] === 0) ? "Güneşli" : "Bulutlu/Yağışlı" 
        };
        weatherCache[index] = weatherData; updateWeatherDOM(weatherData);
    } catch (err) { console.error("Hava durumu hatası:", err); }
}

function updateWeatherDOM(data) {
    document.getElementById('w-morning').innerText = data.morning + "°C";
    document.getElementById('w-noon').innerText = data.noon + "°C";
    document.getElementById('w-evening').innerText = data.evening + "°C";
    document.getElementById('w-desc').innerHTML = `Hava Durumu: <b>${data.desc}</b>`;
    document.getElementById('w-wind').innerHTML = `Rüzgar: <b>${data.wind} km/s</b>`;
}

function nextWeather() { currentCityIdx = (currentCityIdx + 1) % weatherDistricts.length; fetchWeatherForCity(currentCityIdx); }
function prevWeather() { currentCityIdx = (currentCityIdx - 1 + weatherDistricts.length) % weatherDistricts.length; fetchWeatherForCity(currentCityIdx); }
function updateWeatherDots(index) {
    const dotsContainer = document.getElementById('w-dots'); if(!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for(let i=0; i < weatherDistricts.length; i++) {
        const dot = document.createElement('div'); dot.className = `w-dot ${i === index ? 'active' : ''}`; dotsContainer.appendChild(dot);
    }
}

// --- 6. SAAT, IŞIK VE DÖNGÜLER ---
function updateClock() {
    const now = new Date();
    if(document.getElementById('clock')) document.getElementById('clock').innerText = now.toLocaleTimeString('tr-TR');
    if(document.getElementById('current-date')) document.getElementById('current-date').innerText = now.toLocaleDateString('tr-TR');
    let gun = now.toLocaleDateString('tr-TR', { weekday: 'long' });
    if(document.getElementById('current-day')) document.getElementById('current-day').innerText = gun.charAt(0).toUpperCase() + gun.slice(1).toLowerCase();
}

setInterval(updateClock, 1000);

const isik = document.createElement('div'); isik.classList.add('epic-light'); document.body.appendChild(isik);
document.addEventListener('mousemove', (e) => { isik.style.left = e.clientX + 'px'; isik.style.top = e.clientY + 'px'; });

// --- ŞİFRE GÖSTER/GİZLE SİSTEMİ ---
const passwordInput = document.getElementById('login-password');
const toggleBtn = document.getElementById('toggle-password');

if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
        // Input tipini kontrol et ve değiştir
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Buton metnini güncelle
        this.innerText = type === 'password' ? 'GÖSTER' : 'GİZLE';
    });
}
