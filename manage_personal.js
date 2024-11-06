const express = require('express');
const {MongoClient, ObjectId} = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const url = "mongodb://localhost:27017";
const dbName = 'bonussystem';
let dbo;

app.use(express.json());

//initialize database
MongoClient.connect(url)
    .then(client => {
        console.log('Connected to MongoDB');
        dbo = client.db(dbName);
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });


app.post('/salesman/create/', async (req, res) => {
    try {
        const id = req.body.id;
        const name = req.body.name;
        const firstname = req.body.firstname;

        // Check, if ID is valid
        const salesman = {
            _id: id ? new ObjectId(id) : new ObjectId(), //if there is no ID, a random will be generated
            name: `${name}`,
            firstname: `${firstname}`
        };

        const result = await dbo.collection("salesman").insertOne(salesman);
        const insertedId = result.insertedId;

        console.log(`Inserted salesman ${firstname} ${name} with id: ${insertedId}`);
        res.send(`Created new salesman with ID: ${insertedId}`);
    } catch (err) {
        console.error('Error inserting salesman:', err);
        res.status(500).send('Error inserting salesman');
    }
});

app.post('/salesman/:salesmanId/performanceRecord/add', async (req, res) => {
    try {
        const recordId = req.body.id;
        const salesmanId = req.params.salesmanId;
        const record = {
            recordId: recordId ? new ObjectId(recordId) : new ObjectId(), //if there is no ID, a random will be generated
            year: req.body.year,
            description: req.body.description,
            score: req.body.score
        };

        const result = await dbo.collection('salesman').updateOne(
            {_id: new ObjectId(salesmanId)},
            {$push: {performanceRecords: record} }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({message: 'Salesman not found'});
        }

        console.log(`Inserted performance record ${recordId}`);
        res.send(`Created new performance record with ID: ${recordId}`);
    } catch (err) {
        res.status(500).json({message: err.message});
        console.log("Error inserting performance record")
    }
});

app.get('/salesman/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const item = await dbo.collection('salesman').findOne({ _id: new ObjectId(id) });
        if (!item) return res.status(404).json({message: 'Item not found'});
        console.log(`Get request for salesman ${id}`);
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/salesman/', async (req, res) => {
    try {
        const items = await dbo.collection('salesman').find().toArray();
        console.log("Get request for all salesman");
        res.json(items);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

app.get('/salesman/:salesmanId/performance', async (req, res) => {
    try {
        const salesmanId = req.params.salesmanId;
        const salesman = await dbo.collection('salesman').findOne(
            {_id: new ObjectId(salesmanId)},
            {projection: {performanceRecords: 1} }
        );

        if (!salesman) {
            return res.status(404).json({ message: 'Salesman not found' });
        }

        console.log(`Get request for performance record for salesman ${salesmanId}`);
        res.json(salesman.performanceRecords || []);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

app.delete('/salesman/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await dbo.collection('salesman').deleteOne({_id: new ObjectId(id)});

        if(result.deletedCount === 0){
            return res.status(404).json({message: 'Item not found'});
        }

        console.log(`Salesman with the id ${id} has been deleted`);
        res.json({message: 'Salesman deleted'});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

app.delete('/salesman/:salesmanId/performance/:recordId', async (req, res) => {
    try {
        const salesmanId = req.params.salesmanId;
        const recordId = req.params.recordId;

        const result = await dbo.collection('salesman').updateOne(
            {_id: new ObjectId(salesmanId)},
            {$pull: {performanceRecords: {recordId: new ObjectId(recordId)}}}
        );

        if(result.matchedCount === 0){
            return res.status(404).json({message: 'Salesman not found'});
        }
        if(result.modifiedCount === 0){
            return res.status(404).json({message: 'Record not found'});
        }

        console.log(`Performance report with id ${recordId} has been deleted`);
        res.json({message: `Performance record with id: ${recordId} has been deleted`});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
});

//public void addSocialPerformanceRecord(SocialPerformanceRecord record , SalesMan salesMan );

//public List<SocialPerformanceRecord> readSocialPerformanceRecord( SalesMan salesMan );