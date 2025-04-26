const express = require('express');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const app = express();

app.use(express.static(__dirname));
app.use(express.json());
app.use(fileUpload());
app.use(cors());  

const jsonFilePath = path.join(__dirname, 'test.json');
const imagesDir = path.join(__dirname, 'images');

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

app.get('/test.json', (req, res) => {
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
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
        let uploadPath = path.join(imagesDir, imageFile.name);

        imageFile.mv(uploadPath, (err) => {
            if (err) {
                console.error('Error uploading file:', err);
                return res.status(500).send(err);
            }

            newWord.imageUrl = `/images/${imageFile.name}`;
            addWordToJSON(newWord, res);
        });
    } else {
        addWordToJSON(newWord, res);
    }
});

function addWordToJSON(newWord, res) {
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
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
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
