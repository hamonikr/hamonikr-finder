#!/bin/bash

rm -fr *.txt

curl -XDELETE http://192.168.0.55:9200/*
echo ""
sleep 1

rm db/*
echo ""

sleep 1

node app.js
echo ""

