const express = require("express");
const morgan = require("morgan");
const fs = require("fs-extra");

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // TODO: remplacer * par le domaine du site web lorsque ce dernier sera hébergé
    res.header("Access-Control-Allow-Methods", "GET, POST");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.get("/data/:id", (req, res) => {
    const idRecherche = req.params.id;

    fs.readFile("./data/product.json", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send("Erreur lors de la lecture du fichier JSON");
            return;
        }
        const contenuJSON = JSON.parse(data);

        if (idRecherche === "all") {
            res.json(contenuJSON);
            return;
        }
        const elementTrouve = contenuJSON.find((element) => element.id === idRecherche);
        if (!elementTrouve) {
            res.status(404).send("Produit non trouvé");
            return;
        }
        res.json(elementTrouve);
    });
});

const port = 3000;
app.listen(port, () => {
    console.log("Serveur lancé sur le port :", port);
});
