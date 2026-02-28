import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { latLngToCell, gridDisk, cellToBoundary } from "h3-js";
import type { Feature, FeatureCollection, Polygon } from "geojson";

const DEFAULT_CENTER: [number, number] = [-98.5795, 39.8283];
const DEFAULT_ZOOM = 5;
const LOCATED_ZOOM = 13;
const H3_RESOLUTION = 8;
const GRID_DISK_RADIUS = 5;

interface HexProperties {
  h3Index: string;
  signalStrength: number;
}

const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

function generateHexGeoJSON(
  lat: number,
  lng: number
): FeatureCollection<Polygon, HexProperties> {
  const centerCell = latLngToCell(lat, lng, H3_RESOLUTION);
  const disk = gridDisk(centerCell, GRID_DISK_RADIUS);

  const features: Feature<Polygon, HexProperties>[] = disk.map((h3Index) => {
    const boundary = cellToBoundary(h3Index);

    // cellToBoundary returns [lat, lng][] — GeoJSON needs [lng, lat][]
    const coordinates = boundary.map(
      ([cellLat, cellLng]) => [cellLng, cellLat] as [number, number]
    );
    // Close the polygon ring
    coordinates.push(coordinates[0]);

    return {
      type: "Feature" as const,
      properties: {
        h3Index,
        signalStrength: Math.round(Math.random() * 100),
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: [coordinates],
      },
    };
  });

  return {
    type: "FeatureCollection" as const,
    features,
  };
}

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    function addHexLayer(lat: number, lng: number) {
      const geojson = generateHexGeoJSON(lat, lng);

      map.addSource("hex-grid", {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: "hex-fill",
        type: "fill",
        source: "hex-grid",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "signalStrength"],
            0,
            "#ef4444",
            50,
            "#eab308",
            100,
            "#22c55e",
          ],
          "fill-opacity": 0.4,
        },
      });

      map.addLayer({
        id: "hex-outline",
        type: "line",
        source: "hex-grid",
        paint: {
          "line-color": "#ffffff",
          "line-width": 0.5,
          "line-opacity": 0.3,
        },
      });
    }

    function addUserMarker(lat: number, lng: number) {
      new maplibregl.Marker({ color: "#3b82f6" })
        .setLngLat([lng, lat])
        .addTo(map);
    }

    map.on("load", () => {
      if (!navigator.geolocation) {
        setGeoError("Geolocation is not supported by your browser.");
        addHexLayer(DEFAULT_CENTER[1], DEFAULT_CENTER[0]);
        addUserMarker(DEFAULT_CENTER[1], DEFAULT_CENTER[0]);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          map.flyTo({
            center: [longitude, latitude],
            zoom: LOCATED_ZOOM,
          });

          addHexLayer(latitude, longitude);
          addUserMarker(latitude, longitude);
        },
        (err) => {
          setGeoError(`Location access denied: ${err.message}. Showing default location.`);
          addHexLayer(DEFAULT_CENTER[1], DEFAULT_CENTER[0]);
          addUserMarker(DEFAULT_CENTER[1], DEFAULT_CENTER[0]);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "60vh" }}>
      {geoError && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            right: 8,
            zIndex: 10,
            background: "rgba(239, 68, 68, 0.9)",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "0.8rem",
          }}
        >
          {geoError}
        </div>
      )}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
