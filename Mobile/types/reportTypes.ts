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
  Location: string;
  Location_Type: string;
  Location_Details: string;

  // People Involved
  Reporter_Name: string;
  Reporter_Phone: string;
  Reporter_Email: string;
  Is_Victim_Reporter: boolean;
  Victim_Name: string;
  Victim_Contact: string;
  Suspect_Description: string;
  Suspect_Vehicle: string;
  Witness_Info: string;

  // Property and Evidence
  Property_Involved: boolean;
  Property_Description: string;
  Property_Value: string;
  Serial_Numbers: string;
  Evidence_Info: string;
  Media_Attached: boolean;
}
