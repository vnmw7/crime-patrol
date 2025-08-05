// lib/reportService.ts
import { Databases, Query, Models } from "appwrite";
import {
  client,
  APPWRITE_DATABASE_ID,
  REPORTS_MAIN_COLLECTION_ID,
  REPORT_METADATA_COLLECTION_ID,
  REPORT_LOCATIONS_COLLECTION_ID,
  REPORT_REPORTER_INFO_COLLECTION_ID,
  REPORT_VICTIMS_COLLECTION_ID,
  REPORT_SUSPECTS_COLLECTION_ID,
  REPORT_WITNESSES_COLLECTION_ID,
  REPORT_MEDIA_COLLECTION_ID,
} from "./appwrite";

// Enhanced interfaces for complete report structure
export interface CompleteReport extends Models.Document {
  // Main report data (from reports_main)
  incident_type: string;
  incident_date: string;
  reported_by: string;
  status: string;

  // Metadata (from report_metadata) - optional for list view
  metadata?: {
    incident_time?: string;
    is_in_progress?: boolean;
    description?: string;
    is_victim_reporter?: boolean;
    priority_level?: string;
    created_at?: string;
    updated_at?: string;
  };

  // Location data (from report_locations) - optional
  location?: {
    location_address?: string;
    location_type?: string;
    location_details?: string;
    latitude?: number;
    longitude?: number;
  };

  // Reporter info (from report_reporter_info) - optional
  reporter_info?: {
    reporter_name?: string;
    reporter_phone?: string;
    reporter_email?: string;
  };
  // Related people data - only for detailed view
  victims?: {
    victim_name?: string;
    victim_contact?: string;
  }[];

  suspects?: {
    suspect_description?: string;
    suspect_vehicle?: string;
  }[];

  witnesses?: {
    witness_info?: string;
  }[];

  // Media items - optional
  media?: MediaItem[];
}

export interface MediaItem extends Models.Document {
  report_id: string;
  file_id: string;
  media_type: "photo" | "video" | "audio";
  file_name_original: string;
  display_order: number;
  secure_url?: string;
  cloudinary_url?: string;
  file_url?: string;
}

export interface ReportListItem {
  $id: string;
  incident_type: string;
  incident_date: string;
  status: string;
  description?: string;
  location_address?: string;
  priority_level?: string;
}

class ReportService {
  private databases: Databases;

  constructor() {
    this.databases = new Databases(client);
  }

  /**
   * Fetch reports for list view with essential related data
   */
  async fetchReportsForList(userId?: string): Promise<ReportListItem[]> {
    try {
      // Build queries for filtering
      const queries = [Query.orderDesc("incident_date"), Query.limit(50)];
      if (userId) {
        queries.push(Query.equal("reported_by", userId));
      }

      // Fetch main reports
      const reportsResponse = await this.databases.listDocuments(
        APPWRITE_DATABASE_ID,
        REPORTS_MAIN_COLLECTION_ID,
        queries,
      );

      const reports: ReportListItem[] = [];

      // For each report, fetch essential related data
      for (const report of reportsResponse.documents) {
        const reportItem: ReportListItem = {
          $id: report.$id,
          incident_type: report.incident_type,
          incident_date: report.incident_date,
          status: report.status,
        };

        // Fetch metadata for description and priority
        try {
          const metadataResponse = await this.databases.listDocuments(
            APPWRITE_DATABASE_ID,
            REPORT_METADATA_COLLECTION_ID,
            [Query.equal("report_id", report.$id)],
          );
          if (metadataResponse.documents.length > 0) {
            const metadata = metadataResponse.documents[0];
            reportItem.description = metadata.description;
            reportItem.priority_level = metadata.priority_level;
          }
        } catch {
          console.log(`No metadata found for report ${report.$id}`);
        }

        // Fetch location for address
        try {
          const locationResponse = await this.databases.listDocuments(
            APPWRITE_DATABASE_ID,
            REPORT_LOCATIONS_COLLECTION_ID,
            [Query.equal("report_id", report.$id)],
          );
          if (locationResponse.documents.length > 0) {
            reportItem.location_address =
              locationResponse.documents[0].location_address;
          }
        } catch {
          console.log(`No location found for report ${report.$id}`);
        }

        reports.push(reportItem);
      }

      return reports;
    } catch (error) {
      console.error("Error fetching reports for list:", error);
      throw error;
    }
  }

