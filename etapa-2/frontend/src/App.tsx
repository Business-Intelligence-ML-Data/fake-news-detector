import logo from './assets/logo.svg'
import { useForm, SubmitHandler } from 'react-hook-form';

interface VerifyNewsForm {
  titulo: string;
  descripcion: string;
}

interface ContribForm {
  archivo: FileList;
}

function App() {
  const {
    register: registerNews,
    handleSubmit: handleSubmitNews,
    reset: resetNews
  } = useForm<VerifyNewsForm>();

  const {
    register: registerContrib,
    handleSubmit: handleSubmitContrib,
    reset: resetContrib
  } = useForm<ContribForm>();

  const onSubmitNews: SubmitHandler<VerifyNewsForm> = (data: VerifyNewsForm) => {
    console.log("Datos del formulario de verificación:", data);
    // Llamada al backend para verificar la noticia
    resetNews();
  };

  const onSubmitContrib: SubmitHandler<ContribForm> = (data: ContribForm) => {
    console.log("Datos del formulario de contribución:", data);
    // Llamada al backend para entrenar el sistema
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

      <main className='flex flex-row justify-center h-screen bg-[#F5F5F5] py-4 px-52 gap-14'>
        <form
          onSubmit={handleSubmitNews(onSubmitNews)}
          className='flex flex-col gap-4 w-1/2 border border-gray-400 h-fit p-8 rounded-md'
        >
          <h1 className='text-3xl font-bold h-20'>Detector de noticias falsas</h1>

          <div className='h-48 gap-4 flex flex-col'>
            <div>
              <label className="block mb-2 text-sm font-medium text-[#002452]">Titulo</label>
              <input
                {...registerNews("titulo", { required: true })}
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                placeholder="Escribe el titulo de la noticia"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-[#002452]">Descripción</label>
              <textarea
                {...registerNews("descripcion", { required: true })}
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                placeholder="Escribe la descripción de la noticia"
              />
            </div>
          </div>

          <button
            className="hover:cursor-pointer rounded-md bg-[#002452] py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-[#002452f0] focus:shadow-none active:bg-[#002452f0] hover:bg-[#002452f0] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            type="submit"
          >
            Verificar noticia
          </button>
        </form>

        <form
          onSubmit={handleSubmitContrib(onSubmitContrib)}
          className='flex flex-col gap-4 w-1/2 border border-gray-400 h-fit p-8 rounded-md'
        >
          <h1 className='text-3xl font-bold h-20'>Contribuir al sistema con noticias verificadas</h1>

          <div className='h-48'>
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
      </main>
    </>
  )
}

export default App;
