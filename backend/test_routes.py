"""Test if main.py loads correctly"""
import main

print("✅ main.py imported successfully")
print(f"\nTotal routes: {len(main.app.routes)}")
print("\nRoutes:")
for route in main.app.routes:
    methods = str(route.methods) if hasattr(route, 'methods') else 'N/A'
    print(f"  {methods:30s} - {route.path}")
