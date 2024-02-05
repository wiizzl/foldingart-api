const express = require("express");
const morgan = require("morgan");
const fs = require("fs-extra");
const path = require("path");

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use("product", express.static("product"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // TODO: remplacer * par le domaine du site web lorsque ce dernier sera hébergé
    res.header("Access-Control-Allow-Methods", "GET, POST");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log("Serveur lancé sur le port :", PORT);
});

function getAllFiles(basePath) {
    let allFiles = [];
    fs.readdirSync(basePath).forEach((dossier) => {
        const files = fetchFiles(path.join(basePath, dossier));
        allFiles = allFiles.concat(files);
    });

    return allFiles;
}

function fetchFiles(basePath) {
    let allFiles = [];
    fs.readdirSync(basePath).forEach((dossier) => {
        allFiles.push({
            folder: path.basename(basePath),
            file: dossier.split(".")[0],
        });
    });
    return allFiles;
}

app.get("/data/:dossier/:file", (req, res) => {
    try {
        const dossierParam = req.params.dossier;
        const fileParam = req.params.file;

        const dataPath = path.join(__dirname, "data", dossierParam);
        const filePath = path.join(dataPath, `${fileParam}.json`);

        if (!fs.existsSync(dataPath) || !filePath.startsWith(path.join(__dirname, "data", dossierParam))) {
            return res.status(403).send("Oublié");
        }

        fs.readFile(filePath, "utf8", function (err, data) {
            if (err) {
                res.status(404).send("Fichier non trouvé");
            } else {
                res.send(data);
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur interne du serveur");
    }
});

app.get("/fetch/:dossier", (req, res) => {
    try {
        const dossierParam = req.params.dossier;
        const dataPath = path.join(__dirname, "data");

        if (dossierParam === "all") {
            const allFiles = getAllFiles(dataPath);
            res.send(allFiles);
        } else {
            const dossierPath = path.join(dataPath, dossierParam);

            if (!fs.existsSync(dossierPath)) {
                return res.status(404).send("Dossier non trouvé");
            }

            const files = fetchFiles(dossierPath);
            res.send(files);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur interne du serveur");
    }
});
