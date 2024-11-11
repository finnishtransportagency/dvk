FROM public.ecr.aws/docker/library/node:22-alpine3.20 
ENV WORK /opt/dvk
WORKDIR ${WORK}
RUN mkdir -p ${WORK} \
    && npm install -g npm@10 \
    && apk add --no-cache \
        bash \
        cairo-dev \
        g++ \
        make \
        pango-dev \
        pixman-dev \
        pkgconfig \
        py3-pip \
        python3 \
    # since alpine3.19 external packages need to be installed 
    # within a virtual python environment https://docs.python.org/3/library/venv.html
    && python3 -m venv /opt/venv \  
    && source /opt/venv/bin/activate \
    && pip3 install --upgrade pip \
    && pip3 install \
        awscli \
    && rm -rf /var/cache/apk/*

ENV PATH="/opt/venv/bin:$PATH"


 