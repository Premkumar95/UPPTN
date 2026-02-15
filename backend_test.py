#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime

class ServiceMarketplaceAPITester:
    def __init__(self, base_url="https://local-services-tn.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.user_token = None
        self.provider_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_data = {}
        self.provider_data = {}
        self.service_id = None
        self.cart_id = None
        self.booking_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, use_token="none"):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if use_token == "user" and self.user_token:
            headers['Authorization'] = f'Bearer {self.user_token}'
        elif use_token == "provider" and self.provider_token:
            headers['Authorization'] = f'Bearer {self.provider_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            print(f"   Status: {response.status_code}")
            if response.content:
                try:
                    resp_json = response.json()
                    print(f"   Response: {json.dumps(resp_json, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Expected {expected_status}, got {response.status_code}")
                return True, response.json() if response.content else {}
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                return False, response.json() if response.content else {}

        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_districts_and_categories(self):
        """Test basic data endpoints"""
        print("\n" + "="*50)
        print("TESTING BASIC DATA ENDPOINTS")
        print("="*50)
        
        self.run_test("Get Districts", "GET", "/districts", 200)
        self.run_test("Get Categories", "GET", "/categories", 200)

    def test_user_registration_flow(self):
        """Test complete user registration and verification"""
        print("\n" + "="*50)
        print("TESTING USER REGISTRATION FLOW")
        print("="*50)
        
        # Test user registration
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "name": f"Test User {timestamp}",
            "email": f"testuser{timestamp}@example.com",
            "phone": f"+9198765{timestamp}",
            "password": "TestPass123!",
            "pin": "1234",
            "pin_confirm": "1234",
            "role": "user"
        }
        
        success, response = self.run_test(
            "User Registration", 
            "POST", 
            "/auth/register", 
            200, 
            user_data
        )
        
        if not success:
            return False
            
        mock_otp = response.get('mock_otp')
        if not mock_otp:
            print("❌ No mock OTP returned")
            return False
            
        # Test OTP verification
        success, _ = self.run_test(
            "User OTP Verification",
            "POST",
            "/auth/verify-otp",
            200,
            {"contact": user_data["email"], "otp": mock_otp}
        )
        
        if success:
            self.user_data = user_data
            
        return success

    def test_provider_registration_flow(self):
        """Test complete provider registration and verification"""
        print("\n" + "="*50)
        print("TESTING PROVIDER REGISTRATION FLOW")
        print("="*50)
        
        # Test provider registration
        timestamp = datetime.now().strftime('%H%M%S')
        provider_data = {
            "name": f"Test Provider {timestamp}",
            "email": f"provider{timestamp}@example.com", 
            "phone": f"+9187654{timestamp}",
            "password": "ProviderPass123!",
            "pin": "5678",
            "pin_confirm": "5678",
            "role": "provider"
        }
        
        success, response = self.run_test(
            "Provider Registration",
            "POST", 
            "/auth/register",
            200,
            provider_data
        )
        
        if not success:
            return False
            
        mock_otp = response.get('mock_otp')
        if not mock_otp:
            print("❌ No mock OTP returned")
            return False
            
        # Test OTP verification
        success, _ = self.run_test(
            "Provider OTP Verification",
            "POST",
            "/auth/verify-otp", 
            200,
            {"contact": provider_data["email"], "otp": mock_otp}
        )
        
        if success:
            self.provider_data = provider_data
            
        return success

    def test_user_login(self):
        """Test user login with password and PIN"""
        print("\n" + "="*50)
        print("TESTING USER LOGIN")
        print("="*50)
        
        # Test password login
        success, response = self.run_test(
            "User Password Login",
            "POST",
            "/auth/login",
            200,
            {
                "email_or_phone": self.user_data["email"],
                "password": self.user_data["password"],
                "login_type": "password"
            }
        )
        
        if success and 'token' in response:
            self.user_token = response['token']
            print(f"   User Token: {self.user_token[:50]}...")
        
        # Test PIN login
        success2, response2 = self.run_test(
            "User PIN Login",
            "POST", 
            "/auth/login",
            200,
            {
                "email_or_phone": self.user_data["phone"],
                "pin": self.user_data["pin"], 
                "login_type": "pin"
            }
        )
        
        return success and success2

    def test_provider_login(self):
        """Test provider login"""
        print("\n" + "="*50)
        print("TESTING PROVIDER LOGIN")
        print("="*50)
        
        success, response = self.run_test(
            "Provider Login",
            "POST",
            "/auth/login",
            200,
            {
                "email_or_phone": self.provider_data["email"],
                "password": self.provider_data["password"],
                "login_type": "password" 
            }
        )
        
        if success and 'token' in response:
            self.provider_token = response['token']
            print(f"   Provider Token: {self.provider_token[:50]}...")
            
        return success

    def test_auth_me(self):
        """Test authenticated user info endpoints"""
        print("\n" + "="*50)
        print("TESTING AUTH ME ENDPOINTS")
        print("="*50)
        
        user_success, _ = self.run_test(
            "Get User Profile", 
            "GET", 
            "/auth/me", 
            200, 
            use_token="user"
        )
        
        provider_success, _ = self.run_test(
            "Get Provider Profile",
            "GET",
            "/auth/me", 
            200,
            use_token="provider"
        )
        
        return user_success and provider_success

    def test_change_pin_flow(self):
        """Test change PIN functionality"""
        print("\n" + "="*50)
        print("TESTING CHANGE PIN FLOW")
        print("="*50)
        
        # Request OTP for PIN change
        success, response = self.run_test(
            "Request Change PIN OTP",
            "POST",
            "/auth/request-change-pin",
            200,
            {"contact": self.user_data["email"]}
        )
        
        if not success:
            return False
            
        mock_otp = response.get('mock_otp')
        if not mock_otp:
            print("❌ No mock OTP returned for PIN change")
            return False
            
        # Change PIN
        success, _ = self.run_test(
            "Change PIN",
            "POST", 
            "/auth/change-pin",
            200,
            {
                "email_or_phone": self.user_data["email"],
                "otp": mock_otp,
                "new_pin": "9876",
                "confirm_pin": "9876"
            }
        )
        
        return success

    def test_service_crud(self):
        """Test service CRUD operations for providers"""
        print("\n" + "="*50)
        print("TESTING SERVICE CRUD OPERATIONS")
        print("="*50)
        
        # Create service
        service_data = {
            "name": "Test Excavator Service",
            "category": "Earth Movers",
            "description": "Heavy duty excavator for construction",
            "base_price": 2500.0,
            "unit": "day",
            "discount": 10.0
        }
        
        success, response = self.run_test(
            "Create Service",
            "POST",
            "/providers/services",
            200,
            service_data,
            use_token="provider"
        )
        
        if success and 'service_id' in response:
            self.service_id = response['service_id']
            print(f"   Service ID: {self.service_id}")
        
        # Get provider services
        success2, _ = self.run_test(
            "Get Provider Services",
            "GET", 
            "/providers/services",
            200,
            use_token="provider"
        )
        
        # Update service
        update_data = {
            "description": "Updated: Heavy duty excavator for construction",
            "discount": 15.0
        }
        
        success3, _ = self.run_test(
            "Update Service",
            "PUT",
            f"/providers/services/{self.service_id}",
            200,
            update_data,
            use_token="provider"
        )
        
        return success and success2 and success3

    def test_service_discovery(self):
        """Test service discovery endpoints"""
        print("\n" + "="*50)
        print("TESTING SERVICE DISCOVERY")
        print("="*50)
        
        # Get all services
        success1, _ = self.run_test(
            "Get All Services",
            "GET",
            "/services",
            200
        )
        
        # Get services with filters
        success2, _ = self.run_test(
            "Get Services by Category",
            "GET", 
            "/services?category=Earth Movers",
            200
        )
        
        # Get services with keyword search
        success3, _ = self.run_test(
            "Search Services by Keyword",
            "GET",
            "/services?keyword=excavator", 
            200
        )
        
        # Get specific service details
        if self.service_id:
            success4, _ = self.run_test(
                "Get Service Details",
                "GET",
                f"/services/{self.service_id}",
                200
            )
        else:
            success4 = True
            
        return success1 and success2 and success3 and success4

    def test_cart_operations(self):
        """Test cart functionality"""
        print("\n" + "="*50)
        print("TESTING CART OPERATIONS")
        print("="*50)
        
        if not self.service_id:
            print("❌ No service ID available for cart testing")
            return False
            
        # Add to cart
        cart_data = {
            "service_id": self.service_id,
            "hours_days": 2.0
        }
        
        success1, _ = self.run_test(
            "Add to Cart",
            "POST",
            "/cart",
            200,
            cart_data,
            use_token="user"
        )
        
        # Get cart
        success2, response = self.run_test(
            "Get Cart",
            "GET", 
            "/cart",
            200,
            use_token="user"
        )
        
        # Get cart_id for removal test
        if success2 and response and len(response) > 0:
            self.cart_id = response[0].get('cart_id')
            
        return success1 and success2

    def test_booking_operations(self):
        """Test booking functionality"""
        print("\n" + "="*50)
        print("TESTING BOOKING OPERATIONS")
        print("="*50)
        
        if not self.service_id:
            print("❌ No service ID available for booking testing")
            return False
            
        # Create address first
        address_data = {
            "user_name": "Test User",
            "street_name": "123 Test Street", 
            "city": "Chennai",
            "district": "Chennai",
            "pincode": "600001",
            "landmark": "Near Test Mall"
        }
        
        success1, response = self.run_test(
            "Create Address",
            "POST",
            "/addresses",
            200,
            address_data,
            use_token="user"
        )
        
        if not success1 or 'address_id' not in response:
            print("❌ Failed to create address for booking")
            return False
            
        address_id = response['address_id']
        
        # Create booking
        booking_data = {
            "service_id": self.service_id,
            "provider_id": self.provider_data.get('user_id', 'test-provider-id'),
            "address_id": address_id,
            "hours_days": 2.0,
            "payment_method": "cash",
            "notes": "Test booking"
        }
        
        success2, response = self.run_test(
            "Create Booking",
            "POST", 
            "/bookings",
            200,
            booking_data,
            use_token="user"
        )
        
        if success2 and 'booking_id' in response:
            self.booking_id = response['booking_id']
            
        # Get user bookings
        success3, _ = self.run_test(
            "Get User Bookings",
            "GET",
            "/bookings", 
            200,
            use_token="user"
        )
        
        # Get provider bookings
        success4, _ = self.run_test(
            "Get Provider Bookings",
            "GET",
            "/bookings",
            200,
            use_token="provider"  
        )
        
        # Get booking status
        if self.booking_id:
            success5, _ = self.run_test(
                "Get Booking Status",
                "GET",
                f"/bookings/{self.booking_id}",
                200
            )
        else:
            success5 = True
            
        return success1 and success2 and success3 and success4 and success5

    def test_payment_operations(self):
        """Test payment functionality (mock)"""
        print("\n" + "="*50)
        print("TESTING PAYMENT OPERATIONS (MOCK)")
        print("="*50)
        
        if not self.booking_id:
            print("❌ No booking ID available for payment testing")
            return False
            
        # Create payment order
        payment_data = {
            "booking_id": self.booking_id,
            "amount": 5000.0,
            "payment_method": "upi"
        }
        
        success1, response = self.run_test(
            "Create Payment Order",
            "POST",
            "/payments/create-order",
            200,
            payment_data,
            use_token="user"
        )
        
        if success1 and 'order_id' in response:
            order_id = response['order_id']
            
            # Verify payment
            success2, _ = self.run_test(
                "Verify Payment", 
                "POST",
                f"/payments/verify?payment_id={order_id}&booking_id={self.booking_id}",
                200
            )
        else:
            success2 = False
            
        return success1 and success2

    def test_cleanup_operations(self):
        """Test cleanup operations"""
        print("\n" + "="*50)
        print("TESTING CLEANUP OPERATIONS")
        print("="*50)
        
        success_count = 0
        
        # Remove from cart if cart_id exists
        if self.cart_id:
            success, _ = self.run_test(
                "Remove from Cart",
                "DELETE",
                f"/cart/{self.cart_id}", 
                200,
                use_token="user"
            )
            if success:
                success_count += 1
        
        # Delete service
        if self.service_id:
            success, _ = self.run_test(
                "Delete Service",
                "DELETE",
                f"/providers/services/{self.service_id}",
                200,
                use_token="provider"
            )
            if success:
                success_count += 1
                
        return success_count > 0

