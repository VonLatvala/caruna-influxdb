import json
import os
import sys
from datetime import date, timedelta
from pycaruna import CarunaPlus, TimeSpan, Authenticator

if __name__ == '__main__':
    username = os.getenv('CARUNA_USERNAME')
    password = os.getenv('CARUNA_PASSWORD')

    if username is None or password is None:
        raise Exception('CARUNA_USERNAME and CARUNA_PASSWORD must be defined')

    if len(sys.argv) < 4:
        print('Usage: ' + sys.argv[0] + "<year> <month> <day>")
        sys.exit(1)

    # Authenticate to receive token and customer ID
    authenticator = Authenticator(username, password)
    login_result = authenticator.login()

    token = login_result['token']
    customer_id = login_result['user']['ownCustomerNumbers'][0]
    client = CarunaPlus(token)
    customer = client.get_user_profile(customer_id)

    consumption_data = []

    # Loop through each metering point (often just one)
    metering_points = client.get_assets(customer_id)

    for metering_point in metering_points:
        asset_id = metering_point['assetId']
        print("Fetching data for metering point " + asset_id, file=sys.stderr)

        # Start looping through each date since the specified start date
        current_date = date(int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]))
        print("Fetching hourly consumption data since " + current_date.isoformat(), file=sys.stderr)
        today = date.today()

        while current_date < today:
            print("Fetch data for " + current_date.isoformat(), file=sys.stderr)
            daily_consumption = client.get_energy(customer_id, asset_id, TimeSpan.DAILY, current_date.year,
                                                  current_date.month, current_date.day)

            # Filter out data points without any consumption
            daily_consumption_filtered = [data for data in daily_consumption if
                                          'totalConsumption' in data and data['totalConsumption'] is not None]

            # Add the meter number (asset ID) to all data points so we can tag by it when ingesting to Influx
            daily_consumption_mapped = list(map(lambda item: {
                **item,
                'assetId': int(asset_id),
            }, daily_consumption_filtered))

            consumption_data += daily_consumption_mapped
            current_date = current_date + timedelta(days=1)

    print(json.dumps(consumption_data, indent=2))
