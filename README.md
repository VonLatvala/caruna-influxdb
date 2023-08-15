# caruna-influxdb

Scripts for ingesting Caruna electricity consumption data into InfluxDB. It uses the 
[pycaruna](https://github.com/Jalle19/pycaruna) library under the hood. It supports liberating all your consumption 
data from all your metering points.

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
> select * from carunaplus_consumption order by time desc limit 10
name: carunaplus_consumption
time                assetId daytimeConsumption distributionBaseFee distributionFee electricityTax invoicedConsumption nighttimeConsumption temperature totalConsumption totalFee    valueAddedTax
----                ------- ------------------ ------------------- --------------- -------------- ------------------- -------------------- ----------- ---------------- --------    -------------
1692043200000000000 1234567 0                  0.03969086          0.038394        0.0355974      1.58                1.58                 16.6        1.58             0.140966003 0.027283688
1692039600000000000 1234567 0                  0.03969086          0.044955        0.0416805      1.85                1.85                 17          1.85             0.156644687 0.030318265
1692036000000000000 1234567 1.44               0.03969086          0.057168        0.0324432      1.44                0                    17.6        1.44             0.160334555 0.031032432
1692032400000000000 1234567 1.58               0.03969086          0.062726        0.0355974      1.58                0                    18.6        1.58             0.171137683 0.033123356
1692028800000000000 1234567 2.12               0.03969086          0.084164        0.0477636      2.12                0                    19.8        2.12             0.212806891 0.041188348
1692025200000000000 1234567 1.29               0.03969086          0.051213        0.0290637      1.29                0                    20.3        1.29             0.148759775 0.028792156
1692021600000000000 1234567 1.81               0.03969086          0.071857        0.0407793      1.81                0                    20.7        1.81             0.188885679 0.036558445
1692018000000000000 1234567 2.67               0.03969086          0.105999        0.0601551      2.67                0                    21.7        2.67             0.255247751 0.049402691
1692014400000000000 1234567 1.89               0.03969086          0.075033        0.0425817      1.89                0                    21.6        1.89             0.195058895 0.037753259
1692010800000000000 1234567 1.31               0.03969086          0.052007        0.0295143      1.31                0                    21.2        1.31             0.150303079 0.02909086
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
