import psycopg2

DATABASE_URL = "postgresql://neondb_owner:npg_Umlh0AQKknc5@ep-bitter-pine-atyoadbl-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"

def migrate():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Add the missing columns
        print("Adding gst_number...")
        cursor.execute("ALTER TABLE companies ADD COLUMN IF NOT EXISTS gst_number VARCHAR(15);")
        
        print("Adding financial_year...")
        cursor.execute("ALTER TABLE companies ADD COLUMN IF NOT EXISTS financial_year VARCHAR(9);")
        
        print("Migration successful.")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Failed to run migration: {e}")

if __name__ == "__main__":
    migrate()
