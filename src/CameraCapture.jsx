import { useRef, useState, useEffect } from "react";
import { createWorker } from "tesseract.js";

export default function CameraCapture({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let mounted = true;
    let s;
    async function start() {
      try {
        s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (!mounted) return;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          // algunos navegadores requieren play explícito
          try {
            await videoRef.current.play();
          } catch (e) {
            // puede fallar si el usuario no interactuó aún
          }
          // si la pista se detiene inesperadamente, cierra el modal
          s.getVideoTracks().forEach((track) => {
            track.onended = () => {
              alert("La cámara se ha desconectado.");
              onClose();
            };
          });
        }
        setStream(s);
      } catch (err) {
        console.error("Error accessing camera", err);
        alert("No se pudo acceder a la cámara. Comprueba los permisos.");
        onClose();
      }
    }

    start();
    return () => {
      mounted = false;
      if (s) {
        s.getTracks().forEach((t) => t.stop());
      }
    };
  }, [onClose]);

  async function capture() {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // algunos dispositivos aún no reportan tamaño correcto al inicio
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert("La cámara todavía no está lista, espera un momento y vuelve a intentar.");
      return;
    }

    // pinta el frame completo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    // recorta una sección central horizontal (aprox. 75% ancho, 20% alto)
    const cropW = canvas.width * 0.75;
    const cropH = canvas.height * 0.2;
    const cropX = (canvas.width - cropW) / 2;
    const cropY = (canvas.height - cropH) / 2;

    const cropped = document.createElement("canvas");
    cropped.width = cropW;
    cropped.height = cropH;
    const cctx = cropped.getContext("2d");
    cctx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    setProcessing(true);

    try {
      let blob = await new Promise((res) => cropped.toBlob(res, "image/jpeg"));
      if (!blob) {
        console.warn("cropped.toBlob returned null, usando imagen completa");
        blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg"));
      }
      console.log("blob size", blob.size);
      // crear worker con idiomas cargados de una vez (misma técnica que en los scripts Node)
      const worker = await createWorker("eng+spa");
      const { data } = await worker.recognize(blob);
      await worker.terminate();

      const match = data.text.match(/\d{6,}/);
      if (match) {
        onDetected(match[0]);
      } else {
        alert("No se detectó ningún número de serie. Intenta nuevamente.");
      }
    } catch (err) {
      console.error("Error durante OCR", err);
      alert("Ocurrió un error procesando la imagen. Intenta de nuevo.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-full max-h-[90vh] rounded-lg bg-white p-2 md:p-4 flex flex-col overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-gray-700 hover:text-gray-900 z-10"
        >
          ✕
        </button>
        <div className="relative flex-grow overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-full rounded-md bg-black object-contain"
          />
          {/* guía de recorte */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-1/6 border-2 border-yellow-300" />
          </div>
          {processing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-blue-500 border-gray-200" />
            </div>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-slate-600">
          Alinea la serie dentro del recuadro amarillo antes de tomar la foto.
        </p>
        <canvas ref={canvasRef} className="hidden" />
        <div className="mt-3 flex justify-between sticky bottom-0 bg-white py-2">
          <button
            onClick={capture}
            disabled={processing}
            className="relative flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {processing ? (
              <>
                <svg
                  className="mr-2 h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Procesando...
              </>
            ) : (
              "Tomar foto"
            )}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
