from fastapi import FastAPI, APIRouter, HTTPException, status, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import random
import json
import hmac
import hashlib
from jose import JWTError, jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# ============= Models =============

class UserRole(str):
    USER = "user"
    PROVIDER = "provider"
    ADMIN = "admin"

class PaymentMethod(str):
    UPI = "upi"
    CASH = "cash"
    ADVANCE_UPI = "advance_upi"

class BookingStatus(str):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str = Field(..., pattern=r'^[+]?[0-9]{10,15}$')
    password: str = Field(..., min_length=6)
    pin: str = Field(..., pattern=r'^[0-9]{4}$')
    pin_confirm: str = Field(..., pattern=r'^[0-9]{4}$')
    role: str = Field(..., pattern=r'^(user|provider)$')
    
class ProviderDetails(BaseModel):
    upi_id: Optional[str] = None
    bank_account: Optional[str] = None
    ifsc_code: Optional[str] = None
    branch_name: Optional[str] = None

class UserLogin(BaseModel):
    email_or_phone: str
    password: Optional[str] = None
    pin: Optional[str] = None
    login_type: str = Field(..., pattern=r'^(password|pin)$')

class OTPRequest(BaseModel):
    contact: str
    
class OTPVerify(BaseModel):
    contact: str
    otp: str = Field(..., pattern=r'^[0-9]{6}$')

class ChangePinRequest(BaseModel):
    email_or_phone: str
    otp: str = Field(..., pattern=r'^[0-9]{6}$')
    new_pin: str = Field(..., pattern=r'^[0-9]{4}$')
    confirm_pin: str = Field(..., pattern=r'^[0-9]{4}$')

class ServiceCreate(BaseModel):
    name: str
    category: str
    description: str
    base_price: float
    unit: str
    discount: float = 0.0
    
class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[float] = None
    discount: Optional[float] = None

class AddressCreate(BaseModel):
    user_name: str
    street_name: str
    city: str
    district: str
    pincode: str = Field(..., pattern=r'^[0-9]{6}$')
    landmark: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CartItem(BaseModel):
    service_id: str
    hours_days: float
    
class BookingCreate(BaseModel):
    service_id: str
    provider_id: str
    address_id: str
    hours_days: float
    payment_method: str
    notes: Optional[str] = None

class PaymentCreate(BaseModel):
    booking_id: str
    amount: float
    payment_method: str

class SocialMediaUpdate(BaseModel):
    platform: str
    url: str
    otp: str

# ============= Helper Functions =============

def generate_otp() -> str:
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = authorization.split(' ')[1]
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return payload

# Mock OTP storage (use Redis in production)
otp_storage = {}

# ============= Authentication Routes =============

@api_router.post("/auth/register")
async def register_user(data: UserRegister):
    if data.pin != data.pin_confirm:
        raise HTTPException(status_code=400, detail="Pin does not match")
    
    existing_user = await db.users.find_one({"$or": [{"email": data.email}, {"phone": data.phone}]}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "user_id": user_id,
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "password": hash_password(data.password),
        "pin": hash_password(data.pin),
        "role": data.role,
        "verified": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    otp = generate_otp()
    otp_storage[data.email] = {"otp": otp, "created_at": datetime.now(timezone.utc)}
    otp_storage[data.phone] = {"otp": otp, "created_at": datetime.now(timezone.utc)}
    
    return {
        "message": "OTP sent to registered email address and mobile number",
        "user_id": user_id,
        "mock_otp": otp
    }

@api_router.post("/auth/verify-otp")
async def verify_otp(data: OTPVerify):
    if data.contact not in otp_storage:
        raise HTTPException(status_code=400, detail="OTP not found or expired")
    
    stored = otp_storage[data.contact]
    if (datetime.now(timezone.utc) - stored['created_at']).seconds > 300:
        del otp_storage[data.contact]
        raise HTTPException(status_code=400, detail="OTP expired")
    
    if stored['otp'] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    user = await db.users.find_one({"$or": [{"email": data.contact}, {"phone": data.contact}]}, {"_id": 0})
    if user:
        await db.users.update_one(
            {"user_id": user['user_id']},
            {"$set": {"verified": True}}
        )
    
    del otp_storage[data.contact]
    return {"message": "OTP verified successfully", "verified": True}

@api_router.post("/auth/login")
async def login_user(data: UserLogin):
    user = await db.users.find_one(
        {"$or": [{"email": data.email_or_phone}, {"phone": data.email_or_phone}]},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    if not user.get('verified'):
        raise HTTPException(status_code=400, detail="Please verify your account first")
    
    if data.login_type == "password":
        if not data.password:
            raise HTTPException(status_code=400, detail="Password required")
        if not verify_password(data.password, user['password']):
            raise HTTPException(status_code=400, detail="Invalid credentials")
    elif data.login_type == "pin":
        if not data.pin:
            raise HTTPException(status_code=400, detail="PIN required")
        if not verify_password(data.pin, user['pin']):
            raise HTTPException(status_code=400, detail="Invalid PIN")
    
    token = create_token(user['user_id'], user['email'], user['role'])
    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "user_id": user['user_id'],
            "name": user['name'],
            "email": user['email'],
            "role": user['role']
        }
    }

