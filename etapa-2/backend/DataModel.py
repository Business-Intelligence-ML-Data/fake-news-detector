from pydantic import BaseModel

class DataModel(BaseModel):
    ID: str
    Titulo : str
    Descripcion: str
    Fecha: str

    def columns(self):
        return ["ID", "Titulo", "Descripcion", "Fecha"]
    

class NewRetrain(BaseModel):
    ID: str 
    Titulo: str | None = None
    Descripcion: str
    Fecha: str
    Label: int