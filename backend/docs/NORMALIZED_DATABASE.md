# Crime Patrol - Normalized Database Structure

## Overview

The Crime Patrol database has been normalized to address Appwrite's attribute limitations and improve data organization. The database is split into 7 collections, each with a maximum of 8 attributes (well under any practical limits).

## Database Collections

### 1. Reports Collection (8 attributes)

**Collection ID:** `reports_main`  
**Purpose:** Core incident information

| Attribute            | Type          | Required | Default   | Description                                                    |
| -------------------- | ------------- | -------- | --------- | -------------------------------------------------------------- |
| `incident_type`      | String(255)   | Yes      | -         | Type of crime (theft, assault, etc.)                           |
| `incident_date`      | DateTime      | Yes      | -         | Date when incident occurred                                    |
| `incident_time`      | DateTime      | Yes      | -         | Time when incident occurred                                    |
| `is_in_progress`     | Boolean       | Yes      | false     | Whether incident is ongoing                                    |
| `description`        | String(10000) | Yes      | -         | Detailed description of the incident                           |
| `reported_by`        | String(255)   | Yes      | -         | User ID of the reporter                                        |
| `status`             | String(50)    | Yes      | "pending" | Report status (pending, approved, rejected, responded, solved) |
| `is_victim_reporter` | Boolean       | Yes      | false     | Whether the reporter is also the victim                        |

**Indexes:** `incident_type`, `status`, `reported_by`

### 2. Report Locations Collection (6 attributes)

**Collection ID:** `report_locations`  
**Purpose:** Location details with map coordinates

| Attribute          | Type         | Required | Default | Description                                     |
| ------------------ | ------------ | -------- | ------- | ----------------------------------------------- |
| `report_id`        | String(255)  | Yes      | -       | Foreign key to Reports collection               |
| `location_address` | String(500)  | No       | -       | Full address of the incident                    |
| `location_type`    | String(100)  | No       | -       | Type of location (street, building, park, etc.) |
| `location_details` | String(5000) | No       | -       | Additional location details                     |
| `latitude`         | Float        | Yes      | -       | GPS latitude coordinate                         |
| `longitude`        | Float        | Yes      | -       | GPS longitude coordinate                        |

**Indexes:** `report_id`

### 3. Report Reporter Info Collection (4 attributes)

**Collection ID:** `report_reporter_info`  
**Purpose:** Reporter contact information

| Attribute        | Type        | Required | Default | Description                       |
| ---------------- | ----------- | -------- | ------- | --------------------------------- |
| `report_id`      | String(255) | Yes      | -       | Foreign key to Reports collection |
| `reporter_name`  | String(255) | No       | -       | Full name of the reporter         |
| `reporter_phone` | String(50)  | No       | -       | Phone number of the reporter      |
| `reporter_email` | Email       | No       | -       | Email address of the reporter     |

**Indexes:** `report_id`

### 4. Report Victims Collection (3 attributes)

**Collection ID:** `report_victims`  
**Purpose:** Victim information (supports multiple victims per report)

| Attribute        | Type        | Required | Default | Description                        |
| ---------------- | ----------- | -------- | ------- | ---------------------------------- |
| `report_id`      | String(255) | Yes      | -       | Foreign key to Reports collection  |
| `victim_name`    | String(255) | No       | -       | Name of the victim                 |
| `victim_contact` | String(255) | No       | -       | Contact information for the victim |

**Indexes:** `report_id`

### 5. Report Suspects Collection (3 attributes)

**Collection ID:** `report_suspects`  
**Purpose:** Suspect information (supports multiple suspects per report)

| Attribute             | Type          | Required | Default | Description                         |
| --------------------- | ------------- | -------- | ------- | ----------------------------------- |
| `report_id`           | String(255)   | Yes      | -       | Foreign key to Reports collection   |
| `suspect_description` | String(10000) | No       | -       | Physical description of the suspect |
| `suspect_vehicle`     | String(255)   | No       | -       | Vehicle description if applicable   |

