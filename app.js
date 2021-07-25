'use strict';
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()

const port = 8080;
const host = '0.0.0.0';
//Mongodb
const { MongoClient } = require("mongodb");
//Insert private mongoURL credentials
const uri = "...";
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(cors())
app.use(express.json())
//Routes
app.get('/', (req, res) => res.send('EkoGo Backend'));

app.post('/login', async function (req, res) {
    await client.connect();
    const database = client.db('EkoGo');
    const collection_name = database.collection('users');
    var credentials = req.body;
    //Definimos el query
    const query = { user: credentials['user'] };
    await collection_name.findOne(query)
        .then(user_found => {
            if (user_found != null) {
                if (user_found['password'] == credentials['password']) res.json({ status: 'Accepted', userName: user_found['userName'] });
                else res.json({ status: 'Denied', message: 'Contraseña Incorrecta' });
            }
            else res.json({ status: 'Denied', message: 'Usuario Incorrecto' });

        })
        .catch(e => {
            //console.log(e);
            res.json({ message: 'Error en el sistema de autenticación' });
        });
});
//Obtener todos los supermercados
app.get('/allSupermarkets', async (req, res) => {
    var dataArray = [];
    await client.connect();
    const database = client.db('EkoGo');
    const collection_name = database.collection('supermarkets');
    const findResult = collection_name.find({});;
    await findResult.forEach(data => dataArray.push(data));
    //console.log(dataArray[0]);
    //console.log('Found documents =>', findResult);
    res.json({ results: dataArray[0] });

});
//Obtener productos de 1 supermercado
app.get('/supermarketProducts/:supermarketName',async (req, res) => {
    var superName = req.params.supermarketName;
    await client.connect();
    const database = client.db('EkoGo');
    const collection_name = database.collection('supermarketProducts');
    const filteredDocs = await collection_name.find({ supermarketName: superName }).toArray();
    res.json({results:filteredDocs});

})

app.get('/insert', async (req, res) => {
    await client.connect();
    const database = client.db('EkoGo');
    const collection_name = database.collection('supermarketProducts');
    const result = await collection_name.insertOne(data)
        .then(params => {
            //res.json({message:`${result.insertedCount} document was inserted with the _id: ${result.insertedId}`});
            res.json({ message: 'Insertado!' });
        })
        .catch(e => {
            res.json({ message: 'Error Insertando' });
        });
})

app.listen(port, host);
console.log(`Running on http://${host}:${port}`);
