import "@testing-library/jest-dom/vitest";

// MapLibre GL requires WebGL and createObjectURL which jsdom doesn't provide.
// Mock it so components that import MapView don't crash the test suite.
vi.mock("maplibre-gl", () => {
  const mapInstance = {
    addControl: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    on: vi.fn(),
    remove: vi.fn(),
    flyTo: vi.fn(),
  };
  return {
    default: {
      Map: vi.fn(() => mapInstance),
      NavigationControl: vi.fn(),
      Marker: vi.fn(() => ({
        setLngLat: vi.fn().mockReturnThis(),
        addTo: vi.fn().mockReturnThis(),
      })),
    },
  };
});
