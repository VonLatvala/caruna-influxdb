const fs = require('fs')
const Influx = require('influx')

getSchemaDefinition = function () {
  return [
    {
      measurement: 'carunaplus_consumption',
      fields: {
        'totalConsumption': Influx.FieldType.FLOAT,
        'invoicedConsumption': Influx.FieldType.FLOAT,
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
  return {
    measurement: 'carunaplus_consumption',
    timestamp: Date.parse(dataPoint.timestamp) * 1000 * 1000, // nanoseconds
    fields: {
      totalConsumption: dataPoint.totalConsumption,
      invoicedConsumption: dataPoint.invoicedConsumption,
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

const influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST,
  database: process.env.INFLUX_DATABASE,
  username: process.env.INFLUX_USERNAME,
  password: process.env.INFLUX_PASSWORD,
  schema: getSchemaDefinition(),
})

influx.getDatabaseNames().then((names) => {
  if (!names.includes(process.env.INFLUX_DATABASE)) {
    throw new Error(`The specified database "${process.env.INFLUX_DATABASE}" does not exist`)
  }

  const jsonData = fs.readFileSync(0, 'utf-8')
  const consumption = JSON.parse(jsonData)

  const points = consumption.map(data => createPoint(data))

  influx.writePoints(points)
})
