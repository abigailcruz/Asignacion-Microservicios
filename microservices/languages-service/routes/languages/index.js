const express = require("express"); // importa Express
const router = express.Router(); // crea un nuevo enrutador de Express
//const data = require("../../data/languages-codes"); // importa los datos de data-library
const axios = require("axios");

const logger = (message) => console.log(`Author Services: ${message}`);

//Funcion para parsear csv a json
const Papa = require("papaparse");
const fs = require("fs");

const filePath = "./data/language-codes.csv";
const fileContent = fs.readFileSync(filePath, "utf-8");

const csvToJson = Papa.parse(fileContent, {
  header: true,
  dynamicTyping: true,
});

/* console.log(csvToJson.data); */

// Creamos la ruta para obtener todos los lenguajes
router.get("/", (req, res) => {
  // Creamos un objeto de respuesta con los datos de los lenguajes
  const response = {
    service: "languages",
    architecture: "microservices",
    data: csvToJson.data,
  };

  // Enviamos la respuesta
  return res.send(response);
});


//TODO: listar lenguajes por code o por nombre

router.get("/language/:language", async (req, res) => {
  let result;
  const query = req.params.language;

  // Validar si el parámetro es un código o un nombre de lenguaje
  if (query.length === 2) {
    result = csvToJson.data.find((language) => language.code === query);
  } else {
    result = csvToJson.data.find((language) => language.name === query);
  }

  // Si no se encuentra el lenguaje, se mostrará un error 404
  if (!result) {
    return res.status(404).send({ error: "Lenguaje no encontrado" });
  }

  try {
    // Obtenemos el código de lenguaje
    const languageCode = result.code;

    // Consumimos el endpoint de países con el código de lenguaje obtenido
    const response = await axios.get(`http://nginx:8080/api/v2/countries/language/${languageCode}`);

    // Obtenemos los nombres de los países obtenidos en el endpoint anterior
    const countryNames = response.data.data.map(country => country.name);

    // Creamos un arreglo vacío para almacenar los libros
    let books = [];
    let authors = []

    // Recorremos los nombres de los países y consumimos el endpoint de libros para cada uno
    for (let i = 0; i < countryNames.length; i++) {
      const countryName = countryNames[i];
    
      // Consumimos el endpoint de libros con el nombre del país
      const booksResponse = await axios.get(`http://nginx:8080/api/v2/books/${countryName}`);
    
      // Si se encontraron libros para el país, los agregamos al arreglo de libros
      if (booksResponse.data.data.length > 0) {
        books = [...books, ...booksResponse.data.data];
      }

      // Consumimos el endpoint de autores con el nombre del país
      const authorsResponse = await axios.get(`http://nginx:8080/api/v2/authors/country/${countryName}`);
     

      // Si se encontraron autores para el país, los agregamos al arreglo de autores
      if (authorsResponse.data.data.length > 0) {
        authors = [...authors, ...authorsResponse.data.data];
      }
    }

    // Enviamos la respuesta
    const respuesta = {
      language: result.name,
      countries: response.data.data,
      books,
      authors,
    };

    return res.send(respuesta);
  } catch (error) {
    console.log(error);
    // Si hay un error, devolvemos un error 500
    return res.status(500).send({ error });
  }
});


module.exports = router; // exporta el enrutador de Express para su uso en otras partes de la aplicación

/*
Este código es un ejemplo de cómo crear una API de servicios utilizando Express y un enrutador. El enrutador define dos rutas: una para obtener todos los libros y otra para obtener libros por título. También utiliza una función simple de registro para registrar mensajes en los registros.
*/