def main():
    """Main test execution"""
    print("🚀 STARTING SERVICE MARKETPLACE API TESTING")
    print("=" * 60)
    
    tester = ServiceMarketplaceAPITester()
    
    # Test basic endpoints first
    tester.test_districts_and_categories()
    
    # Test user registration and authentication
    if not tester.test_user_registration_flow():
        print("❌ User registration failed, stopping tests")
        return 1
        
    if not tester.test_provider_registration_flow():
        print("❌ Provider registration failed, stopping tests")
        return 1
    
    # Test logins
    if not tester.test_user_login():
        print("❌ User login failed")
        return 1
        
    if not tester.test_provider_login():
        print("❌ Provider login failed")
        return 1
        
    # Test authenticated endpoints
    tester.test_auth_me()
    tester.test_change_pin_flow()
    
    # Test service operations
    if not tester.test_service_crud():
        print("❌ Service CRUD operations failed")
        
    # Test service discovery
    tester.test_service_discovery()
    
    # Test cart and booking operations
    tester.test_cart_operations()
    tester.test_booking_operations()
    
    # Test payments
    tester.test_payment_operations()
    
    # Cleanup
    tester.test_cleanup_operations()
    
    # Print final results
    print("\n" + "="*60)
    print("🏁 TEST RESULTS SUMMARY")
    print("="*60)
    print(f"📊 Tests Run: {tester.tests_run}")
    print(f"✅ Tests Passed: {tester.tests_passed}")
    print(f"❌ Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"📈 Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 ALL TESTS PASSED!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())