const express = require('express');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.static(__dirname));
app.use(express.json());
app.use(fileUpload());
app.use(cors());

const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

// GitHub config
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'your_github_token_here';
const GITHUB_OWNER = 'iliass-coder';
const GITHUB_REPO = 'English';
const GITHUB_BRANCH = 'master';
const GITHUB_FILE_PATH = 'words.json';

async function readJsonFromGitHub() {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`;
    const res = await axios.get(url, {
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });
    return {
        content: JSON.parse(Buffer.from(res.data.content, 'base64').toString('utf-8')),
        sha: res.data.sha,
    };
}

async function writeJsonToGitHub(data, sha) {
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;
    await axios.put(
        url,
        {
            message: 'Update word.json from app',
            content,
            sha,
            branch: GITHUB_BRANCH,
        },
        {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json',
            },
        }
    );
}

app.get('/word.json', async (req, res) => {
    try {
        const { content } = await readJsonFromGitHub();
        res.json(content);
    } catch (err) {
        console.error('Error reading from GitHub:', err.message);
        res.status(500).send('Error reading JSON file');
    }
});

app.post('/add-word', async (req, res) => {
    let newWord = JSON.parse(req.body.wordData);

    if (req.files && req.files.image) {
        let imageFile = req.files.image;
        let uploadPath = path.join(imagesDir, imageFile.name);

        imageFile.mv(uploadPath, async (err) => {
            if (err) {
                console.error('Error uploading file:', err);
                return res.status(500).send(err);
            }

            newWord.imageUrl = `/images/${imageFile.name}`;
            await addWordToGitHubJson(newWord, res);
        });
    } else {
        await addWordToGitHubJson(newWord, res);
    }
});

async function addWordToGitHubJson(newWord, res) {
    try {
        const { content, sha } = await readJsonFromGitHub();
        content.push(newWord);
        await writeJsonToGitHub(content, sha);
        res.send('✅ Word added successfully to GitHub');
    } catch (err) {
        console.error('Error updating GitHub JSON:', err.message);
        res.status(500).send('Error writing JSON to GitHub');
    }
}

app.get('/search-word', async (req, res) => {
    const query = req.query.q.toLowerCase();
    try {
        const { content } = await readJsonFromGitHub();
        const result = content.filter(wordEntry => wordEntry.word.toLowerCase().includes(query));
        res.json(result);
    } catch (err) {
        console.error('Error searching GitHub JSON:', err.message);
        res.status(500).send('Error reading JSON file');
    }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
