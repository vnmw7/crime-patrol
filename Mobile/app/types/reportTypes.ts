// Report form types and interfaces

// Define types for form fields and form data
export interface FormData {
  // Incident Information
  incidentType: string;
  incidentDate: Date;
  incidentTime: Date;
  isInProgress: boolean;
  weaponsInvolved: boolean;
  weaponsDescription: string;
  description: string;

  // Location Information
  location: string;
  locationType: string;
  locationDetails: string;

  // People Involved
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  isVictimReporter: boolean;
  victimName: string;
  victimContact: string;
  suspectDescription: string;
  suspectVehicle: string;
  witnessInfo: string;

  // Property and Evidence
  propertyInvolved: boolean;
  propertyDescription: string;
  propertyValue: string;
  serialNumbers: string;
  evidenceInfo: string;
  mediaAttached: boolean;
}
