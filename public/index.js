let datosSostenibilidad = [];

let svgDashboard = null;
let agujaCO2 = null;
let textoCO2 = null;

const minValorMedidor = 0;
const maxValorMedidor = 50;

const minAngulo = 0;
const maxAngulo = 225;

const pivotX = 996;
const pivotY = 377;

const svgCargado = d3.xml("./Sostenibilidad.svg").then(xml => {
    const importedNode = document.importNode(xml.documentElement, true);
    d3.select("#svg-background").node().appendChild(importedNode);

    svgDashboard = d3.select("#svg-background svg");
    agujaCO2 = svgDashboard.select("#Aguja");

    anguloActualAguja = 0;
    agujaCO2.attr("transform", `rotate(${anguloActualAguja} ${pivotX} ${pivotY})`);


    const numeroOriginal = svgDashboard.select('[id="0000038.90"]');
    if (!numeroOriginal.empty()) {
        numeroOriginal.attr("display", "none");
    }

    textoCO2 = svgDashboard.append("text")
        .attr("id", "co2-valor")
        .attr("x", 995)
        .attr("y", 432)
        .attr("fill", "black")
        .attr("font-size", "20")
        .attr("font-family", "Arial, sans-serif")
        .attr("text-anchor", "middle")
        .text("0000000.00");

    animarGasPorCapas();
});

async function cargarDatos() {
    try {
        await svgCargado;

        const response = await fetch('/api/sostenibilidad');
        const data = await response.json();

        console.log("Respuesta completa API:", data);

    
        const todosLosRegistros =
            data?.result?.records ||
            data?.records ||
            data?.result ||
            data;

        if (!Array.isArray(todosLosRegistros)) {
            throw new Error("La respuesta de /api/sostenibilidad no contiene un array de registros válido.");
        }

        const estacionesUnicas = [];
        const nombresVistos = new Set();

        todosLosRegistros.forEach(r => {
            if (r.Estacion && !nombresVistos.has(r.Estacion)) {
                nombresVistos.add(r.Estacion);
                estacionesUnicas.push(r);
            }
        });

        datosSostenibilidad = estacionesUnicas;

        const selector = document.getElementById('zona-selector');
        selector.innerHTML = '<option value="" disabled selected>COMPARA POR ZONAS &nbsp;&nbsp; ≡</option>';

        datosSostenibilidad.forEach((d, i) => {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = d.Estacion;
            selector.appendChild(option);
        });

        selector.addEventListener('change', (e) => {
            const index = e.target.value;

            if (index !== "") {
                const registro = datosSostenibilidad[index];

                actualizarGraficas(registro);

                const valorMedidor = parseFloat(registro.NO2) || 0;
                actualizarAgujaYTexto(valorMedidor);
            }
        });

    } catch (error) {
        console.error("Error en cargarDatos:", error);
    }
}

// Función para actualizar aguja y número
function actualizarAgujaYTexto(valor) {
    if (!agujaCO2 || agujaCO2.empty()) {
        console.error('No se encontró la aguja. Revisa el id "#Aguja"');
        return;
    }

    const valorNumerico = Number(valor) || 0;
    const valorAjustado = Math.max(minValorMedidor, Math.min(maxValorMedidor, valorNumerico));

    const anguloDestino =
        minAngulo +
        ((valorAjustado - minValorMedidor) / (maxValorMedidor - minValorMedidor)) *
        (maxAngulo - minAngulo);

    // cancelar animaciones previas
    agujaCO2.interrupt();

    // interpolar desde el ángulo actual al nuevo
    agujaCO2
        .transition()
        .duration(700)
        .ease(d3.easeCubicInOut)
        .tween("rotate-needle", function () {
            const interpolador = d3.interpolateNumber(anguloActualAguja, anguloDestino);

            return function (t) {
                const angulo = interpolador(t);
                d3.select(this).attr("transform", `rotate(${angulo} ${pivotX} ${pivotY})`);
            };
        })
        .on("end", () => {
            anguloActualAguja = anguloDestino;
        });

    if (textoCO2) {
        textoCO2.text(formatearNumero(valor));
    }
}

function formatearNumero(valor) {
    return Number(valor).toFixed(2).padStart(10, "0");
}

function actualizarGraficas(registro) {
    const contaminantes = ["SO2", "NO2", "O3", "CO", "PM10", "PM2.5"];

    const valoresSin = contaminantes.map(c => parseFloat(registro[c]) || 0);
    const valoresCon = valoresSin.map(v => v * 0.9);

    const desplazamientoFlotante = 2;

    const commonLayout = {
        height: 380,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        showlegend: false,
        margin: { t: 40, b: 40, l: 40, r: 20 },

        yaxis: {
            range: [0, Math.max(...valoresSin, 10) * 1.3],
            showgrid: false,
            linecolor: '#630099',
            linewidth: 2,
            tickcolor: '#630099',
            tickfont: { color: '#000000' },
            zeroline: true,
            zerolinecolor: '#630099'
        },

        xaxis: {
            showgrid: false,
            linecolor: '#630099',
            linewidth: 2,
            tickcolor: '#630099',
            tickfont: { color: '#000000' }
        },

        font: { family: 'sans-serif', size: 13 }
    };

    const configBarras = {
        type: 'bar',
        base: desplazamientoFlotante,
        marker: {
            color: ['#8500CC', '#630099', '#A601FF', '#420066', '#420066', '#630099'],
            cornerradius: 10
        }
    };

    Plotly.newPlot('grafica-sin', [{
        ...configBarras,
        x: contaminantes,
        y: valoresSin
    }], { ...commonLayout }, { responsive: true, displayModeBar: false });

    Plotly.newPlot('grafica-con', [{
        ...configBarras,
        x: contaminantes,
        y: valoresCon
    }], { ...commonLayout }, { responsive: true, displayModeBar: false });
}

function animarGasPorCapas() {
    if (!svgDashboard) return;

    const grupo1 = svgDashboard.selectAll("#Group_2 path");
    const grupo2 = svgDashboard.selectAll("#Group_2_2 path");
    const grupo3 = svgDashboard.selectAll("#Group_3 path");
    const grupo4 = svgDashboard.selectAll("#Group_4 path");

    function animarGrupo(seleccion, color1, color2, delay = 0) {
        function loop() {
            seleccion
                .interrupt()
                .transition()
                .delay(delay)
                .duration(1000)
                .attr("fill", color1)
                .attr("opacity", 0.95)
                .transition()
                .duration(1000)
                .attr("fill", color2)
                .attr("opacity", 0.55)
                .on("end", loop);
        }
        loop();
    }

    animarGrupo(grupo1, "#B7FF00", "#8CCF4D", 0);
    animarGrupo(grupo2, "#A8E063", "#6AA84F", 150);
    animarGrupo(grupo3, "#9AD14B", "#7FBF3F", 300);
    animarGrupo(grupo4, "#C6FF33", "#99CC33", 450);
}

cargarDatos();