# PetLink - Phase 2: UML Diagrams & Database Design

This document contains the detailed system architecture diagrams and database designs in **Mermaid.js** syntax for Section 4 (UML Diagrams) and Section 5 (Database Design) of the Phase 2 (Agile Software Design Specification) document.

---

## Section 4: UML Diagrams

### 4.1 Sequence Diagrams
These diagrams illustrate the step-by-step logic and communications between the User, React Frontend, Backend API, Database, and external service providers.

#### 1. User Authentication
Covers user registration, validation, secure login using JWT tokens, bcrypt password comparison, and robust error handling.

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant FE as React Frontend (Web/Mobile)
    participant API as Backend API (Express.js)
    participant Auth as Auth Middleware & Bcrypt
    participant DB as Database (MongoDB)

    %% Registration Flow
    Note over U, DB: Registration Flow
    U->>FE: Enter Details (Name, Email, Password, Role)
    FE->>FE: Client-side Validation (Email format, Password strength)
    alt Validation Fails
        FE-->>U: Show Validation Error (e.g., "Invalid email format")
    else Validation Passes
        FE->>API: POST /api/auth/register {name, email, password, role}
        API->>DB: Check if Email exists
        DB-->>API: Email Status (Exists / Unique)
        alt Email Already Registered
            API-->>FE: 400 Bad Request (Error: "Email already in use")
            FE-->>U: Show Error Message ("Email is already registered")
        else Email is Unique
            API->>Auth: Hash password using bcrypt (Salt Rounds = 10)
            Auth-->>API: Hashed Password
            API->>DB: Save new User Document {name, email, passwordHash, role}
            DB-->>API: Save Success (User ID created)
            API-->>FE: 201 Created { success: true, message: "User registered successfully" }
            FE-->>U: Navigate to Login Screen / Show Success Alert
        end
    end

    %% Login Flow
    Note over U, DB: Login Flow
    U->>FE: Enter Login Credentials (Email, Password)
    FE->>API: POST /api/auth/login {email, password}
    API->>DB: Find User by Email
    DB-->>API: User Document (including passwordHash)
    alt User Not Found
        API-->>FE: 401 Unauthorized (Error: "Invalid credentials")
        FE-->>U: Show Error Message ("Invalid email or password")
    else User Found
        API->>Auth: Compare input password with passwordHash
        Auth-->>API: Comparison Result (True/False)
        alt Password Does Not Match
            API-->>FE: 401 Unauthorized (Error: "Invalid credentials")
            FE-->>U: Show Error Message ("Invalid email or password")
        else Password Matches
            API->>Auth: Generate stateless JWT (payload: {userId, role})
            Auth-->>API: Signed JWT Token (Secret Key + Expiry)
            API-->>FE: 200 OK { token, user: { id, name, email, role } }
            FE->>FE: Save JWT (localStorage / Secure AsyncStorage)
            FE-->>U: Redirect to Dashboard / Home Screen
        end
    end
