import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';

// Register WebMCP Tools for Agentic Readiness (Open WebMCP)
if (typeof navigator !== 'undefined' && 'modelContext' in navigator) {
  try {
    const modelContext = (navigator as any).modelContext;
    if (typeof modelContext.provideContext === 'function') {
      modelContext.provideContext({
        name: "arba-pricing-platform",
        description: "Saudi Building Code (SBC) cost estimator and bid balancer tools",
        tools: [
          {
            name: "detect_front_loading",
            description: "Checks BOQ excavation or concrete items for front-loading bid imbalances.",
            parameters: {
              type: "object",
              properties: {
                itemRate: { type: "number", description: "The unit rate proposed by contractor" },
                benchmarkRate: { type: "number", description: "The standard regional index rate" },
                quantity: { type: "number", description: "The quantity of items" }
              },
              required: ["itemRate", "benchmarkRate", "quantity"]
            }
          },
          {
            name: "get_sbc_concrete_requirements",
            description: "Calculate concrete curing parameters and tie-wire weights per SBC 301/304.",
            parameters: {
              type: "object",
              properties: {
                volumeM3: { type: "number", description: "Concrete volume in cubic meters" },
                grade: { type: "string", description: "Concrete grade (e.g. C35, C40)" }
              },
              required: ["volumeM3", "grade"]
            }
          }
        ]
      });
      console.log("🧠 WebMCP context registered successfully for in-browser agents.");
    }
  } catch (e) {
    console.error("Error registering WebMCP context:", e);
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
