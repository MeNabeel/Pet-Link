# PetLink: Agile Software Design Specification (SDS)
**Phase II**  
**Version 1.3**  

---

## Document Metadata

* **Product Owner:** Zupash Awais  
* **Scrum Master:** Nabeel Ijaz  
* **Group ID:** S26SE025  
* **Institution:** Faculty of Information Technology & Computer Science, University of Central Punjab  

### Presenters and Roles:
| Registration Number | Member Name | Role |
| :--- | :--- | :--- |
| L1F22BSSE0286 | Nabeel Ijaz | Backend Development |
| L1F22BSSE0297 | Ehsan Shahid | Mobile App Development |
| L1S23BSSE0100 | Umer Akram | Web Development |
| L1S23BSSE0089 | Usama | Database Design and Testing |

---

## Revision History & Sprint Log

| Version | Sprint | Date | Changes | Owner |
| :--- | :--- | :--- | :--- | :--- |
| **1.0** | **Sprint 1** | **26-May-2026** | Initial SDS creation, architecture selection, module decomposition and requirement alignment with SRS | Team |
| **1.1** | **Sprint 4** | **29-May-2026** | Added Use Case Diagrams, DFDs, Marketplace Design, Shelter Booking Design and UI Flow Models | Team |
| **1.2** | **Sprint 7** | **07-Jun-2026** | Added ER Diagram, Class Diagram, API Design, AI Chatbot and Clinic Locator Architecture | Team |

---

## Abstract

PetLink is a cross-platform web and mobile application developed to serve as a comprehensive pet management platform. It provides a centralized digital solution for pet owners, adopters, buyers, and small service providers in Pakistan, enabling them to manage all pet-related activities through a single, user-friendly system.

In today’s fragmented environment, pet owners face significant challenges when they want to sell or adopt a pet, arrange temporary shelter during travel, purchase pet products, or maintain accurate health records. Most activities are currently handled through scattered social media groups, informal WhatsApp listings, or separate unconnected websites. This leads to incomplete information, lack of trust, difficulty in tracking vaccination schedules, unreliable service coordination, and increased risk of missing important pet care deadlines.

The proposed system offers a complete set of functionalities including user and pet profile management, pet adoption and sale listings with proper validation, temporary shelter service requests, an integrated pet product store with secure payment gateway, digital pet health and vaccination record management with automated reminders, Google Maps-based nearby veterinary clinic locator, and a custom AI-driven chatbot for instant user assistance and guidance.

By addressing these issues, PetLink fulfills a vital public need in the growing pet ownership community of Pakistan. It improves pet welfare through better record-keeping and timely care, enhances trust and transparency in pet trading and services, reduces fragmentation in the market, and provides a reliable, accessible platform that brings convenience and organization to thousands of pet lovers and service providers.

---

## 1. System Architecture

### 1.1 High-Level Architecture
PetLink follows a **Layered Client-Server Architecture** enhanced with scalable cloud components. The system separates presentation, business logic, data management, and external integrations into distinct layers to improve maintainability, scalability, and security.

The architecture consists of:
*   **Presentation Layer:** 
    *   React.js Web Application
    *   React Native Mobile Application
*   **Application Layer:**
    *   API Gateway
    *   Authentication Services
    *   Business Logic Services
    *   Notification Services
*   **Data Layer:**
    *   MongoDB Atlas Database
    *   Redis Cache
*   **External Service Layer:**
    *   Stripe Payment Gateway
    *   Google Maps API
    *   AI Chatbot Service
    *   Firebase Cloud Messaging (FCM)

To support future growth and increased user traffic, a Load Balancer distributes incoming requests across backend instances while Redis caching reduces database load and improves response time. This architecture provides high availability, better performance, easier maintenance, and support for thousands of concurrent users.

