/**
 * USE NOMENCLATURE RESERVATION HOOK
 * 
 * Управління резервуванням товарів при створенні документів
 * Mock-реалізація для демонстрації
 */

import { useState, useCallback, useMemo } from "react";
import type { Reservation, ReservationStatus } from "@/config/nomenclatureConfig";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

export interface ReservationRequest {
  itemId: string;
  itemName: string;
  quantity: number;
  documentId: string;
  documentType: string;
  documentNumber?: string;
  expiresAt?: string;
}

export interface UseNomenclatureReservationReturn {
  reservations: Reservation[];
  isLoading: boolean;
  reserve: (request: ReservationRequest) => Promise<Reservation>;
  release: (reservationId: string, reason?: string) => Promise<void>;
  releaseByDocument: (documentId: string) => Promise<void>;
  checkAvailability: (itemId: string, quantity: number, currentStock: number) => boolean;
  getReservationsForItem: (itemId: string) => Reservation[];
  getReservationsForDocument: (documentId: string) => Reservation[];
  getTotalReservedForItem: (itemId: string) => number;
}

// ============================================
// MOCK STORAGE
// ============================================

// In-memory storage for demo purposes
const reservationsCache = new Map<string, Reservation[]>();

const generateId = () => `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useNomenclatureReservation(cabinetId: string): UseNomenclatureReservationReturn {
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    return reservationsCache.get(cabinetId) || [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync with cache
  const updateReservations = useCallback((newReservations: Reservation[]) => {
    setReservations(newReservations);
    reservationsCache.set(cabinetId, newReservations);
  }, [cabinetId]);

  // Check if item is available for reservation
  const checkAvailability = useCallback((
    itemId: string,
    quantity: number,
    currentStock: number
  ): boolean => {
    const existingReserved = reservations
      .filter(r => r.itemId === itemId && r.status === "active")
      .reduce((sum, r) => sum + r.quantity, 0);
    
    return (currentStock - existingReserved) >= quantity;
  }, [reservations]);

  // Get total reserved for an item
  const getTotalReservedForItem = useCallback((itemId: string): number => {
    return reservations
      .filter(r => r.itemId === itemId && r.status === "active")
      .reduce((sum, r) => sum + r.quantity, 0);
  }, [reservations]);

  // Get reservations for a specific item
  const getReservationsForItem = useCallback((itemId: string): Reservation[] => {
    return reservations.filter(r => r.itemId === itemId && r.status === "active");
  }, [reservations]);

  // Get reservations for a specific document
  const getReservationsForDocument = useCallback((documentId: string): Reservation[] => {
    return reservations.filter(r => r.documentId === documentId && r.status === "active");
  }, [reservations]);

  // Create a new reservation
  const reserve = useCallback(async (request: ReservationRequest): Promise<Reservation> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    const newReservation: Reservation = {
      id: generateId(),
      itemId: request.itemId,
      itemName: request.itemName,
      quantity: request.quantity,
      documentId: request.documentId,
      documentType: request.documentType,
      documentNumber: request.documentNumber,
      createdAt: new Date().toISOString(),
      expiresAt: request.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h default
      status: "active",
    };

    const newReservations = [...reservations, newReservation];
    updateReservations(newReservations);
    
    setIsLoading(false);
    
    toast.success("Товар заброньовано", {
      description: `${request.itemName}: ${request.quantity} шт`,
    });

    return newReservation;
  }, [reservations, updateReservations]);

  // Release a specific reservation
  const release = useCallback(async (reservationId: string, reason?: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));

    const reservation = reservations.find(r => r.id === reservationId);
    
    const newReservations = reservations.map(r => {
      if (r.id === reservationId) {
        return {
          ...r,
          status: "released" as ReservationStatus,
          releasedAt: new Date().toISOString(),
          releasedReason: reason,
        };
      }
      return r;
    });

    updateReservations(newReservations);
    setIsLoading(false);

    if (reservation) {
      toast.info("Резерв знято", {
        description: `${reservation.itemName}: ${reservation.quantity} шт`,
      });
    }
  }, [reservations, updateReservations]);

  // Release all reservations for a document
  const releaseByDocument = useCallback(async (documentId: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const documentReservations = reservations.filter(
      r => r.documentId === documentId && r.status === "active"
    );

    if (documentReservations.length === 0) {
      setIsLoading(false);
      return;
    }

    const newReservations = reservations.map(r => {
      if (r.documentId === documentId && r.status === "active") {
        return {
          ...r,
          status: "released" as ReservationStatus,
          releasedAt: new Date().toISOString(),
          releasedReason: "Документ скасовано",
        };
      }
      return r;
    });

    updateReservations(newReservations);
    setIsLoading(false);

    toast.info("Резерви за документом знято", {
      description: `Звільнено ${documentReservations.length} позицій`,
    });
  }, [reservations, updateReservations]);

  return {
    reservations,
    isLoading,
    reserve,
    release,
    releaseByDocument,
    checkAvailability,
    getReservationsForItem,
    getReservationsForDocument,
    getTotalReservedForItem,
  };
}

// ============================================
// DEMO DATA GENERATOR
// ============================================

export const generateDemoReservations = (cabinetId: string): Reservation[] => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return [
    {
      id: "res-demo-001",
      itemId: "nom-deal-001",
      itemName: "Модель X1 Premium",
      quantity: 2,
      documentId: "doc-001",
      documentType: "invoice",
      documentNumber: "ВИД-2025-001",
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      expiresAt: tomorrow.toISOString(),
      status: "active",
    },
    {
      id: "res-demo-002",
      itemId: "nom-deal-003",
      itemName: "Аксесуар Pro",
      quantity: 5,
      documentId: "doc-002",
      documentType: "order",
      documentNumber: "ЗАМ-2025-015",
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      expiresAt: tomorrow.toISOString(),
      status: "active",
    },
  ];
};
