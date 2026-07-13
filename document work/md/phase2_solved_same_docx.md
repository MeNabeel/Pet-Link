Here is the complete Phase 2 document in Markdown format, with image placeholders included as requested.

```markdown
# BSSE FINAL PROJECT
## Agile Software Design Specification
### PetLink

**Product Owner:** Zupash Awais
**Presented by:** Group ID: S26SE025

| Reg# No | Member Name |
| :--- | :--- |
| L1F22BSSE0286 | Nabeel Ijaz |
| L1F22BSSE0297 | Ehsan Shahid |
| L1S23BSSE0100 | Umar Akram |
| L1S23BSSE0089 | Usama |

**Faculty of Information Technology & Computer Science**
**University of Central Punjab**
Agile Software Design Specification SDS Phase II
**Version 1.0**
Product Owner: **Zupash Awais**
Scrum Master: **Nabeel Ijaz** (S26SE025)

**Team Roles:**
* Nabeel Ijaz: Backend Development
* Umar Akram: Web Development
* Usama: Database Design and Testing
* Ehsan Shahid: Mobile App Development

---

## Table of Contents
1. System Architecture
2. Mapping Design to User Stories
3. Detailed System Design
4. UML Diagrams
5. Database Design (ERD)
6. API Design
7. UI/UX Design (Prototypes)
8. Sprint-wise Design Evolution
9. Test Design
10. Design Quality Attributes
11. Deployment Considerations
12. Future Enhancements
13. Revised Project Plan
14. References
* Appendix A: Glossary
* Appendix B: IV & V Report

---

## Revision History & Sprint Log
| Version | Sprint | Date | Changes | Owner |
| :--- | :--- | :--- | :--- | :--- |
| | | | | |

## Previous Phases Feedback
*[Picture Available: Idea Defence Feedback Screenshot]*

## Abstract
PetLink is a cross-platform web and mobile application developed to serve as a comprehensive pet management platform. It provides a centralized digital solution for pet owners, adopters, buyers, and small service providers in Pakistan, enabling them to manage all pet-related activities through a single, user-friendly system. 

In today’s fragmented environment, pet owners face significant challenges when they want to sell or adopt a pet, arrange temporary shelter during travel, purchase pet products, or maintain accurate health records. Most activities are currently handled through scattered social media groups, informal WhatsApp listings, or separate unconnected websites. This leads to incomplete information, lack of trust, difficulty in tracking vaccination schedules, unreliable service coordination, and increased risk of missing important pet care deadlines.

The proposed system offers a complete set of functionalities including user and pet profile management, pet adoption and sale listings with proper validation, temporary shelter service requests, an integrated pet product store with secure payment gateway, digital pet health and vaccination record management with automated reminders, Google Maps-based nearby veterinary clinic locator, and a custom AI-driven chatbot for instant user assistance and guidance. By addressing these issues, PetLink fulfills a vital public need in the growing pet ownership community of Pakistan. It improves pet welfare through better record-keeping and timely care, enhances trust and transparency in pet trading and services, reduces fragmentation in the market, and provides a reliable, accessible platform that brings convenience and organization to thousands of pet lovers and service providers.

---

## 1. System Architecture

### 1.1 High-Level Architecture
PetLink follows a Layered Client-Server Architecture enhanced with scalable cloud components. The system separates presentation, business logic, data management, and external integrations into distinct layers to improve maintainability, scalability, and security. 

The architecture consists of:
**Presentation Layer:** React.js Web Application, React Native Mobile Application.
**Application Layer:** API Gateway, Authentication Services, Business Logic Services, Notification Services.
**Data Layer:** MongoDB Atlas Database, Redis Cache.
**External Service Layer:** Stripe Payment Gateway, Google Maps API, AI Chatbot Service, Firebase Cloud Messaging (FCM).

To support future growth and increased user traffic, a Load Balancer distributes incoming requests across backend instances while Redis caching reduces database load and improves response time. This architecture provides high availability, better performance, easier maintenance, and support for thousands of concurrent users.

### 1.2 Architecture Diagram
*[Picture Available: Architecture Diagram]*

### 1.3 Component Overview
| Component | Description |
| :--- | :--- |
| React Web Application | Provides browser-based access to PetLink functionalities. |
| React Native Mobile Application | Provides mobile access for Android and iOS users. |
| Load Balancer | Distributes incoming requests among backend services to improve performance and availability. |
| API Gateway | Central entry point that routes requests to appropriate backend services. |
| Authentication Service | Handles registration, login, JWT generation, and access control. |
| Pet Management Service | Manages pet profiles and ownership records. |
| Marketplace Service | Handles pet adoption and sale listings. |
| Shelter Booking Service | Processes temporary shelter requests and provider responses. |
| E-Commerce Service | Manages products, carts, orders, and inventory. |
| Payment Service | Integrates with Stripe to process secure online payments. |
| Health Record Service | Stores vaccination records and manages reminder schedules. |
| Notification Service | Sends push notifications, emails, and real-time alerts. |
| AI Chatbot Service | Provides automated assistance and pet-related guidance. |
| Location Service | Retrieves nearby veterinary clinics using Google Maps APIs. |
| MongoDB Atlas | Stores user, pet, order, listing, and health record data. |
| Redis Cache | Improves performance by caching frequently accessed data. |
| Stripe API | Processes online payment transactions securely. |
| Google Maps API | Provides location and mapping services. |
| Firebase Cloud Messaging | Delivers push notifications to mobile devices. |
| OpenAI / RAG Engine | Generates intelligent chatbot responses. |

---

## 2. Mapping Design to User Stories
| Story ID | Component | Description |
| :--- | :--- | :--- |
| US-01 / US-02 | Authentication Module | Verifies inputs, salts and hashes user passwords via bcrypt, and generates stateless JWT tokens for future requests. |
| US-05 | Pet Profile Module | Creates relational mappings inside the MongoDB document cluster tying unique Pet entries to their respective Owner's User ID. |
| US-06 / US-07 | Marketplace Module | Registers public data documents within the marketplace data collection with structural attributes indicating adoption or sales pricing. |
| US-08 | Marketplace Search | Compiles runtime search strings into active multi-field mongo search queries, filtering parameters like species, age, and breed without structural lag. |
| US-09 | Shelter Request Module | Logs specific time intervals and notes between a pet owner and an available shelter provider entry. |
| US-10 / US-32 | Payment & Order Engine | Interfaces with Stripe sandbox endpoints to execute electronic transactions, outputting immutable order records on success. |
| US-11 / US-12 | Digital Health Vault | Adds sub-document medical logs to specific pet profiles and flags upcoming chronological tasks for automated system reminders. |
| US-13 | AI Chatbot Adapter | Accepts query strings from the client app, forwards them to the AI engine with a structured prompt, and renders the reply. |
| US-14 | Location Engine | Pulls latitude/longitude from client device sensors and maps surrounding veterinary clinic landmarks via Google Maps. |
| US-15 | Notification Module | Distributes alerts (e.g., booking status updates, checkout success) in real time. |
| US-17 to US-26 | Admin Management UI | Locks product ingestion forms behind explicit admin security routes, managing live store inventories and sales logs. |

---

## 3. Detailed System Design

### 3.1 Module Decomposition

**Authentication & User Management Module**
*Purpose:* Enforces platform onboarding rules, evaluates credentials, secures user passwords, and handles session validation using stateless headers across both web and mobile client applications.
* RegistrationManager: Validates incoming registration fields (e.g., name, email, password, role) and creates a new user document collection entry.
* LoginGatekeeper: Handles secure user and administrator authentication requests, issuing a stateless payload on verified credentials.
* BCryptHasher: Provides secure cryptographic operations, salting and hashing plaintext passwords before database storage to prevent reverse-engineering.
* JWTTokenSigner: Generates and cryptographically signs stateless JSON Web Tokens with a dedicated expiration window to authorize future API requests.

**Pet Profile Module**
*Purpose:* Handles CRUD operations for pet statistics and health profiles.
* Profile Creator: Saves new pet records including name, species, breed, age, weight, and image links.
* Profile Editor: Updates profile values when weight, age, or medical details change.
* Profile Remover: Removes pet profiles from the active view.

**Marketplace Module**
*Purpose:* Coordinates pet adoption and sale listings.
* Listing Creator: Validates prices, matches listings to pet profiles, and creates marketplace records.
* Feed Viewer: Fetches listings and sorts them by date and type.
* Search Filter: Performs query operations based on breed, species, location, and price.
* Listing Status Manager: Marks listings as sold, adopted, or inactive.

**Shelter Booking Modules**
*Purpose:* Coordinates boarding bookings between owners and providers.
* Booking Creator: Creates booking requests with start/end dates, pet profiles, and notes.
* Provider Panel: Shows pending, active, and completed booking requests to providers.
* Status Manager: Lets providers accept or reject bookings, which updates database state.

**E-Commerce Modules**
*Purpose:* Handles Store Operations, Cart Updates and Inventory tracking.
* Storefront Catalog: Shows product categories, names, prices, and images.
* Cart Manager: Handles additions, removals, and quantity changes in the cart.
* Inventory Manager: Tracks product stock levels and updates availability flags.

**Payment Processing Module**
*Purpose:* Manages checkout transactions and stripe integrations.
* Price Calculator: Computes the total cost (items + delivery) server-side.
* Stripe Intent Handler: Requests payment intents from Stripe and returns client secrets to the client.
* Webhook Monitor: Listens for Stripe payment success notifications to update order records.

**Health Vault and Scheduler**
*Purpose:* Manages pet health histories and schedules vaccination reminders.
* Record logger: Logs vaccine names, dates, and calculated next due dates.
* Daily cron worker: Checks database records daily to find upcoming vaccine due dates.
* Reminder triggers: Sends push notifications and email alerts when vaccine due dates approach.

**AI Chatbot Module**
*Purpose:* Provides natural language response support.
* Chat Interface: Renders conversation messages in a chat interface.
* Session Handler: Restores recent messages to maintain context.

**Location Module**
*Purpose:* Locates nearby veterinary clinics.
* GPS Coordinate Tracker: Retrieves current device coordinates.
* API Proxy: Safe backend proxy that queries Google Places API using secret keys.
* Map Pin Renderer: Plots nearby veterinary clinics on the map view.

**Notification Module**
*Purpose:* Manages push, web socket, and email alerts.
* FCM Integrator: Sends push notifications to mobile devices.
* Mail Sender: Sends HTML-formatted emails via SMTP.
* Web Socket Service: Sends real-time alerts to active frontend sessions.

**Data Processing Modules**
*Purpose:* Handles database read and write tasks.
* Schema Validator: Validates model data formats using Mongoose templates.
* DB Connector: Maintains connection pools to the cloud database.

**API Layer**
*Purpose:* Manages integrations with external services.
* Third-Party Handshakes: Coordinates API requests to Stripe, Google Maps, and Open LLM for Rag.

### 3.2 Data Flow Description
*[Picture Available: Data Flow Diagram Level 0]*
*[Picture Available: Data Flow Diagram Level 1]*

---

## 4. UML Diagrams
**Use Case Diagram:**
* User Registration and Authentication
* Manage User Profile
* Create and Manage Pet Profile
* Manage Pet Listing
* Request Temporary Shelter
* Purchase Pet Product
* Manage Pet Health Records
* Interact With AI Chatbot
* Find Nearby Veterinary Clinics
* Admin Store Management
*[Picture Available: Use Case Diagram]*

**Class Diagram:**
*[Picture Available: Class Diagram]*

**Sequence Diagrams:**
* AI Chatbot Interaction
* Vaccination Reminder
* Admin Product Management
* Find Nearby Clinics
*[Picture Available: Sequence Diagrams]*

---

## 5. Database Design (ERD)
### 5.1 ER Diagram
*[Picture Available: ER Diagram]*

### 5.2 Schema Tables
*[Picture Available: Schema Tables]*

---

## 6. API Design
| Endpoint | Method | Input | Output |
| :--- | :--- | :--- | :--- |
| /api/auth/register | POST | {name, email, password, role} | User registration confirmation |
| /api/auth/login | POST | {email, password} | Authentication token + user details |
| /api/auth/profile | PUT | userId, name, phone, address | Updated user profile |
| /api/pets | POST | ownerId, name, species, breed, ageMonths, weightKg, imageUrl | Pet profile creation confirmation |
| /api/pets | GET | ownerId | List of owned pet profiles |
| /api/listings | POST | petId, sellerId, type, price, description | Marketplace listing creation confirmation |
| /api/listings | GET | type, category, search, location | List of matching active listings |
| /api/listings/{id}/status | PUT | listingId, status | Updated listing details |
| /api/shelters/bookings | POST | petOwnerId, providerId, petId, startDate, endDate | Booking request confirmation |
| /api/shelters/bookings/pending | GET | providerId | Pending boarding requests |
| /api/shelters/bookings/{id}/status | PATCH | bookingId, status | Updated booking status |
| /api/products | GET | category, search | List of matching shop products |
| /api/admin/products | POST | name, description, price, stock, category, imageUrls | Product creation confirmation |
| /api/admin/products/{id}/stock | PATCH | productId, stock | Updated product inventory |
| /api/orders/checkout | POST | cartId, shippingAddress | Stripe Payment Intent clientSecret + orderId |
| /api/orders/confirm-payment | POST | orderId | Payment confirmation status |
| /api/chatbot/message | POST | message, sessionId | AI reply message |
| /api/clinics/nearby | GET | latitude, longitude | List of nearby veterinary clinics |
| /api/notifications | GET | userId | List of active notifications |
| /api/logout | POST | userId | Logout confirmation |

---

## 7. UI/UX Design (Prototypes)
* **Wireframes:** Low-fidelity sketches (black and white boxes).
* **Navigation Flow:** A flowchart showing how a user gets from Screen A to Screen B.
* **Screens:** High-fidelity mockups (what the final app actually looks like).

*[Picture Available: UI/UX Wireframes, Navigation Flow, and Screens]*

---

## 8. Sprint-wise Design Evolution
| Sprint | Features Designed | Improvements |
| :--- | :--- | :--- |
| Sprint 1 | SRS alignment, authentication modules, user profile structure | Implemented JWT-based session architecture rather than simple cookies for cross-platform integration |
| Sprint 2 | Pet profile CRUD systems, marketplace listing pages, search feed | Added database indexing on search query keys to handle high concurrent search loads. |
| Sprint 3 | Boarding request flows, shelter dashboards, notification layers | Configured Socket.io real-time triggers to keep booking status states live. |
| Sprint 4 | E-commerce storefront backend, inventory manager | Isolated transaction logs from the core products table to prevent race conditions during checkout. |
| Sprint 5 | Stripe payment checkout integration, webhook monitors | Implemented automated payment webhooks to protect orders against client network drops. |
| Sprint 6 | ER Diagram, Class Diagram, detailed Schema Tables | Adjusted schemas to handle SQL-like relationships for clear structural reporting. |
| Sprint 7 | OpenAI Chatbot dialog systems, Google Maps locator | Proxying Maps API calls through the backend to keep api keys hidden from client source code. |
| Sprint 8 | Final design audit and documentation updates | Normalized schemas and completed UCP-spec sprint evolution logs. |

---

## 9. Test Design
| Test ID | Scenario | Expected Result |
| :--- | :--- | :--- |
| TC-01 | User enters valid login credentials | System logs in user and returns a signed JWT. |
| TC-02 | User enters incorrect password | System displays "Invalid Credentials" error. |
| TC-03 | User registers with an existing email | System displays "Email already in use" error. |
| TC-04 | User leaves required fields empty on signup | System displays validation error for required fields. |
| TC-05 | Pet owner creates a pet profile | Pet record is successfully created in the database. |
| TC-06 | Seller lists a pet for sale with a negative price | System blocks submission and displays a pricing error. |
| TC-07 | Seller lists a pet for adoption with a price > 0 | System blocks submission and enforces free adoption. |
| TC-08 | Buyer applies filters on marketplace feed | Feed displays listings matching only selected filters. |
| TC-09 | Pet owner requests boarding shelter | Shelter booking request status is saved as 'pending'. |
| TC-10 | Provider accepts a boarding request | Request status changes from 'pending' to 'accepted'. |
| TC-11 | Provider rejects a boarding request | Request status changes from 'pending' to 'rejected'. |
| TC-12 | Admin uploads a new storefront product | Product is stored and visible on the user storefront. |
| TC-13 | Admin attempts to set negative inventory levels | System rejects update and displays validation error. |
| TC-14 | User attempts to add out-of-stock item to cart | System blocks addition and displays "Out of Stock" banner. |
| TC-15 | User updates product quantity in cart | Cart total adjusts according to new quantity. |
| TC-16 | Buyer checks out with invalid card details | Stripe rejects payment and returns error code to client. |
| TC-17 | Stripe checkout transaction completes successfully | Order status changes to 'paid' and product stock decreases. |
| TC-18 | Daily cron task detects vaccine due in 2 days | Background task triggers email and push notifications. |
| TC-19 | User queries AI chatbot with pet medical questions | Chatbot returns basic guidance with emergency vet warning. |
| TC-20 | User searches for nearby veterinary clinics | Map displays markers for veterinary care facilities near GPS coordinates. |
| TC-21 | User disables location services on device | System displays location permission warning. |
| TC-22 | User logs out of their active session | Session is terminated and client-side token is cleared. |
| TC-23 | Multiple orders process for the last unit of stock | First transaction finishes, and subsequent checkouts fail. |
| TC-24 | Admin reviews monthly sales reports | Dashboard displays transaction history and revenue summaries. |
| TC-25 | Network connection is lost during Stripe checkout | Webhook updates order status once connection is restored. |

---

## 10. Design Quality Attributes
**Scalability:**
PetLink is designed to support future growth and increasing numbers of users through a scalable cloud-based architecture. A Load Balancer distributes incoming requests across backend instances, preventing any single server from becoming overloaded. MongoDB Atlas provides horizontal scaling capabilities and supports large volumes of user, pet, marketplace, and transaction data. Frequently accessed information such as product listings, pet profiles, and marketplace searches can be cached using Redis to reduce database workload and improve response times. Additionally, the system follows a modular service-based design, allowing new services and features to be added without affecting existing modules. This architecture enables the platform to efficiently support thousands of concurrent users while maintaining acceptable performance.

**Security:**
Security is a critical requirement of PetLink because the system manages user accounts, pet records, marketplace transactions, and payment processing.
The following security mechanisms are implemented:
* User passwords are hashed and salted using BCrypt before storage.
* JSON Web Tokens (JWT) are used for secure user authentication and session management.
* Role-Based Access Control (RBAC) restricts access to administrative and provider-specific functionalities.
* HTTPS encryption protects data transmitted between clients and servers.
* Stripe handles payment processing, ensuring sensitive payment information is never stored within the PetLink database.
* Input validation and sanitization mechanisms prevent common attacks such as SQL Injection, NoSQL Injection, and Cross-Site Scripting (XSS).
* API keys for third-party services are securely stored using environment variables and are never exposed to client applications.
These security measures ensure confidentiality, integrity, and protection of user data.

**Maintainability:**
PetLink follows a layered architecture that separates the presentation, business logic, and data access layers. This separation reduces code complexity and improves maintainability.
The system uses:
* Modular component-based frontend development using React.js and React Native.
* Service-oriented backend modules developed using Node.js and Express.js.
* Consistent RESTful API design standards.
* Centralized database schemas and validation mechanisms using Mongoose.
* GitHub version control with feature-branch development workflows.
* Comprehensive documentation including UML diagrams, ER diagrams, API documentation, and test cases.
These practices make the system easier to understand, modify, test, and extend by future developers.

---

## 11. Deployment Considerations
**Hosting:**
The React.js admin portal is hosted on Vercel. The Express.js backend runs on Render containers. The React Native mobile apps are distributed via Google Play Store and Apple App Store.

**Database:**
MongoDB Atlas manages database clusters, automates daily database backups, and handles replica scaling.

**Version Control:**
The project uses GitHub for version control and team collaboration. A branching strategy is followed where separate branches are created for frontend, backend, and feature development before merging into the main branch after testing and review.

---

## 12. Future Enhancements
<What features did you want to include but didn't have time for? (e.g., "Add AI-based recommendations in Version 2.0").>

---

## 13. Revised Project Plan
<Show your progress and provide current status of the project in accordance with the plan provided in project proposal. Gantt chart should be used in this regard. Use Microsoft Office to develop the Gantt chart. Also provide an updated project plan.>

*[Picture Available: Gantt Chart / Updated Project Plan]*

---

## 14. References
* Ian Sommerville, Software Engineering, 10th Edition, Pearson, 2016.
* Roger S. Pressman & Bruce Maxim, Software Engineering: A Practitioner's Approach, 9th Edition, McGraw-Hill, 2019.
* Martin Fowler, Patterns of Enterprise Application Architecture, Addison-Wesley, 2002.
* MongoDB Documentation. https://www.mongodb.com/docs
* React Documentation. https://react.dev
* React Native Documentation. https://reactnative.dev
* Express.js Documentation. https://expressjs.com
* Stripe API Documentation. https://stripe.com/docs
* Google Maps Platform Documentation. https://developers.google.com/maps
* JWT Documentation. https://jwt.io
* BCrypt Documentation. https://github.com/kelektiv/node.bcrypt.js
* Firebase Cloud Messaging Documentation. https://firebase.google.com/docs/cloud-messaging

---

## Appendix A: Glossary
| Term | Meaning |
| :--- | :--- |
| API | Application Programming Interface |
| JWT | JSON Web Token |
| CRUD | Create, Read, Update, Delete |
| ERD | Entity Relationship Diagram |
| DFD | Data Flow Diagram |
| UML | Unified Modeling Language |
| FCM | Firebase Cloud Messaging |
| GPS | Global Positioning System |
| UI | User Interface |
| UX | User Experience |
| MongoDB | NoSQL Document Database |
| React | Frontend JavaScript Library |
| React Native | Mobile App Framework |
| Node.js | JavaScript Runtime Environment |
| Express.js | Backend Web Framework |
| Stripe | Online Payment Gateway |
| AI | Artificial Intelligence |
| Chatbot | Automated Conversational Agent |
| RAG | Retrieval Augmented Generation |
| HTTPS | Secure Hypertext Transfer Protocol |
| BCrypt | Password Hashing Algorithm |
| Webhook | Event-driven HTTP Callback |
| JSON | JavaScript Object Notation |
| SMTP | Simple Mail Transfer Protocol |
| REST API | Representational State Transfer API |

---

## Appendix B: IV & V Report
**(Independent verification & validation)**
**IV & V Resource**
Name | Signature

| S# | Defect Description | Origin Stage | Status | Fix Time (Hours) | Fix Time (Minutes) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| … | | | | | |

**Table 1: List of non-trivial defects**
```