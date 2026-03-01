export type IncidentType = "fire" | "medical" | "police" | "hazmat" | "traffic";
export type IncidentStatus = "active" | "contained" | "resolved";

export interface Incident {
  id: string;
  title: string;
  type: IncidentType;
  address: string;
  lat: number;
  lng: number;
  status: IncidentStatus;
  time: string;
  units: string[];
  description: string;
}

export const DEMO_INCIDENTS: Incident[] = [
  {
    id: "inc-001",
    title: "Structure Fire",
    type: "fire",
    address: "312 Main St, Newark, DE",
    lat: 39.6840,
    lng: -75.7510,
    status: "active",
    time: "14:32",
    units: ["Engine 7", "Engine 3", "Ladder 2", "Battalion 1"],
    description:
      "Two-story residential structure fire, possible occupants trapped inside. Second alarm dispatched. Water supply established from hydrant at Main & Chapel.",
  },
  {
    id: "inc-002",
    title: "MVA with Injuries",
    type: "traffic",
    address: "Rte 896 & Paper Mill Rd, Newark, DE",
    lat: 39.6920,
    lng: -75.7340,
    status: "active",
    time: "14:41",
    units: ["Medic 12", "Engine 5", "PD Unit 44", "PD Unit 51"],
    description:
      "Multi-vehicle accident involving 3 cars. 2 confirmed injuries, one ejection reported. Northbound Rte 896 closed. Extrication equipment requested.",
  },
  {
    id: "inc-003",
    title: "Cardiac Emergency",
    type: "medical",
    address: "85 E Delaware Ave, Newark, DE",
    lat: 39.6812,
    lng: -75.7465,
    status: "active",
    time: "14:55",
    units: ["Medic 6", "Engine 2"],
    description:
      "72yo male, unresponsive. CPR in progress by bystander upon arrival. AED applied. Transport to ChristianaCare in progress.",
  },
  {
    id: "inc-004",
    title: "Gas Leak — Commercial",
    type: "hazmat",
    address: "1200 Elkton Rd, Newark, DE",
    lat: 39.6755,
    lng: -75.7280,
    status: "contained",
    time: "13:18",
    units: ["Hazmat 1", "Engine 6", "Utility 3"],
    description:
      "Natural gas line rupture at strip mall. 50m evacuation perimeter established. Utility crew on scene capping the line. Perimeter holding.",
  },
  {
    id: "inc-005",
    title: "Assault in Progress",
    type: "police",
    address: "Iron Hill Park, Newark, DE",
    lat: 39.6760,
    lng: -75.7620,
    status: "active",
    time: "15:02",
    units: ["PD Unit 12", "PD Unit 33"],
    description:
      "Caller reports large group altercation near the park pavilion. Multiple parties involved, possible weapons. EMS on standby.",
  },
];

export const TYPE_LABELS: Record<IncidentType, string> = {
  fire: "FIRE",
  medical: "MEDICAL",
  police: "POLICE",
  hazmat: "HAZMAT",
  traffic: "TRAFFIC",
};
