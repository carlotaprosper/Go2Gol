const express = require('express');
const path = require('path');
const app = express();

// Middleware para servir los archivos del frontend desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/sostenibilidad', async (req, res) => {
    try {

        const url = 'https://opendata.vlci.valencia.es/api/3/action/datastore_search?resource_id=19b5a1a7-5888-4d3e-b69b-3c1436d64e6e&limit=20';
        
        const response = await fetch(url);
        const data = await response.json();
        
        const records = data.result ? data.result.records : [];
        
        // Log con marca de tiempo
        console.log(`[${new Date().toLocaleTimeString()}] Petición recibida. Registros: ${records.length}`);
        
        res.json(records);
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ error: "Error al obtener los datos" });
    }
});

app.listen(3000, () => console.log('Servidor activo en http://localhost:3000'));