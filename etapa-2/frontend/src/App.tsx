import logo from './assets/logo.svg'
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import axios from 'axios';

interface VerifyNewsItem {
  titulo: string;
  descripcion: string;
  fecha: string;
}

interface VerifyNewsForm {
  noticias: VerifyNewsItem[];
}

interface ContribForm {
  archivo: FileList;
}

interface Prediction {
  Titulo: string;
  Descripcion: string;
  Fecha: string;
  prediction: number;   // 1: noticia falsa, 0: noticia verdadera
  confidence: number;
}

interface RetrainResponse {
  message: string;
  new_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    "f1-score": number;
  }
}

function App() {
  // Estados para loader y respuesta de backend
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [retrainLoading, setRetrainLoading] = useState(false);
  const [retrainResult, setRetrainResult] = useState<RetrainResponse | null>(null);

  // Formulario para verificar noticias
  const {
    control,
    register: registerNews,
    handleSubmit: handleSubmitNews,
    reset: resetNews,
    formState: { errors }
  } = useForm<VerifyNewsForm>({
    defaultValues: {
      noticias: [
        { titulo: '', descripcion: '', fecha: '' }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "noticias"
  });

  // Formulario para contribuir
  const {
    register: registerContrib,
    handleSubmit: handleSubmitContrib,
    reset: resetContrib
  } = useForm<ContribForm>();

  // Función para la verificación de noticias
  const onSubmitNews: SubmitHandler<VerifyNewsForm> = async (data) => {
    const payload = data.noticias.map(item => ({
      Titulo: item.titulo,
      Descripcion: item.descripcion,
      Fecha: item.fecha
    }));

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/predict', payload);
      console.log("Respuesta del backend:", response.data);
      setPredictions(response.data);
    } catch (error) {
      alert("Error en la petición: " + error);
    } finally {
      setLoading(false);
      resetNews();
    }
  };

  // Función para procesar el CSV y enviar la data al endpoint de reentrenamiento
  const processCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      // Separamos el contenido por líneas y eliminamos líneas vacías
      const rows = text.split('\n').filter((row) => row.trim() !== '');
      if (rows.length === 0) return;
      
      // Extraemos el encabezado (primera línea)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const header = rows[0].split(';').map(col => col.trim());
      
      // Convertimos cada fila en un objeto
      const data = rows.slice(1).map(row => {
        const values = row.split(';').map(value => value.trim());
        const objectToReturn = {
          ID: (values[0] === null || values[0] === undefined || values[0] === '') ? 'ID' : values[0],
          Titulo: (values[2] === null || values[2] === undefined || values[2] === '') ? null : (values[2] === null || values[2] === undefined || values[2] === '') ? null : values[2],
          Descripcion: (values[3] === null || values[3] === undefined || values[3] === '') ? '' : values[3],
          Fecha: (values[4] === null || values[4] === undefined || values[4] === '') ? '29/03/2025' : values[4],
          Label: (values[1] === null || values[1] === undefined || values[1] === '' || isNaN(Number(values[1]))) ? 1 : Number(values[1]),
        }
        return objectToReturn;
      });


      
      console.log('Datos parseados del CSV:', data);
      
      setRetrainLoading(true);
      try {
        const response = await axios.post('http://localhost:8000/retrain', data);
        console.log("Respuesta del reentrenamiento:", response.data);
        setRetrainResult(response.data);
      } catch (error) {
        alert("Error en el reentrenamiento: " + error);
      } finally {
        setRetrainLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Función que se ejecuta al enviar el formulario de contribución
  const onSubmitContrib: SubmitHandler<ContribForm> = (data) => {
    if (data.archivo && data.archivo.length > 0) {
      const file = data.archivo[0];
      processCSV(file);
    }
    resetContrib();
  };

  return (
    <>
      <header className="bg-[#002452] w-screen flex items-center justify-center p-4 gap-4">
        <img src={logo} alt="mintic logo" />
        <hr className='border-[.5px] h-28 text-white' />
        <h1 className='text-white text-2xl'>
          Ministerio de Tecnologías de la Información y<br />Comunicaciones de Colombia
        </h1>
      </header>

      <main className='h-screen bg-[#F5F5F5] overflow-y-scroll'>
        <div className='flex flex-row justify-center py-4 px-52 gap-14'>
          {/* Formulario para verificar noticias */}
          <form
            onSubmit={handleSubmitNews(onSubmitNews)}
            className='flex flex-col gap-4 w-1/2 border border-gray-400 h-fit p-8 rounded-md'
          >
            <h1 className='text-3xl font-bold h-20'>
              Detector de noticias falsas
              <button
                type="button"
                className="self-start mb-4 text-sm text-[#002452] hover:underline hover:cursor-pointer"
                onClick={() => append({ titulo: '', descripcion: '', fecha: '' })}
              >
                Agregar otra noticia para verificación
              </button>
            </h1>

            <div className='h-64 gap-4 flex flex-col overflow-y-scroll'>
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 p-4 rounded-md mb-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-[#002452]">Titulo</label>
                    <input
                      {...registerNews(`noticias.${index}.titulo`, { required: "El título es obligatorio" })}
                      className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                      placeholder="Escribe el titulo de la noticia"
                    />
                    {errors.noticias && errors.noticias[index]?.titulo && (
                      <span className="text-xs text-red-500">
                        {errors.noticias[index]?.titulo?.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-[#002452]">Descripción</label>
                    <textarea
                      {...registerNews(`noticias.${index}.descripcion`, { required: "La descripción es obligatoria" })}
                      className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                      placeholder="Escribe la descripción de la noticia"
                    />
                    {errors.noticias && errors.noticias[index]?.descripcion && (
                      <span className="text-xs text-red-500">
                        {errors.noticias[index]?.descripcion?.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-[#002452]">Fecha (DD/MM/AAAA)</label>
                    <input
                      {...registerNews(`noticias.${index}.fecha`, {
                        required: "La fecha es obligatoria",
                        pattern: {
                          value: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/,
                          message: "Formato inválido, use DD/MM/AAAA"
                        }
                      })}
                      className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                      placeholder="DD/MM/AAAA"
                    />
                    {errors.noticias && errors.noticias[index]?.fecha && (
                      <span className="text-xs text-red-500">
                        {errors.noticias[index]?.fecha?.message}
                      </span>
                    )}
                  </div>

                  {fields.length > 1 && (
                    <button
                      type="button"
                      className="mt-2 text-xs text-red-500 hover:underline hover:cursor-pointer"
                      onClick={() => remove(index)}
                    >
                      Remover noticia
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              className="hover:cursor-pointer rounded-md bg-[#002452] py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-[#002452f0] focus:shadow-none active:bg-[#002452f0] hover:bg-[#002452f0] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
              type="submit"
            >
              Verificar noticia(s)
            </button>
          </form>

          {/* Formulario para contribuir al sistema */}
          <form
            onSubmit={handleSubmitContrib(onSubmitContrib)}
            className='flex flex-col gap-4 w-1/2 border border-gray-400 h-fit p-8 rounded-md'
          >
            <h1 className='text-3xl font-bold h-20'>Contribuir al sistema con noticias verificadas</h1>

            <div className='h-64'>
              <div>
                <label className="block mb-2 text-sm font-medium text-[#002452]">Archivo</label>
                <input
                  type="file"
                  accept=".csv"
                  {...registerContrib("archivo", { required: true })}
                  className="file:cursor-pointer cursor-pointer file:border-0 file:mr-4 file:bg-gray-100 file:hover:bg-gray-200 file:text-slate-500 w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                />
                <p className="text-xs text-slate-500 mt-2">
                  El archivo debe ser en formato csv, separado por punto y coma (;) y con las columnas ID, Label, Titulo, Descripcion y Fecha.
                </p>
              </div>
            </div>

            <button
              className="hover:cursor-pointer rounded-md bg-[#002452] py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-[#002452f0] focus:shadow-none active:bg-[#002452f0] hover:bg-[#002452f0] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
              type="submit"
            >
              Entrenar el sistema
            </button>
          </form>
        </div>

        {/* Sección para mostrar el loader o la tabla de resultados de verificación */}
        <section className="px-52 mt-8">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-300 rounded"></div>
              <div className="h-6 bg-gray-300 rounded"></div>
              <div className="h-6 bg-gray-300 rounded"></div>
            </div>
          ) : (
            predictions.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-[#002452] text-white">
                      <th className="px-4 py-2 border">Titulo</th>
                      <th className="px-4 py-2 border">Descripción</th>
                      <th className="px-4 py-2 border">Fecha</th>
                      <th className="px-4 py-2 border">Resultado</th>
                      <th className="px-4 py-2 border">Confianza</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((item, index) => (
                      <tr key={index} className="text-center">
                        <td className="px-4 py-2 border">{item.Titulo}</td>
                        <td className="px-4 py-2 border">{item.Descripcion}</td>
                        <td className="px-4 py-2 border">{item.Fecha}</td>
                        <td className="px-4 py-2 border">
                          {item.prediction === 1 ? "Noticia falsa" : "Noticia verdadera"}
                        </td>
                        <td className="px-4 py-2 border">
                          Este resultado tiene un {(item.confidence * 100).toFixed(0)}% de probabilidad de ser correcto
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </section>

        {/* Sección para mostrar el loader o la tabla con resultados del reentrenamiento */}
        <section className="px-52 mt-8">
          {retrainLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-300 rounded"></div>
              <div className="h-6 bg-gray-300 rounded"></div>
              <div className="h-6 bg-gray-300 rounded"></div>
            </div>
          ) : (
            retrainResult && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Resultados del reentrenamiento</h2>
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-[#002452] text-white">
                      <th className="px-4 py-2 border">Métrica</th>
                      <th className="px-4 py-2 border">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border">Precisión global</td>
                      <td className="px-4 py-2 border">
                        {`El modelo ahora clasifica correctamente el ${(retrainResult.new_metrics.accuracy * 100).toFixed(0)}% de las noticias.`}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border">Exactitud</td>
                      <td className="px-4 py-2 border">
                        {`Ahora, el ${(retrainResult.new_metrics.precision * 100).toFixed(0)}% de las noticias etiquetadas como falsas son realmente falsas.`}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border">Sensibilidad</td>
                      <td className="px-4 py-2 border">
                        {`El modelo reconoce correctamente el ${(retrainResult.new_metrics.recall * 100).toFixed(0)}% de las noticias verdaderas.`}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border">Balance F1</td>
                      <td className="px-4 py-2 border">
                        {`El equilibrio entre precisión y exhaustividad es de ${(retrainResult.new_metrics["f1-score"] * 100).toFixed(0)}%.`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          )}
        </section>
      </main>
    </>
  )
}

export default App;
