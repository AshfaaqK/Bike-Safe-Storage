import requests
import os


def vehicle_lookup(registration):
    dvla_url = 'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles'
    headers = {
        'x-api-key': os.getenv('DVLA_API_KEY'),
        'Content-Type': 'application/json'
    }
    payload = {'registrationNumber': registration}
    
    try:
        response = requests.post(dvla_url, headers=headers, json=payload)
        
        print("=== DVLA DEBUG ===")
        print("DVLA Status:", response.status_code)
        print("DVLA Content-Type:", response.headers.get("Content-Type"))
        print("DVLA Response:", response.text)
        
        return response.json(), response.status_code
    except Exception as e:
        
        return {'error': str(e)}, 500
