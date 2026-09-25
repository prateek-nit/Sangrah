# Product Requirements Document
## Secure Legal Document & Evidence Management System (Prototype)

### 1. Overview
A web platform for police departments, investigators, prosecutors, and courts to
securely upload, organize, verify, search, and audit legal/investigation
documents (FIRs, statements, charge sheets, reports, judgments, evidence
records) tied to specific cases, with cryptographic integrity checks and a
tamper-evident audit trail.

**Goal of this prototype:** demonstrate the core workflow end-to-end — login →
case creation → document upload → hash/integrity verification → OCR-searchable
storage → audit logging → role-based access — as a working MVP, not a
production-hardened deployment.

### 2. Problem Statement
Investigation and case documents are currently scattered across paper files,
shared drives, or ad-hoc systems with no reliable way to:
- Prove a document hasn't been altered after upload
- Restrict access to only the people authorized on a case
- Track who touched a document and when
- Search across large volumes of scanned/handwritten material

### 3. Target Users & Roles
| Role | Core Needs |
|---|---|
| Admin | Manage users, roles, departments, system config |
| Police Officer | Upload FIRs/statements, view own case documents |
| Investigator | Upload evidence, manage chain-of-custody, search case docs |
| Prosecutor | View/download case documents, request access |
| Court Officer | View judgments/charge sheets, verify document integrity |
| Forensic Officer | Upload forensic reports, manage evidence items |

### 4. MVP Scope (In)
1. **Auth & RBAC** — login, JWT session, 6 roles above, case-level permission checks
2. **Case Management** — create/list/view cases; documents & evidence nest under a case
3. **Secure Document Upload** — file upload with type/size validation, SHA-256 hash generated on upload, file encrypted at rest
4. **Integrity Verification** — "Verify" action re-hashes the stored file and compares to the original hash record; flags mismatch
5. **Versioning** — re-upload creates a new version; old versions retained and viewable
6. **Audit Trail** — append-only log of upload/view/download/edit/share/approve events with actor, timestamp, IP
7. **OCR-based Search** — scanned PDFs/images run through OCR on upload; full-text + metadata search (case no., FIR no., doc type, date, officer, keywords)
8. **Document Sharing / Permissions** — grant another user view/download access to a specific document or case
9. **Admin Dashboard** — user management, role assignment, system-wide audit view
10. **Chain of Custody (basic)** — log of evidence handoffs (from → to, timestamp, reason) per evidence item
11. **Digital Signature (basic)** — an "approve" action that records signer identity, timestamp, and a signature hash over the document hash (not a legally-binding PKI signature at prototype stage)

### 5. Out of Scope (for this prototype)
- Blockchain / distributed ledger (hash ledger simulated in a normal append-only Postgres table)
- Legally-binding PKI digital signatures / external CA integration
- Keycloak/enterprise SSO (use simple JWT auth instead)
- Malware scanning service, MFA, device management
- Elasticsearch/OpenSearch cluster (Postgres full-text search + OCR is sufficient at prototype scale)
- AI summarization, entity extraction, semantic search, duplicate detection (stub endpoints only, noted as future work)
- Retention/archival policies, disaster recovery, Kubernetes deployment

### 6. Key User Flows
**Upload flow:** login → select case → upload file → system scans/validates →
SHA-256 hash generated → file encrypted & stored → OCR runs async → metadata
extracted → audit entry created → document appears in case with "processing"
→ "ready" status.

**Verify flow:** user opens document → clicks "Verify Integrity" → backend
re-hashes stored file → compares to stored hash → shows Match/Mismatch with
timestamp.

**Search flow:** user enters query/filters → backend searches metadata +
OCR text (scoped to cases/documents the user has permission for) → results
list with snippet highlighting.

**Audit flow:** admin/court officer opens a document or case → views
chronological, read-only event log.

### 7. Functional Requirements Summary
- FR1: System shall enforce RBAC on every API endpoint and UI view
- FR2: System shall generate and persist a SHA-256 hash for every uploaded file version
- FR3: System shall detect and flag hash mismatches on verification
- FR4: System shall write an audit event for every read/write action on a document
- FR5: Audit log entries shall be append-only (no update/delete endpoint exists)
- FR6: System shall extract text via OCR for image/scanned PDF uploads
- FR7: System shall support search by case no., FIR no., doc type, date range, officer, department, and free-text keyword
- FR8: System shall support per-document and per-case access grants between users
- FR9: System shall track evidence items with a chain-of-custody log

### 8. Non-Functional Requirements
- All traffic over HTTPS/TLS in deployment
- Files encrypted at rest (AES-256)
- Passwords hashed (bcrypt/argon2)
- Audit log write failures must block the triggering action (fail closed)
- Reasonable performance for prototype scale: ~1,000 documents, ~50 concurrent users

### 9. Success Criteria for the Prototype
- A user can log in, create a case, upload a document, see its hash, verify
  it, search for it by OCR text, and view the full audit trail for it
- Role restrictions are demonstrably enforced (a user without case access is denied)
- Tampering with a stored file is detected on next verification
