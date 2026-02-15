import asyncio
import random
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone
import uuid
import bcrypt

# Tamil Nadu Districts
DISTRICTS = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
    "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Karur", "Krishnagiri",
    "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur",
    "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
    "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur",
    "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
]

# Service Categories with keywords
CATEGORIES = {
    "Earth Movers": ["excavator", "jcb", "bulldozer", "earthmoving", "digging"],
    "Packers and Movers": ["packing", "moving", "relocation", "household", "shifting"],
    "Lorry Services": ["transport", "truck", "lorry", "cargo", "goods"],
    "Bore Well": ["borewell", "drilling", "water", "well", "pump"],
    "Power Tools": ["rental", "equipment", "tools", "machinery", "construction"]
}

# Sample company names
COMPANY_NAMES = {
    "Earth Movers": ["Sri Lakshmi Excavators", "Murugan JCB Services", "Tamil Nadu Earth Movers", "Selva Digging Works"],
    "Packers and Movers": ["Fast Track Packers", "Safe Move Logistics", "Tamil Relocations", "Express Movers"],
    "Lorry Services": ["Bharathi Transport", "Speed Cargo Services", "Tamil Nadu Lorry Transport", "Express Logistics"],
    "Bore Well": ["Deepam Bore Well", "Amman Water Drilling", "Tamil Bore Well Services", "Professional Drillers"],
    "Power Tools": ["Kumar Equipment Rentals", "Pro Tools Hire", "Construction Equipment Hub", "Power Tools Tamil Nadu"]
}

# Sample descriptions
DESCRIPTIONS = {
    "Earth Movers": "Professional earth moving services with modern JCB and excavators. Available for construction, land leveling, and excavation works.",
    "Packers and Movers": "Trusted packing and moving services. Safe transportation of household and office goods with insurance coverage.",
    "Lorry Services": "Reliable lorry transportation services for cargo and goods. Door-to-door delivery across Tamil Nadu.",
    "Bore Well": "Expert bore well drilling services with advanced equipment. Water testing and pump installation included.",
    "Power Tools": "Wide range of construction equipment and power tools for rent. Daily and monthly rental options available."
}

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_database():
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🌱 Starting database seeding...")
    
    # Clear existing services (optional)
    await db.services.delete_many({"seeded": True})
    print("✅ Cleared existing seeded services")
    
    services_created = 0
    providers_created = 0
    
    # Create service providers for each district and category
    for district in DISTRICTS:
        for category, keywords in CATEGORIES.items():
            # Create 2-3 providers per category per district
            num_providers = random.randint(2, 3)
            
            for i in range(num_providers):
                # Create provider user
                provider_id = str(uuid.uuid4())
                company_name = random.choice(COMPANY_NAMES[category])
                provider_name = f"{company_name} - {district}"
                
                # Generate phone number (Tamil Nadu area codes: 044, 0422, etc.)
                area_codes = ['044', '0422', '0431', '04543', '0451']
                phone = f"+91{random.choice(area_codes)}{random.randint(1000000, 9999999)}"
                email = f"{company_name.lower().replace(' ', '')}_{district.lower()}@example.com"
                
                # Check if provider already exists
                existing_provider = await db.users.find_one({"email": email})
                
                if not existing_provider:
                    provider_doc = {
                        "user_id": provider_id,
                        "name": provider_name,
                        "email": email,
                        "phone": phone,
                        "password": hash_password("Provider@123"),
                        "pin": hash_password("1234"),
                        "role": "provider",
                        "verified": True,
                        "created_at": datetime.now(timezone.utc).isoformat(),
                        "district": district,
                        "seeded": True
                    }
                    await db.users.insert_one(provider_doc)
                    providers_created += 1
                else:
                    provider_id = existing_provider['user_id']
                
                # Create services for this provider
                num_services = random.randint(1, 2)
                for j in range(num_services):
                    service_id = str(uuid.uuid4())
                    keyword = random.choice(keywords)
                    service_name = f"{category} - {keyword.title()} Service"
                    
                    base_price = random.randint(800, 5000)
                    discount = random.choice([0, 5, 10, 15, 20])
                    
                    service_doc = {
                        "service_id": service_id,
                        "provider_id": provider_id,
                        "name": service_name,
                        "category": category,
                        "description": DESCRIPTIONS[category],
                        "base_price": float(base_price),
                        "unit": "hour" if category in ["Earth Movers", "Power Tools"] else "service",
                        "discount": float(discount),
                        "district": district,
                        "keywords": keywords,
                        "rating": round(random.uniform(3.8, 5.0), 1),
                        "created_at": datetime.now(timezone.utc).isoformat(),
                        "seeded": True
                    }
                    
                    await db.services.insert_one(service_doc)
                    services_created += 1
    
    print(f"✅ Created {providers_created} service providers")
    print(f"✅ Created {services_created} services across all Tamil Nadu districts")
    print("🎉 Database seeding completed!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
