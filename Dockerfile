FROM node:16-alpine
ENV WORK /opt/dvk
WORKDIR ${WORK}
RUN mkdir -p ${WORK} && chown node:node ${WORK}
USER node
