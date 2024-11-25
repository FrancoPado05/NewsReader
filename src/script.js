const form = document.getElementById('link-input-container');
const title = document.getElementById('title')
const subtitle = document.getElementById('subtitle')
const result = document.getElementById('resultado')
const linkInput = document.getElementById('link-input');
const buttonPauseResume = document.getElementById('button-pause-resume');
const buttonCancel = document.getElementById('button-cancel');
const aumentarVelocidad = document.getElementById('button-cancel');
const disminuirVelocidad = document.getElementById('button-cancel');

let rate = 1

const readText = text => {
    const sintetizador = window.speechSynthesis;
    if (sintetizador) {
        const mensaje = new SpeechSynthesisUtterance(text);
        mensaje.lang = 'es-ES';
    
        mensaje.rate = rate;
    
        sintetizador.speak(mensaje);
        }
    else {
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

form.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const link = linkInput.value;

    result.textContent = 'Cargando...';

    try {
        const response = await fetch('https://newsreaderfp.netlify.app/src/api/scrapear', {
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
        title.textContent = data.titulo || 'No se encontro contenido'
        subtitle.textContent = data.subtitulo || 'No se encontro contenido'        
        result.textContent = data.cuerpo || 'No se encontro contenido'

    } 
    catch (error) {
        result.textContent = `Error: ${error.message}`;
    }

    linkInput.value = ''

    const textToRead = `${title.textContent}. ${subtitle.textContent}. ${result.textContent}`
    readText(textToRead)
});

buttonPauseResume.addEventListener('click', pauseResume)
buttonCancel.addEventListener('click', () => {
    cancel()
    title.textContent = ''
    subtitle.textContent = ''
    result.textContent = ''
})