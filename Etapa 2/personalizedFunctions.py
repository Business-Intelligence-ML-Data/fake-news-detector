import pandas as pd
from sklearn.preprocessing import FunctionTransformer
import nltk
from nltk.util import ngrams
from nltk.corpus import stopwords
import re
from nltk.stem.porter import PorterStemmer


def replace_nan_with_description(df):
    for index, row in df.iterrows():
        if pd.isna(row['Titulo']):
            description = row['Descripcion']
            if isinstance(description, str):
                first_sentence = description.split('.')[0]
                df.at[index, 'Titulo'] = first_sentence
    return df

def replace_nan_with_description_array(X):
    df = pd.DataFrame(X, columns=['Titulo', 'Descripcion', 'Fecha'])  # reconstruir el df
    df = replace_nan_with_description(df)
    return df

nan_replacer = FunctionTransformer(replace_nan_with_description_array, validate=False)


stop_words = list(set(stopwords.words('spanish') + stopwords.words('english')))

from sklearn.base import BaseEstimator, TransformerMixin
class NGramsTransformer(BaseEstimator, TransformerMixin):
    def __init__(self, n_grams=[2, 3]):  # contaremos con bigramas y trigramas
        self.n_grams = n_grams

    def generate_ngrams(self, text, n):
        if isinstance(text, str):
            words = [word for word in text.split() if word not in stop_words]
            n_grams = ngrams(words, n)
            return [' '.join(grams) for grams in n_grams]
        return []

    def transform(self, X, y=None):
        df = X.copy()
        for n in self.n_grams:
            df[f'Titulo_{n}grams'] = df['Titulo'].apply(lambda x: self.generate_ngrams(x, n))
            df[f'Descripcion_{n}grams'] = df['Descripcion'].apply(lambda x: self.generate_ngrams(x, n))
        return df

    def fit(self, X, y=None):
        return self





port_stem = PorterStemmer()

class StemmingTransformer(BaseEstimator, TransformerMixin):
    def __init__(self):
        pass

    def stem_text(self, content):
        if isinstance(content, str):
            # Eliminar caracteres no alfabeticos
            content = re.sub(r'[^a-zA-Z]', ' ', content)
            content = content.lower()
            # Palabras tokenizadas
            words = content.split()
            # Stemming y eliminar stopwords
            stemmed_words = [port_stem.stem(word) for word in words if word not in stop_words]
            return " ".join(stemmed_words)
        return ""

    def transform(self, X, y=None):
        df = X.copy()
        df['Titulo'] = df['Titulo'].apply(self.stem_text)
        df['Descripcion'] = df['Descripcion'].apply(self.stem_text)
        return df

    def fit(self, X, y=None):
        return self  # No fitting needed
