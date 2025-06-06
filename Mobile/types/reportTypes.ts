// Report form types and interfaces

// Location information interface
export interface LocationInfo {
  address: string;
  type: string;
  details?: string;
  latitude?: number;
  longitude?: number;
}

// Reporter information interface
export interface ReporterInfo {
  name: string;
  phone: string;
  email?: string;
}

// Victim information interface
export interface VictimInfo {
  name: string;
  contact?: string;
}

// Suspect information interface
export interface SuspectInfo {
  description: string;
  vehicle?: string;
}

// Witness information interface
export interface WitnessInfo {
  info: string;
}

// Media attachment interface for normalized structure
export interface MediaInfo {
  file_id: string;
  media_type: "photo" | "audio" | "video";
  file_name_original: string;
  display_order: number;
  url?: string; // For preview purposes
  appwrite_bucket_id?: string;
}

// Updated FormData interface to match normalized database structure
export interface FormData {
  // Incident Information
  incident_type: string;
  incident_date: Date;
  incident_time: Date;
  is_in_progress: boolean;
  description: string;

  // Location Information (structured object)
  location?: LocationInfo;

  // Reporter Information
  reporter_info?: ReporterInfo;
  is_victim_reporter: boolean;

  // People Involved (arrays to support multiple entries)
  victims?: VictimInfo[];
  suspects?: SuspectInfo[];
  witnesses?: WitnessInfo[];

  // Media attachments
  media?: MediaInfo[];

  // Metadata
  reported_by?: string;
  status?: string;
}

export interface ReportDocument extends FormData {
  Report_ID: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}
