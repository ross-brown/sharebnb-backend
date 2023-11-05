
# ShareBnB Backend

A RESTful API for a outdoor space sharing platform built with Express.js. Built to interact with data about users, listings, and messages, as well as authentication/authorization.

Demo: https://rbrown-sharebnb.surge.sh

Link to frontend repo: https://github.com/ross-brown/sharebnb-frontend
## Tech Stack
![alt text](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white&style=for-the-badge)

![alt text](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white&style=for-the-badge)

![alt text](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

![alt text](https://img.shields.io/badge/json%20web%20tokens-323330?style=for-the-badge&logo=json-web-tokens&logoColor=pink)


## Features
- AWS S3 image upload functionality to show photos for posted listings
- JSON Schema for server-side validation of JSON requests
- Custom Object-oriented ORM with classes to communicate with  PostgreSQL database
- JSON Web Tokens for authentication
## Run Locally

Go to the project directory after cloning the repo

```bash
cd sharebnb-backend
```

Install dependencies

```bash
npm install
```
Create and seed the database

```bash
$ psql -f sharebnb.sql
```

Start the server

```bash
npm start
```



## Future Features

- Write tests
- Delete and Edit a Listing
- Available table in DB, book a listing for certain dates
    -  Possibily add a calender date-picker
- Admin accounts
- More filters for searching listings
- Add TypeScipt with Express 




## Authors

- [Ross Brown](https://www.github.com/ross-brown)
- [Chris Alley](https://www.github.com/cp-alley)

