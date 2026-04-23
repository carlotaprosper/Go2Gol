const express = require('express');
const path = require('path');

const app = express();

app.get('/api/sostenibilidad', async (req, res) => {
    console.log("Petición recibida en /api/sostenibilidad");

    try {
        const url = 'https://opendata.vlci.valencia.es/api/3/action/datastore_search?resource_id=19b5a1a7-5888-4d3e-b69b-3c1436d64e6e&limit=10000';
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.result && data.result.records) {
            res.json(data.result.records);
        } else {
            res.status(500).json({ error: "Respuesta inválida de la API externa" });
        }
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ error: "No se pudieron obtener los datos" });
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;