import requests
from bs4 import BeautifulSoup

import mysql.connector
import os

from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup

from flask_cors import CORS

app = Flask(__name__)
CORS(app)
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})

@app.route('/scrapear', methods=['POST'])

def scrapear():

    data = request.json

    link = data.get('link')
    if not link:
        return jsonify({'error': 'URL no proporcionada'}), 400 # 'error 400' significa Bad Request (Solicitud Incorrecta)

    try:
        result = requests.get(link)
        content = result.text

        soup = BeautifulSoup(content, 'lxml')

        title = soup.find('h1', class_='article-headline left').get_text()
        subtitle = soup.find('h2', class_='article-subheadline left').get_text()
        bodyParagraph = soup.find_all('p', class_='paragraph')

        bodyParagraphText = []
        for paragraph in bodyParagraph:
            bodyParagraphText.append(paragraph.get_text())
        

        if not comandosDeMySQLEstaEnLaBaseDeDatos(title):
            guardarDatosEnBaseDeDatos(title, link)
        return jsonify({
            'titulo': title,
            'subtitulo':subtitle,
            'cuerpo': bodyParagraphText
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500 # 'error 500' significa Internal Server Error
    
def guardarDatosEnBaseDeDatos(title, link):
    # Conexión a MySQL
    conexion = mysql.connector.connect(
        host = "localhost",
        user = "root",
        password = os.getenv('MYSQL_PASSWORD')
    )

    cursor = conexion.cursor()

    comandosDeMySQLGuardarEnBaseDeDatos(cursor, title, link)

    conexion.commit()

    print(f"{cursor.rowcount} registros insertados.")

    # Cerrar la conexión
    cursor.close()
    conexion.close()

def crearTablaSiNoExiste(cursor):
    # Crear la base de datos
    cursor.execute("CREATE DATABASE IF NOT EXISTS news_links")
    cursor.execute("USE news_links")

    # Crear la tabla
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS enlaces (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            link TEXT NOT NULL
        )
    """)


def comandosDeMySQLGuardarEnBaseDeDatos(cursor, title, link):
    
    cursor.execute("USE news_links")

    # Insertar datos en la tabla
    cursor.execute("INSERT INTO enlaces (title, link) VALUES (%s, %s)", (title, link))

def comandosDeMySQLEstaEnLaBaseDeDatos(title):
    conexion = mysql.connector.connect(
        host = "localhost",
        user = "root",
        password = os.getenv('MYSQL_PASSWORD')
    )

    cursor = conexion.cursor()

    crearTablaSiNoExiste(cursor)

    cursor.execute('SELECT * FROM enlaces WHERE title = %s', (title,))

    filaEncontrada = cursor.fetchall()
    if not filaEncontrada:
        return False
    return True

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)