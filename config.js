/** Common config for bookstore. */


// let DB_URI = `postgresql://`;

// if (process.env.NODE_ENV === "test") {
//   DB_URI = `${DB_URI}/books-test`;
// } else {
//   DB_URI = process.env.DATABASE_URL || `${DB_URI}/books`;
// }


// module.exports = { DB_URI };



// read .env files and make environmental variables

require("dotenv").config();

const DB_URI = (process.env.NODE_ENV === "test")
  ? `postgresql://myuser:mypassword@localhost/books_test`
  : `postgresql://myuser:mypassword@localhost/books`;



module.exports = { DB_URI };
