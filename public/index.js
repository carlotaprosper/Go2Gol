document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
});

async function cargarDatos() {
    const contenedor = document.getElementById('resultado');

    try {
        // Hacemos la petición a nuestra propia ruta en Express
        const response = await fetch('/api/sostenibilidad');
        const datos = await response.json();

        if (datos.length === 0) {
            contenedor.innerHTML = '<p>No se encontraron datos.</p>';
            return;
        }

        // Limpiamos el texto de "Cargando..."
        contenedor.innerHTML = '';

        // Recorremos los datos y creamos un bloque HTML para cada uno
        datos.forEach((registro, index) => {
            const div = document.createElement('div');
            div.className = 'registro';
            
            // Como no sé exactamente qué columnas quieres mostrar, 
            // imprimo todo el objeto en formato JSON para que puedas verlo fácilmente.
            div.innerHTML = `
                <h3>Registro #${index + 1}</h3>
                <pre>${JSON.stringify(registro, null, 2)}</pre>
            `;
            
            contenedor.appendChild(div);
        });

    } catch (error) {
        console.error('Error al obtener los datos:', error);
        contenedor.innerHTML = '<p style="color: red;">Error al cargar los datos. Revisa la consola.</p>';
    }
}