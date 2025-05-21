#!/usr/bin/env bash

echo "GENERATING JAVA"

javaDir="./java"

"$javaDir/gradlew" clean install -p "$javaDir"

if [ "$?" != "0" ];
then
  echo "protobuf files generation failed. \n"
  exit 1
fi

echo "JAVA DONE"