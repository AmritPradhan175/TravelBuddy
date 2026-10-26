import psycopg2

passwords_to_try = ['postgres', 'admin', 'root', '1234', '123456', '']
connected = False
for pwd in passwords_to_try:
    try:
        conn = psycopg2.connect(dbname='postgres', user='postgres', password=pwd, host='localhost', port=5432)
        print(f"Connected to PostgreSQL with password: '{pwd}'")
        conn.close()
        connected = True
        break
    except Exception as e:
        pass

if not connected:
    print("Could not connect with default passwords. Will support DATABASE_URL or SQLite fallback.")