```

---

#### 2. Pet Marketplace Purchase
Handles browsing items, adding products to the shopping cart, initiating checkout, securing payment via the Stripe API, and processing order confirmation backend-side.

```mermaid
sequenceDiagram
    autonumber
    actor U as User / Buyer
    participant FE as React Frontend (Web/Mobile)
    participant API as Backend API (Express.js)
    participant DB as Database (MongoDB)
    participant Stripe as Stripe API (External)

    %% Browse & Cart Flow
    Note over U, Stripe: Browse and Cart Management
    U->>FE: Browse products / Select filter (e.g., Category: Food)
    FE->>API: GET /api/products?category=food
    API->>DB: Query products in stock where category = 'food'
    DB-->>API: List of active products
    API-->>FE: 200 OK [Product List]
    FE-->>U: Render products list on Screen
    U->>FE: Click "Add to Cart"
    FE->>FE: Update Cart state (Item, Quantity)
    FE->>API: POST /api/cart { productId, quantity } (authenticated with JWT)
    API->>DB: Save/Update User's Cart document
    DB-->>API: Cart Updated
    API-->>FE: 200 OK { cartDetails }

    %% Checkout & Payment Flow
    Note over U, Stripe: Checkout & Secure Payment (Stripe)
    U->>FE: Click "Checkout"
    FE->>API: POST /api/orders/checkout { cartId, shippingAddress }
    API->>DB: Validate stock for items in cart
    DB-->>API: Stock levels (Valid / Out of Stock)
    alt Out of Stock
        API-->>FE: 400 Bad Request (Error: "Item X is out of stock")
        FE-->>U: Show error ("Some items in your cart are no longer available")
    else Stock Available
        API->>API: Calculate total order price (server-side check)
        API->>Stripe: Create Payment Intent { amount, currency: "PKR", metadata: { cartId } }
        Stripe-->>API: Payment Intent Object (contains Client Secret)
        API->>DB: Create Order Document (Status: "Pending Payment")
        DB-->>API: Order Saved (OrderId)
        API-->>FE: 200 OK { clientSecret, orderId }
        FE->>FE: Initialize Stripe SDK / Payment Sheet
        U->>FE: Enter Card Details & Click "Pay Now"
        FE->>Stripe: Confirm Payment (Client Secret + Card Details)
        Stripe-->>FE: Payment Result (Success / Failed)
        alt Payment Failed
            FE->>API: POST /api/orders/payment-failed { orderId }
            API->>DB: Update Order Status to "Failed"
            DB-->>API: Status Updated
            API-->>FE: Acknowledged
            FE-->>U: Show Payment Failure Screen (Suggest retry)
        else Payment Succeeded
            Stripe-->>API: Webhook Event: payment_intent.succeeded { metadata: { orderId }, transactionId } (Secure confirmation)
            API->>DB: Update Order Status to "Paid" & attach transactionId
            API->>DB: Decrement Product Stock levels (stock = stock - quantity)
            API->>DB: Clear User Cart
            DB-->>API: Database Transaction Success
            FE->>API: POST /api/orders/confirm-payment { orderId }
            API-->>FE: 200 OK { success: true, orderDetails }
            FE-->>U: Show "Order Confirmed" Screen with details
        end
    end
```

---

#### 3. Shelter Service Request
Represents the request-and-response workflow between a Pet Owner seeking temporary shelter/boarding and a Service Provider.

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Pet Owner (User)
    participant FE_Owner as Owner Frontend
    participant API as Backend API (Express.js)
    participant DB as Database (MongoDB)
    participant Socket as Socket.io / Notification Service
    participant FE_Prov as Provider Frontend
    actor Provider as Shelter Provider

    %% Booking Creation
    Note over Owner, Provider: Shelter Booking Request Creation
    Owner->>FE_Owner: Select Shelter, Dates (Check-in/out), and Pet Profile
    Owner->>FE_Owner: Click "Request Boarding"
    FE_Owner->>API: POST /api/shelters/bookings { shelterId, petId, startDate, endDate, notes } (Auth JWT)
    API->>DB: Validate Pet ownership and Provider availability
    DB-->>API: Validated (Owner matches, Provider has space)
    API->>DB: Save Booking Document (Status: "Pending")
    DB-->>API: Booking Saved (BookingId)
    API->>DB: Create Notification for Provider
    DB-->>API: Notification Saved
    API-->>FE_Owner: 201 Created { bookingId, status: "Pending" }
    FE_Owner-->>Owner: Display "Request Sent - Awaiting Provider Review"
    API->>Socket: Emit "new_booking_request" to Provider Room
    Socket->>FE_Prov: Real-time Alert: New Booking Request
    FE_Prov-->>Provider: Show push notification / Banner

    %% Provider Decision Flow
    Note over Owner, Provider: Provider Review & Decision Flow
    Provider->>FE_Prov: Open Dashboard -> Pending Requests
    FE_Prov->>API: GET /api/shelters/bookings/pending
    API->>DB: Query bookings where shelterId = provider's and status = "Pending"
    DB-->>API: List of pending bookings (with Pet & Owner details)
    API-->>FE_Prov: 200 OK [Booking Details & Pet Profile]
    FE_Prov-->>Provider: Display details, dates, and Pet medical notes
    
    alt Provider Accepts Booking
        Provider->>FE_Prov: Click "Accept Booking"
        FE_Prov->>API: PATCH /api/shelters/bookings/:bookingId { status: "Accepted" }
        API->>DB: Update Booking Status -> "Accepted"
        API->>DB: Create Notification for Pet Owner (Booking Accepted)
        DB-->>API: Updates Saved
        API-->>FE_Prov: 200 OK { bookingId, status: "Accepted" }
        FE_Prov-->>Provider: Show "Booking Accepted" success screen
        API->>Socket: Emit "booking_status_changed" to Owner Room
        Socket->>FE_Owner: Real-time Alert: Booking Accepted
        FE_Owner-->>Owner: Display notification and update request to "Accepted"
    else Provider Rejects Booking
        Provider->>FE_Prov: Click "Reject Booking" (optionally enter reason)
        FE_Prov->>API: PATCH /api/shelters/bookings/:bookingId { status: "Rejected", reason: "No capacity" }
        API->>DB: Update Booking Status -> "Rejected" (store reject reason)
        API->>DB: Create Notification for Pet Owner (Booking Rejected)
        DB-->>API: Updates Saved
        API-->>FE_Prov: 200 OK { bookingId, status: "Rejected" }
        FE_Prov-->>Provider: Show "Booking Rejected" screen
        API->>Socket: Emit "booking_status_changed" to Owner Room
        Socket->>FE_Owner: Real-time Alert: Booking Rejected (Reason: "No capacity")
        FE_Owner-->>Owner: Display rejection status & reason
    end
```

