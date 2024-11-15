import sys
import pyttsx3
import requests
from bs4 import BeautifulSoup

import mysql.connector
import os

def main():
    link = extraerLinkDeArgumentos()
    result = requests.get(link)
    content = result.text

    soup = BeautifulSoup(content, 'lxml')

    title = soup.find('h1', class_='article-headline left').get_text()
    subtitle = soup.find('h2', class_='article-subheadline left').get_text()
    bodyParagraph = soup.find_all('p', class_='paragraph')

    bodyParagraphText = f'{title}.{subtitle}.'
    for paragraph in bodyParagraph:
        bodyParagraphText += f' {paragraph.get_text()}'
    

    if not comandosDeMySQLEstaEnLaBaseDeDatos(title):
        guardarDatosEnBaseDeDatos(title, link)
    return bodyParagraphText
        

    # leerParrafo(bodyParagraphText)



def extraerLinkDeArgumentos():
    if len(sys.argv) != 2:
        sys.exit('newsReader.py link')
    return sys.argv[1]

# def leerParrafo(bodyParagraph):
#     engine = pyttsx3.init()
#     engine.setProperty('voice', 'HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech\Voices\Tokens\TTS_MS_ES-MX_SABINA_11.0')
#     engine.say(bodyParagraph)
#     engine.runAndWait()

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
    main()
