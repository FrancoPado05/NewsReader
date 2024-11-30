const form = document.getElementById('link-input-container');
const title = document.getElementById('title')
const subtitle = document.getElementById('subtitle')
const containerBodyParagraph = document.getElementById('container-body-paragraph')
const linkInput = document.getElementById('link-input');
const buttonPauseResume = document.getElementById('button-pause-resume');
const buttonCancel = document.getElementById('button-cancel');
const buttonAumentarVelocidad = document.getElementById('button-aumentar-speed');
const buttonDisminuirVelocidad = document.getElementById('button-decrementar-speed');

const numeroVelocidadActual = document.getElementById('numero-velocidad-actual')
const barraDeProgreso = document.getElementById('barra-de-velocidad');

const diezPuntosPorcentualescurrentWidth = parseFloat(window.getComputedStyle(barraDeProgreso).width);
const cienPuntosPorcentualescurrentWidth = diezPuntosPorcentualescurrentWidth * 10;

let currentWidthReal = diezPuntosPorcentualescurrentWidth
let currentWidthPorcentual = 10

let rate = 1
let textToRead = ''

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

const cancel = () => {
   speechSynthesis.cancel()
   textToRead = ''
}

form.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const link = linkInput.value;

    containerBodyParagraph.innerHTML = '<p class="body-paragraph">Cargando...</p>';
    try {
        speechSynthesis.cancel()
        const response = await fetch('http://127.0.0.1:5000/scrapear', {
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