const form = document.getElementById('link-input-container');
const title = document.getElementById('title')
const subtitle = document.getElementById('subtitle')
const containerBodyParagraph = document.getElementById('container-body-paragraph')
const linkInput = document.getElementById('link-input');

const buttonPauseResume = document.getElementById('button-pause-resume');
const buttonPauseResumeText = document.getElementById('button-pause-resume-text');
const buttonCancel = document.getElementById('button-cancel');
const femaleButton = document.getElementById('female-button');
const maleButton = document.getElementById('male-button');
const buttonAumentarVelocidad = document.getElementById('button-aumentar-speed');
const buttonDisminuirVelocidad = document.getElementById('button-decrementar-speed');

const numeroVelocidadActual = document.getElementById('numero-velocidad-actual')
const barraDeProgreso = document.getElementById('barra-de-velocidad');

const diezPuntosPorcentualescurrentWidth = parseFloat(window.getComputedStyle(barraDeProgreso).width);
const cienPuntosPorcentualescurrentWidth = diezPuntosPorcentualescurrentWidth * 10;

let currentWidthReal = diezPuntosPorcentualescurrentWidth
let currentWidthPorcentual = 10

let rate = 1
let pitch = 0
let textToRead = ''

const readText = text => {
    const sintetizador = window.speechSynthesis;
    if (sintetizador) {
        const mensaje = new SpeechSynthesisUtterance(text);
        mensaje.lang = 'es-ES';
        
        mensaje.pitch = pitch
        mensaje.rate = rate;
    
        sintetizador.speak(mensaje);
        }
    else {
        console.log("La API SpeechSynthesis no está soportada en este navegador.");
    }
}

const pauseResume = () => {
    if (speechSynthesis.paused) {
        speechSynthesis.resume();
        buttonPauseResumeText.innerText = 'PAUSE'
    }
    else {
        speechSynthesis.pause();
        buttonPauseResumeText.innerText = 'RESUME'
    }
}

const cancel = () => {
   speechSynthesis.cancel()
   textToRead = ''
}

const changeVoice = (newPitch) => {
    pitch = newPitch
    speechSynthesis.cancel()
    readText(textToRead)
}

const handleChangeVoiceButtons = (newPitch, buttonApretado, buttonSinApretar) => {
    changeVoice(newPitch)

    buttonApretado.classList.add('boton-seleccionado-apretado')
    buttonApretado.classList.remove('boton-seleccionado-sin-apretar')

    buttonSinApretar.classList.remove('boton-seleccionado-apretado')
    buttonSinApretar.classList.add('boton-seleccionado-sin-apretar')

}

form.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const link = linkInput.value;
    let textBodyParagraph = ''
    containerBodyParagraph.innerHTML = '<p class="body-paragraph">Cargando...</p>';
    try {
        speechSynthesis.cancel()
        const response = await fetch('https://newsreader-1.onrender.com/scrapear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ link })
        });
        
        if (!response.ok) {
            textBodyParagraph = ''
            throw new Error('Error en el scrapping');
        }
        
        const data = await response.json()
        title.textContent = data.titulo || 'No se encontro el titulo'
        subtitle.textContent = data.subtitulo || 'No se encontro el subtitulo'
        textBodyParagraph = ''
        containerBodyParagraph.innerHTML = '';
        for (const paragraph of data.cuerpo) {
            containerBodyParagraph.innerHTML += `<p class="body-paragraph">${paragraph}</p>` || 'No se encontro esta parte del cuerpo'
            textBodyParagraph += ` ${paragraph}`
        }
        

    } 
    catch (error) {
        containerBodyParagraph.innerHTML = `<p class="body-paragraph">${error.message}</p>`;
    }
    
    linkInput.value = ''
    textToRead = `${title.textContent}. ${subtitle.textContent}. ${textBodyParagraph}`
    readText(textToRead)
});

buttonPauseResume.addEventListener('click', pauseResume)
buttonCancel.addEventListener('click', () => {
    cancel()
    title.textContent = ''
    subtitle.textContent = ''
    containerBodyParagraph.innerHTML = ''
})

femaleButton.addEventListener('click', () => { handleChangeVoiceButtons(2, femaleButton, maleButton) })

maleButton.addEventListener('click', () => { handleChangeVoiceButtons(0, maleButton, femaleButton) })

buttonAumentarVelocidad.addEventListener('click', () => {
    rate = Math.min(rate + 1, 10)
    speechSynthesis.cancel()
    readText(textToRead)
    if (currentWidthPorcentual === 5) {
        rate = 1
        currentWidthPorcentual = 10
        numeroVelocidadActual.innerText = '1.0'
        currentWidthReal = diezPuntosPorcentualescurrentWidth
        barraDeProgreso.style.width = `${currentWidthReal}px`
    }
    else {
        currentWidthPorcentual = Math.min(currentWidthPorcentual + 10, 100)
        numeroVelocidadActual.innerText = `${currentWidthPorcentual / 10}`
        currentWidthReal = Math.min(currentWidthReal + diezPuntosPorcentualescurrentWidth, cienPuntosPorcentualescurrentWidth)
        barraDeProgreso.style.width = `${currentWidthReal}px`
    }
})

buttonDisminuirVelocidad.addEventListener('click', () => {
    rate = Math.max(rate - 1, 1)
    speechSynthesis.cancel()
    readText(textToRead)
    if (currentWidthPorcentual === 10) {
        rate = 0.5
        currentWidthPorcentual = 5
        numeroVelocidadActual.innerText = '0.5'
        currentWidthReal = diezPuntosPorcentualescurrentWidth / 2
        barraDeProgreso.style.width = `${currentWidthReal}px`
    }
    else {
        currentWidthPorcentual = Math.max(currentWidthPorcentual - 10, 5)
        numeroVelocidadActual.innerText = `${currentWidthPorcentual / 10}`        
        currentWidthReal = Math.max(currentWidthReal - diezPuntosPorcentualescurrentWidth, diezPuntosPorcentualescurrentWidth / 2)
        barraDeProgreso.style.width = `${currentWidthReal}px`
    }
})