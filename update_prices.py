import os
import json
import urllib.request
import time
from datetime import datetime

# Get all stocks from Hisseler directory
hisseler_dir = os.path.join(os.path.dirname(__file__), 'Hisseler')
stocks = [d for d in os.listdir(hisseler_dir) if os.path.isdir(os.path.join(hisseler_dir, d))]

today = datetime.today().strftime('%d-%m-%Y')
start_date = "01-01-2018"

prices = {}

for stock in stocks:
    print(f"Fetching data for {stock}...")
    url = f"https://www.isyatirim.com.tr/_layouts/15/IsYatirim.Website/Common/Data.aspx/HisseTekil?hisse={stock}&startdate={start_date}&enddate={today}"
    try:
        req = urllib.request.Request(url, headers={'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode('utf-8'))
        
        if 'value' in data and data['value']:
            stock_data = {}
            for row in data['value']:
                date_str = row.get('HGDG_TARIH')
                if not date_str:
                    continue
                    
                stock_data[date_str] = {
                    "price": row.get('HGDG_KAPANIS', 0),
                    "pd": row.get('PD', 0)
                }
            
            prices[stock] = stock_data
            print(f"  -> Fetched {len(stock_data)} days of data.")
        else:
            print(f"  -> No data found.")
            
        time.sleep(0.5) # Sleep to avoid rate limiting
    except Exception as e:
        print(f"  -> Error fetching data: {e}")

output_path = os.path.join(os.path.dirname(__file__), 'js', 'prices_compiled.js')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(f"window.stockPrices = {json.dumps(prices, separators=(',', ':'))};\n")
    
print(f"Historical market cap and prices saved to {output_path}")
