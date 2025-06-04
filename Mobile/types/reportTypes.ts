// Report form types and interfaces

// Define types for form fields and form data
export interface FormData {
  // Incident Information
  Incident_Type: string;
  Incident_Date: Date;
  Incident_Time: Date;
  Is_In_Progress: boolean;
  Description: string;

  // Location Information
  Location: string; // Consider using a more structured location type
  Location_Type: string;
  Location_Details?: string;

  // People Involved
  Reporter_Name: string;
  Reporter_Phone: string;
  Reporter_Email?: string;
  Is_Victim_Reporter: boolean;
  Victim_Name?: string;
  Victim_Contact?: string;
  Suspect_Description?: string;
  Suspect_Vehicle?: string;
  Witness_Info?: string;
  Media_Attached?: boolean;
  Media_Attachments?: {
    url: string; // Changed from uri to url
    type: string;
    name: string;
    appwrite_file_id?: string;
    appwrite_bucket_id?: string;
  }[];

  reported_by?: string;
}

export interface ReportDocument extends FormData {
  Report_ID: string;
  Report_Status: string;
  Created_At: Date;
  Updated_At: Date;
  reported_by?: string;
}
