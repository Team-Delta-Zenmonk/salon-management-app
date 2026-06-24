import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import type { LatLngExpression, LeafletMouseEvent } from "leaflet";
import { useTheme } from "@mui/material/styles";

export type LatLngValue = {
  lat: number;
  lng: number;
};

type MapPickerProps = {
  value?: LatLngValue | null;
  onChange?: (value: LatLngValue) => void;
  height?: number | string;
  disabled?: boolean;
  flyTo?: LatLngValue | null;
};

function ClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      if (onClick) onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Watches the flyTo prop and animates the map to the new location */
function FlyToHandler({ flyTo }: { flyTo?: LatLngValue | null }) {
  const map = useMap();

  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], 15, { duration: 1.5 });
    }
  }, [flyTo, map]);

  return null;
}

export default function MapPicker({ value, onChange, height = 300, disabled, flyTo }: Readonly<MapPickerProps>) {
  const theme = useTheme();
  const [position, setPosition] = useState<LatLngExpression | null>(
    value ? [value.lat, value.lng] : null
  );

  useEffect(() => {
    if (value) {
      setPosition([value.lat, value.lng]);
    }
  }, [value]);

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
      style={{ height, width: "100%", borderRadius: theme.shape.borderRadius, overflow: "hidden" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <ClickHandler onClick={handleSelect} />
      <FlyToHandler flyTo={flyTo} />

      {position && <Marker position={position} />}
    </MapContainer>
  );
}