---

#### 4. Create Listing (Adoption/Sale)
Details how a pet owner submits details, uploads image files, gets them validated, uploads them to Cloudinary CDN, and saves the listing.

```mermaid
sequenceDiagram
    autonumber
    actor U as Pet Owner / Seller
    participant FE as React Frontend (Web/Mobile)
    participant API as Backend API (Express.js)
    participant Cloudinary as Cloudinary API (External Image CDN)
    participant DB as Database (MongoDB)

    Note over U, DB: Create Pet Marketplace Listing (Adoption/Sale)
    U->>FE: Fill form (Category: Adoption/Sale, Name, Breed, Age, Price, Location, Medical Info, Photos)
    U->>FE: Click "Submit Listing"
    FE->>FE: Client-side Validation (Check required fields, size/format of images, positive price if Sale)
    alt Validation Fails
        FE-->>U: Show form validation error (e.g. "Price is required for Sale")
    else Validation Passes
        FE->>API: POST /api/listings (Multipart Form Data: fields + image binaries)
        API->>API: Server-side Validation & sanitization (Validate role, verify input bounds)
        alt Server-side Validation Fails
            API-->>FE: 400 Bad Request { success: false, error: "Validation failed" }
            FE-->>U: Display specific server error message
        else Validation Success
            API->>Cloudinary: Upload image files (secure stream)
            Cloudinary-->>API: Upload Response (returns secure URLs & public IDs)
            API->>DB: Save Listing Document { sellerId, petDetails, listingType, price, images: [URLs], status: "Active" }
            DB-->>API: Document Saved Successfully
            API-->>FE: 201 Created { success: true, listingId, message: "Listing published" }
            FE-->>U: Redirect to Marketplace Page / Display Success Alert
        end
    end
```

---

