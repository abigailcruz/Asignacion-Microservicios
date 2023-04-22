// Importamos la biblioteca Express
const express = require("express");
const axios = require("axios");
// Importamos el archivo data-library.js que contiene la información sobre los países.
const data = require("../../data/data-library");

// Creamos un router de Express
const router = express.Router();

// Creamos una función de registro que imprime mensajes de registro en la consola
const logger = (message) => console.log(`Countries Service: ${message}`);

// Creamos una ruta GET en la raíz del router que devuelve todos los países
router.get("/", (req, res) => {
  // Creamos un objeto de respuesta con información sobre el servicio y los datos de los países
  const response = {
    service: "countries",
    architecture: "microservices",
    length: data.dataLibrary.countries.length,
    data: data.dataLibrary.countries,
  };
  // Registramos un mensaje en la consola
  logger("Get countries data");
  // Enviamos la respuesta al cliente
  return res.send(response);
});

//TODO: Listar el nombre del país al que pertenece.

router.get("/country/:capitalName", async (req, res) => {
  const capitalName = req.params.capitalName;
  const countries = data.dataLibrary.countries;

  // Buscamos el país correspondiente a la capital recibida
  const country = Object.values(countries).find((c) => c.capital === capitalName);
  if (country) {
    try {
      // Hacemos una solicitud al endpoint de autores para obtener información sobre los autores del país
      const authorsResponse = await axios.get(`http://nginx:8080/api/v2/authors/country/${country.name}`);
      const authors = authorsResponse.data.data.map((item) => item.author);
      

      // Hacemos una solicitud al endpoint de libros para obtener información sobre los libros del país
      const booksResponse = await axios.get(`http://nginx:8080/api/v2/books/${country.name}`);
      

      // Si las solicitudes son exitosas, se crea un objeto de respuesta con el nombre del país, la información de los autores y la información de los libros
      const response = {
        service: "countries",
        architecture: "microservices",
        country: country.name,
        authors: authors,
        books: booksResponse.data
      };
      // Enviamos la respuesta al cliente
      return res.send(response);
    } catch (error) {
      // Si alguna de las solicitudes falla, se muestra un error 500
      const errorResponse = {
        error: `Error al obtener información para el país ${country.name}`,
      };
      // Registramos un mensaje en la consola
      logger(`Error: ${error.message}`);
      // Enviamos la respuesta al cliente
      return res.status(500).send(errorResponse);
    }
  } else {
     // Si no encontramos ningún país con esa capital, se muestra un error 404
     const errorResponse = {
      error: `No se encontró ningún país con la capital ${capitalName}`,
    };
    // Registramos un mensaje en la consola
    logger(`Error: No se encontró ningún país con la capital ${capitalName}`);
    // Enviamos la respuesta al cliente
    return res.status(404).send(errorResponse);
  }
});

//TODO: Listar países, donde se hable o se use el determinado lenguaje
router.get("/language/:language", (req, res) => {
  const language = req.params.language;

  // Filtramos los países cuyo arreglo de lenguajes incluya el lenguaje solicitado
  const countries = Object.keys(data.dataLibrary.countries)
    .filter((countryCode) => data.dataLibrary.countries[countryCode].languages.includes(language))
    .map((countryCode) => data.dataLibrary.countries[countryCode]);

  // Si no se encuentran países con el lenguaje solicitado, devolvemos un error 404
  if (countries.length === 0) {
    return res.status(404).send({ error: "No se han encontrado paises donde se hable este lenguaje" });
  }

  // Creamos un objeto de respuesta con los datos de los países
  const response = {
    service: "countries",
    architecture: "microservices",
    data: countries,
  };

  // Enviamos la respuesta
  return res.send(response);
});





//Exportamos el router
module.exports = router;
