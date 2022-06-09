FROM node:16-alpine
USER node

ENV WORK /opt/dvk
WORKDIR ${WORK}
RUN mkdir -p ${WORK}
