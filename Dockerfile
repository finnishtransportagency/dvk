FROM public.ecr.aws/docker/library/node:18.16.0-alpine
ENV WORK /opt/dvk
WORKDIR ${WORK}
RUN mkdir -p ${WORK}
RUN npm install -g npm@9
RUN apk add --no-cache \
        bash \
        python3 \
        py3-pip \
        pkgconfig \
        pixman-dev \
        cairo-dev \
        pango-dev \
        make \
        g++ \
    && pip3 install --upgrade pip \
    && pip3 install \
        awscli \
    && rm -rf /var/cache/apk/*
 