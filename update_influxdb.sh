#!/bin/bash
set -e
VARIABLE_CHECK_OK=1
ensure_variables() {
    for VARIABLE in "$@"; do
        if [[ -z ${!VARIABLE} ]]; then
            echo "Please set ${VARIABLE}" >&2
            VARIABLE_CHECK_OK=0
        fi
    done
    if [[ $VARIABLE_CHECK_OK -ne 1 ]]; then
        echo "Missing environment variables" >&2
        exit 1
    fi
}

ensure_variables INFLUX_HOST INFLUX_USERNAME INFLUX_PASSWORD INFLUX_DATABASE CARUNA_USERNAME CARUNA_PASSWORD
set -u

DATE=$(node check-next-missing-timestamp.js)
CONSUMPTION_DATA=$(python3 get_consumption_data.py $DATE)
node caruna-influxdb.js <<< "$CONSUMPTION_DATA"