#### 5. AI Chatbot Interaction
Triggers when a user enters a query, fetches conversation context memory, queries OpenAI API, and saves/returns the response.

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant FE as React Frontend (Web/Mobile)
    participant API as Backend API (Express.js)
    participant DB as Database (MongoDB)
    participant AI as OpenAI / NLP Engine (External API)

    Note over U, AI: AI Chatbot Interaction Flow
    U->>FE: Type message (e.g., "How often should I vaccinate my 2-month-old kitten?") & Click Send
    FE->>FE: Append user message to active chat UI
    FE->>API: POST /api/chatbot/message { message, sessionId }
    API->>API: Check session and user authentication
    alt Existing Chat Session
        API->>DB: Fetch last 5-10 messages for SessionId (Context Memory)
        DB-->>API: Chat History Array
    else New Chat Session
        API->>API: Initialize new SessionId and default System Prompt (Pet Care Expert Context)
    end
    API->>API: Format payload (System Prompt + Chat History + New Message)
    API->>AI: POST /v1/chat/completions { model: "gpt-4o", messages }
    AI-->>API: Response JSON (AI generated reply text)
    API->>DB: Save User Message & AI Response to Session History
    DB-->>API: History Saved
    API-->>FE: 200 OK { reply: "..." }
    FE->>FE: Render response with formatting / typing animation
    FE-->>U: Display Chatbot Response
```

---

#### 6. Vaccination Reminder
A background daily scheduler checks pet health records for upcoming vaccine due dates, and pushes multi-channel alerts (email, push, and web sockets).

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Node-cron / Agenda Scheduler (Worker)
    participant DB as Database (MongoDB)
    participant API as Backend Service (Express.js)
    participant Mail as Email Service (SendGrid/Nodemailer)
    participant FCM as Push Notification Service (Firebase Cloud Messaging)
    participant Socket as Socket.io Server
    participant FE as React Frontend (Web/Mobile)
    actor U as Pet Owner (User)

    Note over Cron, U: Automated Daily Vaccination Reminder Routine
    Cron->>Cron: Scheduled Trigger (Daily at 08:00 AM)
    Cron->>DB: Query HealthRecords where nextDueDate == Today + 2 Days (or Today) and notified == false
    DB-->>Cron: List of Pending Reminders [ { userId, petName, vaccineName, nextDueDate } ]
    
    loop For each Pending Reminder
        Cron->>DB: Fetch User details (Email, Device Push Tokens)
        DB-->>Cron: User contact info { email, pushToken }
        
        %% Create in-app notification
        Cron->>DB: Create Notification Document { userId, title: "Vaccination Due", message: "...", status: "unread" }
        DB-->>Cron: Notification Created
        
        %% Send Email Notification
        Cron->>Mail: Send Email { to: email, subject: "Reminder: Pet Vaccination Due", body: "..." }
        Mail-->>Cron: Email Sent Status (Success/Fail)
        
        %% Send Push Notification
        alt Push Token exists
            Cron->>FCM: Send Push Notification Payload { token, title: "Vaccination Due", body: "..." }
            FCM-->>Cron: Push Sent Status
        end
        
        %% Real-time delivery if online
        Cron->>Socket: Emit "notification_received" { userId, payload }
        Socket->>FE: WebSocket push (if connection active)
        FE-->>U: Show In-App Banner/Alert
        
        %% Mark as notified
        Cron->>DB: Update HealthRecord (Set notified = true)
        DB-->>Cron: Updated
    end
    
    Cron->>Cron: Finish job execution and log stats
```

---

