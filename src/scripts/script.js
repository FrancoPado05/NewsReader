const form = document.getElementById('link-input-container');
const resultado = document.getElementById('resultado')
const linkInput = document.getElementById('link-input');
const buttonPauseResume = document.getElementById('button-pause-resume');
const buttonCancel = document.getElementById('button-cancel');
// const buttonAumentarSpeed = document.getElementById('button-aumentar-speed');
// const buttonDecrementarSpeed = document.getElementById('button-decrementar-speed');

const readText = text => {
    const sintetizador = window.speechSynthesis;
    
    if (sintetizador) {
        const mensaje = new SpeechSynthesisUtterance(text);
        mensaje.lang = 'es-ES';

        mensaje.rate = 1;
        mensaje.pitch = 1;

        sintetizador.speak(mensaje);
    } else {
        console.log("La API SpeechSynthesis no está soportada en este navegador.");
    }
}

const pauseResume = () => {
    if (speechSynthesis.paused)
      speechSynthesis.resume();
    else
      speechSynthesis.pause();
}

const cancel = () => speechSynthesis.cancel();

const aumentarVelocidad = () => {
    if (mensaje.rate < 10) {
        mensaje.rate += 1
    } 
}

const decrementarVelocidad = () => {
    if (mensaje.rate > 1) {
        mensaje.rate -= 1
    } 
}

form.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const link = linkInput.value;

    resultado.textContent = 'Cargando...';

    try {
        const response = await fetch('http://127.0.0.1:5000/scrapear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ link }),
        });
    
        if (!response.ok) {
            throw new Error('Error en el scrapping');
        }

        const data = await response.json()
        resultado.textContent = data.cuerpo || 'No se encontro contenido'

    } 
    catch (error) {
        resultado.textContent = `Error: ${error.message}`;
    }

    linkInput.value = ''

    readText(resultado.textContent)
});

buttonPauseResume.addEventListener('click', pauseResume)
buttonCancel.addEventListener('click', () => {
    cancel()
    resultado.textContent = ''
})

buttonAumentarSpeed.addEventListener('click', aumentarVelocidad)
buttonDecrementarSpeed.addEventListener('click', decrementarVelocidad)