  /**
   * Fetch complete report details with all related data
   */
  async fetchCompleteReportDetails(reportId: string): Promise<CompleteReport> {
    try {
      // Fetch main report
      const mainReport = await this.databases.getDocument(
        APPWRITE_DATABASE_ID,
        REPORTS_MAIN_COLLECTION_ID,
        reportId,
      );

      const completeReport: CompleteReport = {
        ...mainReport,
        incident_type: mainReport.incident_type,
        incident_date: mainReport.incident_date,
        reported_by: mainReport.reported_by,
        status: mainReport.status,
      }; // Fetch metadata
      try {
        const metadataResponse = await this.databases.listDocuments(
          APPWRITE_DATABASE_ID,
          REPORT_METADATA_COLLECTION_ID,
          [Query.equal("report_id", reportId)],
        );
        if (metadataResponse.documents.length > 0) {
          const metadata = metadataResponse.documents[0];
          completeReport.metadata = {
            incident_time: metadata.incident_time,
            is_in_progress: metadata.is_in_progress,
            description: metadata.description,
            is_victim_reporter: metadata.is_victim_reporter,
            priority_level: metadata.priority_level,
            created_at: metadata.created_at,
            updated_at: metadata.updated_at,
          };
        }
      } catch {
        console.log(`No metadata found for report ${reportId}`);
      }

      // Fetch location
      try {
        const locationResponse = await this.databases.listDocuments(
          APPWRITE_DATABASE_ID,
          REPORT_LOCATIONS_COLLECTION_ID,
          [Query.equal("report_id", reportId)],
        );
        if (locationResponse.documents.length > 0) {
          const location = locationResponse.documents[0];
          completeReport.location = {
            location_address: location.location_address,
            location_type: location.location_type,
            location_details: location.location_details,
            latitude: location.latitude,
            longitude: location.longitude,
          };
        }
      } catch {
        console.log(`No location found for report ${reportId}`);
      }

      // Fetch reporter info
      try {
        const reporterResponse = await this.databases.listDocuments(
          APPWRITE_DATABASE_ID,
          REPORT_REPORTER_INFO_COLLECTION_ID,
          [Query.equal("report_id", reportId)],
        );
        if (reporterResponse.documents.length > 0) {
          const reporter = reporterResponse.documents[0];
          completeReport.reporter_info = {
            reporter_name: reporter.reporter_name,
            reporter_phone: reporter.reporter_phone,
            reporter_email: reporter.reporter_email,
          };
        }
      } catch {
        console.log(`No reporter info found for report ${reportId}`);
      }

      // Fetch victims
      try {
        const victimsResponse = await this.databases.listDocuments(
          APPWRITE_DATABASE_ID,
          REPORT_VICTIMS_COLLECTION_ID,
          [Query.equal("report_id", reportId)],
        );
        completeReport.victims = victimsResponse.documents.map((victim) => ({
          victim_name: victim.victim_name,
          victim_contact: victim.victim_contact,
        }));
      } catch {
        console.log(`No victims found for report ${reportId}`);
        completeReport.victims = [];
      }

      // Fetch suspects
      try {
        const suspectsResponse = await this.databases.listDocuments(
          APPWRITE_DATABASE_ID,
          REPORT_SUSPECTS_COLLECTION_ID,
          [Query.equal("report_id", reportId)],
        );
        completeReport.suspects = suspectsResponse.documents.map((suspect) => ({
          suspect_description: suspect.suspect_description,
          suspect_vehicle: suspect.suspect_vehicle,
        }));
      } catch {
        console.log(`No suspects found for report ${reportId}`);
        completeReport.suspects = [];
      }

      // Fetch witnesses
      try {
        const witnessesResponse = await this.databases.listDocuments(
          APPWRITE_DATABASE_ID,
          REPORT_WITNESSES_COLLECTION_ID,
          [Query.equal("report_id", reportId)],
        );
        completeReport.witnesses = witnessesResponse.documents.map(
          (witness) => ({
            witness_info: witness.witness_info,
          }),
        );
      } catch {
        console.log(`No witnesses found for report ${reportId}`);
        completeReport.witnesses = [];
      }

      // Fetch media
      try {
        const mediaResponse = await this.databases.listDocuments(
          APPWRITE_DATABASE_ID,
          REPORT_MEDIA_COLLECTION_ID,
          [Query.equal("report_id", reportId), Query.orderAsc("display_order")],
        );
        completeReport.media = mediaResponse.documents as MediaItem[];
      } catch {
        console.log(`No media found for report ${reportId}`);
        completeReport.media = [];
      }

      return completeReport;
    } catch (error) {
      console.error("Error fetching complete report details:", error);
      throw error;
    }
  }

  /**
   * Fetch reports by user with essential data
   */
  async fetchReportsByUser(userId: string): Promise<ReportListItem[]> {
    return this.fetchReportsForList(userId);
  }

  /**
   * Fetch reports by status
   */
  async fetchReportsByStatus(status: string): Promise<ReportListItem[]> {
    try {
      const reportsResponse = await this.databases.listDocuments(
        APPWRITE_DATABASE_ID,
        REPORTS_MAIN_COLLECTION_ID,
        [Query.equal("status", status), Query.orderDesc("incident_date")],
      );

      const reports: ReportListItem[] = [];

      for (const report of reportsResponse.documents) {
        const reportItem: ReportListItem = {
          $id: report.$id,
          incident_type: report.incident_type,
          incident_date: report.incident_date,
          status: report.status,
        }; // Fetch description from metadata
        try {
          const metadataResponse = await this.databases.listDocuments(
            APPWRITE_DATABASE_ID,
            REPORT_METADATA_COLLECTION_ID,
            [Query.equal("report_id", report.$id)],
          );
          if (metadataResponse.documents.length > 0) {
            reportItem.description = metadataResponse.documents[0].description;
          }
        } catch {
          console.log(`No metadata found for report ${report.$id}`);
        }

        reports.push(reportItem);
      }

      return reports;
    } catch (error) {
      console.error("Error fetching reports by status:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const reportService = new ReportService();
