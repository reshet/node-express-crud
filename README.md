# Build Node.js CRUD server with Express and MongoDB

Learning project sample

## REST API

CRUD Rest API is fully in index.js file. Details on accessing database is in data.js file. Project itself works with User(id, email, password) Mongo Model, introduces passwords storage in bcrypt hashed format in db, does auth and login with password check against stored hash, and also secures some of the routes to only authenticated users, checking the presence of the valid JWT token with passport.js library.

## Error-checking middleware 

Errors.js file contains different error types and handler function. index.js file has use of handling middleware both sync and async error handling is demonstrated under various routes.
