require('dotenv').config()
const express = require('express')
const db= require('./models')
const app = express()
const PORT = 8000;
const cors = require('cors');


app.use(cors({
    origin: 'http://localhost:3000' ,
    credentials: true
  }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = require('./routes')
app.use("/",router)

db.sequelize.sync({ force: true }).then(() => {
    app.listen(PORT, () => {
        console.log(`http://localhost:${PORT}`);
    });
});