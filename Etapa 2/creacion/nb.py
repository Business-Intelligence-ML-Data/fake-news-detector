import pandas as pd
df = pd.read_csv('./fake_news_spanish.csv', delimiter=';')
X_train = df[['Titulo', 'Descripcion', 'Fecha']]
y_train = df['Label']
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer

# 1. Definimos el ColumnTransformer para vectorizar cada columna por separado
preprocessor = ColumnTransformer(
    transformers=[
        ('titulo_tfidf', TfidfVectorizer(ngram_range=(1, 3), smooth_idf=False), 'Titulo'),
        ('desc_tfidf', TfidfVectorizer(ngram_range=(1, 3), smooth_idf=False), 'Descripcion')
    ],
    remainder='drop'  # ignorar otras columnas, si las hubiera
)

from sklearn.naive_bayes import MultinomialNB

from sklearn.pipeline import Pipeline

from personalizedFunctions import replace_nan_with_description, replace_nan_with_description_array, NGramsTransformer, StemmingTransformer, nan_replacer, port_stem, stop_words


# Create the new pipeline with Naïve Bayes
pipeline_nb = Pipeline([
    ('nan_replacer', nan_replacer),
    ('stemmer', StemmingTransformer()),
    ('ngrams', NGramsTransformer()),
    ('preprocessor', preprocessor),
    ('nb', MultinomialNB(alpha=2.0))  # Replace KNN with Naïve Bayes
])

# Train the pipeline
pipeline_nb.fit(X_train, y_train)

from joblib import dump, load
dump(pipeline_nb, 'pipeline_nb.pkl')