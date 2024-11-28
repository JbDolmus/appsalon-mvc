
let paso = 1;
const pasoInicial = 1;
const pasoFinal = 3;

const cita = {
    id: '',
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
};


document.addEventListener('DOMContentLoaded', function () {
    iniciarApp();
});

function iniciarApp() {
    mostrarSeccion();
    tabs();//Cambia de seccion cuando se hace click en los tabs
    botonesPaginador();//Agrega o quita los botones del paginador
    paginaSiguiente();
    paginaAnterior();

    consultarAPI();//Consulta la API en el backend de PHP

    idCliente();
    nombreCliente();//Agrega el nombre del cliente al objeto cita
    seleccionarFecha();//Agrega la fecha de la cita al objeto cita
    seleccionarHora();//Agrega la hora de la cita al objeto cita

    mostrarResumen();//Muestra el resumen de la cita
}

function mostrarSeccion() {

    //Ocultar la seccion anterior
    const seccionAnterior = document.querySelector('.mostrar');
    if (seccionAnterior) { //Si la seccion anterior existe
        seccionAnterior.classList.remove('mostrar');
    }

    const seccion = document.querySelector(`#paso-${paso}`);
    seccion.classList.add('mostrar');

    //Ocultar los tabs anteriores
    const tabAnterior = document.querySelector('.actual');
    if (tabAnterior) {
        tabAnterior.classList.remove('actual');
    }

    //Resalta el tab actual
    const tab = document.querySelector(`[data-paso="${paso}"]`);
    tab.classList.add('actual');
}

function tabs() {
    const botones = document.querySelectorAll('.tabs button');
    botones.forEach(boton => {
        boton.addEventListener('click', function (e) {

            paso = parseInt(e.target.dataset.paso);

            mostrarSeccion();
            botonesPaginador();

            if (paso === 3) {
                mostrarResumen();
            }
        });
    });
}

function botonesPaginador() {

    const paginaAnterior = document.querySelector('#anterior');
    const paginaSiguiente = document.querySelector('#siguiente');

    if (paso === 1) {
        paginaAnterior.classList.add('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    } else if (paso === 3) {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.add('ocultar');
        mostrarResumen();
    } else {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }
    mostrarSeccion();
}

function paginaSiguiente() {
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', () => {
        if (paso >= pasoFinal) return;
        paso++;
        botonesPaginador();
    });
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', () => {

        if (paso <= pasoInicial) return;
        paso--;
        botonesPaginador();
    });
}

async function consultarAPI() {
    try {
        const url = `${location.origin}/api/servicios`;
        const resultado = await fetch(url);
        const servicios = await resultado.json();
        mostrarServicios(servicios);
    } catch (error) {
        console.log(error);
    }
}

function mostrarServicios(servicios) {

    servicios.forEach(servicio => {
        const { id, nombre, precio } = servicio;

        const nombreServicio = document.createElement('P');
        nombreServicio.classList.add('nombre-servicio');
        nombreServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.classList.add('precio-servicio');
        precioServicio.textContent = `Precio: $${precio}`;

        const servicioDiv = document.createElement('DIV');
        servicioDiv.classList.add('servicio');
        servicioDiv.dataset.idServicio = id;

        servicioDiv.onclick = () => seleccionarServicio(servicio);

        servicioDiv.appendChild(nombreServicio);
        servicioDiv.appendChild(precioServicio);

        document.querySelector('#servicios').appendChild(servicioDiv);
    });
}

function seleccionarServicio(servicio) {
    const { id } = servicio;
    const { servicios } = cita;
    const divServicio = document.querySelector(`[data-id-servicio="${id}"]`);

    //Comprueba si el servicio ya fue agregado
    if (servicios.some(agregado => agregado.id === id)) {
        //Elimina el servicio
        cita.servicios = servicios.filter(agregado => agregado.id !== id);
        divServicio.classList.remove('seleccionado');
    } else {
        //Agrega el servicio
        cita.servicios = [...servicios, servicio];
        divServicio.classList.add('seleccionado');
    }


}

function idCliente() {
    cita.id = document.querySelector('#id').value;
}

function nombreCliente() {
    cita.nombre = document.querySelector('#nombre').value;
}

