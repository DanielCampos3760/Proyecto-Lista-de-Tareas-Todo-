// ============================================
// LISTA DE TAREAS - CURSO DE JAVASCRIPT
// ============================================
// Este archivo contiene toda la lógica de nuestra
// aplicación de lista de tareas (To-Do App)
// ============================================

// ============================================
// PASO 1: Seleccionar elementos del DOM
// ============================================
// Primero necesitamos "agarrar" los elementos HTML
// con los que vamos a trabajar

const formulario = document.getElementById('form-tarea');
const inputTarea = document.getElementById('input-tarea');
const listaTareas = document.getElementById('lista-tareas');
const contadorPendientes = document.getElementById('contador-pendientes');
const botonesFiltro = document.querySelectorAll('.filtro');
const inputFecha = document.getElementById('input-fecha');
const selectCategoria = document.getElementById('select-categoria');
const btnDarkMode = document.getElementById('toggle-dark-mode');
const selectPrioridad = document.getElementById('select-prioridad');
const btnLimpiar = document.getElementById('btn-limpiar');
let filtroCategoria = 'todas';

// ============================================
// PASO 2: Estado de la aplicación
// ============================================
// El "estado" son los datos que nuestra app necesita
// para funcionar correctamente

// Array que guarda todas las tareas
let tareas = [];

// El filtro actualmente seleccionado
let filtroActual = 'todas';

// ============================================
// PASO 3: Cargar tareas del localStorage
// ============================================
// Cuando abrimos la página, queremos recuperar
// las tareas que guardamos anteriormente

function cargarTareas() {
    // Intentamos obtener las tareas guardadas
    const tareasGuardadas = localStorage.getItem('tareas');

    // Si hay tareas guardadas, las convertimos de JSON a array
    if (tareasGuardadas) {
        tareas = JSON.parse(tareasGuardadas);
        console.log('✅ Tareas cargadas:', tareas.length);
    } else {
        console.log('📝 No hay tareas guardadas, empezando desde cero');
    }

    // Mostramos las tareas en pantalla
    renderizarTareas();
}

// ============================================
// PASO 4: Guardar tareas en localStorage
// ============================================
// Cada vez que modificamos las tareas, las guardamos
// para que persistan al cerrar el navegador

function guardarTareas() {
    // Convertimos el array a texto JSON y lo guardamos
    localStorage.setItem('tareas', JSON.stringify(tareas));
    console.log('💾 Tareas guardadas');
}

// ============================================
// PASO 5: Agregar nueva tarea
// ============================================
// Función que se ejecuta cuando el usuario
// quiere agregar una nueva tarea

function agregarTarea(texto, fecha, categoria, prioridad) {
    const hoy = new Date().setHours(0,0,0,0);
    const fechaSeleccionada = new Date(fecha);

    if (fecha && fechaSeleccionada < hoy) {
        alert("⚠️ No puedes asignar una fecha pasada.");
        return;
    }

    const nuevaTarea = {
        id: Date.now(),
        texto,
        fecha,
        categoria,
        prioridad, // Guardamos la prioridad
        completada: false
    };

    tareas.unshift(nuevaTarea);
    guardarTareas();
    renderizarTareas();
    inputTarea.focus(); // Mejora de UX
}

function editarTarea(id) {
    const tarea = tareas.find(t => t.id === id);
    const nuevoTexto = prompt("Edita tu tarea:", tarea.texto);
    if (nuevoTexto !== null && nuevoTexto.trim() !== "") {
        tarea.texto = nuevoTexto.trim();
        guardarTareas();
        renderizarTareas();
    }
}

// ============================================
// PASO 6: Cambiar estado de tarea
// ============================================
// Cuando el usuario hace clic en el checkbox,
// cambiamos entre completada/pendiente

function toggleTarea(id) {
    // Usamos map para crear un nuevo array
    // modificando solo la tarea con el ID indicado
    tareas = tareas.map(tarea => {
        if (tarea.id === id) {
            // Invertimos el valor de completada (true -> false, false -> true)
            return { ...tarea, completada: !tarea.completada };
        }
        return tarea;
    });

    guardarTareas();
    renderizarTareas();

    console.log('🔄 Tarea actualizada:', id);
}

// ============================================
// PASO 7: Eliminar tarea
// ============================================
// Cuando el usuario hace clic en el botón de eliminar

function eliminarTarea(id) {
    tareas = tareas.filter(t => t.id !== id);
    guardarTareas();
    renderizarTareas();
}

// ============================================
// PASO 8: Filtrar tareas
// ============================================
// Devuelve las tareas según el filtro seleccionado