### 1.2 Architecture Diagram
[Here's diagram and available: High-Level Architecture Diagram]

### 1.3 Component Overview
| Component | Description |
| :--- | :--- |
| **React Web Application** | Provides browser-based access to PetLink functionalities. |
| **React Native Mobile Application** | Provides mobile access for Android and iOS users. |
| **Load Balancer** | Distributes incoming requests among backend services to improve performance and availability. |
| **API Gateway** | Central entry point that routes requests to appropriate backend services. |
| **Authentication Service** | Handles registration, login, JWT generation, and access control. |
| **Pet Management Service** | Manages pet profiles and ownership records. |
| **Marketplace Service** | Handles pet adoption and sale listings. |
| **Shelter Booking Service** | Processes temporary shelter requests and provider responses. |
| **E-Commerce Service** | Manages products, carts, orders, and inventory. |
| **Payment Service** | Integrates with Stripe to process secure online payments. |
| **Health Record Service** | Stores vaccination records and manages reminder schedules. |
| **Notification Service** | Sends push notifications, emails, and real-time alerts. |
| **AI Chatbot Service** | Provides automated assistance and pet-related guidance. |
| **Location Service** | Retrieves nearby veterinary clinics using Google Maps APIs. |
| **MongoDB Atlas** | Stores user, pet, order, listing, and health record data. |
| **Redis Cache** | Improves performance by caching frequently accessed data. |
| **Stripe API** | Processes online payment transactions securely. |
| **Google Maps API** | Provides location and mapping services. |
| **Firebase Cloud Messaging** | Delivers push notifications to mobile devices. |
| **OpenAI / RAG Engine** | Generates intelligent chatbot responses. |

---

## 2. Mapping Design to User Stories

| Story ID | Component | Description |
| :--- | :--- | :--- |
| **US-01 / US-02** | Authentication Module | Verifies inputs, salts and hashes user passwords via bcrypt, and generates stateless JWT tokens for future requests. |
| **US-05** | Pet Profile Module | Creates relational mappings inside the MongoDB document cluster tying unique Pet entries to their respective Owner's User ID. |
| **US-06 / US-07** | Marketplace Module | Registers public data documents within the marketplace data collection with structural attributes indicating adoption or sales pricing. |
| **US-08** | Marketplace Search | Compiles runtime search strings into active multi-field mongo search queries, filtering parameters like species, age, and breed without structural lag. |
| **US-09** | Shelter Request Module | Logs specific time intervals and notes between a pet owner and an available shelter provider entry. |
| **US-10 / US-32** | Payment & Order Engine | Interfaces with Stripe sandbox endpoints to execute electronic transactions, outputting immutable order records on success. |
| **US-11 / US-12** | Digital Health Vault | Adds sub-document medical logs to specific pet profiles and flags upcoming chronological tasks for automated system reminders. |
| **US-13** | AI Chatbot Adapter | Accepts query strings from the client app, forwards them to the AI engine with a structured prompt, and renders the reply. |
| **US-14** | Location Engine | Pulls latitude/longitude from client device sensors and maps surrounding veterinary clinic landmarks via Google Maps. |
| **US-15** | Notification Module | Distributes alerts (e.g., booking status updates, checkout success) in real time. |
| **US-17 to US-26** | Admin Management UI | Locks product ingestion forms behind explicit admin security routes, managing live store inventories and sales logs. |

---

## 3. Detailed System Design

### 3.1 Module Decomposition

#### 3.1.1 Authentication & User Management Module
*   **Purpose:** Enforces platform onboarding rules, evaluates credentials, secures user passwords, and handles session validation using stateless headers across both web and mobile client applications.
*   **Sub-Modules:**
    *   **RegistrationManager:** Validates incoming registration fields (e.g., name, email, password, role) and creates a new user document collection entry.
    *   **LoginGatekeeper:** Handles secure user and administrator authentication requests, issuing a stateless payload on verified credentials.
    *   **BCryptHasher:** Provides secure cryptographic operations, salting and hashing plaintext passwords before database storage to prevent reverse-engineering.
    *   **JWTTokenSigner:** Generates and cryptographically signs stateless JSON Web Tokens with a dedicated expiration window to authorize future API requests.

#### 3.1.2 Pet Profile Module
*   **Purpose:** Handles CRUD operations for pet statistics and health profiles.
*   **Sub-Modules:**
    *   **Profile Creator:** Saves new pet records including name, species, breed, age, weight, and image links.
    *   **Profile Editor:** Updates profile values when weight, age, or medical details change.
    *   **Profile Remover:** Removes pet profiles from the active view.

#### 3.1.3 Marketplace Module
*   **Purpose:** Coordinates pet adoption and sale listings.
*   **Sub-Modules:**
    *   **Listing Creator:** Validates prices, matches listings to pet profiles, and creates marketplace records.
    *   **Feed Viewer:** Fetches listings and sorts them by date and type.
    *   **Search Filter:** Performs query operations based on breed, species, location, and price.
    *   **Listing Status Manager:** Marks listings as sold, adopted, or inactive.

#### 3.1.4 Shelter Booking Modules
*   **Purpose:** Coordinates boarding bookings between owners and providers.
*   **Sub-Modules:**
    *   **Booking Creator:** Creates booking requests with start/end dates, pet profiles, and notes.
    *   **Provider Panel:** Shows pending, active, and completed booking requests to providers.
    *   **Status Manager:** Lets providers accept or reject bookings, which updates database state.

#### 3.1.5 E-Commerce Modules
*   **Purpose:** Handles Store Operations, Cart Updates and Inventory tracking.
*   **Sub-Modules:**
    *   **Storefront Catalog:** Shows product categories, names, prices, and images.
    *   **Cart Manager:** Handles additions, removals, and quantity changes in the cart.
    *   **Inventory Manager:** Tracks product stock levels and updates availability flags.

#### 3.1.6 Payment Processing Module
*   **Purpose:** Manages checkout transactions and Stripe integrations.
*   **Sub-Modules:**
    *   **Price Calculator:** Computes the total cost (items + delivery) server-side.
    *   **Stripe Intent Handler:** Requests payment intents from Stripe and returns client secrets to the client.
    *   **Webhook Monitor:** Listens for Stripe payment success notifications to update order records.

#### 3.1.7 Health Vault and Scheduler
*   **Purpose:** Manages pet health histories and schedules vaccination reminders.
*   **Sub-Modules:**
    *   **Record logger:** Logs vaccine names, dates, and calculated next due dates.
    *   **Daily cron worker:** Checks database records daily to find upcoming vaccine due dates.
    *   **Reminder triggers:** Sends push notifications and email alerts when vaccine due dates approach.

#### 3.1.8 AI Chatbot Module
*   **Purpose:** Provides natural language response support.
*   **Sub-Modules:**
    *   **Chat Interface:** Renders conversation messages in a chat interface.
    *   **Session Handler:** Restores recent messages to maintain context.

#### 3.1.9 Location Module
*   **Purpose:** Locates nearby veterinary clinics.
*   **Sub-Modules:**
    *   **GPS Coordinate Tracker:** Retrieves current device coordinates.
    *   **API Proxy:** Safe backend proxy that queries Google Places API using secret keys.
    *   **Map Pin Renderer:** Plots nearby veterinary clinics on the map view.

#### 3.1.10 Notification Module
*   **Purpose:** Manages push, web socket, and email alerts.
*   **Sub-Modules:**
    *   **FCM Integrator:** Sends push notifications to mobile devices.
    *   **Mail Sender:** Sends HTML-formatted emails via SMTP.
    *   **Web Socket Service:** Sends real-time alerts to active frontend sessions.

#### 3.1.11 Data Processing Modules
*   **Purpose:** Handles database read and write tasks.
*   **Sub-Modules:**
    *   **Schema Validator:** Validates model data formats using Mongoose templates.
    *   **DB Connector:** Maintains connection pools to the cloud database.

#### 3.1.12 API Layer
*   **Purpose:** Manages integrations with external services.
*   **Sub-Modules:**
    *   **Third-Party Handshakes:** Coordinates API requests to Stripe, Google Maps, and Open LLM for RAG.

### 3.2 Data Flow Description
*   **DFD Level 0 Diagram:**  
    [Here's diagram and available: Data Flow Diagram Level 0]
*   **DFD Level 1 Diagram:**  
    [Here's diagram and available: Data Flow Diagram Level 1]

---

## 4. UML Diagrams

### 4.1 Use Case Diagram
*   **User Registration and Authentication:**  
    [Here's diagram and available: Use Case Diagram - User Registration and Authentication]
*   **Manage User Profile:**  
    [Here's diagram and available: Use Case Diagram - Manage User Profile]
*   **Create and Manage Pet Profile:**  
    [Here's diagram and available: Use Case Diagram - Create and Manage Pet Profile]
*   **Manage Pet Listing:**  
    [Here's diagram and available: Use Case Diagram - Manage Pet Listing]
*   **Request Temporary Shelter:**  
    [Here's diagram and available: Use Case Diagram - Request Temporary Shelter]
*   **Purchase Pet Product:**  
    [Here's diagram and available: Use Case Diagram - Purchase Pet Product]
*   **Manage Pet Health Records:**  
    [Here's diagram and available: Use Case Diagram - Manage Pet Health Records]
*   **Interact With AI Chatbot:**  
    [Here's diagram and available: Use Case Diagram - Interact With AI Chatbot]
*   **Find Nearby Veterinary Clinics:**  
    [Here's diagram and available: Use Case Diagram - Find Nearby Veterinary Clinics]
*   **Admin Store Management:**  
    [Here's diagram and available: Use Case Diagram - Admin Store Management]

### 4.2 Class Diagram
[Here's diagram and available: Class Diagram]

### 4.3 Sequence Diagrams
*   **User Authentication Sequence:**  
    [Here's diagram and available: Sequence Diagram - User Authentication]
*   **Pet Marketplace Purchase Sequence:**  
    [Here's diagram and available: Sequence Diagram - Pet Marketplace Purchase]
*   **Shelter Service Request Sequence:**  
    [Here's diagram and available: Sequence Diagram - Shelter Service Request]
*   **Create Listing Sequence:**  
    [Here's diagram and available: Sequence Diagram - Create Listing]
*   **AI Chatbot Interaction Sequence:**  
    [Here's diagram and available: Sequence Diagram - AI Chatbot Interaction]
*   **Vaccination Reminder Sequence:**  
    [Here's diagram and available: Sequence Diagram - Vaccination Reminder]
*   **Admin Product Management Sequence:**  
    [Here's diagram and available: Sequence Diagram - Admin Product Management]
*   **Find Nearby Clinics Sequence:**  
    [Here's diagram and available: Sequence Diagram - Find Nearby Clinics]

---

## 5. Database Design (ERD)

### 5.1 ER Diagram
[Here's diagram and available: Entity Relationship Diagram (ERD)]

### 5.2 Schema Tables
[Here's diagram and available: Detailed Database Schema and Collection Tables]

---

## 6. API Design

| Endpoint | Method | Input | Output | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | POST | `{name, email, password, role}` | User registration confirmation | Registers a new user account with role selection |
| `/api/auth/login` | POST | `{email, password}` | Authentication token + user details | Logs in user and yields signed JWT + profile details |
| `/api/auth/profile` | PUT | `userId, name, phone, address` | Updated user profile | Updates profile details for active user accounts |
| `/api/pets` | POST | `ownerId, name, species, breed, ageMonths, weightKg, imageUrl` | Pet profile creation confirmation | Adds a new pet profile tied to owner ID |
| `/api/pets` | GET | `ownerId` | List of owned pet profiles | Retrieves all active pet profiles registered to an owner |
| `/api/listings` | POST | `petId, sellerId, type, price, description` | Marketplace listing creation confirmation | Creates a public sale or adoption listing |
| `/api/listings` | GET | `type, category, search, location` | List of matching active listings | Queries marketplace listings with filters |
| `/api/listings/{id}/status` | PUT | `listingId, status` | Updated listing details | Updates listing status (sold, adopted, inactive) |
| `/api/shelters/bookings` | POST | `petOwnerId, providerId, petId, startDate, endDate` | Booking request confirmation | Submits a new boarding request to a provider |
| `/api/shelters/bookings/pending` | GET | `providerId` | Pending boarding requests | Fetches pending shelter requests for the active provider |
| `/api/shelters/bookings/{id}/status` | PATCH | `bookingId, status` | Updated booking status | Provider accepts or rejects boarding requests |
| `/api/products` | GET | `category, search` | List of matching shop products | Queries e-commerce store catalog with criteria |
| `/api/admin/products` | POST | `name, description, price, stock, category, imageUrls` | Product creation confirmation | Restricts product creation to administrators |
| `/api/admin/products/{id}/stock` | PATCH | `productId, stock` | Updated product inventory | Updates catalog inventory level for store items |
| `/api/orders/checkout` | POST | `cartId, shippingAddress` | Stripe Payment Intent clientSecret + orderId | Initializes Stripe checkout process with intents |
| `/api/orders/confirm-payment` | POST | `orderId` | Payment confirmation status | Processes payment confirmations post-Stripe webhook |
| `/api/chatbot/message` | POST | `message, sessionId` | AI reply message | Sends user prompt to custom AI agent and outputs reply |
| `/api/clinics/nearby` | GET | `latitude, longitude` | List of nearby veterinary clinics | Queries places API for local veterinary care clinics |
| `/api/notifications` | GET | `userId` | List of active notifications | Retrieves all unread push and system notifications for a user |
| `/api/logout` | POST | `userId` | Logout confirmation | Terminates active user session and invalidates tokens |

---

## 7. UI/UX Design (Prototypes)

### 7.1 Wireframes
*   **Logo Wireframe:**  
    [Here's diagram and available: Logo Wireframe]
*   **Login Wireframes:**  
    [Here's diagram and available: Login Wireframes]
*   **Home Wireframe:**  
    [Here's diagram and available: Home Wireframe]
*   **Listing Wireframe:**  
    [Here's diagram and available: Listing Wireframe]
*   **Shelter Wireframe:**  
    [Here's diagram and available: Shelter Wireframe]
*   **AI Chatbot Wireframe:**  
    [Here's diagram and available: AI Chatbot Wireframe]

### 7.2 Navigation Flow
*   **Generic App Flow:**  
    [Here's diagram and available: Navigation Flow - Generic App Flow]
*   **Flow as Admin:**  
    [Here's diagram and available: Navigation Flow - Flow as Admin]
*   **Flow as User:**  
    [Here's diagram and available: Navigation Flow - Flow as User]

### 7.3 Screens
[Here's diagram and available: Screens Prototypes]

---

## 8. Sprint-wise Design Evolution

| Sprint | Features Designed | Improvements |
| :--- | :--- | :--- |
| **Sprint 1** | SRS alignment, authentication modules, user profile structure | Implemented JWT-based session architecture rather than simple cookies for cross-platform integration. |
| **Sprint 2** | Pet profile CRUD systems, marketplace listing pages, search feed | Added database indexing on search query keys to handle high concurrent search loads. |
| **Sprint 3** | Boarding request flows, shelter dashboards, notification layers | Configured Socket.io real-time triggers to keep booking status states live. |
| **Sprint 4** | E-commerce storefront backend, inventory manager | Isolated transaction logs from the core products table to prevent race conditions during checkout. |
| **Sprint 5** | Stripe payment checkout integration, webhook monitors | Implemented automated payment webhooks to protect orders against client network drops. |
| **Sprint 6** | ER Diagram, Class Diagram, detailed Schema Tables | Adjusted schemas to handle SQL-like relationships for clear structural reporting. |
| **Sprint 7** | OpenAI Chatbot dialog systems, Google Maps locator | Proxying Maps API calls through the backend to keep api keys hidden from client source code. |
| **Sprint 8** | Final design audit and documentation updates | Normalized schemas and completed UCP-spec sprint evolution logs. |

---

## 9. Test Design

| Test ID | Scenario | Expected Result |
| :--- | :--- | :--- |
| **TC-01** | User enters valid login credentials | System logs in user and returns a signed JWT. |
| **TC-02** | User enters incorrect password | System displays "Invalid Credentials" error. |
| **TC-03** | User registers with an existing email | System displays "Email already in use" error. |
| **TC-04** | User leaves required fields empty on signup | System displays validation error for required fields. |
| **TC-05** | Pet owner creates a pet profile | Pet record is successfully created in the database. |
| **TC-06** | Seller lists a pet for sale with a negative price | System blocks submission and displays a pricing error. |
| **TC-07** | Seller lists a pet for adoption with a price > 0 | System blocks submission and enforces free adoption. |
| **TC-08** | Buyer applies filters on marketplace feed | Feed displays listings matching only selected filters. |
| **TC-09** | Pet owner requests boarding shelter | Shelter booking request status is saved as 'pending'. |
| **TC-10** | Provider accepts a boarding request | Request status changes from 'pending' to 'accepted'. |
| **TC-11** | Provider rejects a boarding request | Request status changes from 'pending' to 'rejected'. |
| **TC-12** | Admin uploads a new storefront product | Product is stored and visible on the user storefront. |
| **TC-13** | Admin attempts to set negative inventory levels | System rejects update and displays validation error. |
| **TC-14** | User attempts to add out-of-stock item to cart | System blocks addition and displays "Out of Stock" banner. |
| **TC-15** | User updates product quantity in cart | Cart total adjusts according to new quantity. |
| **TC-16** | Buyer checks out with invalid card details | Stripe rejects payment and returns error code to client. |
| **TC-17** | Stripe checkout transaction completes successfully | Order status changes to 'paid' and product stock decreases. |
| **TC-18** | Daily cron task detects vaccine due in 2 days | Background task triggers email and push notifications. |
| **TC-19** | User queries AI chatbot with pet medical questions | Chatbot returns basic guidance with emergency vet warning. |
| **TC-20** | User searches for nearby veterinary clinics | Map displays markers for veterinary care facilities near GPS coordinates. |
| **TC-21** | User disables location services on device | System displays location permission warning. |
| **TC-22** | User logs out of their active session | Session is terminated and client-side token is cleared. |
| **TC-23** | Multiple orders process for the last unit of stock | First transaction finishes, and subsequent checkouts fail. |
| **TC-24** | Admin reviews monthly sales reports | Dashboard displays transaction history and revenue summaries. |
| **TC-25** | Network connection is lost during Stripe checkout | Webhook updates order status once connection is restored. |

---

## 10. Design Quality Attributes

### 10.1 Scalability
*   PetLink is designed to support future growth and increasing numbers of users through a scalable cloud-based architecture.
*   A **Load Balancer** distributes incoming requests across backend instances, preventing any single server from becoming overloaded.
*   **MongoDB Atlas** provides horizontal scaling capabilities and supports large volumes of user, pet, marketplace, and transaction data.
*   Frequently accessed information such as product listings, pet profiles, and marketplace searches can be cached using **Redis** to reduce database workload and improve response times.
*   A **modular service-based design** allows new services and features to be added without affecting existing modules, supporting thousands of concurrent users.

### 10.2 Security
*   **BCrypt Hashing:** User passwords are encrypted, salted, and hashed before database storage to prevent reverse engineering.
*   **Stateless JWT Authentication:** Secure JSON Web Tokens (JWT) are used for secure authentication and session management.
*   **Role-Based Access Control (RBAC):** Access control restricts administration and provider-specific capabilities to secure accounts.
*   **HTTPS Encryption:** Protects data integrity and confidentiality during transmission.
*   **Stripe Integration:** Processing of online transactions is offloaded entirely to Stripe, ensuring no payment card details are stored in the PetLink database.
*   **Secure API Keys:** Secret API keys are stored within backend environment variables, keeping them hidden from client source codes.

### 10.3 Maintainability
*   **Layered Architecture:** Clear separation of presentation, business logic, and data layers reduces software coupling.
*   **Modular Frontends:** React.js (Web) and React Native (Mobile) utilize component-based designs to minimize redundant code.
*   **RESTful APIs:** Adheres to structured and uniform routing paradigms.
*   **Centralized DB Schemas:** Mongoose schemas provide robust database document validation.
*   **Version Control Standards:** Collaborative development flows using Git branches ensure software stability before production deployments.

---

## 11. Deployment Considerations

*   **Hosting:**
    *   **React Web Admin Portal:** Hosted on Vercel for fast, global delivery.
    *   **Express.js Backend:** Runs on Render containers with auto-scaling capabilities.
    *   **React Native Mobile Applications:** Distributed through the Google Play Store (Android) and Apple App Store (iOS).
*   **Database:** MongoDB Atlas manages database clusters, automates daily database backups, and handles replica scaling.
*   **Version Control:** Hosted on GitHub, employing feature-branch workflows to organize frontend and backend development routes before major releases.

---

## 12. Future Enhancements

*   **Veterinary Appointment Booking System:** Allows direct booking with veterinary clinics, real-time sync with calendar records, and push alerts.
*   **Lost and Found Pet Tracking:** Facilitates lost pet reports, image uploads, area geolocated alerts, and AI-powered image matching.
*   **Pet Community and Social Features:** Fosters pet owner networks with community groups, image sharing, and discussion feeds.
*   **Microservices Migration:** Gradually evolves the layered monolithic engine into individual microservices (e.g., authentication, marketplace, payment, notification, AI bot) to support continuous large-scale scaling.

---

## 13. Revised Project Plan
[Here's diagram and available: Revised Project Plan]

---

## 14. References

1. Sommerville, Ian. *Software Engineering*, 10th Edition. Pearson, 2016.  
2. Pressman, Roger S. & Maxim, Bruce. *Software Engineering: A Practitioner's Approach*, 9th Edition. McGraw-Hill, 2019.  
3. Fowler, Martin. *Patterns of Enterprise Application Architecture*. Addison-Wesley, 2002.  
4. MongoDB Documentation: [https://www.mongodb.com/docs](https://www.mongodb.com/docs)  
5. React Documentation: [https://react.dev](https://react.dev)  
6. React Native Documentation: [https://reactnative.dev](https://reactnative.dev)  
7. Express.js Documentation: [https://expressjs.com](https://expressjs.com)  
8. Stripe API Documentation: [https://stripe.com/docs](https://stripe.com/docs)  
9. Google Maps Platform Documentation: [https://developers.google.com/maps](https://developers.google.com/maps)  
10. JWT Documentation: [https://jwt.io](https://jwt.io)  
11. BCrypt Hashing Documentation: [https://github.com/kelektiv/node.bcrypt.js](https://github.com/kelektiv/node.bcrypt.js)  
12. Firebase Cloud Messaging Documentation: [https://firebase.google.com/docs/cloud-messaging](https://firebase.google.com/docs/cloud-messaging)  

---

## Appendices

### Appendix A: Glossary
| Term | Meaning |
| :--- | :--- |
| **API** | Application Programming Interface |
| **JWT** | JSON Web Token |
| **CRUD** | Create, Read, Update, Delete |
| **ERD** | Entity Relationship Diagram |
| **DFD** | Data Flow Diagram |
| **UML** | Unified Modeling Language |
| **FCM** | Firebase Cloud Messaging |
| **GPS** | Global Positioning System |
| **UI** | User Interface |
| **UX** | User Experience |
| **MongoDB** | NoSQL Document Database |
| **React** | Frontend JavaScript Library |
| **React Native** | Mobile App Framework |
| **Node.js** | JavaScript Runtime Environment |
| **Express.js** | Backend Web Framework |
| **Stripe** | Online Payment Gateway |
| **AI** | Artificial Intelligence |
| **Chatbot** | Automated Conversational Agent |
| **RAG** | Retrieval Augmented Generation |
| **HTTPS** | Secure Hypertext Transfer Protocol |
| **BCrypt** | Password Hashing Algorithm |
| **Webhook** | Event-driven HTTP Callback |
| **JSON** | JavaScript Object Notation |
| **SMTP** | Simple Mail Transfer Protocol |
| **REST API** | Representational State Transfer API |

### Appendix B: Independent Verification & Validation (IV & V) Report

**IV & V Evaluators:**
*   Nabeel Ijaz (Signature: *Signed*)
*   Ehsan Shahid (Signature: *Signed*)

#### Table 1: Non-Trivial Defect Log
| S# | Defect Description | Origin Stage | Status | Fix Time (Hours) | Fix Time (Minutes) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Initial use case model did not include AI Chatbot interaction functionality. | Requirements Analysis | Fixed | 1 | 20 |
| **2** | DFD Level-1 was missing data flow between Marketplace Module and Database. | System Design | Fixed | 1 | 00 |
| **3** | Class Diagram contained duplicate attributes across User and Provider entities. | UML Design | Fixed | 1 | 45 |
| **4** | Test case coverage was incomplete for location-based services and AI chatbot interactions. | Test Design | Fixed | 1 | 00 |
