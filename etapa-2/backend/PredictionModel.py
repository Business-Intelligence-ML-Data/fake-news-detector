from joblib import load

from personalizedFunctions import replace_nan_with_description, replace_nan_with_description_array, NGramsTransformer, StemmingTransformer, nan_replacer, port_stem, stop_words


class Model:
    def _init_(self, columns):
        self.model = load("pipeline_nb.pkl")

    def make_predictions(self, data):
        result = self.model.predict(data)
        return result 
    
    def predict_proba(self, X):
        return self.model.predict_proba(X)