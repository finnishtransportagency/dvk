FROM public.ecr.aws/docker/library/node:16.15.1-alpine
ENV WORK /opt/dvk
WORKDIR ${WORK}
RUN mkdir -p ${WORK}
RUN npm install --location=global esbuild
