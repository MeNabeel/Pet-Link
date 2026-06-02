Here is the clean, reconstructed Markdown file for your Software Requirements Specification, with all image links, base64 data, and screenshot placeholders removed as requested:

```markdown
# BSSE FINAL PROJECT
## Software Requirements Specification
### PetLink

**Product Owner:** Zupash Awais
Presented by: **Group ID: S26SE025**

| **Reg# No** | **Member Name** |
| ------ | ------ |
| L1F22BSSE0286 | Nabeel Ijaz |
| L1F22BSSE0297 | Ehsan Shahid |
| L1S23BSSE0100 | Umar Akram |
| L1S23BSSE0089 | Usama |

**Faculty of Information Technology & Computer Science**
**University of Central Punjab**

Version: 1.3
Product Owner: Zupash Awais
Scrum Master: Nabeel Ijaz

**Team**

| Member Name | Roles |
| ------ | ------ |
| Nabeel Ijaz | Backend Development |
| Umar Akram | Web Development |
| Usama | Database Design and Testing |
| Ehsan Shahid | Mobile App Development |

---

### Abstract
**PetLink** is a cross-platform web and mobile application developed to serve as a comprehensive pet management platform. It provides a **centralized digital solution** for pet owners, adopters, buyers, and small service providers in Pakistan, enabling them to manage all pet-related activities through a single, user-friendly system.

In today's fragmented environment, pet owners face significant challenges when they want to sell or adopt a pet, arrange temporary shelter during travel, purchase pet products, or maintain accurate health records. Most activities are currently handled through scattered social media groups, informal WhatsApp listings, or separate unconnected websites. This leads to incomplete information, lack of trust, difficulty in tracking vaccination schedules, unreliable service coordination, and increased risk of missing important pet care deadlines.

The proposed system offers a complete set of functionalities including user and **pet profile management, pet adoption** and **sale listings** with proper validation, **temporary shelter service** requests, an integrated **pet product store** with secure payment gateway, **digital pet health** and **vaccination record management** with **automated reminders**, **Google Maps-based nearby veterinary clinic locator**, and a custom **AI-driven chatbot** for instant user assistance and guidance. 

By addressing these issues, PetLink fulfills a vital public need in the growing pet ownership community of Pakistan. It improves pet welfare through better record-keeping and timely care, enhances trust and transparency in pet trading and services, reduces **fragmentation in the market**, and provides a reliable, accessible platform that brings convenience and organization to thousands of pet lovers and service providers.

---

### 1. Introduction and Background

#### 1.1 Product Vision & Problem Context
**Problem Description:**
Pet owners in Pakistan face numerous challenges in their daily lives while managing pet-related activities. When they want to sell or adopt a pet, they usually rely on scattered Facebook groups, WhatsApp chats, or random online posts where information is incomplete, unverified, and often misleading. Arranging temporary shelter for their pet during travel or work commitments becomes stressful because there is no reliable way to find trusted boarding services quickly. Purchasing pet food, accessories, or medicines requires visiting multiple websites or local stores with no centralized payment option. Moreover, keeping track of vaccination schedules, medical history, and important reminders is usually done manually on paper or phone notes, leading to missed doses and potential health risks for the pet. Overall, the lack of a single trusted platform forces users to switch between many unconnected sources, wasting time, reducing trust, and creating inefficiency in everyday pet care.

**Target Users:**
*   **Pet Owners / Adopters**: Frequent users who need a simple and reliable interface to manage all pet-related activities.
*   **Service Providers (Shelters)**: Users who manage listings and provide shelter services.
*   **Platform Admin (Sellers)**: Manages platform content, resolves disputes, and ensures quality control and manage product listings.

**Objectives of the System:**
*   To design and develop a cross-platform application providing a unified platform for all pet-related activities.
*   To enable users to create and manage detailed pet profiles with adoption and sale listings.
*   To provide a secure temporary shelter/boarding service request system.
*   To implement an integrated pet product store with secure payment gateway.
*   To develop a digital pet health and vaccination record management module with automated reminders.
*   To integrate Google Maps API for location-based discovery of nearby veterinary clinics.
*   To build an AI-driven chatbot for user assistance.
*   To ensure responsive, user-friendly interface across web and mobile devices.

**User Research:**
To validate the real-world problems facing pet owners in Pakistan, our team conducted a quantitative user research survey utilizing Google Forms. The survey gathered detailed feedback from 24 active participants across the pet care community.
*   **Community Pet Ownership Rate:** 70% of respondents currently own pets. Among pet owners, cats are the most common (71.4%), followed by birds and other pets.
*   **Market Fragmentation:** 70% of users rely on scattered platforms including Facebook Groups, WhatsApp Groups, Instagram Pages, and OLX for pet-related activities. Only 10% use dedicated applications.
*   **Medical Record Struggle:** 70% of respondents reported difficulty managing pet vaccination or medical records. Methods of tracking include phone notes, veterinary clinic records, paper records, and WhatsApp messages indicating no standardized solution.
*   **Demand for Automated Reminders:** 80% of respondents stated that automated vaccination reminders would help them manage their pets better.
*   **Trust & Verification Concerns:** Major problems identified when adopting or purchasing pets online include: fake/misleading information (40%), lack of trust (30%), no health records (30%), unverified sellers (10%), and scam concerns (10%).
*   **Shelter Service Challenges:** Among users who have needed boarding services, common difficulties include: hard to find trusted providers (50%), lack of reviews (20%), expensive services (10%), and safety concerns (10%).
*   **Difficulty Finding Vets:** On a scale of 1-5 (1 = easy, 5 = very difficult), responses averaged 2.9, indicating moderate difficulty finding nearby veterinary clinics quickly during emergencies.
*   **Demand for Centralized Platform:** 90% of respondents said they would use or maybe use a single platform combining pet adoption, shopping, health tracking, and shelter services.
*   **AI Chatbot Interest:** 70% of respondents expressed interest in using an AI chatbot for pet-related guidance.
*   **Verified Marketplace Importance:** On a scale of 1-5 (1 = very important, 5 = not important), average response was 2.2, confirming strong demand for verified and trusted pet marketplaces.

**Expected Benefits:**
*   Improved pet welfare through better record-keeping and timely care reminders.
*   Enhanced trust and transparency in pet trading and services.
*   Reduced fragmentation in the local pet management market.
*   Convenient and centralized platform accessible on both web and mobile.

**Potential Beneficiaries:**
*   **Direct beneficiaries:** Pet owners, adopters in Pakistan.
*   **Indirect beneficiaries:** Veterinary clinics, pet food suppliers, animal shelters, and the general pet welfare ecosystem.

#### 1.2 Stakeholders Identification

| **Stakeholder** | **Role** | **Expectations** |
| ------ | ------ | ------ |
| Pet Owner | Primary User | Easy-to-use interface; pet profile management, health tracking, service booking |
| Pet Adopters | Primary User | Verified listings, transparent adoption process |
| Pet Sellers | Primary User | Reach buyers, manage listings easily |
| Shelter Service Providers | Service Provider | Ability to post and manage Shelter Service listings; receive service requests, receive booking requests, manage availability communicate with users. |
| System Administrator | Platform Manager / Store Manager | Add/update/delete pet products, manage inventory, view orders, update order status, monitor activities, manage users |
| Store Manager | Product Manager | Upload product images, set prices, manage categories, handle stock levels |
| Zupash Awais | Product Owner / Supervisor | Project meets FYP requirements; proper documentation; functional system. |
| Scrum Master (Nabeel Ijaz) | Team Lead | Smooth sprint execution, remove impediments |
| Development Team | System Developers | Clear requirements; manageable workload; good tooling and support. |
| Investors/Business Partners | Financial Stakeholders | ROI, platform growth, market penetration |

---

### 2. Agile Framework Setup
The PetLink project will follow the Agile Scrum methodology to manage development. Team roles, sprint durations, and tools are defined below.

**Team Roles:**
*   **Product Owner:** Zupash Awais (Supervisor)
*   **Scrum Master:** Nabeel Ijaz (Group Leader)
*   **Development Team:** Nabeel Ijaz, Ehsan Shahid, Muhammad Umar, Usama

**Sprint duration:**
Each sprint will last 2 weeks. The total project timeline is divided into multiple sprints covering all major feature modules.

**Tools:**
*   **Version Control:** Git / GitHub
*   **Project Management:** Jira (Kanban Board)
*   **Communication:** WhatsApp Group, Weekly Meetings
*   **Documentation:** Google Docs, Microsoft Word
*   **Development:** VS Code, Postman, MongoDB Compass
*   **Design:** Figma
*   **Testing:** Postman, Jest

#### 2.1 Epics For the Project

| **Epic ID** | **Epic Name** | **Description** | **Related Problem Area** |
| ------ | ------ | ------ | ------ |
| EP-01 | User Management | Handles user registration, login, authentication, profile management, and role-based access | Users unable to securely access the system |
| EP-02 | Pet Profile Management | Allows users to create, update, view, and delete pet profiles with images and details | No centralized pet information storage |
| EP-03 | Pet Marketplace (Adoption/Sale) | Manages pet adoption and sale listings with search, filter, and browse capabilities | Fragmented, unverified pet trading |
| EP-04 | Shelter Service Exchange | Handles temporary shelter/boarding service requests and management | No reliable pet boarding service coordination |
| EP-05 | Admin Product Management | Allows Admin to add, update, delete, and manage pet products with inventory, pricing, categories, and images | No centralized store management, manual product updates, inefficient inventory handling |
| EP-06 | User Product StoreFront | Allows users to browse products, add to cart, checkout, and purchase pet products | Disconnected pet product purchasing, no quality assurance |
| EP-07 | Payment Processing | Integrates payment methods and handles transaction processing | Lack of secure and automated payments |
| EP-08 | Order Management | Allows Admin to view customer orders, update order status (pending, shipped, delivered, cancelled), and manage order history | No order tracking, manual order processing |
| EP-09 | Digital Health Vault | Manages pet health records, vaccination schedules, and automated reminders | Missed vaccination schedules and health risks |
| EP-10 | AI Chatbot Assistant | Provides instant user assistance, guidance, and FAQs | No immediate help/support for users |
| EP-11 | Location Services | Integrates Google Maps for nearby veterinary clinic discovery | Difficulty finding vet clinics |
| EP-12 | Notification System | Sends alerts via in-app/push/email for important updates | Users miss important updates and reminders |

#### 2.2 Product Backlog

| **Backlog ID** | **Epic** | **Feature Description** | **Priority** |
| ------ | ------ | ------ | ------ |
| PB-01 | User Management | Implement user registration with email and password | High |
| PB-02 | User Management | Develop secure login and logout functionality | High |
| PB-03 | User Management | Enable password reset and recovery via email | Medium |
| PB-04 | User Management | Create user profile management (view/update personal data) | Medium |
| PB-05 | User Management | Implement role-based access control (Admin/User roles) | Low |
| PB-06 | Pet Profile Management | Create pet profile with name, breed, age, weight, medical conditions | High |
| PB-07 | Pet Profile Management | Enable pet image upload and storage | Medium |
| PB-08 | Pet Profile Management | Allow edit and delete of pet profiles | Medium |
| PB-09 | Pet Marketplace (Adoption/Sale) | Create pet adoption listing with validation | High |
| PB-10 | Pet Marketplace (Adoption/Sale) | Create pet sale listing with price and details | High |
| PB-11 | Pet Marketplace (Adoption/Sale) | Implement search and filter for pet listings | High |
| PB-12 | Pet Marketplace (Adoption/Sale) | Display detailed listing view | Medium |
| PB-13 | Shelter Service Exchange | Create temporary shelter service request | Medium |
| PB-14 | Shelter Service Exchange | Manage shelter service listings by providers | Medium |
| PB-15 | Shelter Service Exchange | Implement request acceptance/rejection flow | Medium |
| PB-16 | Admin Product Management | Admin login with role-based access to admin dashboard | High |
| PB-17 | Admin Product Management | Admin can add new pet products (name, description, price, stock quantity, category, images) | High |
| PB-18 | Admin Product Management | Admin can view all products with search and filter | High |
| PB-19 | Admin Product Management | Admin can update existing product details (price, description, stock, images) | High |
| PB-20 | Admin Product Management | Admin can delete/disable products (soft delete) | Medium |
| PB-21 | Admin Product Management | Admin can manage product categories (add, edit, delete categories like Food, Accessories, Medicines, Toys) | Medium |
| PB-22 | Admin Product Management | Admin can upload multiple product images per product | Medium |
| PB-23 | Admin Product Management | Admin can set and update product inventory/stock levels | High |
| PB-24 | Admin Product Management | Admin can mark products as "Out of Stock" when inventory reaches zero | Medium |
| PB-25 | Order Management | Admin can view all customer orders with details | High |
| PB-26 | Order Management | Admin can update order status (Pending → Processing → Shipped → Delivered → Cancelled) | High |
| PB-27 | Order Management | Admin can view order history and sales reports | Medium |
| PB-28 | Order Management | Admin can track total revenue and product-wise sales | Medium |
| PB-29 | User Product Store | Users can browse pet products with categories | High |
| PB-30 | User Product Store | Users can search products by name, category, price range | High |
| PB-31 | User Product Store | Users can add products to shopping cart | High |
| PB-32 | User Product Store | Users can manage cart (update quantity, remove items) | Medium |
| PB-33 | User Product Store | Users can proceed to checkout with order summary | High |
| PB-34 | User Product Store | Users can view order history and track order status | Medium |
| PB-35 | User Product Store | Users can view product details (images, description, price, stock availability) | Medium |
| PB-36 | User Product Store | Checkout process with order summary | High |
| PB-37 | Payment Processing | Integrate payment gateway | High |
| PB-38 | Payment Processing | Process payments securely | High |
| PB-39 | Payment Processing | Handle payment success/failure scenarios | Medium |
| PB-40 | Digital Health Vault | Add vaccination/health records for pets | High |
| PB-41 | Digital Health Vault | View health records history | Medium |
| PB-42 | Digital Health Vault | Set and send automated reminders for due dates | High |
| PB-43 | AI Chatbot Assistant | Implement AI chatbot interface | High |
| PB-44 | AI Chatbot Assistant | Train chatbot on FAQs and platform guidance | Medium |
| PB-45 | AI Chatbot Assistant | Handle unrecognized queries gracefully | Medium |
| PB-46 | Location Services | Integrate Google Maps API | Medium |
| PB-47 | Location Services | Display nearby veterinary clinics based on location | Medium |
| PB-48 | Notification System | Implement in-app notifications | Medium |
| PB-49 | Notification System | Send email/push notifications for reminders and updates | Low |

#### 2.3 User Stories

| **Story ID** | **Backlog ID** | **User Story** | **Priority** | **Acceptance Criteria** | **Focal Person responsible for this task** |
| ------ | ------ | ------ | ------ | ------ | ------ |
| US-01 | PB-01 | As a user, I want to register an account so that I can access the system | High | User enters valid data → account created successfully | Ehsan Shahid |
| US-02 | PB-02 | As a registered user, I want to log in securely so that I can access my account | High | Valid credentials → login success, Invalid → error message | Ehsan Shahid |
| US-03 | PB-03 | As a user, I want to reset my password so that I can regain access if I forget it | Medium | Email verification → password reset link sent | Nabeel Ijaz |
| US-04 | PB-04 | As a user, I want to update my profile information so that my details stay current | Medium | Save changes → profile updated successfully | Nabeel Ijaz |
| US-05 | PB-06 | As a pet owner, I want to create a profile for my pet so that I can manage all pet-related activities | High | Form submitted → pet profile created and saved | Umer Akram |
| US-06 | PB-09 | As a pet owner, I want to list my pet for adoption so that I can find a new home for them | High | Listing created → appears in marketplace | Ehsan Shahid |
| US-07 | PB-10 | As a pet owner, I want to list my pet for sale so that I can find potential buyers | High | Listing created with price → appears in marketplace | Nabeel Ijaz |
| US-08 | PB-11 | As an adopter, I want to search and filter pet listings so that I can find pets matching my preferences | High | Filters applied → relevant listings displayed | Nabeel Ijaz |
| US-09 | PB-13 | As a pet owner, I want to request temporary shelter so that my pet is cared for during my travel | Medium | Request submitted → notification sent to provider | Ehsan Shahid |
| US-10 | PB-36 | As a buyer, I want to purchase pet products securely so that I can get food and supplies delivered | High | Payment successful → order created and confirmed | Ehsan Shahid |
| US-11 | PB-40 | As a pet owner, I want to add vaccination records so that I can track my pet's health | High | Record added → saved with next due date | Nabeel Ijaz |
| US-12 | PB-42 | As a pet owner, I want to receive reminders for upcoming vaccinations so that I don't miss them | High | Due date reached → notification sent | Ehsan Shahid |
| US-13 | PB-43 | As any user, I want to chat with an AI assistant so that I can get instant help and guidance | High | Question asked → relevant response provided | Nabeel Ijaz |
| US-14 | PB-47 | As a pet owner, I want to find nearby veterinary clinics so that I can take my pet for emergency care | Medium | Location allowed → clinics shown on map | Ehsan Shahid |
| US-15 | PB-48, PB-49 | As a user, I want to receive notifications about my requests so that I stay updated | Medium | Status change → notification received | Ehsan Shahid |
| US-16 | PB-16 | As an Admin, I want to log in to an admin dashboard so that I can manage the pet store | High | Admin credentials → dashboard access; non-admin → access denied | Nabeel Ijaz |
| US-17 | PB-17 | As an Admin, I want to add new pet products so that users can browse and purchase them | High | Form submitted with valid data → product saved and visible to users | Nabeel Ijaz |
| US-18 | PB-18 | As an Admin, I want to view all products so that I can manage inventory | High | Products displayed in table/grid with search and filter | Nabeel Ijaz |
| US-19 | PB-19 | As an Admin, I want to update product details so that I can change prices or descriptions | High | Changes saved → product updated in store | Nabeel Ijaz |
| US-20 | PB-20 | As an Admin, I want to delete/disable products so that I can remove items no longer available | Medium | Product disabled → not visible to users | Nabeel Ijaz |
| US-21 | PB-21 | As an Admin, I want to manage product categories so that products are organized properly | Medium | Category added/edited/deleted → products categorized correctly | Umer Akram |
| US-22 | PB-22 | As an Admin, I want to upload multiple product images so that users can see product details | Medium | Images uploaded → displayed on product page | Umer Akram |
| US-23 | PB-23 | As an Admin, I want to set inventory levels so that I can track stock | High | Stock set → auto "Out of Stock" when zero | Ehsan Shahid |
| US-24 | PB-25 | As an Admin, I want to view all customer orders so that I can process them | High | Orders displayed with customer details and items | Ehsan Shahid |
| US-25 | PB-26 | As an Admin, I want to update order status so that customers know their order progress | High | Status changed → notification sent to customer | Ehsan Shahid |
| US-26 | PB-27 | As an Admin, I want to view sales reports so that I can track revenue | Medium | Reports generated with total sales and product performance | Ehsan Shahid |
| US-27 | PB-29 | As a user, I want to browse pet products so that I can buy food and supplies | High | Products displayed by categories with images and prices | Ehsan Shahid |
| US-28 | PB-30 | As a user, I want to search for products so that I can find specific items | High | Search results relevant to keywords | Ehsan Shahid |
| US-29 | PB-35 | As a user, I want to view product details so that I can make informed purchase decisions | High | Product page shows all details including stock status | Umer Akram |
| US-30 | PB-31 | As a user, I want to add products to cart so that I can buy multiple items | High | Item added → cart updated with quantity | Umer Akram |
| US-31 | PB-32 | As a user, I want to manage my cart so that I can change quantities or remove items | Medium | Cart reflects changes correctly | Ehsan Shahid |
| US-32 | PB-36 | As a user, I want to checkout securely so that I can complete my purchase | High | Checkout → payment processing → order confirmed | Ehsan Shahid |
| US-33 | PB-34 | As a user, I want to view my order history so that I can track my purchases | Medium | Past orders displayed with status | Umer Akram |

#### 2.4 Story Points & Estimation

| **Story ID** | **User Story (Short)** | **Complexity Level** | **Story Points** | **Justification** |
| ------ | ------ | ------ | ------ | ------ |
| US-01 | User Registration | Medium | 3 | Requires form validation, database storage, and error handling |
| US-02 | User Login | Medium | 3 | Authentication logic and session handling required |
| US-03 | Password Reset | Medium | 3 | Email service integration, token generation |
| US-04 | Profile Update | Low | 2 | CRUD operations, form handling |
| US-05 | Pet Profile Creation | Medium | 3 | Image upload, data validation, relationships |
| US-06 | Pet Adoption Listing | Medium | 3 | Validation, marketplace integration |
| US-07 | Pet Sale Listing | Medium | 3 | Price validation, marketplace integration |
| US-08 | Search & Filter | High | 8 | Multiple filter criteria, search algorithm |
| US-09 | Shelter Request | Medium | 3 | Request flow, notification system |
| US-10 | Purchase Products | High | 8 | Cart, payment gateway, order processing |
| US-11 | Add Health Records | Low | 2 | CRUD operations, date tracking |
| US-12 | Vaccination Reminders | Medium | 3 | Scheduling system, notification service |
| US-13 | AI Chatbot | High | 13 | NLP integration, training, conversation handling |
| US-14 | Nearby Clinics | Medium | 3 | Google Maps API integration, location services |
| US-15 | Notifications | Medium | 3 | Real-time/in-app notifications |
| US-16 | Admin Login | Low | 2 | Role-based access |
| US-17 | Add Product | Medium | 3 | Multi-field form, image upload |
| US-18 | View Products | Medium | 3 | Table with search/filter |
| US-19 | Update Product | Medium | 3 | Edit form, save changes |
| US-20 | Delete/Disable Product | Low | 2 | Soft delete logic |
| US-21 | Manage Categories | Low | 2 | CRUD for categories |
| US-22 | Upload Product Images | Medium | 3 | Multiple image handling |
| US-23 | Set Inventory Levels | Low | 2 | Stock tracking |
| US-24 | View Orders | Medium | 3 | Order listing with details |
| US-25 | Update Order Status | Medium | 3 | Status workflow |
| US-26 | Sales Reports | Medium | 3 | Analytics, charts |
| US-27 | Browse Products | Medium | 3 | Storefront UI |
| US-28 | Search Products | Medium | 3 | Search implementation |
| US-29 | Product Details | Low | 2 | Detail page |
| US-30 | Add to Cart | Medium | 3 | Cart state management |
| US-31 | Manage Cart | Medium | 3 | Quantity updates |
| US-32 | Checkout | High | 8 | Multi-step process |
| US-33 | Order History | Low | 2 | History display |

#### 2.5 Sprint Planning & Sprint Backlog

| **Sprint No.** | **Duration** | **Sprint Goal** | **Total Story Points** |
| ------ | ------ | ------ | ------ |
| Sprint 1 | 2 Weeks | Implement user authentication features | 13 |
| Sprint 2 | 2 Weeks | Pet profile and marketplace core | 11 |
| Sprint 3 | 2 Weeks | Shelter service and health records | 14 |
| Sprint 4 | 2 Weeks | Admin Product Management (Store Backend) | 16 |
| Sprint 5 | 2 Weeks | User Store & Order Management | 17 |
| Sprint 6 | 2 Weeks | AI Chatbot and location services | 16 |
| Sprint 7 | 2 Weeks | Admin Order Management & Reporting | 16 |
| Sprint 8 | 2 Weeks | Testing, bug fixes, integration, polish | 14 |

**Total Story Points:** 13 + 11 + 14 + 16 + 17 + 16 + 16 + 14 = 117 points

---

### 3. Functional Requirements

#### 3.1 Use Case Diagram
##### 3.1.1 Use Case Diagram Table

| **Use Case ID** | **Use Case Name** | **Primary Actor** | **Description** | **Mapped User Story ID** | **User Story** |
| ------ | ------ | ------ | ------ | ------ | ------ |
| UC-01 | User Registration | New User | Allows a new user to create an account using email and password | US-01 | As a new user, I want to register an account so that I can access the system. |
| UC-02 | User Login | Registered User | Enables users to log into the system securely | US-02 | As a registered user, I want to log in securely so that I can access my account. |
| UC-03 | Password Recovery | User | Allows users to reset their password via email verification | US-03 | As a user, I want to reset my password so that I can regain access if I forget it. |
| UC-04 | Manage User Profile | Registered User | View and update profile information | US-04 | As a user, I want to update my profile information so that my details stay current |
| UC-05 | Create & Manage Pet Profile | Pet Owner | Create, update, view, delete pet profiles | US-05 | As a pet owner, I want to create a profile for my pet so that I can manage all pet-related activities |
| UC-06 | Manage Pet Listing | Pet Owner | Create adoption/sale listings | US-06, US-07 | As a pet owner, I want to list my pet for adoption so that I can find a new home for them |
| UC-07 | Search & Browse Listings | Adopter/Buyer | Search, filter, view pet listings | US-08 | As an adopter, I want to search and filter pet listings so that I can find pets matching my preferences. |
| UC-08 | Request Shelter Service | Pet Owner | Request temporary shelter/boarding | US-09 | As a pet owner, I want to request temporary shelter so that my pet is cared for during my travel |
| UC-09 | Purchase Pet Product | Buyer | Browse cart, checkout, pay for products | US-10 | As a buyer, I want to purchase pet products securely so that I can get food and supplies delivered |
| UC-10 | Manage Health Records | Pet Owner | Add, view vaccination/health records | US-11 | As a pet owner, I want to add vaccination records so that I can track my pet's health |
| UC-11 | Receive Health Reminders | Pet Owner | Get automated reminders for due dates | US-12 | As a pet owner, I want to receive reminders for upcoming vaccinations so that I don't miss them |
| UC-12 | Interact with AI Chatbot | Any User | Chat with AI assistant for help | US-13 | As any user, I want to chat with an AI assistant so that I can get instant help and guidance |
| UC-13 | Find Nearby Clinics | Pet Owner | Locate veterinary clinics on map | US-14 | As a pet owner, I want to find nearby veterinary clinics so that I can take my pet for emergency care |
| UC-14 | Receive Notifications | User | Get updates on requests and reminders | US-15 | As a user, I want to receive notifications about my requests so that I stay updated |
| UC-15 | Admin Login | Admin | Secure login to admin dashboard | US-16 | As an Admin, I want to log in to an admin dashboard so that I can manage the pet store |
| UC-16 | Add Pet Product | Admin | Add new product with details, price, stock, images | US-17 | As an Admin, I want to add new pet products so that users can browse and purchase them |
| UC-17 | View All Products | Admin | View product list with search/filter | US-18 | As an Admin, I want to view all products so that I can manage inventory |
| UC-18 | Update Product | Admin | Edit product details, price, stock | US-19 | As an Admin, I want to update product details so that I can change prices or descriptions |
| UC-19 | Delete/Disable Product | Admin | Remove or hide products from store | US-20 | As an Admin, I want to delete/disable products so that I can remove items no longer available |
| UC-20 | Manage Categories | Admin | Add, edit, delete product categories | US-21 | As an Admin, I want to manage product categories so that products are organized properly |
| UC-21 | Manage Inventory | Admin | Update stock levels, mark out of stock | US-22, US-23 | As an Admin, I want to set inventory levels so that I can track stock |
| UC-22 | View Customer Orders | Admin | See all orders with details | US-24 | As an Admin, I want to view all customer orders so that I can process them |
| UC-23 | Update Order Status | Admin | Change order status (Pending→ Shipped→ Delivered) | US-25 | As an Admin, I want to update order status so that customers know their order progress |
| UC-24 | View Sales Reports | Admin | Generate revenue and product performance reports | US-26 | As an Admin, I want to view sales reports so that I can track revenue |
| UC-25 | Browse Products | User | View products by category | US-27 | As a user, I want to browse pet products so that I can buy food and supplies |
| UC-26 | Search Products | User | Search by name, category, price | US-28 | As a user, I want to search for products so that I can find specific items |
| UC-27 | View Product Details | User | See product images, description, price, stock | US-29 | As a user, I want to view product details so that I can make informed purchase decisions |
| UC-28 | Add to Cart | User | Add products to shopping cart | US-30 | As a user, I want to add products to cart so that I can buy multiple items |
| UC-29 | Manage Cart | User | Update quantity, remove items | US-31 | As a user, I want to manage my cart so that I can change quantities or remove items |
| UC-30 | Checkout | User | Place order and make payment | US-32, US-10 | As a user, I want to checkout securely so that I can complete my purchase |
| UC-31 | View Order History | User | Track past orders and status | US-33 | As a user, I want to view my order history so that I can track my purchases |

##### 3.1.2 User Registration and Authentication
##### 3.1.3 Manage User Profile
##### 3.1.4 Create and Manage Pet Profile
##### 3.1.5 Manage Pet Listing
##### 3.1.6 Request Temporary Shelter Service
##### 3.1.7 Purchase Pet Product
##### 3.1.8 Manage Pet Health Records
##### 3.1.9 Interact With AI Chatbot
##### 3.1.10 Find Nearby Veterinary Clinics
##### 3.1.11 Admin Store Management Diagram

---

### 4. Non-functional Requirements

#### 4.1 Reliability
| **Reliability ID** | **Description** |
| ------ | ------ |
| NFR-REL-01 | The PetLink platform shall maintain at least 99% operational uptime during normal usage conditions. |
| NFR-REL-02 | The system shall automatically create daily database backups to prevent data loss. |
| NFR-REL-03 | In case of server or application failure, the system shall recover core services within a reasonable recovery time. |
| NFR-REL-04 | The system shall preserve data integrity during concurrent user operations and database updates. |
| NFR-REL-05 | If external APIs (e.g., Google Maps or Payment Gateway) become unavailable, the system shall display appropriate fallback error messages instead of crashing. |
| NFR-REL-06 | The notification system shall retry failed email or push notifications automatically when possible. |

#### 4.2 Performance
| **Performance ID** | **Description** |
| ------ | ------ |
| NFR-PER-01 | The client platforms (React web and React Native mobile apps) must resolve and display initial home viewport configurations within 3 seconds on standard connections. |
| NFR-PER-02 | The Node.js API ecosystem must reply to data queries within a threshold of 500ms for 95% of execution loops (excluding external sandbox transaction handshakes). |
| NFR-PER-03 | The persistence architecture must support 50 operational concurrent connections during localized demonstration testing without structural lag. |
| NFR-PER-04 | The conversational AI assistant engine must parse input data and render initial tokens inside a 2-3 second conversational window. |

#### 4.3 Use-ability
| **Usability ID** | **Description** |
| ------ | ------ |
| NFR-USA-01 | The user interface shall remain consistent across both web and mobile platforms. |
| NFR-USA-02 | Users shall be able to complete core actions such as login, pet listing, and checkout without technical assistance. |
| NFR-USA-03 | The system shall provide meaningful validation and error messages for invalid inputs. |
| NFR-USA-04 | Navigation menus and workflows shall remain intuitive and easy to understand for first-time users. |
| NFR-USA-05 | The platform shall support responsive layouts for different screen sizes and mobile devices. |

#### 4.4 Other Non-functional Requirements
**Security:**
*   All communication must be encrypted using HTTPS (TLS 1.2 or higher).
*   User passwords must be hashed and salted using bcrypt before storage.
*   Authentication managed via stateless JWT with appropriate expiry times.
*   All user inputs validated and sanitized server-side to prevent injection attacks.
*   PetLink backend will never store sensitive credit card details; payment handled by sandbox gateway.

**Maintainability:**
The codebase must be well-structured, commented, and follow consistent naming conventions to facilitate future updates and bug fixes.

**Scalability:**
The database schema and backend architecture must support future scaling including additional servers, features, and increased user load.

**Interoperability:**
The backend API must be platform-agnostic, serving both the React web app and React Native mobile app effectively.

---

### 5. Scrum Activities Plan
This section describes how Scrum activities will be executed throughout the PetLink development lifecycle.

**Daily Scrum:**
The team will conduct short daily stand-up meetings through WhatsApp or in-person sessions lasting approximately 10-15 minutes. During each meeting, every team member will discuss:
*   What tasks were completed yesterday?
*   What tasks will be worked on today?
*   Are there any blockers or issues affecting progress?

**Sprint Review:**
At the end of each 2-week sprint, the team will demonstrate completed features to the Product Owner (supervisor) for review and feedback.

**Sprint Retrospective:**
After each sprint review, the team will conduct a retrospective to discuss what went well, what can be improved, and action items for the next sprint.

#### 5.1 Kanban Board / Task Tracking
Task tracking will be done using Jira with the following task states:

#### 5.2 Acceptance Criteria
Each user story must meet its defined acceptance criteria before being marked as Done. Test scenarios will be aligned directly with user stories and functional requirements. Each feature will be tested for:
*   Correct functionality under normal conditions.
*   Proper error handling and validation messages.
*   Performance and load behavior within defined thresholds.
*   Security validation (e.g., unauthorized access prevention).

#### 5.3 Release Criteria
A sprint release will only be approved if the following conditions are met:
*   All sprint user stories have been implemented and passed acceptance testing.
*   No critical or high-severity bugs remain unresolved.
*   Code reviewed and merged to the main branch on GitHub.
*   Product Owner (supervisor) has reviewed and approved the sprint demo.

#### 5.4 Burndown Chart & Progress Tracking
Progress will be tracked by using a burndown chart maintained in Jira. The expected burn rate is approximately 12-17 story points per sprint. At the end of each sprint, the remaining story points will be compared against the ideal burn line to monitor project health and adjust workload accordingly.

#### 5.5 Backlog Refinement Plan
The product backlog will be reviewed and refined at the beginning of each sprint. The process includes:
*   Reviewing upcoming user stories for clarity and completeness.
*   Re-estimating story points if scope has changed.
*   Adding new items discovered during development or supervisor feedback.
*   Reprioritizing items based on project progress and deadlines.

---

### 6. Risk Analysis

| **Risk ID** | **Risk Description** | **Category** | **Impact** | **Mitigation Strategy** |
| ------ | ------ | ------ | ------ | ------ |
| R-01 | AI Chatbot failing to understand user queries accurately. | Technical | High | Use pre-defined intents and fallback responses; extensive testing of common queries. |
| R-02 | Inconsistent experience between Web (React.js) and Mobile (React Native) apps. | Technical | High | Share business logic via shared API; conduct cross-platform testing in each sprint. |
| R-03 | Payment gateway sandbox environment unavailability or API changes. | Technical | Medium | Use well-documented gateway (Stripe); maintain fallback mock payment flow. |
| R-04 | Time constraints due to managing dual front-ends and complex backend. | Team | High | Strict sprint planning; assign clear ownership; prioritize core features first. |
| R-05 | Google Maps API quota exceeded or unavailable. | External | Low | Monitor API usage; implement caching; vet locator is lower priority feature. |
| R-06 | Security vulnerabilities in user authentication or payment module. | Security | High | Use bcrypt, JWT, HTTPS, input sanitization; conduct security testing each sprint. |

---

### 7. References
Sommerville, I. (2016). Software Engineering (10th ed.). Pearson Education.
Pressman, R. S., & Maxim, B. R. (2020). Software Engineering: A Practitioner's Approach (9th ed.). McGraw-Hill Education.
React.js Documentation. (2025). React - A JavaScript library for building user interfaces. Retrieved from https://react.dev
React Native Documentation. (2025). React Native - Learn once, write anywhere. Retrieved from https://reactnative.dev
Node.js Foundation. (2025). Node.js Documentation. Retrieved from https://nodejs.org/en/docs
MongoDB Inc. (2025). MongoDB Documentation. Retrieved from https://www.mongodb.com/docs
Google Maps Platform. (2025). Google Maps API Documentation. Retrieved from https://developers.google.com/maps/documentation
Stripe. (2025). Stripe API Reference - Testing. Retrieved from https://stripe.com/docs/testing
Express.js. (2025). Express.js Documentation. Retrieved from https://expressjs.com
Mongoose. (2025). Mongoose ODM Documentation. Retrieved from https://mongoosejs.com/docs/
Khan, S., & Ahmed, R. (2022). Adoption of Digital Platforms in Pakistan. Journal of Information Systems, 14(2), 45-52.
JWT.io. (2025). JSON Web Tokens Documentation. Retrieved from https://jwt.io
OWASP Foundation. (2024). OWASP Top Ten - The Ten Most Critical Web Application Security Risks. Retrieved from https://owasp.org/www-project-top-ten/
Nielsen, J. (1993). Usability Engineering. Morgan Kaufmann.
Pet Industry Market Research. (2024). Pakistan Pet Care Market Report. (Local market insights)

---

### Appendix A: Glossary
**AI Chatbot:** Conversational AI agent for user assistance.
**Backend:** Server-side logic, APIs, and database (Node.js + Express.js).
**Cross-Platform:** Works consistently on web and mobile.
**Frontend:** Client-side UI (React.js for web, React Native for mobile).
**JWT:** JSON Web Token for secure authentication.
**MERN Stack:** MongoDB, Express.js, React, Node.js.
**MongoDB:** NoSQL document database.
**Mongoose:** ODM for MongoDB (schema & validation).
**NLP:** Natural Language Processing for chatbot understanding.
**Pet Profile:** Digital record of pet details (name, breed, health, etc.).
**Product Owner:** Defines requirements & priorities.
**React.js:** Web UI library.
**React Native:** Mobile app framework (iOS/Android).
**Scrum Master:** Facilitates Scrum processes.
**Sprint:** Time-boxed iteration.
**SRS:** Software Requirements Specification (this document).
**Stripe:** Payment gateway for online transactions.
**UC (Use Case):** User interaction description for a goal.
**UI/UX:** User Interface / User Experience design.
**User Story:** "As a [user], I want [feature] so that [benefit]".
**Vaccination Record:** Digital health record with reminders.

---

### Appendix B: IV & V Report
**(Independent verification & validation)**

**IV & V Resource**
Name Signature
Nabeel Ijaz
Ehsan Shahid

| **S#** | **Defect Description** | **Origin Stage** | **Status** | **Fix Time (Hours)** | **Fix Time (Minutes)** |
| --- | --- | --- | --- | --- | --- |
| 1 | Missing User Research data (Survey/Interview results) in section 1.1 | SRS Drafting | Fixed | 2 | 30 |
| 2 | Inconsistent numbering of Use Cases in old document | SRS Drafting | Fixed | 2 | 15 |
| 3 | Some User Stories lacked proper Acceptance Criteria | SRS Drafting | Fixed | 3 | 50 |
| 4 | Non-functional requirements were not mapped properly to the new template sections | Template Migration | Fixed | 1 | 45 |
| 5 | Missing Story Points estimation for several user stories | Agile Section | Fixed | 2 | 30 |

**Table 3: List of non-trivial defects**
```