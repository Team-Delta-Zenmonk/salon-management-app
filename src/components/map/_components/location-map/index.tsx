import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type { LatLngExpression, LeafletMouseEvent } from "leaflet";

export type LatLngValue = {
  lat: number;
  lng: number;
};

type MapPickerProps = {
  value?: LatLngValue | null;
  onChange?: (value: LatLngValue) => void;
  height?: number | string;
  disabled?: boolean;
};

function ClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      if (onClick) onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ value, onChange, height = 300, disabled }: Readonly<MapPickerProps>) {
  const [position, setPosition] = useState<LatLngExpression | null>(
    value ? [value.lat, value.lng] : null
  );

  const handleSelect = (lat: number, lng: number) => {
    if (disabled) return;

    const newPos = { lat, lng };
    setPosition([lat, lng]);
    onChange?.(newPos);
  };

  const center: LatLngExpression = position ?? [28.6139, 77.209];

  return (
    <MapContainer
      center={center}
      zoom={position ? 15 : 11}
      style={{ height, width: "100%", borderRadius: 8, overflow: "hidden" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <ClickHandler onClick={handleSelect} />

      {position && <Marker position={position} />}
    </MapContainer>
  );
}
