@echo off

start cmd /k "http-server -a 0.0.0.0 -p 8080 --cors cors-config.json"
start cmd /k "node server.js"
