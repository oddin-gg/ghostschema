#!/usr/bin/env bash

# GO
./scripts/go.sh
if [ "$?" != "0" ];
then
  echo "Golang protobuf files generation failed."
  exit 1
fi

# JS
./scripts/js.sh
if [ "$?" != "0" ];
then
  echo "JavaScript protobuf files generation failed."
  exit 1
fi

# PYTHON
./scripts/python.sh
if [ "$?" != "0" ];
then
  echo "Python protobuf files generation failed."
  exit 1
fi

# JAVA
./scripts/java.sh
if [ "$?" != "0" ];
then
  echo "Java protobuf files generation failed."
  exit 1
fi