**Indexes:** `report_id`

### 6. Report Witnesses Collection (2 attributes)

**Collection ID:** `report_witnesses`  
**Purpose:** Witness information (supports multiple witnesses per report)

| Attribute      | Type          | Required | Default | Description                             |
| -------------- | ------------- | -------- | ------- | --------------------------------------- |
| `report_id`    | String(255)   | Yes      | -       | Foreign key to Reports collection       |
| `witness_info` | String(10000) | No       | -       | Witness information and contact details |

**Indexes:** `report_id`

### 7. Report Media Collection (5 attributes)

**Collection ID:** `report_media`  
**Purpose:** Photos, videos, and audio files (supports multiple media files per report)

| Attribute            | Type        | Required | Default | Description                       |
| -------------------- | ----------- | -------- | ------- | --------------------------------- |
| `report_id`          | String(255) | Yes      | -       | Foreign key to Reports collection |
| `file_id`            | String(255) | Yes      | -       | File ID from Appwrite Storage     |
| `media_type`         | String(50)  | Yes      | -       | Type: "photo", "audio", "video"   |
| `file_name_original` | String(255) | No       | -       | Original filename                 |
| `display_order`      | Integer     | No       | 0       | Order for displaying media        |

**Indexes:** `report_id`, `media_type`

## Report Status Values

- `pending` - Report submitted, awaiting review
- `approved` - Report approved by authorities
- `rejected` - Report rejected (invalid/spam)
- `responded` - Authorities have responded to the report
- `solved` - Case has been resolved

## API Endpoints

### Create Report

```http
POST /api/reports
Content-Type: application/json

{
  "incident_type": "Theft",
  "incident_date": "2024-01-15T14:30:00Z",
  "incident_time": "2024-01-15T14:30:00Z",
  "is_in_progress": false,
  "description": "Someone broke into my car...",
  "reported_by": "user123",
  "status": "pending",
  "is_victim_reporter": true,
  "location": {
    "address": "123 Main Street",
    "type": "Parking Lot",
    "details": "Level 2, Section B",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "reporter_info": {
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com"
  },
  "victims": [
    {
      "name": "John Doe",
      "contact": "john@example.com"
    }
  ],
  "suspects": [
    {
      "description": "Male, 5'8\", dark hoodie",
      "vehicle": "White sedan"
    }
  ],
  "witnesses": [
    {
      "info": "Security guard saw suspicious person"
    }
  ],
  "media": [
    {
      "file_id": "file123",
      "media_type": "photo",
      "file_name_original": "evidence.jpg",
      "display_order": 1
    }
  ]
}
```

### Get Report

```http
GET /api/reports/{reportId}
```

### List Reports

```http
GET /api/reports?status=pending&incident_type=Theft
```

### Update Status

```http
PATCH /api/reports/{reportId}/status
Content-Type: application/json

{
  "status": "approved"
}
```

### Get Reports by Location

```http
GET /api/reports/location/40.7128/-74.0060?radius=10
```

## Database Relationships

- All collections are linked through the `report_id` field
- One report can have:
  - One location record
  - One reporter info record
  - Multiple victims
  - Multiple suspects
  - Multiple witnesses
  - Multiple media files

## Migration from Legacy Structure

If you have existing reports in the old format, you'll need to:

1. Extract data from the monolithic reports collection
2. Distribute the data across the new normalized collections
3. Ensure all `report_id` foreign keys are properly set

## Usage Examples

See `src/examples/normalizedDatabaseExamples.js` for complete code examples of:

- Creating reports
- Retrieving complete reports
- Updating status
- Listing reports with filters

## Benefits of Normalization

1. **Attribute Limit Compliance:** Each collection has ≤8 attributes
2. **Better Data Organization:** Related data is grouped logically
3. **Scalability:** Easy to add new attributes to specific collections
4. **Flexibility:** Support for multiple victims, suspects, witnesses, and media
5. **Performance:** Indexes on foreign keys for efficient querying
6. **Maintainability:** Clear separation of concerns
