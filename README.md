# caruna-influxdb

Scripts for ingesting Caruna electricity consumption (including tariff divison) data into InfluxDB.

## Requirements

* Python 3
* Node.js

## Installation

```bash
pip3 install -r requirements.txt
npm i
```

## Usage

Something like this:

```bash
CARUNA_USERNAME="user@example.com" CARUNA_PASSWORD="password" python3 get_consumption_data.py | \
  INFLUX_HOST=10.110.1.6 INFLUX_DATABASE=caruna INFLUX_USERNAME=caruna INFLUX_PASSWORD=caruna \
  node caruna-influxdb.js
```

## License

TODO