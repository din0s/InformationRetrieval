FROM continuumio/miniconda3 AS build

COPY requirements.txt .
RUN conda env create -n crawler -f requirements.txt && \
    conda install -c conda-forge conda-pack && \
    conda-pack -n crawler -o /tmp/env.tar && \
    mkdir /venv && cd /venv && tar xf /tmp/env.tar && \
    rm /tmp/env.tar && \
    /venv/bin/conda-unpack

FROM debian:buster

COPY --from=build /venv /venv

WORKDIR /krepa
COPY src ./crawler

SHELL [ "/bin/bash", "-c" ]

ENTRYPOINT  source /venv/bin/activate && \
            python crawler/main.py $WEBSITE $PAGES $APPEND $THREADS
