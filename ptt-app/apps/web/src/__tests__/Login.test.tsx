import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";

const mockUser = {
  id: "u1",
  email: "officer@metro.gov",
  role: "OFFICER",
  badgeNumber: null,
  licenseNumber: null,
  createdAt: "2025-01-01T00:00:00.000Z",
  agency: { id: "a1", name: "Metro PD", type: "police" },
};

function mockFetchSuccess() {
  let callCount = 0;
  return vi.fn().mockImplementation(async () => {
    callCount++;
    // First call = login, second call = GET /me
    if (callCount === 1) {
      return {
        ok: true,
        json: async () => ({ token: "mock-jwt-token", user: mockUser }),
      };
    }
    return {
      ok: true,
      json: async () => mockUser,
    };
  });
}

describe("Login flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the login form", () => {
    render(<App />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows dashboard after successful login", async () => {
    global.fetch = mockFetchSuccess();

    render(<App />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "officer@metro.gov" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
  });

  it("shows error on failed login", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Invalid email or password" }),
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "wrong@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });
  });
});
