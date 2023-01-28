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

The project consists of two separate scripts:

* `get_consumption_data.py` which produces a JSON blob containing all the consumption data from Caruna Plus
* `caruna-influxdb.js`, which ingests the JSON data into InfluxDB

The first step is to get all your historical data. This takes some time, so it's best to only do it once. In the 
following example, all data since 2019-11-01 is fetched.

```bash
CARUNA_USERNAME="user@example.com" CARUNA_PASSWORD="password" python3 get_consumption_data.py 2019 11 01 > history.json
```

We now have a large JSON file named `history.json`. We'll ingest this into InfluxDB like this:

```bash
cat history.json | INFLUX_HOST=10.110.1.6 INFLUX_DATABASE=caruna INFLUX_USERNAME=caruna INFLUX_PASSWORD=caruna node caruna-influxdb.js
```

The data should now be ingested and look something like this:

```
> select * from carunaplus_consumption
name: carunaplus_consumption
time                assetId distributionBaseFee distributionFee electricityTax invoicedConsumption temperature totalConsumption totalFee    valueAddedTax
----                ------- ------------------- --------------- -------------- ------------------- ----------- ---------------- --------    -------------
1674597600000000000 1234567 0.037764481         0.026709677     0.0259095      1.15                1.4         1.15             0.112075737 0.021692035
1674601200000000000 1234567 0.037764481         0.028335484     0.0274866      1.22                1.6         1.22             0.116047341 0.022460731
1674604800000000000 1234567 0.037764481         0.029032258     0.0281625      1.25                1.6         1.25             0.117749457 0.022790171
1674608400000000000 1234567 0.037764481         0.016025806     0.0155457      0.69                1.7         0.69             0.085976625 0.016640604
1674612000000000000 1234567 0.037764481         0.014632258     0.0141939      0.63                1.9         0.63             0.082572393 0.015981721
1674615600000000000 1234567 0.037764481         0.026477419     0.0256842      1.14                2           1.14             0.111508365 0.021582221
1674619200000000000 1234567 0.037764481         0.013006452     0.0126168      0.56                2           0.56             0.078600789 0.015213025
1674622800000000000 1234567 0.037764481         0.070728226     0.0421311      1.87                2.3         1.87             0.186773521 0.036149641
1674626400000000000 1234567 0.037764481         0.05408629      0.0322179      1.43                2.4         1.43             0.153845153 0.029776422
1674630000000000000 1234567 0.037764481         0.037444355     0.0223047      0.99                2.5         0.99             0.120916785 0.023403201
1674633600000000000 1234567 0.037764481         0.072241129     0.0430323      1.91                2.6         1.91             0.189767009 0.03672902
```

Now that you have all your historical data you can set up a cron job which fetches the consumption data from just the 
last few days. You can combine the two scripts like this:

```bash
CARUNA_USERNAME="user@example.com" CARUNA_PASSWORD="password" python3 get_consumption_data.py 2023 01 28 | \
  INFLUX_HOST=10.110.1.6 INFLUX_DATABASE=caruna INFLUX_USERNAME=caruna INFLUX_PASSWORD=caruna \
  node caruna-influxdb.js
```

Adjusting the start date parameter dynamically is left as an exercise for the reader

## Data structure

Each data point is tagged by the meter number ("asset ID"), so you can ingest data from multiple installations and/or 
user accounts into the same database.

## License

TODO
