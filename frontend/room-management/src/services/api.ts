import type { Room, RoomWithBookings, Patient, Booking, DashboardStats, User } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiService {
  private token: string | null = localStorage.getItem("room_harmony_token");

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("room_harmony_token", token);
    } else {
      localStorage.removeItem("room_harmony_token");
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data.data !== undefined ? data.data : data;
    } catch (error: any) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  // Dashboard Stats
  async getDashboardStats(date?: string): Promise<DashboardStats> {
    const query = date ? `?date=${encodeURIComponent(date)}` : "";
    return this.request<DashboardStats>(`/dashboard/stats${query}`);
  }

  // Rooms
  async getRooms(params?: { ward?: string; floor?: number }): Promise<Room[]> {
    const query = new URLSearchParams();
    if (params?.ward) query.append("ward", params.ward);
    if (params?.floor !== undefined) query.append("floor", params.floor.toString());
    const qStr = query.toString() ? `?${query.toString()}` : "";
    return this.request<Room[]>(`/rooms${qStr}`);
  }

  async getRoomById(id: string): Promise<RoomWithBookings> {
    return this.request<RoomWithBookings>(`/rooms/${id}`);
  }

  async createRoom(room: {
    roomNumber: string;
    ward: string;
    floor: number;
    bedCount: number;
    dailyRate: number;
    amenities?: string[];
  }): Promise<Room> {
    return this.request<Room>("/rooms", {
      method: "POST",
      body: JSON.stringify(room),
    });
  }

  async updateRoom(id: string, room: Partial<Room>): Promise<Room> {
    return this.request<Room>(`/rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(room),
    });
  }

  async setRoomMaintenance(id: string, isUnderMaintenance: boolean): Promise<Room> {
    return this.request<Room>(`/rooms/${id}/maintenance`, {
      method: "PATCH",
      body: JSON.stringify({ isUnderMaintenance }),
    });
  }

  async deleteRoom(id: string): Promise<void> {
    await this.request(`/rooms/${id}`, { method: "DELETE" });
  }

  // Bookings
  async getBookings(params?: { status?: string; roomId?: string; patientId?: string }): Promise<Booking[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.roomId) query.append("roomId", params.roomId);
    if (params?.patientId) query.append("patientId", params.patientId);
    const qStr = query.toString() ? `?${query.toString()}` : "";
    return this.request<Booking[]>(`/bookings${qStr}`);
  }

  async getTimeline(startDate?: string, endDate?: string): Promise<Booking[]> {
    const query = new URLSearchParams();
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);
    return this.request<Booking[]>(`/bookings/timeline?${query.toString()}`);
  }

  async createBooking(booking: {
    patientId: string;
    roomId: string;
    admissionDate: string;
    expectedDischargeDate: string;
  }): Promise<Booking> {
    return this.request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(booking),
    });
  }

  async directAdmitPatient(payload: {
    patient: {
      name: string;
      age: number;
      gender: string;
      phone: string;
      address: string;
      ailment?: string;
      notes?: string;
    };
    roomId: string;
    admissionDate: string;
    expectedDischargeDate: string;
  }): Promise<{ booking: Booking; patientId: string }> {
    return this.request<{ booking: Booking; patientId: string }>("/bookings/direct-admit", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async dischargePatient(bookingId: string, actualDischargeDate: string): Promise<Booking> {
    return this.request<Booking>(`/bookings/${bookingId}/discharge`, {
      method: "POST",
      body: JSON.stringify({ actualDischargeDate }),
    });
  }

  async cancelBooking(bookingId: string): Promise<Booking> {
    return this.request<Booking>(`/bookings/${bookingId}/cancel`, {
      method: "POST",
    });
  }

  // Patients
  async getPatients(search?: string): Promise<Patient[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return this.request<Patient[]>(`/patients${query}`);
  }

  async getPatientById(id: string): Promise<Patient> {
    return this.request<Patient>(`/patients/${id}`);
  }

  async createPatient(patient: Omit<Patient, "id" | "createdAt" | "updatedAt">): Promise<Patient> {
    return this.request<Patient>("/patients", {
      method: "POST",
      body: JSON.stringify(patient),
    });
  }

  async deletePatient(id: string): Promise<void> {
    await this.request(`/patients/${id}`, { method: "DELETE" });
  }

  // Users (Admin)
  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/users");
  }

  async updateUserAllowance(id: string, isAllowed: boolean): Promise<User> {
    return this.request<User>(`/users/${id}/allow`, {
      method: "PUT",
      body: JSON.stringify({ isAllowed }),
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.request(`/users/${id}`, { method: "DELETE" });
  }
}

export const api = new ApiService();
