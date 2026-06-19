import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { mountCmsBridge } from "./lib/cmsBridge";

mountCmsBridge();

if (import.meta.env.DEV) console.log("[Main] Script started loading");

// Check localStorage availability
let storageAvailable = false;
try {
  localStorage.setItem('__test__', 'test');
  localStorage.removeItem('__test__');
  storageAvailable = true;
  if (import.meta.env.DEV) console.log("[Main] localStorage is available");
} catch (e) {
  console.warn("[Main] localStorage is NOT available:", e);
}

// Check if running in iframe
const isIframe = window.self !== window.top;
if (import.meta.env.DEV) console.log("[Main] Running in iframe:", isIframe);

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("[ErrorBoundary] Caught error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Error details:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      
      // Production: show generic user-friendly message
      if (!isDev) {
        return (
          <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ color: '#dc2626', marginBottom: 16 }}>Щось пішло не так</h1>
            <p style={{ color: '#6b7280', marginBottom: 16 }}>
              Виникла несподівана помилка. Будь ласка, оновіть сторінку або спробуйте пізніше.
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Оновити сторінку
            </button>
          </div>
        );
      }
      
      // Development: show detailed error info
      return (
        <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ color: '#dc2626', marginBottom: 16 }}>Помилка завантаження (DEV)</h1>
          <p style={{ marginBottom: 8 }}><strong>Повідомлення:</strong></p>
          <pre style={{ 
            background: '#fef2f2', 
            padding: 12, 
            borderRadius: 8, 
            overflow: 'auto',
            fontSize: 14,
            color: '#991b1b'
          }}>
            {this.state.error?.message}
          </pre>
          {this.state.error?.stack && (
            <>
              <p style={{ marginTop: 16, marginBottom: 8 }}><strong>Stack trace:</strong></p>
              <pre style={{ 
                background: '#f3f4f6', 
                padding: 12, 
                borderRadius: 8, 
                overflow: 'auto',
                fontSize: 12,
                color: '#374151'
              }}>
                {this.state.error.stack}
              </pre>
            </>
          )}
          <p style={{ marginTop: 16, color: '#6b7280', fontSize: 14 }}>
            localStorage available: {storageAvailable ? 'Yes' : 'No'} | 
            iframe: {isIframe ? 'Yes' : 'No'}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

if (import.meta.env.DEV) console.log("[Main] About to render App");

try {
  const rootElement = document.getElementById("root");
  if (import.meta.env.DEV) console.log("[Main] Root element found:", !!rootElement);
  
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    if (import.meta.env.DEV) console.log("[Main] App rendered successfully");
  } else {
    console.error("[Main] Root element not found!");
  }
} catch (e) {
  console.error("[Main] Error during render:", e);
}
