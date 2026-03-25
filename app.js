// ===== DEBUG =====
console.log("🚀 NoPain NoGain v3 - FIX COMPLETO");

// ===== ESTADO ===== 
let appState = JSON.parse(localStorage.getItem("appState")) || {
    user: { balance: 5.0, name: "Tú" },
    challenge: null,
    votes: 0
};

function saveState(){
    localStorage.setItem("appState", JSON.stringify(appState));
    console.log("💾 Guardado:", appState.challenge ? appState.challenge.name : "Sin reto");
}

// ===== TOAST =====
function showToast(msg, type = "success"){
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(()=>t.classList.add("show"), 50);
    setTimeout(()=>t.remove(), 3500);
}

// ===== WALLET =====
function actualizarWallet(){
    document.querySelectorAll(".wallet").forEach(w => {
        w.innerHTML = `🟢 ${appState.user.balance.toFixed(2)} SOL`;
    });
}

// ===== CREAR RETO =====
function crearReto(){
    const nombre = document.getElementById("retoNombre");
    const apuesta = document.getElementById("retoApuesta");
    const dias = document.getElementById("retoDias");
    
    if(!nombre || !apuesta || !dias){
        showToast("❌ Campos no encontrados", "error");
        return;
    }
    
    const n = nombre.value.trim();
    const a = parseFloat(apuesta.value);
    const d = parseInt(dias.value);
    
    if(!n || isNaN(a) || isNaN(d) || a > appState.user.balance || a <= 0 || d <= 0){
        showToast("⚠️ Datos inválidos", "error");
        return;
    }

    appState.user.balance -= a;
    appState.challenge = {
        name: n,
        bet: a,
        pool: a,
        participants: ["Tú"],
        days: d,
        currentDay: 0,
        startTime: Date.now(),
        endTime: Date.now() + (d * 24 * 60 * 60 * 1000),
        votes: 0
    };
    
    saveState();
    actualizarWallet();
    renderReto();
    actualizarTimer();
    
    showToast("✅ Reto creado!");
}

// ===== RENDER RETO =====
function renderReto(){
    if(!appState.challenge) return;
    
    // NOMBRE
    const nombreReto = document.getElementById("nombreReto");
    if(nombreReto) nombreReto.innerText = appState.challenge.name;
    
    // POOL
    const pool = document.getElementById("pool");
    if(pool) pool.innerText = appState.challenge.pool.toFixed(2) + " SOL";
    
    // PROGRESO
    const textoProgreso = document.getElementById("textoProgreso");
    if(textoProgreso) textoProgreso.innerText = `Día ${appState.challenge.currentDay}/${appState.challenge.days}`;
    
    // BARRA
    const bar = document.getElementById("bar");
    if(bar){
        const porc = Math.min((appState.challenge.currentDay / appState.challenge.days) * 100, 100);
        bar.style.width = porc + "%";
    }
    
    // PARTICIPANTES
    const listaParticipantes = document.getElementById("listaParticipantes");
    if(listaParticipantes){
        listaParticipantes.innerHTML = "";
        appState.challenge.participants.forEach(p => {
            const div = document.createElement("div");
            div.className = "user";
            div.innerText = p;
            listaParticipantes.appendChild(div);
        });
    }
    
    // CONTADOR
    const countParticipantes = document.getElementById("countParticipantes");
    if(countParticipantes) countParticipantes.innerText = appState.challenge.participants.length;
}

// ===== AGREGAR USUARIO (FIX) =====
function agregarUsuario(){
    console.log("➕ Agregar usuario llamado");
    
    // BUSCAR INPUT
    const nuevoUsuario = document.getElementById("nuevoUsuario");
    const nombreInvitado = document.getElementById("nombreInvitado");
    const input = nuevoUsuario || nombreInvitado;
    
    if(!input){
        showToast("❌ Input no encontrado", "error");
        console.error("❌ Inputs buscados:", {nuevoUsuario, nombreInvitado});
        return;
    }
    
    const nombre = input.value.trim();
    console.log("📝 Nombre ingresado:", nombre);
    
    if(!nombre){
        showToast("❌ Escribe un nombre", "error");
        return;
    }
    
    if(!appState.challenge){
        showToast("❌ No hay reto activo", "error");
        console.error("❌ Sin challenge:", appState.challenge);
        return;
    }
    
    if(appState.challenge.participants.includes(nombre)){
        showToast("⚠️ Usuario ya existe", "error");
        return;
    }
    
    // AGREGAR
    appState.challenge.participants.push(nombre);
    appState.challenge.pool += appState.challenge.bet;
    
    saveState();
    renderReto();
    input.value = "";
    
    showToast(`✅ ${nombre} agregado (+${appState.challenge.bet.toFixed(1)} SOL)`);
    console.log("✅ Agregado:", appState.challenge.participants);
}

