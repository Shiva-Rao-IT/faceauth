import os
from pymongo import MongoClient
from dotenv import load_dotenv
import bcrypt

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client.get_database()

def seed():
    print("Seeding database...")

    # Clear existing collections
    db.users.delete_many({})
    db.courses.delete_many({})
    print("Cleared existing users and courses.")

    # Hash password
    password = "password123"
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Seed Users
    users = [
        {"email": "admin@example.com", "password": hashed_password, "role": "admin", "name": "Admin User"},
        {"email": "teacher@example.com", "password": hashed_password, "role": "teacher", "name": "Teacher Bob"},
        {"roll_no": "S001", "password": hashed_password, "role": "student", "name": "Student Alice", "course_id": "CS101"},
    ]
    db.users.insert_many(users)
    print(f"Inserted {len(users)} users.")
    print("Default password for all users is: password123")

if __name__ == "__main__":
    seed()