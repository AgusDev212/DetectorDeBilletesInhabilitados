import { useMemo, useState } from "react";
import rangosImagen from "./img/Billetes_Inhabilitados_OK.jpg";

const RANGOS_INHABILITADOS = {
  50: [
    [77100001, 77550000],
    [78000001, 78450000],
    [78900001, 96350000],
    [96350001, 96800000],
    [96800001, 97250000],
    [98150001, 98600000],
    [104900001, 105350000],
    [105350001, 105800000],
    [106700001, 107150000],
    [107600001, 108050000],
    [108050001, 108500000],
    [109400001, 109850000],
  ],
  20: [
    [87280145, 91646549],
    [96650001, 97100000],
    [99800001, 100250000],
    [100250001, 100700000],
    [109250001, 109700000],
    [110600001, 111050000],
    [111050001, 111500000],
    [111950001, 112400000],
    [112400001, 112850000],
    [112850001, 113300000],
    [114200001, 114650000],
    [114650001, 115100000],
    [115100001, 115550000],
    [118700001, 119150000],
    [119150001, 119600000],
    [120500001, 120950000],
  ],
  10: [
    [67250001, 67700000],
    [69050001, 69500000],
    [69500001, 69950000],
    [69950001, 70400000],
    [70400001, 70850000],
    [70850001, 71300000],
    [76310012, 85139995],
    [86400001, 86850000],
    [90900001, 91350000],
    [91800001, 92250000],
  ],
};

const ESTILO_TABLA_POR_CORTE = {
  10: {
    fondo: "bg-blue-50 border-blue-200",
    encabezado: "bg-blue-100 text-blue-800",
    celda: "border-blue-100",
  },
  20: {
    fondo: "bg-orange-50 border-orange-200",
    encabezado: "bg-orange-100 text-orange-800",
    celda: "border-orange-100",
  },
  50: {
    fondo: "bg-purple-50 border-purple-200",
    encabezado: "bg-purple-100 text-purple-800",
    celda: "border-purple-100",
  },
};

const ESTILO_CAMPO_POR_CORTE = {
  10: "border-blue-300 bg-blue-50 text-blue-900 ring-blue-500/30",
  20: "border-orange-300 bg-orange-50 text-orange-900 ring-orange-500/30",
  50: "border-purple-300 bg-purple-50 text-purple-900 ring-purple-500/30",
};

function App() {
  const [corte, setCorte] = useState("10");
  const [numeroSerie, setNumeroSerie] = useState("");

  const manejarCambioCorte = (nuevoCorte) => {
    setCorte(nuevoCorte);
    setNumeroSerie("");
  };

  const limpiarFormulario = () => {
    setNumeroSerie("");
  };

  const valorSerie = useMemo(() => {
    if (!numeroSerie) {
      return null;
    }

    return Number(numeroSerie);
  }, [numeroSerie]);

  const estaInhabilitado = useMemo(() => {
    if (valorSerie === null || Number.isNaN(valorSerie)) {
      return null;
    }

    const rangos = RANGOS_INHABILITADOS[corte] ?? [];

    return rangos.some(
      ([desde, hasta]) => valorSerie >= desde && valorSerie <= hasta,
    );
  }, [corte, valorSerie]);

  const mensajeEstado = useMemo(() => {
    if (!numeroSerie.trim()) {
      return {
        texto: "Ingresa un número de serie para validar.",
        clase: "bg-slate-100 text-slate-700 border-slate-300",
      };
    }

    if (estaInhabilitado) {
      return {
        texto: "BILLETE INHABILITADO",
        clase: "bg-red-100 text-red-700 border-red-400",
      };
    }

    return {
      texto: "Billete habilitado",
      clase: "bg-green-100 text-green-700 border-green-400",
    };
  }, [estaInhabilitado, numeroSerie]);

  const rangosDelCorte = RANGOS_INHABILITADOS[corte] ?? [];
  const estiloTabla =
    ESTILO_TABLA_POR_CORTE[corte] ?? ESTILO_TABLA_POR_CORTE[10];
  const estiloCampoValor =
    ESTILO_CAMPO_POR_CORTE[corte] ?? ESTILO_CAMPO_POR_CORTE[10];

  const rangoCoincidente = useMemo(() => {
    if (!estaInhabilitado || valorSerie === null || Number.isNaN(valorSerie)) {
      return null;
    }

    return (
      rangosDelCorte.find(
        ([desde, hasta]) => valorSerie >= desde && valorSerie <= hasta,
      ) ?? null
    );
  }, [estaInhabilitado, rangosDelCorte, valorSerie]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto grid w-full max-w-5xl gap-8 rounded-2xl bg-white p-6 shadow-lg md:grid-cols-2 md:p-8">
        <div className="space-y-5">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Detector de billetes no válidos
          </h1>
          <p className="text-sm text-slate-600 md:text-base">
            Selecciona el valor del billete e ingresa su número de serie. La
            verificación se realiza en tiempo real según los rangos oficiales de
            la imagen.
          </p>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Valor del billete
            </span>
            <select
              value={corte}
              onChange={(event) => manejarCambioCorte(event.target.value)}
              className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${estiloCampoValor}`}
            >
              <option value="10">Bs 10</option>
              <option value="20">Bs 20</option>
              <option value="50">Bs 50</option>
            </select>
          </label>

          <div className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Número de serie
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={numeroSerie}
                onChange={(event) =>
                  setNumeroSerie(event.target.value.replace(/\D/g, ""))
                }
                placeholder="Ejemplo: 104950000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2"
              />
              <button
                type="button"
                onClick={limpiarFormulario}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div
            className={`rounded-xl border-2 px-4 py-5 text-center text-2xl font-extrabold tracking-wide ${mensajeEstado.clase}`}
          >
            {mensajeEstado.texto}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-800">
              Rangos inhabilitados para Bs {corte}
            </h2>
            <div
              className={`max-h-52 overflow-y-auto rounded-lg border ${estiloTabla.fondo}`}
            >
              <table className="w-full border-collapse text-sm text-slate-700">
                <thead className={`sticky top-0 ${estiloTabla.encabezado}`}>
                  <tr>
                    <th
                      className={`border-b px-3 py-2 text-left font-semibold ${estiloTabla.celda}`}
                    >
                      Desde
                    </th>
                    <th
                      className={`border-b px-3 py-2 text-left font-semibold ${estiloTabla.celda}`}
                    >
                      Hasta
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rangosDelCorte.map(([desde, hasta]) => {
                    const esRangoCoincidente =
                      rangoCoincidente &&
                      rangoCoincidente[0] === desde &&
                      rangoCoincidente[1] === hasta;

                    return (
                      <tr
                        key={`${desde}-${hasta}`}
                        className={
                          esRangoCoincidente ? "bg-red-100 text-red-700" : ""
                        }
                      >
                        <td
                          className={`border-b px-3 py-2 font-mono ${estiloTabla.celda}`}
                        >
                          {desde}
                        </td>
                        <td
                          className={`border-b px-3 py-2 font-mono ${estiloTabla.celda}`}
                        >
                          {hasta}
                          {esRangoCoincidente && "  ← coincide"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <img
            src={rangosImagen}
            alt="Rangos de billetes inhabilitados"
            className="h-auto w-full rounded-xl border border-slate-200 object-cover shadow-sm"
          />
          <p className="text-xs text-slate-500">
            Fuente: rangos oficiales mostrados en la imagen proporcionada.
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
