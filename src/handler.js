const {nanoid} = require('nanoid');
const storageBooks = require('./books');

const addBookHandler = (request, h) => {
  const checkNameBook = request.payload.hasOwnProperty('name');

  // jika property name kosong, maka berikan message 'Gagal menambahkan buku. Mohon isi nama buku'
  if (!checkNameBook) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  // Mengirimkan data ke body request dengan method payload
  const {name, year, author, summary, publisher, pageCount, readPage, reading} = request.payload;

  const id = nanoid(16);
  const finished = pageCount === readPage ? true : false;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt,
  };

  if (pageCount >= readPage) {
    storageBooks.push(newBook);
  }

  const isSuccess = storageBooks.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  } else if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  let responseBody;
  const query = request.query;
  const {name, reading, finished} = query;

  if (name) {
    const array = [];
    for (let i=0; i<storageBooks.length; i++) {
      if (storageBooks[i].name.toLowerCase().includes(name.toLowerCase())) {
        const {id, name, publisher} = storageBooks[i];
        array.push({id, name, publisher});
      }
    }
    responseBody = {
      'status': 'success',
      'data': {
        'books': array,
      },
    };
    return responseBody;
  }

  if (reading && Number(reading) === 0 || Number(reading) === 1) {
    const array = [];
    for (let i=0; i<storageBooks.length; i++) {
      if (storageBooks[i].reading == reading) {
        const {id, name, publisher} = storageBooks[i];
        array.push({id, name, publisher});
      }
    }
    responseBody = {
      'status': 'success',
      'data': {
        'books': array,
      },
    };
    return responseBody;
  }

  if (finished && Number(finished) === 0 || Number(finished) === 1) {
    const array = [];
    for (let i=0; i<storageBooks.length; i++) {
      if (storageBooks[i].finished == finished) {
        const {id, name, publisher} = storageBooks[i];
        array.push({id, name, publisher});
      }
    }
    responseBody = {
      'status': 'success',
      'data': {
        'books': array,
      },
    };
    return responseBody;
  } else if (finished && Number(finished) !== 0 && Number(finished) !== 1) {
    const array = [];
    for (let i=0; i<storageBooks.length; i++) {
      array.push(
          {id: storageBooks[i].id, name: storageBooks[i].name, publisher: storageBooks[i].publisher},
      );
    }
    responseBody = {
      'status': 'success',
      'data': {
        'books': array,
      },
    };
    return responseBody;
  }

  if (storageBooks.length > 0 && !name && !reading && !finished) {
    const array = [];
    for (let i=0; i<storageBooks.length; i++) {
      array.push(
          {id: storageBooks[i].id, name: storageBooks[i].name, publisher: storageBooks[i].publisher},
      );
    }
    responseBody = {
      'status': 'success',
      'data': {
        'books': array,
      },
    };
    return responseBody;
  } else {
    responseBody = {
      status: 'success',
      data: {
        storageBooks,
      },
    };
    return responseBody;
  }
};

const getBookByIdHandler = (request, h) => {
  const {id} = request.params;
  const book = storageBooks.filter((b) => b.id === id)[0];

  if (book) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const checkNameBook = request.payload.hasOwnProperty('name');
  const {readPage, pageCount} = request.payload;
  const checkPage = readPage <= pageCount;

  // jika request body tidak memiliki property name, maka tampilkan message 'Gagal memperbarui buku. Mohon isi nama buku'
  if (!checkNameBook) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  } else if (!checkPage) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  } else if (checkNameBook && checkPage) {
    const {id} = request.params;

    const {name, year, author, summary, publisher, pageCount, readPage, reading} = request.payload;
    const updatedAt = new Date().toISOString();

    const BookIndex = storageBooks.findIndex((book) => book.id === id);

    if (BookIndex !== -1) {
      storageBooks[BookIndex] = {
        ...storageBooks[BookIndex],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        updatedAt,
      };

      const response = h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
      });
      response.code(200);
      return response;
    }

    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
    return response;
  }
};

const deleteBookByIdHandler = (request, h) => {
  const {id} = request.params;

  const BookIndex = storageBooks.findIndex((book) => book.id === id);

  // jika id ditemukan, maka tampilkan message 'Buku berhasil dihapus'
  if (BookIndex !== -1) {
    storageBooks.splice(BookIndex, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  // jika id tidak ditemukan, maka tampilkan message 'Buku gagal dihapus. Id tidak ditemukan'
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
