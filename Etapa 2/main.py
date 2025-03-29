from typing import Optional

from fastapi import FastAPI

from DataModel import DataModel
import pandas as pd
import numpy as np
from joblib import load
from PredictionModel import Model

# Funciones y transformadores usados en el pipeline

#if __name__ != "__main__":
#    model = load("assets/pipeline_nb.pkl")

app = FastAPI()


@app.get("/")
def read_root():
   return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Optional[str] = None):
   return {"item_id": item_id, "q": q}


@app.post("/predict")
def make_predictions(dataModel: DataModel):
   df = pd.DataFrame(dataModel.dict(), columns=dataModel.dict().keys(), index=[0])
   df.columns = dataModel.columns()
   model = Model(df)
   result = model.make_predictions(df)
   if isinstance(result, np.ndarray):
    result = result.tolist()
   return {"prediction": result}

