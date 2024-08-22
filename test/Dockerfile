# NOTE!! When updating base image version update also requirements.txt if needed
FROM ppodgorsek/robot-framework:7.2.0
COPY bin/robot.sh /opt/robotframework/bin/
ENV HOME $ROBOT_WORK_DIR
ENV PATH=$ROBOT_WORK_DIR/.local/bin:$PATH
CMD ["robot.sh"]
