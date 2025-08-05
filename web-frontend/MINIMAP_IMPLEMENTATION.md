# Minimap Implementation

## Overview

Replaced the "Incident Locations" bar chart with an interactive minimap that displays actual incident locations from your Appwrite database.

## New Features

### 🗺️ **Interactive Minimap**

- **Real-time incident locations** plotted on an interactive map
- **Color-coded markers** for different incident types
- **Bacolod City center** marked for reference
- **Popup information** showing incident details on marker click

### 🎨 **Visual Enhancements**

- **Incident type color mapping**:
  - **Red tones**: Theft, Burglary, Assault, Robbery
  - **Orange**: Vandalism, Suspicious Activity
  - **Blue**: Traffic Violations, Noise Complaints
  - **Purple**: Domestic Disturbance, Harassment
  - **Green**: Missing Person
  - **Gray**: Other/Unknown

### 📍 **Smart Marker Management**

- **Automatic offset** for overlapping incident locations
- **Responsive markers** with 20px width for better visibility
- **Popup details** including:
  - Report ID
  - Incident type
  - Address
  - Location type
  - Status
  - Additional details

### 📊 **Legend and Statistics**

- **Incident count display** showing total mapped incidents
- **Color-coded legend** for different marker types
- **Responsive design** that works on all screen sizes

## Technical Implementation

### Data Integration

- **Joins report data** with location data for complete incident information
- **Filters valid coordinates** to only show mappable incidents
- **Real-time updates** when new incidents are added to database

### Map Configuration

- **Center**: Bacolod City coordinates (10.6767, 122.9563)
- **Zoom level**: 12 (city-wide view)
- **Tile layer**: OpenStreetMap
- **Interactive**: Scroll wheel zoom enabled

### Performance Optimizations

- **Marker clustering** for overlapping locations
- **Efficient coordinate processing** with precision rounding
- **Conditional rendering** only when location data is available

## Usage

The minimap automatically loads when:

1. Dashboard component mounts
2. Location data is successfully fetched from Appwrite
3. Valid latitude/longitude coordinates are found

### Interactive Features

- **Zoom in/out** using mouse wheel or map controls
- **Pan around** the map by clicking and dragging
- **Click markers** to view incident details in popup
- **Responsive layout** adapts to different screen sizes

## Data Requirements

The minimap expects location documents with:

- `latitude` and `longitude` coordinates
- `report_id` to link with incident reports
- `Location_Address` for address information
- `Location_Type` for location classification
- `Location_Details` for additional context

## Fallback Behavior

When no location data is available:

- Shows "No incident locations to display on map" message
- Maintains consistent UI layout
- Provides user feedback about data availability

This minimap provides a much more valuable and interactive way to visualize incident locations compared to the previous static bar chart, giving users immediate geographical context for crime patterns in Bacolod City.
