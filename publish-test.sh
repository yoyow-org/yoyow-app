#!/bin/bash
npm run build-hash-test
echo "==================================>>> build-hash done"
ssh root@47.90.105.247 "rm -rf /home/www/yoyow-app/hash-history"
echo "==================================>>> remove done"
scp -r ./hash-history/ root@47.90.105.247:/home/www/yoyow-app
echo "==================================>>> upload done"
