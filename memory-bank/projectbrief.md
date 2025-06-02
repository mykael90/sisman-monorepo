# Project Brief
## 1. Project Title
Prototype Maintenance Management System for Brazilian Federal Educational Institutions (IFES-CMMS Prototype), named SISMAN.

## 2. Overview

**2.1. Background & Purpose:**
Brazilian Federal Educational Institutions (IFES) manage a vast and diverse portfolio of infrastructure assets critical to their educational and research missions. Currently, maintenance management within these institutions often relies on manual processes, disparate spreadsheets, or inadequate existing systems. This leads to inefficiencies, lack of standardized data, difficulties in strategic planning, and potential underutilization or premature degradation of assets. Commercial Computerized Maintenance Management Systems (CMMS) often present challenges related to cost, interoperability with existing public administration systems, data ownership, and customization to the specific needs and regulations of IFES.

This project aims to address these challenges by developing, implementing, and validating a prototype open-source, web-based CMMS specifically tailored to the context of IFES. The primary purpose is to improve the efficiency of maintenance operations and the quality of data for decision-making.

**2.2. Scope:**
1.  **Development & Validation (Software Phase):**
    *   Design and development of a Minimum Viable Product (MVP) of a CMMS.
    *   Implementation and demonstration of the prototype within a relevant department at UFRN (e.g., DIMAN/INFRA).
    *   Evaluation of the prototype's effectiveness, usability, and potential for broader adoption.

The MVP will focus on core maintenance management functionalities, providing a foundation for future expansion.

**2.3. Target Users:**
*   Primary: Maintenance departments and managers within IFES (initially at UFRN's DIMAN/INFRA).
*   Secondary: Technicians, administrative staff involved in maintenance requests, and potentially facility users for reporting issues.

## 3. Requirements

**3.1. Functional Requirements (Core MVP features):**
*   **Asset Management:**
    *   Inventory of infrastructure assets (buildings, systems, key equipment).
    *   Categorization, compartmentalization and basic information for each asset.
*   **Work Order Management:**
    *   Creation, assignment, tracking, and closure of maintenance requests.
    *   Prioritization mechanism.
*   **User & Role Management:**
    *   User authentication and authorization (login/logout).
    *   Different access levels for administrators, managers, technicians.
*   **Materials Management (Basic):**
    *   Tracking of materials consumed for work orders.
    *   Basic inventory management for maintenance-specific supplies (e.g., integration with or mimicking parts of an "almoxarifado" system for the maintenance depot).
*   **Reporting (Basic):**
    *   Generation of basic reports on work order status, asset maintenance history.
*   **Data Input & Retrieval:**
    *   Forms for inputting new assets, work orders, material usage.
    *   Search and filter capabilities for assets and work orders.

**3.2. Non-Functional Requirements:**
*   **Usability:** Intuitive and user-friendly interface, minimizing training needs. The design should be familiar, not necessarily innovative.
*   **Accessibility:** Web-based, accessible via standard internet browsers on various devices.
*   **Performance:** Adequate response times for typical operations within the pilot context.
*   **Reliability:** System should be stable and consistently available during operational hours.
*   **Security:** Basic data protection and secure user authentication.
*   **Maintainability:** Modular, well-documented, and legible code (following principles like MVC).
*   **Scalability (Architectural consideration for future):** While an MVP, the architecture should not inherently prevent future scaling.
*   **Open-Source:** The system will be developed using open-source technologies and the resulting code should be open.
*   **Interoperability (Future Goal):** Potential for future integration with existing IFES systems (e.g., SIPAC, SUAP, GLPI as mentioned in the survey).

**3.3. Constraints:**
*   **Time & Resources:** Development within the timeframe of a Master's dissertation, primarily by a single developer.
*   **MVP Focus:** Limited scope to core functionalities for initial validation.
*   **Pilot Environment:** Initial deployment and validation at UFRN.
*   **Data Resilience:** Consideration for long-term data viability, independent of specific software versions.

## 4. Goals & Objectives

**4.1. Primary Goals:**
1.  **Develop a Functional CMMS Prototype (MVP):** Deliver a working web-based software application that addresses core maintenance management needs identified in the research phase.
2.  **Improve Maintenance Efficiency at Pilot Site:** Reduce operational inefficiencies (e.g., rework, delays in logistics, resource allocation) within the UFRN maintenance department.
3.  **Enhance Data Quality & Record Keeping:** Establish a system for structured, reliable, and easily accessible data on maintenance activities, assets, and events.

**4.2. Secondary Objectives/Deliverables:**
*   **Validate the Solution:** Demonstrate the prototype's utility and gather feedback from UFRN maintenance personnel to validate its approach and identify areas for improvement.
*   **Substantiate Informed Decision-Making:** Provide a tool that can offer data to support better operational, tactical, and potentially strategic maintenance decisions.
*   **Create a Reusable & Extensible Platform:** Develop the prototype with a modular architecture (MVC) and using open-source technologies to facilitate future development, customization, and adoption by other IFES.
*   **Contribute to Knowledge:** Document the design, development, and validation process, providing insights for future research and development of CMMS in the public educational sector.
*   **Reduce Reliance on Inadequate or Costly Solutions:** Offer a viable, tailored alternative to manual processes or ill-fitting commercial CMMS.