function filtrarTareas() {
    return tareas.filter(tarea => {
        // Filtro por estado
        const cumpleEstado = 
            filtroActual === 'todas' || 
            (filtroActual === 'pendientes' && !tarea.completada) || 
            (filtroActual === 'completadas' && tarea.completada);
        
        // Filtro por categoría
        const cumpleCategoria = 
            filtroCategoria === 'todas' || 
            tarea.categoria === filtroCategoria;

        return cumpleEstado && cumpleCategoria;
    });
}

// ============================================
// PASO 9: Renderizar tareas
// ============================================
// "Renderizar" significa mostrar en pantalla
// Esta función actualiza la lista visual de tareas

function renderizarTareas() {
    const tareasFiltradas = filtrarTareas();
    listaTareas.innerHTML = '';

    tareasFiltradas.forEach(tarea => {
        const li = document.createElement('li');
        // Añadimos la clase de prioridad
        li.className = `tarea ${tarea.completada ? 'completada' : ''} prioridad-${tarea.prioridad}`;

        let indicativoHTML = '';
        if (tarea.fecha) {
            const hoy = new Date().setHours(0,0,0,0);
            const diferencia = (new Date(tarea.fecha) - hoy) / (1000*60*60*24);
            if (diferencia >= 0 && diferencia < 7) {
                indicativoHTML = `<span class="indicador-proximo">⚠️ Próximo</span>`;
            }
        }

        li.innerHTML = `
            <input type="checkbox" ${tarea.completada ? 'checked' : ''}>
            <div class="tarea-info">
                <span class="tarea-texto">${escaparHTML(tarea.texto)} ${indicativoHTML}</span>
                <small>${tarea.categoria} | ${tarea.fecha || 'Sin fecha'}</small>
            </div>
            <button class="btn-editar">✏️</button>
            <button class="btn-eliminar">🗑️</button>
        `;

        // ELIMINAR: Primero la animación, luego los datos
        li.querySelector('.btn-eliminar').onclick = () => {
            li.classList.add('tarea-borrando');
            // 'onanimationend' es más seguro para esperar a que termine
            li.onanimationend = () => eliminarTarea(tarea.id);
        };

        li.querySelector('.btn-editar').onclick = () => editarTarea(tarea.id);
        li.querySelector('input').onclick = () => toggleTarea(tarea.id);
        
        listaTareas.appendChild(li);
    });
    actualizarContador();
}

// ============================================
// PASO 10: Actualizar contador
// ============================================
// Muestra cuántas tareas pendientes hay

function actualizarContador() {
    // Contamos las tareas que NO están completadas
    const pendientes = tareas.filter(tarea => !tarea.completada).length;
    contadorPendientes.textContent = pendientes;
}

// ============================================
// PASO 11: Función auxiliar de seguridad
// ============================================
// Evita que alguien inyecte código HTML malicioso

function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// ============================================
// PASO 12: Configurar eventos
// ============================================
// Conectamos las acciones del usuario con nuestras funciones

// Evento cuando se envía el formulario (agregar tarea)
formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const texto = inputTarea.value.trim();
    const fecha = inputFecha.value;
    const categoria = selectCategoria.value;
    const prioridad = selectPrioridad.value; // Asegúrate de capturar esto

    if (texto) {
        agregarTarea(texto, fecha, categoria, prioridad);
        formulario.reset();
        inputTarea.focus();
    }
});

// Eventos para los botones de filtro
botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {
        // Quitamos la clase 'activo' de todos los botones
        botonesFiltro.forEach(b => b.classList.remove('activo'));

        // Agregamos 'activo' al botón que se clickeó
        boton.classList.add('activo');

        // Actualizamos el filtro actual con el valor del data-filtro
        filtroActual = boton.dataset.filtro;

        // Volvemos a renderizar para mostrar las tareas filtradas
        renderizarTareas();

        console.log('🔍 Filtro cambiado a:', filtroActual);
    });
});

// ============================================
// PASO 13: Iniciar la aplicación
// ============================================
// Cuando la página termina de cargar, iniciamos todo

document.querySelectorAll('.filtro-cat').forEach(boton => {
    boton.addEventListener('click', () => {
        document.querySelectorAll('.filtro-cat').forEach(b => b.classList.remove('activo'));
        boton.classList.add('activo');
        filtroCategoria = boton.dataset.cat;
        renderizarTareas();
    });
});

btnDarkMode.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

btnLimpiar.onclick = () => {
    if(confirm("¿Borrar todas las tareas terminadas?")) {
        tareas = tareas.filter(t => !t.completada);
        guardarTareas();
        renderizarTareas();
    }
};

if(localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark-mode');

cargarTareas();

console.log('🚀 ¡Aplicación de tareas lista!');
console.log('💡 Tip: Abre la consola del navegador (F12) para ver los logs');