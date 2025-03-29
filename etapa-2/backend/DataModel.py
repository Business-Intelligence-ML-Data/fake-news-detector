from pydantic import BaseModel

class DataModel(BaseModel):
    Titulo : str
    Descripcion: str
    Fecha: str

    def columns(self):
        return ["Titulo", "Descripcion", "Fecha"]
    

class NewRetrain(BaseModel):
    Titulo: str
    Descripcion: str
    Fecha: str
    Etiqueta: int