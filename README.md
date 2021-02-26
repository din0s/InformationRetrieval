# Information Retrieval
This project implements a simple search engine, which consists of web crawling, creating the inverted index and serving the results through a query processor that ranks the documents based on TF-IDF cosine similarity. Multi-threading is supported in all three stages of the application.

## Deployment
- **Web crawler:** Python 3.9 and Anaconda
- **Indexer:** Java 8 and Gradle v6.7
- **Query processor:** NodeJS v15.8
- **Database:** MongoDB v4.4

Alternatively, you can use **Docker** and **Docker Compose** to run each and every component:
```sh
$ docker-compose build
$ docker-compose up
```

## Screenshots
![homepage](https://i.imgur.com/9VwyyVN.png)

![Results Page](https://i.imgur.com/sKP5TzJ.png)

## Authors
- Konstantinos Papakostas (papakosk@csd.auth.gr)
- Christina Kreza (chriskreza@csd.auth.gr)
