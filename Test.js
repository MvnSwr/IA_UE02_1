const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.get('/employees/:id', (req, res) => {
    const id = req.params.id;
    console.log(`Submited ID is: ${id}`);
    res.send("{\"id\" : " + id + ", \"name\" : \"Meyer\"}");
});

app.post('/employee/create/', function (req, res){
    const name = req.body.name;
    const id = req.body.id;
    console.log(`Create new Employee: Name: ${name}, ID: ${id}`);
    res.send("OK");
});

app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
})