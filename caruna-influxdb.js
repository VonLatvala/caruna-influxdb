const fs = require('fs')
const Influx = require('influx')

getSchemaDefinition = function () {
  return [
    {
      measurement: 'carunaplus_consumption',
      fields: {
        'totalConsumption': Influx.FieldType.FLOAT,
        'invoicedConsumption': Influx.FieldType.FLOAT,
        'daytimeConsumption': Influx.FieldType.FLOAT,
        'nighttimeConsumption': Influx.FieldType.FLOAT,
        'totalFee': Influx.FieldType.FLOAT,
        'distributionFee': Influx.FieldType.FLOAT,
        'distributionBaseFee': Influx.FieldType.FLOAT,
        'electricityTax': Influx.FieldType.FLOAT,
        'valueAddedTax': Influx.FieldType.FLOAT,
        'temperature': Influx.FieldType.FLOAT,
      },
      tags: [
        'assetId',
      ]
    }
  ]
}

createPoint = function (dataPoint) {
  console.log("Creating datapoint", dataPoint.timestamp);
  return {
    measurement: 'carunaplus_consumption',
    timestamp: Date.parse(dataPoint.timestamp) * 1000 * 1000, // nanoseconds
    fields: {
      totalConsumption: dataPoint.totalConsumption,
      invoicedConsumption: dataPoint.invoicedConsumption,
      daytimeConsumption: dataPoint.invoicedConsumptionByTransferProductParts.daytime ?? 0,
      nighttimeConsumption: dataPoint.invoicedConsumptionByTransferProductParts.nighttime ?? 0,
      totalFee: dataPoint.totalFee,
      distributionFee: dataPoint.distributionFee,
      distributionBaseFee: dataPoint.distributionBaseFee,
      electricityTax: dataPoint.electricityTax,
      valueAddedTax: dataPoint.valueAddedTax,
      temperature: dataPoint.temperature,
    },
    tags: {
      assetId: dataPoint.assetId,
    }
  }
}

const requiredEnvVars = [
  'INFLUX_HOST',
  'INFLUX_DATABASE',
  'INFLUX_USERNAME',
  'INFLUX_PASSWORD',
]

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${requiredEnvVars.join(', ')} must be specified`)
  }
}

console.log("Creating InfluxDB instance")
const influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST,
  database: process.env.INFLUX_DATABASE,
  username: process.env.INFLUX_USERNAME,
  password: process.env.INFLUX_PASSWORD,
  schema: getSchemaDefinition(),
})
console.log(`Created InfluxDB instance ${process.env.INFLUX_USERNAME}@${process.env.INFLUX_HOST}/${process.env.INFLUX_DATABASE}`)

console.log('Getting database names')
influx.getDatabaseNames().then((names) => {
  console.log(`Got database names ${names.join(',')}`)
  if (!names.includes(process.env.INFLUX_DATABASE)) {
    throw new Error(`The specified database "${process.env.INFLUX_DATABASE}" does not exist`)
  }

  console.log("Reading input file")
  const jsonData = fs.readFileSync(0, 'utf-8')
  console.log("Parsing JSON")
  const consumption = JSON.parse(jsonData)

  console.log("Creating points")
  const points = consumption.map(data => createPoint(data))

  console.log("Writing points to InfluxDB")
  influx.writePoints(points)
  console.log("Done writing points to InfluxDB")
})