#### 7. Admin Product Management
Illustrates an authorized administrator adding new items or updating stock levels with immediate visibility changes based on inventory level.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as System Admin / Store Manager
    participant FE as Admin Frontend (React Web)
    participant API as Backend API (Express.js)
    participant DB as Database (MongoDB)

    %% Admin Add Product
    Note over Admin, DB: Admin Product Creation Flow
    Admin->>FE: Fill Product Form (Name, Description, Price, Stock, Category, Images)
    Admin->>FE: Click "Add Product"
    FE->>API: POST /api/admin/products (JSON + Bearer JWT Token)
    API->>API: Verify Token & Check Role (user.role === 'admin')
    alt User is Not Admin
        API-->>FE: 403 Forbidden { error: "Access denied" }
        FE-->>Admin: Show Error: "Unauthorized access"
    else User is Admin
        API->>API: Validate Product Input (Price >= 0, Stock >= 0)
        alt Validation Fails
            API-->>FE: 400 Bad Request { error: "Invalid price or stock" }
            FE-->>Admin: Show field validation error
        else Validation Success
            API->>DB: Save Product Document
            DB-->>API: Product Saved Successfully
            API-->>FE: 201 Created { productDetails }
            FE-->>Admin: Display "Product added successfully" and refresh grid
        end
    end

    %% Admin Update Stock / Inventory Management
    Note over Admin, DB: Admin Stock Update Flow
    Admin->>FE: View Inventory -> Click Edit Stock for Product X
    Admin->>FE: Change Stock quantity (e.g., Set Stock = 50)
    FE->>API: PATCH /api/admin/products/:productId/stock { stock: 50 } (Bearer JWT)
    API->>API: Verify Admin Permissions
    API->>DB: Find Product & Update Stock Field
    alt Stock Update to > 0
        API->>DB: Set status = "In Stock"
    else Stock Update to == 0
        API->>DB: Set status = "Out of Stock"
    end
    DB-->>API: Updated Product Document
    API-->>FE: 200 OK { success: true, updatedProduct }
    FE-->>Admin: Update grid UI to show new stock and status
```

---

#### 8. Find Nearby Clinics
Enables a user to query clinics, using GPS tracking permission, and securely calling Google Maps API proxied through the backend API.

```mermaid
sequenceDiagram
    autonumber
    actor U as Pet Owner (User)
    participant FE as React Frontend (Web/Mobile)
    participant API as Backend API (Express.js)
    participant Google as Google Maps Places API (External)

    Note over U, Google: Find Nearby Veterinary Clinics Flow
    U->>FE: Click "Find Clinics Near Me"
    FE->>FE: Request GPS/Location Access from OS (Browser/Mobile)
    alt Location Permission Denied
        FE-->>U: Show Alert: "Location access required to find nearby clinics"
    else Location Permission Granted
        FE->>FE: Retrieve Current Coordinates (Lat, Lng)
        FE->>API: GET /api/clinics/nearby?lat=31.5204&lng=74.3587
        Note right of API: Securing API Key by proxying through backend
        API->>Google: GET /maps/api/place/nearbysearch/json { location: "31.5204,74.3587", radius: 5000, type: "veterinary_care", key: PROXY_SECRET_KEY }
        Google-->>API: JSON Response (Array of clinics with names, rating, distance, geolocations)
        API->>API: Filter and sort clinics by distance
        API-->>FE: 200 OK [ { name, address, distance, rating, lat, lng } ]
        FE->>FE: Initialize Map view and render markers for clinics
        FE->>FE: Render details list below Map
        FE-->>U: Show Interactive Map showing veterinary clinics and user's location
    end
