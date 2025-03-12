#!/bin/bash
for (( c=1; c<=50000; c++ ))
do  
  curl "http://127.0.0.1:3000/$c"
done