@api_router.post("/auth/request-change-pin")
async def request_change_pin(data: OTPRequest):
    user = await db.users.find_one(
        {"$or": [{"email": data.contact}, {"phone": data.contact}]},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    otp = generate_otp()
    otp_storage[data.contact] = {"otp": otp, "created_at": datetime.now(timezone.utc)}
    
    return {
        "message": f"OTP has been sent to registered mail address/mobile number",
        "mock_otp": otp
    }

@api_router.post("/auth/change-pin")
async def change_pin(data: ChangePinRequest):
    if data.new_pin != data.confirm_pin:
        raise HTTPException(status_code=400, detail="Pin does not match")
    
    if data.email_or_phone not in otp_storage:
        raise HTTPException(status_code=400, detail="Please request OTP first")
    
    stored = otp_storage[data.email_or_phone]
    if stored['otp'] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    user = await db.users.find_one(
        {"$or": [{"email": data.email_or_phone}, {"phone": data.email_or_phone}]},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    await db.users.update_one(
        {"user_id": user['user_id']},
        {"$set": {"pin": hash_password(data.new_pin)}}
    )
    
    del otp_storage[data.email_or_phone]
    return {"message": "PIN changed successfully"}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"user_id": current_user['user_id']}, {"_id": 0, "password": 0, "pin": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ============= Service Provider Routes =============

@api_router.post("/providers/services")
async def create_service(data: ServiceCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'provider':
        raise HTTPException(status_code=403, detail="Only service providers can add services")
    
    service_id = str(uuid.uuid4())
    service_doc = {
        "service_id": service_id,
        "provider_id": current_user['user_id'],
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.services.insert_one(service_doc)
    return {"message": "Service added successfully", "service_id": service_id}

@api_router.get("/providers/services")
async def get_my_services(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'provider':
        raise HTTPException(status_code=403, detail="Only service providers can view their services")
    
    services = await db.services.find({"provider_id": current_user['user_id']}, {"_id": 0}).to_list(1000)
    return services

@api_router.put("/providers/services/{service_id}")
async def update_service(service_id: str, data: ServiceUpdate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'provider':
        raise HTTPException(status_code=403, detail="Only service providers can update services")
    
    service = await db.services.find_one({"service_id": service_id, "provider_id": current_user['user_id']}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db.services.update_one(
            {"service_id": service_id},
            {"$set": update_data}
        )
    
    return {"message": "Service updated successfully"}

@api_router.delete("/providers/services/{service_id}")
async def delete_service(service_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'provider':
        raise HTTPException(status_code=403, detail="Only service providers can delete services")
    
    result = await db.services.delete_one({"service_id": service_id, "provider_id": current_user['user_id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return {"message": "Service deleted successfully"}

@api_router.put("/providers/payment-details")
async def update_payment_details(data: ProviderDetails, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'provider':
        raise HTTPException(status_code=403, detail="Only service providers can update payment details")
    
    await db.users.update_one(
        {"user_id": current_user['user_id']},
        {"$set": {"payment_details": data.model_dump()}}
    )
    
    return {"message": "Payment details updated successfully"}

# ============= Service Discovery Routes =============

@api_router.get("/services")
async def get_services(
    district: Optional[str] = None,
    category: Optional[str] = None,
    keyword: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    query = {}
    
    if category:
        query["category"] = {"$regex": category, "$options": "i"}
    
    if keyword:
        query["$or"] = [
            {"name": {"$regex": keyword, "$options": "i"}},
            {"description": {"$regex": keyword, "$options": "i"}},
            {"category": {"$regex": keyword, "$options": "i"}}
        ]
    
    if min_price is not None or max_price is not None:
        query["base_price"] = {}
        if min_price is not None:
            query["base_price"]["$gte"] = min_price
        if max_price is not None:
            query["base_price"]["$lte"] = max_price
    
    services = await db.services.find(query, {"_id": 0}).to_list(1000)
    
    for service in services:
        provider = await db.users.find_one({"user_id": service['provider_id']}, {"_id": 0, "name": 1, "phone": 1, "email": 1})
        service['provider'] = provider
        service['rating'] = round(random.uniform(3.5, 5.0), 1)
    
    return services

@api_router.get("/services/{service_id}")
async def get_service_detail(service_id: str):
    service = await db.services.find_one({"service_id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    provider = await db.users.find_one({"user_id": service['provider_id']}, {"_id": 0, "name": 1, "phone": 1, "email": 1})
    service['provider'] = provider
    service['rating'] = round(random.uniform(3.5, 5.0), 1)
    
    return service

# ============= Cart & Booking Routes =============

@api_router.post("/cart")
async def add_to_cart(data: CartItem, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'user':
        raise HTTPException(status_code=403, detail="Only users can add to cart")
    
    service = await db.services.find_one({"service_id": data.service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    cart_item = {
        "cart_id": str(uuid.uuid4()),
        "user_id": current_user['user_id'],
        "service_id": data.service_id,
        "hours_days": data.hours_days,
        "added_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.cart.insert_one(cart_item)
    return {"message": "Service added to cart"}

@api_router.get("/cart")
async def get_cart(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'user':
        raise HTTPException(status_code=403, detail="Only users can view cart")
    
    cart_items = await db.cart.find({"user_id": current_user['user_id']}, {"_id": 0}).to_list(1000)
    
    for item in cart_items:
        service = await db.services.find_one({"service_id": item['service_id']}, {"_id": 0})
        item['service'] = service
        if service:
            final_price = service['base_price'] * (1 - service['discount'] / 100)
            item['total_amount'] = final_price * item['hours_days']
    
    return cart_items

@api_router.delete("/cart/{cart_id}")
async def remove_from_cart(cart_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.cart.delete_one({"cart_id": cart_id, "user_id": current_user['user_id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    return {"message": "Item removed from cart"}

@api_router.post("/bookings")
async def create_booking(data: BookingCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'user':
        raise HTTPException(status_code=403, detail="Only users can create bookings")
    
    service = await db.services.find_one({"service_id": data.service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    final_price = service['base_price'] * (1 - service['discount'] / 100)
    total_amount = final_price * data.hours_days
    
    booking_id = str(uuid.uuid4())
    booking_doc = {
        "booking_id": booking_id,
        "user_id": current_user['user_id'],
        "service_id": data.service_id,
        "provider_id": data.provider_id,
        "address_id": data.address_id,
        "hours_days": data.hours_days,
        "total_amount": total_amount,
        "payment_method": data.payment_method,
        "status": "pending",
        "notes": data.notes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bookings.insert_one(booking_doc)
    
    await db.cart.delete_many({"user_id": current_user['user_id'], "service_id": data.service_id})
    
    return {
        "message": "Booking created successfully. Notification sent to service provider.",
        "booking_id": booking_id,
        "total_amount": total_amount
    }

@api_router.get("/bookings")
async def get_bookings(current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'user':
        bookings = await db.bookings.find({"user_id": current_user['user_id']}, {"_id": 0}).to_list(1000)
    elif current_user['role'] == 'provider':
        bookings = await db.bookings.find({"provider_id": current_user['user_id']}, {"_id": 0}).to_list(1000)
    else:
        bookings = await db.bookings.find({}, {"_id": 0}).to_list(1000)
    
    for booking in bookings:
        service = await db.services.find_one({"service_id": booking['service_id']}, {"_id": 0})
        booking['service'] = service
        
        user = await db.users.find_one({"user_id": booking['user_id']}, {"_id": 0, "name": 1, "email": 1, "phone": 1})
        booking['user'] = user
        
        provider = await db.users.find_one({"user_id": booking['provider_id']}, {"_id": 0, "name": 1, "email": 1, "phone": 1})
        booking['provider'] = provider
    
    return bookings

@api_router.get("/bookings/{booking_id}")
async def get_booking_status(booking_id: str):
    booking = await db.bookings.find_one({"booking_id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    service = await db.services.find_one({"service_id": booking['service_id']}, {"_id": 0})
    booking['service'] = service
    
    return booking

@api_router.put("/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, status: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] not in ['provider', 'admin']:
        raise HTTPException(status_code=403, detail="Only providers can update booking status")
    
    if status not in ['pending', 'in_progress', 'completed', 'cancelled']:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    await db.bookings.update_one(
        {"booking_id": booking_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Booking status updated successfully"}

# ============= Address Routes =============

@api_router.post("/addresses")
async def create_address(data: AddressCreate, current_user: dict = Depends(get_current_user)):
    address_id = str(uuid.uuid4())
    address_doc = {
        "address_id": address_id,
        "user_id": current_user['user_id'],
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.addresses.insert_one(address_doc)
    return {"message": "Address added successfully", "address_id": address_id}

@api_router.get("/addresses")
async def get_addresses(current_user: dict = Depends(get_current_user)):
    addresses = await db.addresses.find({"user_id": current_user['user_id']}, {"_id": 0}).to_list(1000)
    return addresses

@api_router.delete("/addresses/{address_id}")
async def delete_address(address_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.addresses.delete_one({"address_id": address_id, "user_id": current_user['user_id']})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Address not found")
    
    return {"message": "Address deleted successfully"}

# ============= Payment Routes (Mock) =============

@api_router.post("/payments/create-order")
async def create_payment_order(data: PaymentCreate, current_user: dict = Depends(get_current_user)):
    order_id = str(uuid.uuid4())
    
    payment_doc = {
        "payment_id": order_id,
        "booking_id": data.booking_id,
        "user_id": current_user['user_id'],
        "amount": data.amount,
        "payment_method": data.payment_method,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payments.insert_one(payment_doc)
    
    return {
        "order_id": order_id,
        "amount": data.amount,
        "currency": "INR",
        "mock": True,
        "message": "Mock payment order created"
    }

@api_router.post("/payments/verify")
async def verify_payment(payment_id: str, booking_id: str):
    payment = await db.payments.find_one({"payment_id": payment_id}, {"_id": 0})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    await db.payments.update_one(
        {"payment_id": payment_id},
        {"$set": {"status": "completed"}}
    )
    
    await db.bookings.update_one(
        {"booking_id": booking_id},
        {"$set": {"status": "completed", "payment_status": "paid"}}
    )
    
    return {
        "message": "Payment verified successfully",
        "payment_status": "completed"
    }

# ============= Location Routes (Mock) =============

@api_router.post("/locations/geocode")
async def geocode_address(address: str):
    return {
        "address": address,
        "latitude": 11.0168 + random.uniform(-1, 1),
        "longitude": 76.9558 + random.uniform(-1, 1),
        "mock": True
    }

@api_router.post("/locations/reverse-geocode")
async def reverse_geocode(latitude: float, longitude: float):
    districts = ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli"]
    return {
        "latitude": latitude,
        "longitude": longitude,
        "address": f"Tamil Nadu, {random.choice(districts)}",
        "mock": True
    }

# ============= Admin Routes =============

@api_router.post("/admin/social-media")
async def update_social_media(data: SocialMediaUpdate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Only admin can update social media")
    
    if data.platform not in otp_storage or otp_storage[data.platform]['otp'] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    await db.settings.update_one(
        {"type": "social_media"},
        {"$set": {f"links.{data.platform}": data.url}},
        upsert=True
    )
    
    del otp_storage[data.platform]
    return {"message": "Social media link updated successfully"}

@api_router.post("/admin/request-otp")
async def admin_request_otp(platform: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Only admin can request OTP")
    
    otp = generate_otp()
    otp_storage[platform] = {"otp": otp, "created_at": datetime.now(timezone.utc)}
    
    return {"message": "OTP sent", "mock_otp": otp}

@api_router.get("/admin/social-media")
async def get_social_media():
    settings = await db.settings.find_one({"type": "social_media"}, {"_id": 0})
    if not settings:
        return {"links": {}}
    return settings

# ============= Districts & Categories =============

@api_router.get("/districts")
async def get_districts():
    return {
        "districts": [
            "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
            "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Karur", "Krishnagiri",
            "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur",
            "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
            "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur",
            "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
        ]
    }

@api_router.get("/categories")
async def get_categories():
    return {
        "categories": [
            "Earth Movers",
            "Packers and Movers",
            "Lorry Services",
            "Bore Well",
            "Power Tools"
        ]
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()