function seleccionarFecha() {
    const inputFecha = document.querySelector('#fecha');

    inputFecha.addEventListener('input', (e) => {

        const dia = new Date(e.target.value).getUTCDay();

        if ([0, 6].includes(dia)) {
            e.target.value = '';
            mostrarAlerta('Fines de semana no permitidos', 'error', '.formulario');
        } else {
            cita.fecha = e.target.value;
        }
    });
}

function mostrarAlerta(mensaje, tipo, elemento, desaparece = true) {

    //Prevenir duplicados
    const alertaPrevia = document.querySelector('.alerta');
    if (alertaPrevia) {
        alertaPrevia.remove();
    }

    //Script para crear la alerta
    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');
    alerta.classList.add(tipo);

    const referencia = document.querySelector(elemento);
    referencia.appendChild(alerta);

    if (desaparece) {
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }
}

function seleccionarHora() {
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input', (e) => {
        const horaCita = e.target.value;
        const hora = horaCita.split(':')[0];

        if (hora < 10 || hora > 18) {
            inputHora.value = '';
            mostrarAlerta('Hora no válida', 'error', '.formulario');
        } else {
            cita.hora = horaCita;
        }
    });
}

function mostrarResumen() {
    const resumen = document.querySelector('.contenido-servicio');

    //Limpiar el contenido del resumen
    while (resumen.firstChild) {
        resumen.removeChild(resumen.firstChild);
    }

    if (Object.values(cita).includes('') || cita.servicios.length === 0) {
        mostrarAlerta('Faltan datos de Servicios, Fecha u Hora', 'error', '.contenido-servicio', false);
        return;
    }

    //Formatear el div de resumen
    const { nombre, fecha, hora, servicios } = cita;

    //Heading para Servicios en Resumen
    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios';
    resumen.appendChild(headingServicios);

    //Iterar sobre los servicios
    servicios.forEach(servicio => {
        const { id, nombre, precio } = servicio;

        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.innerHTML = `<span>Precio:</span> $${precio}`;

        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        resumen.appendChild(contenedorServicio);

    });

    //Heading para Servicios en Resumen
    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Resumen de Cita';
    resumen.appendChild(headingCita);

    const nombreCliente = document.createElement('P');
    nombreCliente.innerHTML = `<span>Nombre:</span> ${nombre}`;

    //Formatear la fecha en español
    const fechaObj = new Date(fecha);
    
    
    const mes = fechaObj.getMonth();
    const dia = fechaObj.getDate() + 2;
    const year = fechaObj.getFullYear();

    const fechaUTC = new Date(Date.UTC(year, mes, dia));
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = fechaUTC.toLocaleDateString('es-MX', opciones);

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span> ${fechaFormateada}`;

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora:</span> ${hora} Horas`;

    const botonReservar = document.createElement('BUTTON');
    botonReservar.classList.add('boton')
    botonReservar.textContent = 'Reservar Cita';
    botonReservar.onclick = reservarCita;

    resumen.appendChild(nombreCliente);
    resumen.appendChild(fechaCita);
    resumen.appendChild(horaCita);
    resumen.appendChild(botonReservar);


}

async function reservarCita() {

    const { id, fecha, hora, servicios } = cita;
    const idServicios = servicios.map(servicio => servicio.id);

    const datos = new FormData();

    datos.append('fecha', fecha);
    datos.append('hora', hora);
    datos.append('usuarioid', id);
    datos.append('servicios', idServicios.join(','));
    
    try {
        //Peticion hacia la api
        const url = `${location.origin}/api/citas`;

        const respuesta = await fetch(url, {
            method: 'POST',
            body: datos
        });
        
        //console.log(await respuesta.json());
        resultado = await respuesta.json();
        
        if (resultado.resultado) {
            Swal.fire({
                icon: "success",
                title: "Cita Creada",
                text: "Tu cita fue creada correctamente"
                
            }).then(() => {
                setTimeout(() => {
                    window.location.reload();
                }, 3000);

            });
        }
    } catch (error) {
        console.log(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un error al guardar la cita"
            
        });
    }
    // console.log([...datos]);//Mostrar los datos del formData
}