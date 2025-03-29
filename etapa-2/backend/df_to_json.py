import pandas as pd


df = pd.read_csv('./fake_news_spanish.csv', delimiter=';', encoding='utf-8')

#print(df.dtypes)

#df = df.head(1000)

#df = df.drop(labels='ID', axis=1)

#df = df.rename(columns={'Label':'Etiqueta'})

# Convertir DataFrame a JSON
json_data = df.to_json(orient="records", indent=4, force_ascii=False)

# Guardar en un archivo JSON
with open("datos.json", "w") as json_file:
    json_file.write(json_data)

# Mostrar el JSON
#print(json_data)