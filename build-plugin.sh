#!/bin/bash

# Navigate to the plugin directory
cd android/app/src/main/java/com/swift/drop

# Compile the plugin
javac WifiP2PPlugin.java

# Create the plugin JAR
jar cvf ../WifiP2PPlugin.jar WifiP2PPlugin.class

# Copy the JAR to the appropriate location
cp ../WifiP2PPlugin.jar ../../../libs/
