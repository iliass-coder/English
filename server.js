const express = require('express');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const cors = require('cors'); 
const app = express();

app.use(express.static(__dirname));
app.use(express.json());
app.use(fileUpload());
app.use(cors());  

// Middleware to determine environment
app.use((req, res, next) => {
    const host = req.get('Host');
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    console.log (host);

        req.jsonFilePath = "https://english2.onrender.com/test.json";
        req.imagesDir = "https://english2.onrender.com/images";
    

    // Ensure the image directory exists
    if (!fs.existsSync(req.imagesDir)) {
        fs.mkdirSync(req.imagesDir);
    }

    next(); // Pass to the next middleware or route handler
});

app.get('/test.json', (req, res) => {
    fs.readFile(req.jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            res.status(500).send('Error reading JSON file');
        } else {
            res.send(data);
        }
    });
});

app.post('/add-word', (req, res) => {
    let newWord = JSON.parse(req.body.wordData);
    if (req.files && req.files.image) {
        let imageFile = req.files.image;
        let uploadPath = path.join(req.imagesDir, imageFile.name);

        imageFile.mv(uploadPath, (err) => {
            if (err) {
                console.error('Error uploading file:', err);
                return res.status(500).send(err);
            }

            newWord.imageUrl = `/images/${imageFile.name}`;
            addWordToJSON(newWord, req.jsonFilePath, res);
        });
    } else {
        addWordToJSON(newWord, req.jsonFilePath, res);
    }
});

function addWordToJSON(newWord, jsonFilePath, res) {
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            res.status(500).send('Error reading JSON file');
        } else {
            const wordsAndDefinitions = JSON.parse(data);
            wordsAndDefinitions.push(newWord);
            fs.writeFile(jsonFilePath, JSON.stringify(wordsAndDefinitions, null, 2), (err) => {
                if (err) {
                    console.error('Error writing JSON file:', err);
                    res.status(500).send('Error writing JSON file');
                } else {
                    res.send('Word added successfully');
                }
            });
        }
    });
}

app.get('/search-word', (req, res) => {
    const query = req.query.q.toLowerCase();
    fs.readFile(req.jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            res.status(500).send('Error reading JSON file');
        } else {
            const wordsAndDefinitions = JSON.parse(data);
            const result = wordsAndDefinitions.filter(wordEntry => wordEntry.word.toLowerCase().includes(query));
            res.send(result);
        }
    });
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
