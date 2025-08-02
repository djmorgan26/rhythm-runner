#!/bin/bash
echo "Deploying to Surge.sh..."
cd dist
echo "rhythm-runner-spotify-test.surge.sh" > CNAME
surge . rhythm-runner-spotify-test.surge.sh