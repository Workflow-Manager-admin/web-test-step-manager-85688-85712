#!/bin/bash
cd /home/kavia/workspace/code-generation/web-test-step-manager-85688-85712/test_step_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

