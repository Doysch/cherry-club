#!/bin/bash
# Double-click to start Cherry Club locally
cd "$(dirname "$0")"
PORT=8766
( sleep 1; open "http://localhost:$PORT/" ) &
echo "Cherry Club is running at http://localhost:$PORT/  (close this window to stop)"
python3 -m http.server $PORT
