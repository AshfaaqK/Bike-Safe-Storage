import requests
import os
from flask import jsonify


def vehicle_lookup(registration):
    test_dvla_url = 'https://uat.driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles'
    headers = {
        'x-api-key': os.getenv('TEST_DVLA_API_KEY'),
        'Content-Type': 'application/json'
    }
    payload = {'registrationNumber': registration}
    
    try:
        response = requests.post(test_dvla_url, headers=headers, json=payload)
        
        return response.json(), response.status_code
    except Exception as e:
        
        return {'error': str(e)}, 500
