require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.MYSQL_PASSWORD,
  database: 'news_links'
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.stack);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Crear la base de datos y la tabla si no existen
function crearTablaSiNoExiste() {
  const query = `
    CREATE DATABASE IF NOT EXISTS news_links;
    USE news_links;
    CREATE TABLE IF NOT EXISTS enlaces (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      link TEXT NOT NULL
    );
  `;
  db.query(query, (err) => {
    if (err) {
      console.error('Error al crear la base de datos o la tabla:', err.stack);
    }
  });
}

// Rutas de la API
app.post('/scrapear', async (req, res) => {
  const { link } = req.body;
  if (!link) {
    return res.status(400).json({ error: 'URL no proporcionada' });
  }

  try {
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);

    // Extraer datos
    const title = $('h1.article-headline.left').text();
    const subtitle = $('h2.article-subheadline.left').text();
    let bodyParagraphText = '';
    $('p.paragraph').each((i, el) => {
      bodyParagraphText += $(el).text() + ' ';
    });

    // Verificar si ya está en la base de datos
    if (!(await comandosDeMySQLEstaEnLaBaseDeDatos(title))) {
      guardarDatosEnBaseDeDatos(title, link);
    }

    return res.json({
      titulo: title,
      subtitulo: subtitle,
      cuerpo: bodyParagraphText
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

// Guardar en la base de datos
function guardarDatosEnBaseDeDatos(title, link) {
  crearTablaSiNoExiste();

  const query = 'INSERT INTO enlaces (title, link) VALUES (?, ?)';
  db.query(query, [title, link], (err, result) => {
    if (err) {
      console.error('Error al guardar en la base de datos:', err.stack);
      return;
    }
    console.log(`${result.affectedRows} registro(s) insertado(s).`);
  });
}

// Verificar si el título ya está en la base de datos
function comandosDeMySQLEstaEnLaBaseDeDatos(title) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM enlaces WHERE title = ?';
    db.query(query, [title], (err, results) => {
      if (err) {
        reject(err);
      }
      resolve(results.length > 0);
    });
  });
}

// Exportar el handler como función Netlify
module.exports.handler = serverless(app);