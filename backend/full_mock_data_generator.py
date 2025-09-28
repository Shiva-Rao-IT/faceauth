import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta
import random
import bcrypt

# --- Configuration ---
# You can customize the mock data generation here
CONFIG = {
    "clear_existing_data": True,  # Set to False if you want to add to existing data
    "num_students_per_course": 20, # Increased number of students per course
    "num_days_of_attendance": 30,
    "attendance_chance": 0.92,  # Slightly varied the attendance chance
    "courses_to_create": [
        {"_id": "CS101", "name": "Intro to Python"},
        {"_id": "PHY201", "name": "Modern Physics"},
        {"_id": "MTH301", "name": "Advanced Calculus"},
        {"_id": "MTH202", "name": "Linear Algebra"},
        {"_id": "PHY301", "name": "Quantum Mechanics"},
        {"_id": "BIO101", "name": "Introduction to Biology"},
        {"_id": "CHEM101", "name": "General Chemistry"},
        {"_id": "ENG201", "name": "Literary Analysis"}
    ],
    "student_names": [
        "Aarav Sharma", "Vivaan Singh", "Aditya Kumar", "Vihaan Patel", "Arjun Reddy",
        "Sai Gupta", "Reyansh Yadav", "Krishna Verma", "Ishaan Ali", "Shaurya Joshi",
        "Diya Mehta", "Saanvi Shah", "Aanya Iyer", "Myra Rao", "Ananya Reddy",
        "Pari Choudhary", "Kabir Das", "Rohan Mehra", "Sameer Khan", "Neha Bhasin",
        "Tanvi Sharma", "Yash Singh", "Aryan Kumar", "Advik Patel", "Aarohi Reddy",
        "Ishita Jain", "Kavya Singh", "Advait Sharma", "Ayaan Gupta", "Anika Verma",
        "Rhea Pillai", "Zoya Hussain", "Mihir Khanna", "Dev Shah", "Anaya Singh"
    ]
}

# --- Script Starts ---
load_dotenv()
print("🚀 Starting full mock data generation...")

# 1. Connect to the database
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("❌ ERROR: MONGO_URI not found in .env file.")
    exit()

try:
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    db.command('ping')
    print("✅ Database connection successful.")
except Exception as e:
    print(f"❌ ERROR: Could not connect to MongoDB. Details: {e}")
    exit()


def generate_full_mock_data():
    """Clears, creates, and populates student and attendance data."""

    if CONFIG["clear_existing_data"]:
        print("\n🧹 Clearing existing data...")
        # Clear only mockable data, leave admins/teachers alone
        db.users.delete_many({"role": "student"})
        db.attendance.delete_many({})
        print("   Cleared all students and attendance records.")

    # 2. Create courses if they don't exist
    print("\n📚 Setting up courses...")
    for course in CONFIG["courses_to_create"]:
        # update_one with upsert=True inserts if not found, updates if found
        db.courses.update_one({"_id": course["_id"]}, {"$set": {"name": course["name"]}}, upsert=True)
    print(f"   Ensured {len(CONFIG['courses_to_create'])} courses exist.")

    # 3. Create new students
    print("\n🧑‍🎓 Creating new students...")
    new_students = []
    password = "password123"  # Common password for all mock students
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    name_pool = CONFIG["student_names"][:]  # Create a mutable copy
    student_roll_start = 100

    for course in CONFIG["courses_to_create"]:
        for i in range(CONFIG["num_students_per_course"]):
            if not name_pool:
                print("   Warning: Ran out of unique names. Reusing names.")
                name_pool = CONFIG["student_names"][:] # Reset pool if empty

            student_name = random.choice(name_pool)
            name_pool.remove(student_name) # Ensure unique names for now
            roll_no = f"S{student_roll_start}"
            student_roll_start += 1

            student_doc = {
                "name": student_name,
                "roll_no": roll_no,
                "password": hashed_password,
                "role": "student",
                "course_id": course["_id"],
                # Face encoding would be added via the app, skipping here
            }
            new_students.append(student_doc)

    if new_students:
        db.users.insert_many(new_students)
        print(f"   Successfully created {len(new_students)} new students.")
        print(f"   Default password for all new students is: {password}")

    # 4. Generate attendance for the new students
    print("\n🗓️  Generating attendance records...")
    students_from_db = list(db.users.find({"role": "student"}))
    records_to_insert = []
    today = datetime.now()

    for day_offset in range(CONFIG["num_days_of_attendance"]):
        current_date = today - timedelta(days=day_offset)
        # Skip weekends
        if current_date.weekday() >= 5:
            continue
        
        date_str = current_date.strftime("%Y-%m-%d")

        for student in students_from_db:
            if 'course_id' in student and random.random() < CONFIG["attendance_chance"]:
                record = {
                    "student_id": student["_id"],
                    "course_id": student["course_id"],
                    "date": date_str,
                    "status": "Present"
                }
                records_to_insert.append(record)

    if records_to_insert:
        db.attendance.insert_many(records_to_insert)
        print(f"   Successfully inserted {len(records_to_insert)} attendance records.")

    print("\n✨ Full mock data generation complete!")


if __name__ == "__main__":
    generate_full_mock_data()

