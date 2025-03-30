@For %%G In ("%~dp0.") Do @Set "parent=%%~fG"
cd %parent%
call .venv/Scripts/activate.bat
pip install Flask openpyxl python-dotenv
python python/api.py
