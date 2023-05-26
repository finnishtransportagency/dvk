FROM ppodgorsek/robot-framework:latest
COPY bin/robot.sh /opt/robotframework/bin/
ENV HOME $ROBOT_WORK_DIR
ENV PATH=$ROBOT_WORK_DIR/.local/bin:$PATH
USER root
RUN dnf remove -y nodejs npm
RUN curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
RUN dnf install -y nodejs
USER ${ROBOT_UID}:${ROBOT_GID}
CMD ["robot.sh"]
