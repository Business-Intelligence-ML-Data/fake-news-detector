from typing import Optional

from fastapi import FastAPI, HTTPException

from DataModel import DataModel, NewRetrain
import pandas as pd
import numpy as np
from joblib import load, dump
from PredictionModel import Model
from typing import List

from personalizedFunctions import (
    replace_nan_with_description, replace_nan_with_description_array, 
    NGramsTransformer, StemmingTransformer, nan_replacer, port_stem, stop_words
)
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

app = FastAPI()


@app.get("/")
def read_root():
   return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Optional[str] = None):
   return {"item_id": item_id, "q": q}


@app.post("/predict")
def make_predictions(dataModels: List[DataModel]):

   df = pd.DataFrame([data.dict() for data in dataModels])
    
   if len(dataModels) > 0:
        df.columns = dataModels[0].columns()
    
   model = Model(df)
   result = model.make_predictions(df)

   probabilities = model.predict_proba(df)
    
   if isinstance(result, np.ndarray):
        result = result.tolist()
    
   confidence = [float(max(prob)) for prob in probabilities]
    
   response = []
   for data, pred, conf in zip(dataModels, result, confidence):
     data_dict = data.dict()
     data_dict["prediction"] = pred
     data_dict["confidence"] = round(conf, 2)
     response.append(data_dict)

   return response

MODEL_PATH = "pipeline_nb.pkl"


@app.post("/retrain")
def retrain(newData: List[NewRetrain]):
   if not newData:
        raise HTTPException(status_code=400, detail="No se enviaron datos para reentrenar.")
   
   df = pd.DataFrame([item.dict() for item in newData])
   X_new = df.drop(columns=["Label"])
   y_new = df["Label"]


   preprocessor = ColumnTransformer(
        transformers=[
            ('titulo_tfid', TfidfVectorizer(ngram_range=(1, 3), smooth_idf=False), 'Titulo'),
            ('desc_tfidf', TfidfVectorizer(ngram_range=(1, 3), smooth_idf=False), 'Descripcion')
        ],
        remainder='drop'
   )

   new_pipeline = Pipeline([
        ('nan_replacer', nan_replacer),
        ('stemmer', StemmingTransformer()),
        ('ngrams', NGramsTransformer()),
        ('preprocessor', preprocessor),
        ('nb', MultinomialNB(alpha=2.0))
    ])

   new_pipeline.fit(X_new, y_new)

   predictions = new_pipeline.predict(X_new)

   metrics = {
     "accuracy": accuracy_score(y_new, predictions),
     "precision": precision_score(y_new, predictions),
     "recall": recall_score(y_new, predictions),
     "f1-score": f1_score(y_new, predictions)
   }

   dump(new_pipeline, MODEL_PATH)

   return {"message": "Modelo reentrenado exitosamente", "new_metrics":metrics}