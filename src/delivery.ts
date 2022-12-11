import countries from "./data/countries_by_coords.json";

interface Country {
  country: string;
  north: number | null;
  south: number | null;
  east: number | null;
  west: number | null;
}

// Our pigeons travel fast!
const SPEED = 10_000;
const EARTH_RADIUS = 6371;

export function getCountdownString(deliveryTime: Date): string {
  const diff = deliveryTime.getTime() - new Date().getTime();

  if (diff < 0) {
    return "0h 0m 0s";
  }

  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return `${hours}h ${minutes}m ${seconds}s`;
}

export function calculateDeliveryTime(
  sender: string,
  recipient: string
): number {
  const senderCoords = countries.find(
    (country) => country.country === sender
  ) as Country;
  const recipientCoords = countries.find(
    (country) => country.country === recipient
  ) as Country;

  return calculateDistance(senderCoords, recipientCoords) / SPEED;
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function calculateDistance(
  senderCoords: Country,
  recipientCoords: Country
): number {
  if (
    senderCoords.east === null ||
    senderCoords.west === null ||
    senderCoords.north === null ||
    senderCoords.south === null
  ) {
    return 1000;
  }

  if (
    recipientCoords.east === null ||
    recipientCoords.west === null ||
    recipientCoords.north === null ||
    recipientCoords.south === null
  ) {
    return 1000;
  }

  let lat1 = (senderCoords.north + senderCoords.south) / 2;
  const lon1 = (senderCoords.east + senderCoords.west) / 2;
  let lat2 = (recipientCoords.north + recipientCoords.south) / 2;
  const lon2 = (recipientCoords.east + recipientCoords.west) / 2;

  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.max(1000, EARTH_RADIUS * c);
}
