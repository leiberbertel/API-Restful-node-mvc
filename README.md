# Movie API Restful 
### _This is an API for the basic operation of a movie app with MVC architecture_:
![Static Badge](https://img.shields.io/badge/version-1.0-brightgreen)
![Static Badge](https://img.shields.io/badge/Node-20-brightgreen)

## Running the API 🚀

To run the API, you will need Node.js version 17+ installed on your machine.
[Download it here:](https://nodejs.org/en)

First, clone the repository :

```bash
git clone https://github.com/leiberbertel/API-Restful-node-mvc.git
cd API-Restful-node-mvc
```

Next, open your command terminal and located in the project root, execute the commands:

```bash
npm install 
```

```bash 
# Environment MySQL
npm run start:mysql

# Environment MongoDB
npm run start:mongodb

# Environment Local
npm run start:local
```


The application will launch and be running on port 1234

All endpoints and schemas are documented using Swagger UI. You can view the documentation at http://localhost:1234/swagger-ui/index.html#/, which is the default endpoint for the Swagger UI.

## Built with 🛠
 * Node version 20.9 - Language used
 * MySQL - Database Engine
 * MongoDB - Database Engine
 * Express - Framework used
 * Zod - Model Validation Unit
 * Dotenv - Dependency for environment variables
 * Semistandard - Dependency to format the code

