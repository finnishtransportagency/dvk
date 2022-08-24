#!/usr/bin/env bash
pip3 install --user --no-cache-dir -r $ROBOT_TESTS_DIR/requirements.txt
robot --version
run-tests-in-virtual-screen.sh
