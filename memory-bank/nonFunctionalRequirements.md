# Non-Functional Requirements (NFRs) - Maintenance Management System (SISMAN - UFRN)

Defining Non-Functional Requirements (NFRs) is crucial to ensure the system meets expectations for quality, performance, security, and usability.

## 1. Performance

*   **NFR01 - Response Time (Interface):** Key user interactions (opening screens, listing service orders, saving forms) must have a perceived response time of less than 2 seconds under normal UFRN network conditions.
*   **NFR02 - Response Time (API):** API requests (NestJS backend) for common operations (service order CRUD, status queries) must return in under 500ms (excluding network latency).
*   **NFR03 - Initial Concurrent Load:** The system must initially support at least 50 concurrent users performing typical operations (queries, registrations, updates) without significant performance degradation. (This number may be adjusted based on the actual estimate of simultaneous users at UFRN).
*   **NFR04 - Report Processing:** Generation of basic reports (e.g., service orders by status, by sector) must be completed in under 10 seconds for an expected data volume of 1 year of UFRN operation.

## 2. Reliability and Availability

*   **NFR05 - Availability:** The system must be available 99.5% of the time during the UFRN maintenance team's business hours (e.g., Monday to Friday, 8 AM to 6 PM).
*   **NFR06 - Failure Recovery (RTO):** In case of a critical failure (server, database), the system must be restored and operational within a maximum of 8 hours (Recovery Time Objective).
*   **NFR07 - Data Loss (RPO):** In case of a catastrophic failure, the maximum acceptable data loss is 24 hours (Recovery Point Objective), indicating the need for at least daily backups.
*   **NFR08 - Error Handling:** The system must display clear and informative error messages to the user in case of operational failures (e.g., connection failure, validation error) and record detailed logs.

## 3. Usability

*   **NFR09 - Ease of Learning:** A new user (maintenance technician or administrator) must be able to perform basic tasks for their profile (e.g., create/update SOs, consult schedule) after a maximum of 1 hour of training.
*   **NFR10 - Efficiency of Use:** The most frequent tasks (e.g., material reservation, material receipt, material dispatch, consulting pending requisitions and SOs) must require a minimal number of clicks/steps.
*   **NFR11 - Intuitive Interface:** The interface must follow consistent design patterns and be intuitive, minimizing the need to consult documentation for routine operations.
*   **NFR12 - Language:** The entire user interface and system messages must be in Brazilian Portuguese.
*   **NFR13 - Responsiveness:** The frontend interface (Next.js) must be responsive, adapting to provide an adequate user experience on different screen sizes, from small smartphones (minimum width around 360px) and tablets to desktops with Full HD (1920px width) resolutions or higher.

## 4. Security

*   **NFR14 - Authentication:** Access to the system must be protected by individual authentication through the Single Sign-On (SSO) system provided by UFRN. In case of SSO unavailability, access can be achieved through passwordless authentication via magic link or OTP (One-Time Password). For users not part of the academic community, and therefore without access to SIG and SSO systems, access requires prior registration by the SISMAN administrator, and authentication will occur exclusively via magic link or OTP. SISMAN will not store user passwords or other sensitive information, delegating identity verification to the SSO provider.
*   **NFR15 - Authorization:** The system must implement access control based on profiles (e.g., Administrator, Maintenance Supervisor, Maintenance Technician, Requester), ensuring users only access functionalities and data relevant to their profile.
*   **NFR16 - Protection Against Common Attacks:** The system must implement protections against major web vulnerabilities, such as those defined by the OWASP Top 10, including SQL Injection and Cross-Site Scripting (XSS).
*   **NFR17 - Secure Communication:** All communication between the frontend (Next.js) and the backend (NestJS), and between the user and the frontend, must occur over HTTPS (TLS).
*   **NFR18 - Audit Logs:** The system must record audit logs for critical security events (logins, failed login attempts, permission changes, deletion of important data).
*   **NFR19 - Compliance (LGPD):** The system must comply with the General Data Protection Law (LGPD - Lei Geral de Proteção de Dados), especially if handling personal data of requesters or technicians.

## 5. Maintainability

*   **NFR20 - Modularity:** The source code (both Next.js and NestJS) must be organized into cohesive modules/components with low coupling to facilitate future modifications and feature additions.
*   **NFR21 - Code Readability:** The code must follow style guides (e.g., configured ESLint/Prettier) and good naming practices to be easily understood by other developers.
*   **NFR22 - Technical Documentation:** Minimal documentation of the architecture, main modules/components, and the build/deploy process must exist. The NestJS API must have auto-generated documentation (e.g., Swagger/OpenAPI).
*   **NFR23 - Testability:** The system must be designed to facilitate automated testing (unit, integration). Considering the reduced project development time by a single developer, a minimum test coverage will not be defined for this project.

## 6. Scalability

*   **NFR24 - Vertical Scalability:** The architecture must allow the system to utilize more resources (CPU, memory) on the server where it is hosted, if necessary.
*   **NFR25 - Horizontal Scalability (Preparation):** The backend architecture (NestJS) must be stateless (not storing session state in server memory) to *enable* horizontal scalability (adding more backend instances) in the future, if the system is expanded or usage volume grows significantly.

## 7. Portability and Deployment

*   **NFR26 - Browser Compatibility:** The frontend (Next.js) must be compatible with the last two stable versions of major browsers (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).
*   **NFR27 - OS Compatibility:** The backend (NestJS) must be capable of running on Linux operating systems (recommended for servers). The frontend is web-based, independent of the client's OS.
*   **NFR28 - Containerized Deployment:** The application (NestJS backend and, optionally, the Next.js frontend build) must be packaged and distributed using container technology (e.g., Docker) to ensure runtime environment consistency, encapsulate dependencies, and simplify the deployment process across different infrastructures.

## 8. Interoperability

*   **NFR29 - API Integration (Exposure):** If necessary, the system must expose a secure API to allow communication and data exchange with other authorized institutional systems, using common formats (e.g., JSON).
*   **NFR30 - API Integration (Consumption):** If necessary, the system must be able to consume APIs from other institutional systems to fetch or send data, properly handling authentication and data formats (e.g., JSON, XML).

## 9. Notifications

*   **NFR31 - Notification Channels:** The system must initially support notifications via email and in-app web interface notifications. The architecture should facilitate the future addition of other channels (e.g., SMS, Push).
*   **NFR32 - Notification Reliability:** Essential notifications (e.g., SO assignment) must be delivered with high reliability.
*   **NFR33 - Notification Latency:** Sending high-priority notifications must occur in a timely manner after the triggering event (e.g., in under 1 minute).

### General Observations

*   **Prioritization:** Not all NFRs have the same initial priority. It is important to discuss with UFRN stakeholders which are most critical for the project's success in its early stages.
*   **Measurability:** Whenever possible, NFRs should be measurable to allow objective verification of their fulfillment (e.g., "less than 2 seconds" instead of "fast").
*   **Evolution:** These are initial requirements. As the system evolves and usage increases, they may need to be reviewed and adjusted.
