const express = require("express");
const morgan = require("morgan");
const fs = require("fs-extra");
const path = require("path");

const { fetchFiles } = require("./fetchFiles");

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

app.get("/product/:product", (req, res) => {
    try {
        const productPath = path.join(__dirname, "product", `${req.params.product}.json`);
        if (!productPath.startsWith(path.join(__dirname, "product"))) {
            return res.status(403).send("Oublié");
        }

        fs.readFile(productPath, "utf8", function (err, data) {
            if (err) {
                res.status(404).send("Non trouvé");
            } else {
                res.send(data);
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur interne du serveur");
    }
});
console.log(fetchFiles("./product"));

app.get("/fetch/product", (req, res) => {
    res.send(fetchFiles("./product"));
});
