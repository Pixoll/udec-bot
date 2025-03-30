cd "$(dirname "$0")/.."
source .venv/bin/activate
pip install Flask openpyxl python-dotenv
python3 python/api.py