```

---

### 4.2 Class Diagram
A comprehensive Class Diagram showing the core system objects, attributes, methods, and structural relationships (Aggregation, Composition, Association).

```mermaid
classDiagram
    direction TB

    class User {
        +String userId
        +String name
        +String email
        +String passwordHash
        +String role
        +String phone
        +String address
        +Date createdAt
        +register() Boolean
        +login() String
        +updateProfile(data) Boolean
        +resetPassword(email) Boolean
    }

    class PetProfile {
        +String petId
        +String ownerId
        +String name
        +String species
        +String breed
        +int ageMonths
        +float weightKg
        +String medicalHistory
        +String imageUrl
        +createProfile() Boolean
        +updateProfile(data) Boolean
        +deleteProfile() Boolean
    }

    class MarketplaceListing {
        +String listingId
        +String petId
        +String sellerId
        +String type
        +float price
        +String description
        +String status
        +Date createdAt
        +createListing() Boolean
        +updateListing(data) Boolean
        +markAsCompleted(status) Boolean
        +deleteListing() Boolean
    }

    class ShelterRequest {
        +String requestId
        +String petOwnerId
        +String providerId
        +String petId
        +Date startDate
        +Date endDate
        +String status
        +String notes
        +submitRequest() Boolean
        +updateStatus(status) Boolean
        +cancelRequest() Boolean
    }

    class Product {
        +String productId
        +String name
        +String description
        +float price
        +int stock
        +String category
        +List~String~ imageUrls
        +String status
        +createProduct() Boolean
        +updateDetails(data) Boolean
        +updateStock(qty) Boolean
        +softDelete() Boolean
    }

    class Order {
        +String orderId
        +String buyerId
        +float totalAmount
        +String status
        +String shippingAddress
        +String stripePaymentId
        +Date createdAt
        +createOrder() Boolean
        +updateStatus(status) Boolean
        +processPayment() Boolean
    }

    class OrderItem {
        +String productId
        +int quantity
        +float priceAtPurchase
    }

    class HealthRecord {
        +String recordId
        +String petId
        +String vaccineName
        +Date administrationDate
        +Date nextDueDate
        +String notes
        +boolean notified
        +addRecord() Boolean
        +updateRecord(data) Boolean
        +checkReminderStatus() Boolean
    }

    class Notification {
        +String notificationId
        +String userId
        +String title
        +String message
        +boolean isRead
        +Date createdAt
        +createNotification() Boolean
        +markAsRead() Boolean
    }

    %% Relationships
    User "1" o-- "*" PetProfile : owns
    User "1" --> "*" MarketplaceListing : creates
    User "1" --> "*" Order : places
    User "1" *-- "*" Notification : receives
    User "1" --> "*" ShelterRequest : requests (Owner)
    User "1" --> "*" ShelterRequest : handles (Provider)

    PetProfile "1" <-- "*" MarketplaceListing : references
    PetProfile "1" <-- "*" ShelterRequest : boards
    PetProfile "1" *-- "*" HealthRecord : contains

    Order "1" *-- "*" OrderItem : contains
    OrderItem "*" --> "1" Product : references
