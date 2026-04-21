let datosSostenibilidad = [];

// cargar el SVG de fondo con d3.js
d3.xml("./Sostenibilidad.svg").then(xml => {
    const importedNode = document.importNode(xml.documentElement, true);
    d3.select("#svg-background").node().appendChild(importedNode);
});

// cargar los datos de la api
async function cargarDatos() {
    try {
        const response = await fetch('/api/sostenibilidad');
        const todosLosRegistros = await response.json();
        
        // filtrar estaciones únicas
        const estacionesUnicas = [];
        const nombresVistos = new Set();
        todosLosRegistros.forEach(r => {
            if (!nombresVistos.has(r.Estacion)) {
                nombresVistos.add(r.Estacion);
                estacionesUnicas.push(r);
            }
        });

        datosSostenibilidad = estacionesUnicas;
        // reiniciar el selector cada vez que se recarga
        const selector = document.getElementById('zona-selector');
        selector.innerHTML = '<option value="" disabled selected>COMPARA POR ZONAS &nbsp;&nbsp; ≡</option>';

        // cargar los datos para cada estación
        datosSostenibilidad.forEach((d, i) => {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = d.Estacion;
            selector.appendChild(option);
        });

        // actualizar las gráficas
        selector.addEventListener('change', (e) => {
            const index = e.target.value;
            if (index !== "") {
                actualizarGraficas(datosSostenibilidad[index]);
            }
        });
    } catch (error) { console.error(error); }
}

// creación/actualización de las gráficas
function actualizarGraficas(registro) {
    const contaminantes = ["SO2", "NO2", "O3", "CO", "PM10", "PM2.5"];
    
    // obtener los valores reales de la API
    const valoresSin = contaminantes.map(c => parseFloat(registro[c]) || 0);
    
    // simular una reducción del 20% para "Con G2G"
    const valoresCon = valoresSin.map(v => v * 0.9);

    const desplazamientoFlotante = 2; // para que las barras 'floten'

    const commonLayout = {
        height: 380,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        showlegend: false,
        margin: { t: 40, b: 40, l: 40, r: 20 },
        
        // configuración del eje Y
        yaxis: { 
            // empezamos un poco por debajo de 0 para que el eje se vea limpio bajo las barras
            range: [0, Math.max(...valoresSin) * 1.3], 
            showgrid: false,
            linecolor: '#630099',
            linewidth: 2,
            tickcolor: '#630099',
            tickfont: { color: '#000000' },
            zeroline: true,
            zerolinecolor: '#630099'
        },

        // configuración del eje X
        xaxis: {
            showgrid: false,
            linecolor: '#630099',
            linewidth: 2,
            tickcolor: '#630099',
            tickfont: { color: '#000000' }
        },

        font: { family: 'sans-serif', size: 13}
    };

    // configuración para las barras
    const configBarras = {
        type: 'bar',
        // la barra empiece en 2 en lugar de 0
        base: desplazamientoFlotante, 
        marker: { 
            color: ['#8500CC', '#630099', '#A601FF', '#420066', '#420066', '#630099'],
            cornerradius: 10
        }
    };

    // gráfica SIN
    Plotly.newPlot('grafica-sin', [{
        ...configBarras,
        x: contaminantes,
        y: valoresSin
    }], { ...commonLayout}, {responsive: true, displayModeBar: false});

    // gráfica CON
    Plotly.newPlot('grafica-con', [{
        ...configBarras,
        x: contaminantes,
        y: valoresCon
    }], { ...commonLayout}, {responsive: true, displayModeBar: false});
}

cargarDatos();