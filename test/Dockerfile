FROM ppodgorsek/robot-framework:latest
COPY bin/robot.sh /opt/robotframework/bin/
ENV HOME $ROBOT_WORK_DIR
ENV PATH=$ROBOT_WORK_DIR/.local/bin:$PATH
USER root
RUN dnf remove -y nodejs npm
RUN curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
RUN dnf install -y nodejs
RUN npm install -g npm@latest
RUN dnf update -y \
  libtasn1 \
  curl \
  libcurl \
  openssl-libs \
  xorg-x11-server-common \
  xorg-x11-server-Xvfb  \
  libxml2  \
  krb5-libs  \
  gnutls  \
  poppler  \
  poppler-glib  \
  device-mapper-multipath  \
  kpartx  \
  webkit2gtk3  \
  webkit2gtk3-jsc  \
  sudo \
  dbus-common \
  dbus-libs \
  dbus \
  flatpak \
  flatpak-session-helper \
  tpm2-tss \
  python3-setuptools \
  python-setuptools-wheel \
  zchunk \
  zchunk-libs \
  && dnf clean all
RUN pip3 install \
  --upgrade \
  --no-cache-dir \
  robotframework-browser \
  grpcio-tools \
  cryptography \
  protobuf \
  future \
  certifi \
  requests
USER ${ROBOT_UID}:${ROBOT_GID}
CMD ["robot.sh"]