// ===== ELIMINAR USUARIO (FIX) =====
function eliminarUsuario(){
    console.log("➖ Eliminar usuario");
    
    const eliminarUsuario = document.getElementById("eliminarUsuario");
    const nuevoUsuario = document.getElementById("nuevoUsuario");
    const input = eliminarUsuario || nuevoUsuario;
    
    if(!input){
        showToast("❌ Input no encontrado", "error");
        return;
    }
    
    const nombre = input.value.trim();
    
    if(!nombre){
        showToast("❌ Escribe nombre a eliminar", "error");
        return;
    }
    
    if(!appState.challenge){
        showToast("❌ No hay reto", "error");
        return;
    }
    
    const idx = appState.challenge.participants.indexOf(nombre);
    if(idx === -1){
        showToast("❌ Usuario no encontrado", "error");
        return;
    }
    
    // ELIMINAR
    appState.challenge.participants.splice(idx, 1);
    appState.challenge.pool -= appState.challenge.bet;
    
    saveState();
    renderReto();
    input.value = "";
    
    showToast(`✅ ${nombre} eliminado`);
}

// ===== TIMER COUNTDOWN =====
function actualizarTimer(){
    const timer = document.getElementById("timer");
    if(!timer) return;
    
    if(!appState.challenge?.endTime){
        timer.innerText = "00:00:00";
        return;
    }
    
    const restante = appState.challenge.endTime - Date.now();
    if(restante <= 0){
        timer.innerText = "00:00:00";
        timer.style.color = "#ef4444";
        return;
    }
    
    const segs = Math.floor(restante / 1000);
    const h = Math.floor(segs / 3600);
    const m = Math.floor((segs % 3600) / 60);
    const s = segs % 60;
    
    timer.innerText = `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}

// INTERVALO
setInterval(actualizarTimer, 1000);

// ===== OTRAS FUNCIONES =====
function sumarProgreso(){
    if(!appState.challenge) return showToast("❌ Sin reto", "error");
    if(appState.challenge.currentDay >= appState.challenge.days){
        showToast("✅ Reto completado!");
        return;
    }
    appState.challenge.currentDay++;
    saveState();
    renderReto();
    showToast("📈 Día completado");
}

// ===== VOTAR SALIDA (FIX COMPLETO) =====
function votarSalida(){
    console.log("🗳️ Votar salida");
    
    if(!appState.challenge){
        showToast("❌ No hay reto activo", "error");
        return;
    }
    
    // INCREMENTAR VOTOS
    appState.challenge.votes = (appState.challenge.votes || 0) + 1;
    
    // CALCULAR MAYORÍA
    const totalParticipantes = appState.challenge.participants.length;
    const votosNecesarios = Math.ceil(totalParticipantes / 2);
    
    // ACTUALIZAR UI
    const votosSalida = document.getElementById("votosSalida");
    if(votosSalida){
        votosSalida.innerText = `${appState.challenge.votes} votos (necesitas ${votosNecesarios})`;
    }
    
    saveState();
    renderReto();
    
    // VERIFICAR MAYORÍA
    if(appState.challenge.votes >= votosNecesarios){
        showToast("🚪 ¡MAYORÍA! Reto terminado", "error");
        appState.challenge = null;
        saveState();
        setTimeout(()=>window.location.href = "index.html", 2000);
        return;
    }
    
    showToast(`🗳️ ${appState.challenge.votes}/${votosNecesarios} votos`, "success");
    console.log("✅ Voto registrado:", {actual: appState.challenge.votes, max: votosNecesarios});
}

function subirPrueba(event){
    showToast("📸 Prueba subida");
}

function toggleMusic(){
    showToast("🎵 Música");
}

function depositar(){
    const cantidad = parseFloat(document.getElementById("cantidad")?.value);
    if(cantidad && cantidad > 0){
        appState.user.balance += cantidad;
        saveState();
        actualizarWallet();
        showToast(`+${cantidad} SOL`);
    }
}

function retirar(){
    const cantidad = parseFloat(document.getElementById("cantidad")?.value);
    if(cantidad && cantidad > 0 && cantidad <= appState.user.balance){
        appState.user.balance -= cantidad;
        saveState();
        actualizarWallet();
        showToast(`-${cantidad} SOL`);
    }
}

// ===== INIT =====
window.addEventListener("load", ()=>{
    console.log("🚀 INIT");
    actualizarWallet();
    renderReto();
    actualizarTimer();
});

// ===== 🎵 MÚSICA DE FONDO =====
let musicPlaying = false;
const bgMusic = document.getElementById("bgMusic");

function toggleMusic(){
    if(!bgMusic) return;
    
    if(musicPlaying){
        bgMusic.pause();
        musicPlaying = false;
        showToast("🔇 Música PAUSADA");
    } else {
        bgMusic.play().catch(e => {
            showToast("🎵 Toca botón para activar música", "error");
        });
        musicPlaying = true;
        showToast("🔊 Música ACTIVADA");
    }
}

// AUTO-INICIO (TOCA CUALQUIER BOTÓN PRIMERO)
document.addEventListener("click", function initMusic(){
    if(!musicPlaying && bgMusic){
        bgMusic.volume = 0.3; // VOL 30%
        document.removeEventListener("click", initMusic);
    }
}, {once: true});
