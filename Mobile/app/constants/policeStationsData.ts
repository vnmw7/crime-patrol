// Police station data from Bacolod City
export const policeStations = [
  {
    id: "1",
    name: "Police Station 1",
    address: "Bays Center, San Juan Street, Downtown Bacolod",
    contactNumbers: ["(034) 703-1673"],
    location: {
      latitude: 10.6749,
      longitude: 122.9529,
    },
    barangay: "Downtown",
  },
  {
    id: "2",
    name: "Police Station 2",
    address: "Barangay Handumanan, Bacolod City",
    contactNumbers: ["(034) 707-8301"],
    location: {
      latitude: 10.6633,
      longitude: 122.9452,
    },
    barangay: "Handumanan",
  },
  {
    id: "3",
    name: "Police Station 3",
    address: "13th Lacson Street, Barangay Mandalagan, Bacolod City",
    contactNumbers: ["(034) 434-8177"],
    location: {
      latitude: 10.6804,
      longitude: 122.9577,
    },
    barangay: "Mandalagan",
  },
  {
    id: "4",
    name: "Police Station 4",
    address: "Barangay Villamonte, Bacolod City",
    contactNumbers: ["(034) 433-5041", "(034) 708-3771", "(034) 708-1700"],
    location: {
      latitude: 10.668,
      longitude: 122.944,
    },
    barangay: "Villamonte",
  },
  {
    id: "5",
    name: "Police Station 5",
    address: "Barangay Granada, Bacolod City",
    contactNumbers: ["(034) 708-8291"],
    location: {
      latitude: 10.695,
      longitude: 122.965,
    },
    barangay: "Granada",
  },
  {
    id: "6",
    name: "Police Station 6",
    address: "Barangay Taculing, Bacolod City",
    contactNumbers: ["(034) 468-0341"],
    location: {
      latitude: 10.66,
      longitude: 122.962,
    },
    barangay: "Taculing",
  },
  {
    id: "7",
    name: "Police Station 7",
    address: "Barangay Mansilingan, Bacolod City",
    contactNumbers: ["(034) 446-2802"],
    location: {
      latitude: 10.655,
      longitude: 122.97,
    },
    barangay: "Mansilingan",
  },
  {
    id: "8",
    name: "Police Station 8",
    address: "Barangay Tangub, Bacolod City",
    contactNumbers: ["(034) 444-1593", "(034) 704-3133"],
    location: {
      latitude: 10.63,
      longitude: 122.96,
    },
    barangay: "Tangub",
  },
  {
    id: "9",
    name: "Police Station 9",
    address: "Barangay Sum-ag, Bacolod City",
    contactNumbers: ["(034) 444-3155"],
    location: {
      latitude: 10.61,
      longitude: 122.955,
    },
    barangay: "Sum-ag",
  },
];

// Emergency respondents data
export const emergencyRespondents = [
  {
    id: "e1",
    name: "Philippine Red Cross - Bacolod City Chapter",
    address: "Pnrc Building, 10th Street, Bacolod City, Negros Occidental",
    contactNumbers: ["(034) 434-8541", "(034) 434-9286"],
    location: {
      latitude: 10.67,
      longitude: 122.955,
    },
    type: "emergency",
  },
  {
    id: "e2",
    name: "Amity Emergency Services Foundation",
    address: "Amity Building, Hilado Extension, Bacolod City",
    contactNumbers: ["(034) 432-2161"],
    location: {
      latitude: 10.672,
      longitude: 122.956,
    },
    type: "emergency",
  },
  {
    id: "e3",
    name: "Disaster Risk Reduction and Management Office (DRRMO)",
    address: "2F City Hall Building, cor. Araneta-Luzuriaga Sts., Bacolod City",
    contactNumbers: [
      "(034) 432-3879",
      "(034) 445-7826",
      "(034) 432-3871",
      "0930-243-4706",
      "0936-940-1591",
    ],
    location: {
      latitude: 10.667,
      longitude: 122.953,
    },
    type: "emergency",
  },
];

// List of barangays for filtering
export const barangays = [
  "Downtown",
  "Handumanan",
  "Mandalagan",
  "Villamonte",
  "Granada",
  "Taculing",
  "Mansilingan",
  "Tangub",
  "Sum-ag",
];
