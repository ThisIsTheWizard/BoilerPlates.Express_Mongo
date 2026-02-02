# BoilerPlates.Express_Mongo

![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)
![Express](https://img.shields.io/badge/Express-4-black?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-6.green?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow)

A boilerplate setup for running an **Express.js** backend with **MongoDB** using Docker Compose.
This repository provides a ready-to-use Express API connected to a MongoDB database for rapid backend development.

---

## 🚀 Features

- Express.js REST API
- MongoDB database in a Docker container
- Mongo Express for database administration
- Environment-based configuration
- Dockerized for easy setup and deployment

---

## 📂 Project Structure

```
BoilerPlates.Express_Mongo/
└───src/
   ├───server.js
   ├───middlewares/
   │   ├───authorizer.js
   │   ├───error.js
   │   └───index.js
   ├───modules/
   │   ├───controllers.js
   │   ├───entities.js
   │   ├───helpers.js
   │   ├───routers.js
   │   ├───services.js
   │   ├───**/
   │   │   ├───**.controller.js
   │   │   ├───**.model.js
   │   │   ├───**.helper.js
   │   │   ├───**.router.js
   │   │   └───**.service.js
   ├───routes/
   │   └───index.js
   └───utils/
      ├───database/
      │   └───index.js
      ├───error/
      │   └───index.js
      └───seed/
         └───**.seed.js
```

---

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/ThisIsTheWizard/BoilerPlates.Express_Mongo.git
cd BoilerPlates.Express_Mongo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Rename the `.env.sample` file into `.env` and customize as needed (MongoDB URI, ports, credentials, etc.)

### 4. Initialize private key for mongo

```bash
openssl rand -base64 756 > mongo-keyfile
chmod 600 mongo-keyfile
```

### 5. Start services

```bash
docker-compose up -d --build
```

---

## 🌐 Access

- **Express API** → `http://localhost:8000`
- **MongoDB** → `mongodb://localhost:27017`
- **Mongo Express** → [http://localhost:8081](http://localhost:8081)
  - Login with credentials from `.env`

---

## 🛠️ Commands

- Start containers:

  ```bash
  docker-compose up -d --build
  ```

- Stop containers:

  ```bash
  docker-compose down
  ```

- View logs:

  ```bash
  docker-compose logs -f
  ```

- Run Express server locally:

  ```bash
  npm run dev
  ```

---

## 📦 Volumes

Data is persisted via Docker volumes:

- `mongo_express_data` → Stores Mongo Express configuration
- `mongo_one_data` → Stores MongoDB database files
- `mongo_two_data` → Stores MongoDB database files

---

## 📝 License

This boilerplate is provided under the MIT License.
Feel free to use and modify it for your projects.

---

👋 Created by [Elias Shekh](https://portfolio.wizardcld.com)
If you find this useful, ⭐ the repo or reach out!
