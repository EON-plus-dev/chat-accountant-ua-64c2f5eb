/**
 * Tasks Store Hook
 * 
 * Manages tasks state with CRUD operations, localStorage persistence,
 * filtering, and statistics.
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Task, TaskStatus, TaskPriority, TaskSource } from "@/config/tasksConfig";
import { getDemoTasksForCabinet } from "@/config/tasksConfig";

interface UseTasksStoreOptions {
  cabinetId?: string;
  persistToLocalStorage?: boolean;
  initializeWithDemo?: boolean;
}

interface TaskStats {
  total: number;
  open: number;
  inProgress: number;
  done: number;
  cancelled: number;
  overdue: number;
  byPriority: Record<TaskPriority, number>;
}

interface UseTasksStoreReturn {
  tasks: Task[];
  stats: TaskStats;
  isLoading: boolean;
  // CRUD
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  // Quick actions
  completeTask: (taskId: string) => void;
  startTask: (taskId: string) => void;
  cancelTask: (taskId: string) => void;
  reopenTask: (taskId: string) => void;
  // Filtering
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByAssignee: (assigneeId: string) => Task[];
  getTasksByDocument: (documentId: string) => Task[];
  getOverdueTasks: () => Task[];
}

const STORAGE_KEY_PREFIX = "tasks-store-";

export function useTasksStore(options: UseTasksStoreOptions = {}): UseTasksStoreReturn {
  const { 
    cabinetId, 
    persistToLocalStorage = true,
    initializeWithDemo = true,
  } = options;
  
  const storageKey = `${STORAGE_KEY_PREFIX}${cabinetId || "global"}`;
  
  // Initialize state from localStorage or demo data
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (persistToLocalStorage) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.error("[TasksStore] Failed to load from localStorage:", e);
      }
    }
    
    // Initialize with demo data if enabled
    if (initializeWithDemo && cabinetId) {
      return getDemoTasksForCabinet(cabinetId);
    }
    
    return [];
  });
  
  const [isLoading] = useState(false);
  
  // Persist to localStorage when tasks change
  useEffect(() => {
    if (persistToLocalStorage) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(tasks));
      } catch (e) {
        console.error("[TasksStore] Failed to save to localStorage:", e);
      }
    }
  }, [tasks, storageKey, persistToLocalStorage]);
  
  // Filter tasks by cabinet if specified
  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    
    if (cabinetId) {
      result = result.filter(t => t.cabinetId === cabinetId);
    }
    
    // Sort: open first, then by priority, then by date
    return result.sort((a, b) => {
      // Status order: open > in_progress > done > cancelled
      const statusOrder: Record<TaskStatus, number> = { 
        open: 0, 
        in_progress: 1, 
        done: 2, 
        cancelled: 3 
      };
      
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      
      // Priority order: critical > high > medium > low
      const priorityOrder: Record<TaskPriority, number> = { 
        critical: 0, 
        high: 1, 
        medium: 2, 
        low: 3 
      };
      
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      // Date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, cabinetId]);
  
  // Calculate statistics
  const stats = useMemo<TaskStats>(() => {
    const now = new Date();
    
    const byPriority: Record<TaskPriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    
    filteredTasks.forEach(t => {
      byPriority[t.priority]++;
    });
    
    return {
      total: filteredTasks.length,
      open: filteredTasks.filter(t => t.status === "open").length,
      inProgress: filteredTasks.filter(t => t.status === "in_progress").length,
      done: filteredTasks.filter(t => t.status === "done").length,
      cancelled: filteredTasks.filter(t => t.status === "cancelled").length,
      overdue: filteredTasks.filter(t => 
        t.dueDate && 
        new Date(t.dueDate) < now && 
        t.status !== "done" && 
        t.status !== "cancelled"
      ).length,
      byPriority,
    };
  }, [filteredTasks]);
  
  // CRUD Operations
  const addTask = useCallback((taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    
    setTasks(prev => [newTask, ...prev]);
    
    if (import.meta.env.DEV) console.log("[TasksStore] Task added:", newTask.title);
    return newTask;
  }, []);
  
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, ...updates, updatedAt: new Date().toISOString() }
        : t
    ));
    
    console.log("[TasksStore] Task updated:", taskId, updates);
  }, []);
  
  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    console.log("[TasksStore] Task deleted:", taskId);
  }, []);
  
  // Quick Actions
  const completeTask = useCallback((taskId: string) => {
    updateTask(taskId, { 
      status: "done", 
      completedAt: new Date().toISOString() 
    });
  }, [updateTask]);
  
  const startTask = useCallback((taskId: string) => {
    updateTask(taskId, { status: "in_progress" });
  }, [updateTask]);
  
  const cancelTask = useCallback((taskId: string) => {
    updateTask(taskId, { status: "cancelled" });
  }, [updateTask]);
  
  const reopenTask = useCallback((taskId: string) => {
    updateTask(taskId, { 
      status: "open",
      completedAt: undefined,
    });
  }, [updateTask]);
  
  // Filtering helpers
  const getTasksByStatus = useCallback((status: TaskStatus) => {
    return filteredTasks.filter(t => t.status === status);
  }, [filteredTasks]);
  
  const getTasksByAssignee = useCallback((assigneeId: string) => {
    return filteredTasks.filter(t => t.assigneeId === assigneeId);
  }, [filteredTasks]);
  
  const getTasksByDocument = useCallback((documentId: string) => {
    return filteredTasks.filter(t => t.documentId === documentId);
  }, [filteredTasks]);
  
  const getOverdueTasks = useCallback(() => {
    const now = new Date();
    return filteredTasks.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) < now && 
      t.status !== "done" && 
      t.status !== "cancelled"
    );
  }, [filteredTasks]);
  
  return {
    tasks: filteredTasks,
    stats,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    startTask,
    cancelTask,
    reopenTask,
    getTasksByStatus,
    getTasksByAssignee,
    getTasksByDocument,
    getOverdueTasks,
  };
}
