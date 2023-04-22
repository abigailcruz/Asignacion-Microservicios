const express = require("express"); // importa Express
const router = express.Router(); // crea un nuevo enrutador de Express
const data = require("../../data/data-library"); // importa los datos de data-library
const axios = require("axios");

const logger = (message) => console.log(`Author Services: ${message}`);

// define un controlador para la ruta raíz ("/")
router.get("/", (req, res) => {
  const response = {
    // crea una respuesta con información sobre los libros
    service: "books",
    architecture: "microservices",
    length: data.dataLibrary.books.length,
    data: data.dataLibrary.books,
  };
  logger("Get book data"); // registra un mensaje en los registros
  return res.send(response); // devuelve la respuesta al cliente
});

// define un controlador para la ruta "/title/:title"
router.get("/title/:title", (req, res) => {
  // busca los libros que contengan el título buscado
  const titles = data.dataLibrary.books.filter((title) => {
    return title.title.includes(req.params.title);
  });
  // crea una respuesta con información sobre los libros que coinciden con el título buscado
  const response = {
    service: "books",
    architecture: "microservices",
    length: titles.length,
    data: titles,
  };
  return res.send(response); // devuelve la respuesta al cliente
});

//TODO: Listar todos los libros escritos por un autor buscando por: nombre o id

router.get("/books/:author", async(req, res) => {
  try {
    const authorSearch= req.params.author;
    let books = [];

    // Verificamos si el parámetro es un ID de autor o un nombre de autor
    if (isNaN(authorSearch)) {
      // Si es un nombre de autor, buscamos el autor por nombre
      const response = await axios.get(`http://nginx:8080/api/v2/authors/author/${authorSearch}`);
      const authors = response.data.data;

      // Obtenemos los libros donde el autor coincide con alguno de los autores encontrados
      books = data.dataLibrary.books.filter((book) => {
        return authors.some((author) => author.id == book.authorid);
      });
    } else {
      // Si es un ID de autor, buscamos los libros directamente
      books = data.dataLibrary.books.filter((book) => {
        return book.authorid == authorSearch;
      });
    }

    // Creamos un objeto de respuesta con los datos de los libros encontrados
    const response = {
      service: "books",
      architecture: "microservices",
      data: books,
    };

    // Enviamos la respuesta
    return res.send(response);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "No se han podido obtener los libros" });
  }
});


//TODO: Listar todos los libros según rango de años

router.get("/yearbook/:yearRange", async (req, res) => {

  const books = data.dataLibrary.books;
  
  let result = [];

  const yearRange = req.params.yearRange;

  switch (yearRange) {
    case "1900-1930":
      result = books.filter((book) => book.year >= 1900 && book.year <= 1930);
      break;
    case ">=1900":
      result = books.filter((book) => book.year >= 1900);
      break;
    case "<=1900":
      result = books.filter((book) => book.year <= 1900);
      break;
    case "=1900":
      result = books.filter((book) => book.year === 1900);
      break;
    default:
      return res.status(400).send({ error: "Debes ingresar un rango de años válido" });
  }


  // Creamos un objeto de respuesta con los datos de los libros encontrados
  const response = {
    service: "books",
    architecture: "microservices",
    data: result,
  };

  return res.send(response);
});


//TODO:  Listar los libros distribuidos en ese país

router.get("/:country/", (req, res) => {
  // Filtramos los libros donde el país de distribución coincide con el que se envía en la solicitud
  const books = data.dataLibrary.books.filter((book) => {
    return book.distributedCountries.includes(req.params.country);
  });
  console.log(books)
  // Seleccionamos únicamente los campos que deseamos devolver
  const filteredBooks = books.map((book) => ({
    id: book.id,
    title: book.title,
    authorid: book.authorid,
    imageLink: book.imageLink,
    link: book.link,
    pages: book.pages,
    year: book.year,
  }));

  // Creamos un objeto de respuesta con los datos de los libros filtrados
  const response = {
    service: "books",
    architecture: "microservices",
    data: filteredBooks,
  };

  // Enviamos la respuesta
  return res.send(response);
});







module.exports = router; // exporta el enrutador de Express para su uso en otras partes de la aplicación

/*
Este código es un ejemplo de cómo crear una API de servicios utilizando Express y un enrutador. El enrutador define dos rutas: una para obtener todos los libros y otra para obtener libros por título. También utiliza una función simple de registro para registrar mensajes en los registros.
*/
