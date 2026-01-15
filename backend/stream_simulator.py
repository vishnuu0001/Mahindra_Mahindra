"""
Streaming Data Simulator for M&M Digital Maturity Reports
This script simulates real-time updates to dimension levels
"""
import asyncio
import random
import requests
from datetime import datetime

BASE_URL = "http://localhost:8000"

async def simulate_streaming_updates():
    """Simulate random updates to dimension levels"""
    print("🔄 Starting streaming data simulation...")
    print("📊 This will randomly update dimension levels every 10 seconds")
    print("Press Ctrl+C to stop\n")
    
    iteration = 0
    while True:
        try:
            iteration += 1
            print(f"\n{'='*60}")
            print(f"Iteration {iteration} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"{'='*60}")
            
            # Get all areas
            response = requests.get(f"{BASE_URL}/api/m&m/areas")
            if response.status_code == 200:
                areas = response.json()
                
                for area in areas:
                    # Pick a random dimension from this area
                    if area['dimensions']:
                        dimension = random.choice(area['dimensions'])
                        dimension_id = dimension['id']
                        old_level = dimension['current_level']
                        
                        # Simulate update
                        update_response = requests.post(
                            f"{BASE_URL}/api/m&m/simulate-update/{dimension_id}"
                        )
                        
                        if update_response.status_code == 200:
                            result = update_response.json()
                            if result['new_level'] != result['old_level']:
                                change_symbol = "📈" if result['new_level'] > result['old_level'] else "📉"
                                print(f"{change_symbol} {area['name']} - {dimension['name']}: "
                                      f"L{result['old_level']} → L{result['new_level']}")
                            else:
                                print(f"  {area['name']} - {dimension['name']}: L{old_level} (no change)")
            
            print(f"\nNext update in 10 seconds...")
            await asyncio.sleep(10)
            
        except KeyboardInterrupt:
            print("\n\n✋ Stopping simulation...")
            break
        except Exception as e:
            print(f"⚠️  Error: {e}")
            await asyncio.sleep(10)

if __name__ == "__main__":
    print("""
╔═══════════════════════════════════════════════════════════╗
║   M&M Digital Maturity Streaming Data Simulator           ║
║                                                            ║
║   This simulates real-time updates to the Reports page    ║
║   Make sure the backend is running on port 8000           ║
╚═══════════════════════════════════════════════════════════╝
    """)
    
    try:
        asyncio.run(simulate_streaming_updates())
    except KeyboardInterrupt:
        print("\n✅ Simulation stopped")
