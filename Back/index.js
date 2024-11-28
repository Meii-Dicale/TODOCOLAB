const express = require('express')
const app = express();
const crudUser = require('./routes/crudUser');
const crudTask = require('./routes/crudTask');
const cors = require('cors');


app.use(cors({
    origin: 'http://localhost:5173', // Autorise uniquement cette origine
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Liste des méthodes autorisées
    allowedHeaders: ['Content-Type', 'Authorization'], // Liste des en-têtes autorisés
  }));

app.use(express.json());



app.use('/user', crudUser);
app.use('/task', crudTask)
app.listen(3007, () =>{
    console.log('port 3007')
})
