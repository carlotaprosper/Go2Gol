const express = require('express');
const path = require('path');
const app = express();

// 1. LAS RUTAS DE LA API PRIMERO
app.get('/api/sostenibilidad', async (req, res) => {
    console.log("Petición recibida en /api/sostenibilidad");
    try {
        const url = 'https://opendata.vlci.valencia.es/api/3/action/datastore_search?resource_id=19b5a1a7-5888-4d3e-b69b-3c1436d64e6e&limit=10000';
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            console.log("Datos obtenidos con éxito de Valencia");
            res.json(data.result.records);
        } else {
            res.status(500).json({ error: "Error en la API de Valencia" });
        }
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ error: "No se pudieron obtener los datos" });
    }
});

// 2. DESPUÉS EL SERVIDOR DE ARCHIVOS ESTÁTICOS
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => {
    console.log('Servidor activo en http://localhost:3000');
});