```

---

## Section 5: Database Design

### 5.1 Entity-Relationship Diagram (ERD)
The database for PetLink is structured using MongoDB (NoSQL). The ERD maps out the collections, their fields, field types, and the logical referencing relationships between collections.

```mermaid
erDiagram
    USERS {
        objectId id PK
        string name
        string email
        string passwordHash
        string role
        string phone
        string address
        date createdAt
    }

    PET_PROFILES {
        objectId id PK
        objectId ownerId FK
        string name
        string species
        string breed
        int ageMonths
        float weightKg
        string medicalHistory
        string imageUrl
        date createdAt
    }

    MARKETPLACE_LISTINGS {
        objectId id PK
        objectId petId FK
        objectId sellerId FK
        string type
        float price
        string description
        string status
        date createdAt
    }

    SHELTER_REQUESTS {
        objectId id PK
        objectId petOwnerId FK
        objectId providerId FK
        objectId petId FK
        date startDate
        date endDate
        string status
        string notes
        date createdAt
    }

    PRODUCTS {
        objectId id PK
        string name
        string description
        float price
        int stock
        string category
        array imageUrls
        string status
        date createdAt
    }

    ORDERS {
        objectId id PK
        objectId buyerId FK
        float totalAmount
        string status
        string shippingAddress
        string stripePaymentId
        date createdAt
    }

    ORDER_ITEMS {
        objectId id PK
        objectId orderId FK
        objectId productId FK
        int quantity
        float priceAtPurchase
    }

    HEALTH_RECORDS {
        objectId id PK
        objectId petId FK
        string vaccineName
        date administrationDate
        date nextDueDate
        string notes
        boolean notified
        date createdAt
    }

    NOTIFICATIONS {
        objectId id PK
        objectId userId FK
        string title
        string message
        boolean isRead
        date createdAt
    }

    CARTS {
        objectId id PK
        objectId userId FK
        date updatedAt
    }

    CART_ITEMS {
        objectId id PK
        objectId cartId FK
        objectId productId FK
        int quantity
    }

    %% Relationships
    USERS ||--o{ PET_PROFILES : "owns"
    USERS ||--o{ MARKETPLACE_LISTINGS : "creates"
    USERS ||--o{ SHELTER_REQUESTS : "requests (as Owner)"
    USERS ||--o{ SHELTER_REQUESTS : "handles (as Provider)"
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--|| CARTS : "has"

    PET_PROFILES ||--o{ MARKETPLACE_LISTINGS : "listed in"
    PET_PROFILES ||--o{ SHELTER_REQUESTS : "boarded in"
    PET_PROFILES ||--o{ HEALTH_RECORDS : "has records"

    ORDERS ||--|{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered in"
    
    CARTS ||--o{ CART_ITEMS : "contains"
    PRODUCTS ||--o{ CART_ITEMS : "added to"
```

---

### 5.2 Schema Tables
Below is the technical specification of the field constraints, data types, indexes, and keys for the PetLink database schema.

#### 1. Users Collection
Stores details for all actors (Adopters, Sellers, Owners, Service Providers, and Admins).

| Field Name | Data Type | Key/Index | Required? | Constraints & Details |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK | Yes | Auto-generated by MongoDB |
| `name` | String | | Yes | Length: 3 - 50 chars |
| `email` | String | Unique | Yes | Valid email format, indexed |
| `passwordHash` | String | | Yes | Bcrypt-hashed password |
| `role` | String | | Yes | Enum: `['admin', 'buyer', 'seller', 'shelter_provider']` |
| `phone` | String | | No | Format check for Pakistani numbers |
| `address` | String | | No | User's physical location info |
| `createdAt` | Date | | Yes | Defaults to `Date.now()` |

#### 2. PetProfiles Collection
Stores profile details of pets owned by users.

| Field Name | Data Type | Key/Index | Required? | Constraints & Details |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK | Yes | Auto-generated |
| `ownerId` | ObjectId | FK, Index | Yes | References `Users._id` |
| `name` | String | | Yes | Name of the pet |
| `species` | String | | Yes | e.g., `'Cat'`, `'Dog'`, `'Rabbit'` |
| `breed` | String | | Yes | Breed of the pet |
| `ageMonths` | Number | | Yes | Must be >= 0 |
| `weightKg` | Number | | Yes | Decimal representation, must be > 0 |
| `medicalHistory` | String | | No | Notes on allergies or chronic conditions |
| `imageUrl` | String | | Yes | Direct image link from Cloudinary |
| `createdAt` | Date | | Yes | Defaults to `Date.now()` |

#### 3. MarketplaceListings Collection
Stores active and completed pet trading listings (Adoption and Sale).

| Field Name | Data Type | Key/Index | Required? | Constraints & Details |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK | Yes | Auto-generated |
| `petId` | ObjectId | FK, Index | Yes | References `PetProfiles._id` |
| `sellerId` | ObjectId | FK, Index | Yes | References `Users._id` |
| `type` | String | | Yes | Enum: `['adoption', 'sale']` |
| `price` | Number | | Yes | Required if type is `'sale'`, else must be `0` |
| `description` | String | | Yes | Text details about listing |
| `status` | String | | Yes | Enum: `['active', 'sold', 'adopted', 'inactive']` |
| `createdAt` | Date | | Yes | Defaults to `Date.now()` |

#### 4. ShelterRequests Collection
Manages temporary boarding booking requests submitted by owners and accepted/rejected by shelter providers.

| Field Name | Data Type | Key/Index | Required? | Constraints & Details |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK | Yes | Auto-generated |
| `petOwnerId` | ObjectId | FK, Index | Yes | References `Users._id` (Pet Owner) |
| `providerId` | ObjectId | FK, Index | Yes | References `Users._id` (Shelter Provider) |
| `petId` | ObjectId | FK | Yes | References `PetProfiles._id` |
| `startDate` | Date | | Yes | Boarding start date |
| `endDate` | Date | | Yes | Boarding end date, must be >= `startDate` |
| `status` | String | | Yes | Enum: `['pending', 'accepted', 'rejected', 'cancelled']` |
| `notes` | String | | No | Special care instructions |
| `createdAt` | Date | | Yes | Defaults to `Date.now()` |

#### 5. Products Collection
Stores pet products managed by Admin and displayed in the User StoreFront.

| Field Name | Data Type | Key/Index | Required? | Constraints & Details |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK | Yes | Auto-generated |
| `name` | String | | Yes | Product name |
| `description` | String | | Yes | Detailed product specification |
| `price` | Number | | Yes | Must be >= 0 |
| `stock` | Number | | Yes | Integer quantity, must be >= 0 |
| `category` | String | | Yes | Enum: `['food', 'medicine', 'accessories', 'toys']` |
| `imageUrls` | Array (String) | | Yes | Array of Cloudinary links |
| `status` | String | | Yes | Enum: `['in_stock', 'out_of_stock']` |
| `createdAt` | Date | | Yes | Defaults to `Date.now()` |

#### 6. Orders Collection
Stores product sales history and shipping status.

| Field Name | Data Type | Key/Index | Required? | Constraints & Details |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK | Yes | Auto-generated |
| `buyerId` | ObjectId | FK, Index | Yes | References `Users._id` |
| `totalAmount` | Number | | Yes | Must be >= 0 |
| `status` | String | | Yes | Enum: `['pending', 'paid', 'shipped', 'delivered', 'cancelled']` |
| `shippingAddress` | String | | Yes | Shipping address details |
| `stripePaymentId` | String | Unique | No | Store reference for transactions |
| `createdAt` | Date | | Yes | Defaults to `Date.now()` |

#### 7. OrderItems Collection
Links items in an order to the primary `Orders` table.

| Field Name | Data Type | Key/Index | Required? | Constraints & Details |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK | Yes | Auto-generated |
| `orderId` | ObjectId | FK, Index | Yes | References `Orders._id` |
| `productId` | ObjectId | FK | Yes | References `Products._id` |
| `quantity` | Number | | Yes | Integer, must be >= 1 |
| `priceAtPurchase` | Number | | Yes | Remembers price at time of sale |

#### 8. HealthRecords Collection
Stores medical events and vaccinations for automated triggers.

| Field Name | Data Type | Key/Index | Required? | Constraints & Details |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK | Yes | Auto-generated |
| `petId` | ObjectId | FK, Index | Yes | References `PetProfiles._id` |
| `vaccineName` | String | | Yes | e.g. `'Rabies'`, `'FVRCP'` |
| `administrationDate`| Date | | Yes | Date vaccine was given |
| `nextDueDate` | Date | Index | Yes | Next scheduled vaccination date |
| `notes` | String | | No | Comments from veterinarian |
| `notified` | Boolean | | Yes | Default: `false`. True once reminder fires |
| `createdAt` | Date | | Yes | Defaults to `Date.now()` |

#### 9. Notifications Collection
Manages alerts sent dynamically to user profiles.

| Field Name | Data Type | Key/Index | Required? | Constraints & Details |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK | Yes | Auto-generated |
| `userId` | ObjectId | FK, Index | Yes | References `Users._id` |
| `title` | String | | Yes | Notification heading |
| `message` | String | | Yes | Alert description text |
| `isRead` | Boolean | | Yes | Default: `false` |
| `createdAt` | Date | | Yes | Defaults to `Date.now()` |

#### 10. Carts & CartItems Collections
Handles user carts and items waiting for checkout.

**Carts Table**
| Field Name | Data Type | Key/Index | Required? | Constraints & Details |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK | Yes | Auto-generated |
| `userId` | ObjectId | FK, Index | Yes | References `Users._id` (One cart per user) |
| `updatedAt` | Date | | Yes | Timestamp of last modification |

**CartItems Table**
| Field Name | Data Type | Key/Index | Required? | Constraints & Details |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | PK | Yes | Auto-generated |
| `cartId` | ObjectId | FK, Index | Yes | References `Carts._id` |
| `productId` | ObjectId | FK | Yes | References `Products._id` |
| `quantity` | Number | | Yes | Must be >= 1 |
