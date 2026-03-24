import sys
import os

# Add to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'api')))

from app import create_app
from app.crud.operations_dashboard_crud import get_operations_dashboard_data
from app.models import Company

app = create_app()

with app.app_context():
    company = Company.query.first()
    if not company:
        print("No company found.")
        sys.exit(1)
        
    filters = {'start_date': '2026-03-01', 'end_date': '2026-03-19'}
    
    try:
        data = get_operations_dashboard_data(str(company.id), filters)
        if 'error' in data:
            print("API Error Response:", data['error'])
        else:
            print("Success! Keys:", data.keys())
    except Exception as e:
        import traceback
        traceback.print_exc()
