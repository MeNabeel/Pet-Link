Here is the clean Markdown version of the "Updated FYP Phase 2 Document Template" with all image/screenshot instructions and visual diagram placeholders removed for a pure text-based output:

```markdown
# BSSE FINAL PROJECT
## Agile Software Design Specification
### PetLink

**Product Owner:** Zupash Awais
**Presented by:** Group ID: S26SE025

**Student Reg#:** [To be added] **Student Name:** [To be added]
**Faculty of Information Technology & Computer Science**
**University of Central Punjab**

---

**Agile Software Design Specification**
**SDS Phase II**
**Version 1.0**

**Product Owner:** Zupash Awais
**Scrum Master:** Nabeel Ijaz (S26SE025)

**Team**

| Member Name | Roles |
| ------ | ------ |
| Nabeel Ijaz | Backend Development |
| Umar Akram | Web Development |
| Usama | Database Design and Testing |
| Ehsan Shahid | Mobile App Development |

---

## Table of Contents
*Note: Page numbers omitted for markdown format.*

## Revision History & Sprint Log

| **Version** | **Sprint** | **Date** | **Changes** | **Owner** |
| ------ | ------ | ------ | ------ | ------ |
| | | | | |
| | | | | |
| | | | | |

## Previous Phases Feedback
**Idea Defence Feedback**
*(Feedback details to be populated)*

## Abstract
PetLink is a cross-platform web and mobile application developed to serve as a comprehensive pet management platform. It provides a centralized digital solution for pet owners, adopters, buyers, and small service providers in Pakistan, enabling them to manage all pet-related activities through a single, user-friendly system.

In today’s fragmented environment, pet owners face significant challenges when they want to sell or adopt a pet, arrange temporary shelter during travel, purchase pet products, or maintain accurate health records. Most activities are currently handled through scattered social media groups, informal WhatsApp listings, or separate unconnected websites. This leads to incomplete information, lack of trust, difficulty in tracking vaccination schedules, unreliable service coordination, and increased risk of missing important pet care deadlines.

The proposed system offers a complete set of functionalities including user and pet profile management, pet adoption and sale listings with proper validation, temporary shelter service requests, an integrated pet product store with secure payment gateway, digital pet health and vaccination record management with automated reminders, Google Maps-based nearby veterinary clinic locator, and a custom AI-driven chatbot for instant user assistance and guidance.

By addressing these issues, PetLink fulfills a vital public need in the growing pet ownership community of Pakistan. It improves pet welfare through better record-keeping and timely care, enhances trust and transparency in pet trading and services, reduces fragmentation in the market, and provides a reliable, accessible platform that brings convenience and organization to thousands of pet lovers and service providers.

---

## 1. System Architecture

### 1.1 High-Level Architecture
*Identify the "style" of your system. Is it Client-Server (like a basic website), Microservices (independent small services), or Layered (Presentation, Logic, Data)? Briefly justify why you chose it.*

### 1.2 Architecture Diagram
*(Diagram structure goes here - Visuals removed)*

### 1.3 Component Overview
*List each component from your system and give it a one-sentence job description.*

---

## 2. Mapping Design to User Stories

| **Story ID** | **Component** | **Description** |
| ------ | ------ | ------ |
| | | |

---

## 3. Detailed System Design

### 3.1 Module Decomposition
*Break the big components into smaller sub-modules. Explain what the Authentication, Data Processing, and API Layers specifically do.*

**Examples:**
*   Authentication Module
*   Data Processing Module
*   API Layer

### 3.2 Data Flow Description
*Describe how data moves through the system. For example: "User enters credentials -> Auth Module checks DB -> Token is returned to UI."*

---

## 4. UML Diagrams
*   **Use Case Diagram:** Shows how different users (Actors) interact with the system functions. *(optional)*
*   **Class Diagram:** The "skeleton" of your code. Show the objects, their attributes, methods, and how they relate (Inheritance, Association). *(Mandatory)*
*   **Sequence Diagram:** Shows the step-by-step logic over time. For one specific action (like "Purchase Item"), show the messages sent between the User, Controller, and Database. *(Mandatory)*

---

## 5. Database Design (ERD)

### 5.1 ER Diagram
*(Entity-Relationship structure goes here - Visuals removed)*

### 5.2 Schema Tables
*A technical table defining each field's data type/attributes (e.g., user_id : INT, Primary Key).*

---

## 6. API Design

***Goal:*** *Document the "contracts" between your frontend and backend.*
***What to write:*** *List the Endpoint (e.g., /api/login), the Method (GET, POST, etc.), what the user sends (Input), and what the server returns (Output).*

| **Endpoint** | **Method** | **Input** | **Output** |
| ------ | ------ | ------ | ------ |
| | | | |
| | | | |

---

## 7. UI/UX Design (Prototypes)

*   ***Wireframes:*** *Low-fidelity sketches (black and white boxes).*
*   ***Navigation Flow:*** *A flowchart showing how a user gets from Screen A to Screen B.*
*   ***Screens:*** *High-fidelity mockups (what the final app actually looks like).*

---

## 8. Sprint-wise Design Evolution

*Describe how the design changed as you worked. "In Sprint 1, we designed the Login; in Sprint 2, we realized we needed an extra table for Social Media Auth, so we added it."*

| **Sprint** | **Features Designed** | **Improvements** |
| ------ | ------ | ------ |
| | | |
| | | |
| | | |

---

## 9. Test Design

***Goal:*** *Plan how you will prove the system works.*
***What to write:*** *Create specific scenarios.*
***Scenario:*** *"User enters wrong password."*
***Expected Result:*** *"System displays 'Invalid Credentials' error."*

| **Test ID** | **Scenario** | **Expected Result** |
| ------ | ------ | ------ |
| | | |
| | | |

---

## 10. Design Quality Attributes

*Explain how your design handles the "non-functional" elements:*
*   ***Scalability:*** *How will it handle 10,000 users?*
*   ***Security:*** *How are you protecting passwords (e.g., hashing)?*
*   ***Maintainability:*** *How easy is it for a new developer to read your code?*

---

## 11. Deployment Considerations

*   ***Hosting:*** *Where will it live? (AWS, Azure, Heroku?)*
*   ***Database:*** *Which DB engine? (PostgreSQL, MongoDB?)*
*   ***Version Control:*** *Mention using GitHub/GitLab and your branching strategy.*

---

## 12. Future Enhancements

*What features did you want to include but didn't have time for? (e.g., "Add AI-based recommendations in Version 2.0").*

---

## 13. Revised Project Plan

*Show your progress and provide current status of the project in accordance with the plan provided in project proposal. A Gantt chart should be used in this regard. Also provide an updated project plan.*

---

## 14. References

*List all books, conference papers, journal articles, websites, etc., used in preparing the content of this document. Provide enough information so that the reader could access a copy of each reference, including title, author, volume/edition number, page number(s), and publication year. Mention complete URLs for websites.*

---

## Appendix A: Glossary

*Define all the terms necessary to properly interpret the design specifications, including acronyms and abbreviations. You may wish to build a separate glossary that spans multiple projects or the entire organization, and just include terms specific to a single project in each specification.*

---

## Appendix B: IV & V Report
**(Independent Verification & Validation)**

**IV & V Resource:**
Name: _________________ Signature: _________________

| **S#** | **Defect Description** | **Origin Stage** | **Status** | **Fix Time (Hours)** | **Fix Time (Minutes)** |
| ------ | ------ | ------ | ------ | ------ | ------ |
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| … | | | | | |

**Table 1: List of non-trivial defects**
```