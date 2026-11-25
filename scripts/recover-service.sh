#!/bin/bash

set -e

PROJECT_DIR="/home/vagrant/vagrant"
LOG_FILE="$PROJECT_DIR/logs/self-healing.log"

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p "$PROJECT_DIR/logs"

echo "[$TIMESTAMP] Recovery triggered by Alertmanager" >> "$LOG_FILE"

cd "$PROJECT_DIR"

ansible-playbook "$PROJECT_DIR/ansible/recover-service.yml" >> "$LOG_FILE" 2>&1

echo "[$TIMESTAMP] Recovery playbook completed successfully" >> "$LOG_FILE"
