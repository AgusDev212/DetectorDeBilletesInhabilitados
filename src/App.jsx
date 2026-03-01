import { useMemo, useState } from "react";
import rangosImagen from "./img/rangos.jpg";

const RANGOS_INHABILITADOS = {
  50: [
    [69950001, 70400000],
    [70400001, 70850000],
    [70850001, 71300000],
    [76310012, 85139995],
    [86400001, 86850000],
    [90900001, 91350000],
    [91800001, 92250000],
    [118700001, 119150000],
    [119150001, 119600000],
    [120500001, 120950000],
  ],
  20: [
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
  ],
  10: [
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-blue-500 focus:ring-2"
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
            <ul className="max-h-44 space-y-1 overflow-y-auto text-sm text-slate-700">
              {rangosDelCorte.map(([desde, hasta]) => (
                <li
                  key={`${desde}-${hasta}`}
                  className={`rounded px-2 py-1 font-mono ${
                    rangoCoincidente &&
                    rangoCoincidente[0] === desde &&
                    rangoCoincidente[1] === hasta
                      ? "border border-red-300 bg-red-100 text-red-700"
                      : ""
                  }`}
                >
                  {desde} - {hasta}
                  {rangoCoincidente &&
                    rangoCoincidente[0] === desde &&
                    rangoCoincidente[1] === hasta &&
                    "  ← coincide"}
                </li>
              ))}
            </ul>
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
