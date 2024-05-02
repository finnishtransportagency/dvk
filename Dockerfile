# alpine3.19 has externally (OS?) installed pip
# and needs to upgraded differently
FROM public.ecr.aws/docker/library/node:20.12-alpine3.18 
ENV WORK /opt/dvk
WORKDIR ${WORK}
RUN mkdir -p ${WORK}
RUN npm install -g npm@10
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
 