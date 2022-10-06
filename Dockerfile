FROM public.ecr.aws/docker/library/node:16.15.1-alpine
ENV WORK /opt/dvk
WORKDIR ${WORK}
RUN mkdir -p ${WORK}
RUN npm install --location=global esbuild && apk add bash
RUN apk add --no-cache \
        python3 \
        py3-pip \
    && pip3 install --upgrade pip \
    && pip3 install \
        awscli \
    && rm -rf /var/cache/apk/*
 