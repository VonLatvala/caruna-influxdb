const Influx = require('influx')

let writeLog = (message) => process.stderr.write(message + '\n')
let defaultDateTimeStr = process.env.START_DATE_DEFAULT || "2024-01-01:00:00+00:00"

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

writeLog("Creating InfluxDB instance")
const influx = new Influx.InfluxDB({
    host: process.env.INFLUX_HOST,
    database: process.env.INFLUX_DATABASE,
    username: process.env.INFLUX_USERNAME,
    password: process.env.INFLUX_PASSWORD,
    schema: getSchemaDefinition(),
})
writeLog(`Created InfluxDB instance ${process.env.INFLUX_USERNAME}@${process.env.INFLUX_HOST}/${process.env.INFLUX_DATABASE}`)

writeLog('Getting database names')
influx.getDatabaseNames().then((names) => {
    writeLog(`Got database names ${names.join(',')}`)
    if (!names.includes(process.env.INFLUX_DATABASE)) {
        throw new Error(`The specified database "${process.env.INFLUX_DATABASE}" does not exist`)
    }
    influx.query(`SELECT last(totalConsumption), time FROM carunaplus_consumption;`).then(result => {
        var dateTimeStr = ""
        if(result.length < 0) {
            writeLog(`No timestamp found in influxdb! Defaulting to ${defaultDateTimeStr}`)
            dateTimeStr = defaultDateTimeStr
        } else {
            dateTimeStr = result[0].time
        }
        let dateTime = new Date((new Date(dateTimeStr)).getTime() + 86400000)
        process.stdout.write(
        `${dateTime.getFullYear()} ${dateTime.getMonth()+1} ${dateTime.getDate()}\n`
        )
    })
})
