// netlify-functions/scrapear.js

require('dotenv').config();  // Cargar las variables de entorno desde un archivo .env
const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2');

exports.handler = async function(event, context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'  // Permite solicitudes desde cualquier dominio
    // Si solo quieres permitir solicitudes de tu dominio específico:
    // 'Access-Control-Allow-Origin': 'https://newsreaderfp.netlify.app'
  };

  const { link } = JSON.parse(event.body);  // Extraer el enlace del cuerpo de la solicitud

  if (!link) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'URL no proporcionada' }),
    };
  }

  const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQL_PASSWORD,  // Asegúrate de definir esta variable en un archivo .env
    database: 'news_links'
  });

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
    if (!(await comandosDeMySQLEstaEnLaBaseDeDatos(db, title))) {
      guardarDatosEnBaseDeDatos(db, title, link);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        titulo: title,
        subtitulo: subtitle,
        cuerpo: bodyParagraphText,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// Guardar en la base de datos
function guardarDatosEnBaseDeDatos(db, title, link) {
  crearTablaSiNoExiste(db);

  const query = 'INSERT INTO enlaces (title, link) VALUES (?, ?)';
  db.query(query, [title, link], (err, result) => {
    if (err) {
      console.error('Error al guardar en la base de datos:', err.stack);
      return;
    }
    console.log(`${result.affectedRows} registro(s) insertado(s).`);
  });
}

// Crear la base de datos y la tabla si no existen
function crearTablaSiNoExiste(db) {
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

// Verificar si el título ya está en la base de datos
function comandosDeMySQLEstaEnLaBaseDeDatos(db, title) {
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