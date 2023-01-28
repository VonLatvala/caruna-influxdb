# caruna-influxdb

Scripts for ingesting Caruna electricity consumption data into InfluxDB. It uses the 
[pycaruna](https://github.com/Jalle19/pycaruna) library under the hood. It supports liberating all your consumption 
data from all your metering points.

Older versions of this project supported dividing the consumption by tariff used (night vs. day for example), but 
since Caruna moved to their new Caruna Plus API that information is no longer available.

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
CARUNA_USERNAME="user@example.com" CARUNA_PASSWORD="password" python3 get_consumption_data.py 2023 01 25 | \
  INFLUX_HOST=10.110.1.6 INFLUX_DATABASE=caruna INFLUX_USERNAME=caruna INFLUX_PASSWORD=caruna \
  node caruna-influxdb.js
```

The `get_consumption_data.py` script can be used to retrieve all consumption data since the specified date. It's best 
to run it once with the date for when you started using Caruna, then let it fetch the last few days data regularly to 
keep your dataset updated. Yesterday's data is usually available around noon the next day.

The `get_consumpton_data.py` prints some progress to stderr so you know it's doing something. The actual JSON data it 
outputs is printed to stdout.

## Data structure

Each data point is tagged by the meter number ("asset ID"), so you can ingest data from multiple installations and/or 
user accounts into the same database.

## License

TODO
