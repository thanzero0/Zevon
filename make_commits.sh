#!/bin/bash
for i in {1..9}; do
  date > .commit_tick
  git add -A
  git commit -m "Automated update $i"
  git push
  sleep 1
done
