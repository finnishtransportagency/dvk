FROM ppodgorsek/robot-framework:latest
COPY bin/robot.sh /opt/robotframework/bin/
ENV HOME $ROBOT_WORK_DIR
ENV PATH=$ROBOT_WORK_DIR/.local/bin:$PATH
CMD ["robot.sh"]
