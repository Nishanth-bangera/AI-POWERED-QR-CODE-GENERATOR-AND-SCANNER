import sqlite3

# ------------------------------------
# DATABASE FILE
# ------------------------------------
DATABASE = "user.db"


# ------------------------------------
# CREATE DATABASE AND USERS TABLE
# ------------------------------------
def create_database():

    conn = sqlite3.connect(DATABASE)

    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        mobile TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()


# ------------------------------------
# GET DATABASE CONNECTION
# ------------------------------------
def get_connection():

    return sqlite3.connect(DATABASE)


# ------------------------------------
# CREATE DATABASE WHEN FILE RUNS
# ------------------------------------
create_database()