const fs = require('fs')
const Influx = require('influx')

getSchemaDefinition = function () {
  return [
    {
      measurement: 'consumption',
      fields: {
        'kwh_total': Influx.FieldType.FLOAT,
        'kwh_night': Influx.FieldType.FLOAT,
        'kwh_day': Influx.FieldType.FLOAT,
      },
      tags: []
    }
  ]
}

createPoint = function (consumption) {
  return {
    measurement: 'consumption',
    timestamp: (new Date(consumption.date)).getTime() * 1000 * 1000, // nanoseconds
    fields: {
      'kwh_total': consumption.kwh_total,
      'kwh_night': consumption.kwh_night,
      'kwh_day': consumption.kwh_day,
    },
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
