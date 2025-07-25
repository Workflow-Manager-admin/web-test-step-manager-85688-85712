import React, { useState, useEffect, useCallback } from "react";
import {
  fetchSuites,
  createSuite,
  updateSuite,
  deleteSuite,
  getSuite,
  fetchTestSteps,
  createTestStep,
  getTestStep,
  updateTestStep,
  deleteTestStep,
} from "../api";
import "./Dashboard.css";

// Util for deep copy
const DEEP_CLONE = (o) => JSON.parse(JSON.stringify(o));

// Suite Dialog component
function SuiteDialog({ open, mode, suite, onSave, onClose }) {
  const [name, setName] = useState(suite?.name || "");
  const [description, setDescription] = useState(suite?.description || "");

  useEffect(() => {
    if (open) {
      setName(suite?.name || "");
      setDescription(suite?.description || "");
    }
  }, [open, suite]);

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog">
        <h3>{mode === "edit" ? "Edit Suite" : "New Suite"}</h3>
        <input
          className="input"
          placeholder="Suite name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="input"
          rows={3}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div style={{ marginTop: 14, display: "flex", gap: "9px" }}>
          <button
            className="btn-primary"
            onClick={() =>
              onSave({ name: name.trim(), description: description.trim() })
            }
            disabled={!name.trim()}
          >
            Save
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Step Dialog (Create/Edit)
function StepDialog({ open, mode, step, suiteOptions, onSave, onClose }) {
  const [title, setTitle] = useState(step?.title || "");
  const [description, setDescription] = useState(step?.description || "");
  const [suiteId, setSuiteId] = useState(step?.suite_id || suiteOptions[0]?.id || "");

  useEffect(() => {
    if (open) {
      setTitle(step?.title || "");
      setDescription(step?.description || "");
      setSuiteId(step?.suite_id || suiteOptions[0]?.id || "");
    }
  }, [open, step, suiteOptions]);

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog">
        <h3>{mode === "edit" ? "Edit Step" : "New Step"}</h3>
        <input
          className="input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="input"
          rows={3}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          className="input"
          value={suiteId}
          onChange={(e) => setSuiteId(Number(e.target.value))}
        >
          {suiteOptions.map((suite) => (
            <option key={suite.id} value={suite.id}>
              {suite.name}
            </option>
          ))}
        </select>
        <div style={{ marginTop: 14, display: "flex", gap: "9px" }}>
          <button
            className="btn-primary"
            onClick={() =>
              onSave({
                title: title.trim(),
                description: description.trim(),
                suite_id: suiteId,
              })
            }
            disabled={!title.trim() || !suiteId}
          >
            Save
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Confirm Dialog
function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-dialog">
        <p style={{ marginBottom: 16, fontWeight: 500 }}>{message}</p>
        <div style={{ display: "flex", gap: "13px" }}>
          <button className="btn-accent" onClick={onConfirm}>Confirm</button>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Step List Table
function TestStepTable({ steps, onEdit, onDelete }) {
  return (
    <table className="step-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Suite</th>
          <th>Order</th>
          <th style={{ textAlign: "center" }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {steps.map((step) => (
          <tr key={step.id}>
            <td>{step.title}</td>
            <td>{step.description}</td>
            <td>{step.suite_name || step.suite_id}</td>
            <td>{step.order !== undefined ? step.order : ""}</td>
            <td style={{ textAlign: "center" }}>
              <button
                className="btn-secondary btn-xs"
                onClick={() => onEdit(step)}
              >
                Edit
              </button>
              <button
                className="btn-accent btn-xs"
                onClick={() => onDelete(step)}
                style={{ marginLeft: 8 }}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
        {steps.length === 0 && (
          <tr>
            <td colSpan={5} style={{ textAlign: "center", color: "#aaa" }}>
              No test steps found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

// Suite Mini controls
function SuitePanel({ suite, onEdit, onDelete }) {
  if (!suite) return null;
  return (
    <div className="suite-panel">
      <div className="suite-title">
        <span>{suite.name}</span>
        <div style={{ display: "flex", gap: 7 }}>
          <button className="btn-secondary btn-xs" onClick={onEdit}>
            Edit
          </button>
          <button className="btn-accent btn-xs" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
      {suite.description && (
        <div className="suite-desc">{suite.description}</div>
      )}
    </div>
  );
}

// --- Dashboard Main ---
export default function Dashboard() {
  // State
  const [suites, setSuites] = useState([]);
  const [currentSuite, setCurrentSuite] = useState(null);
  const [steps, setSteps] = useState([]);
  const [search, setSearch] = useState("");
  const [suiteDialog, setSuiteDialog] = useState({ open: false, mode: "new", suite: null });
  const [stepDialog, setStepDialog] = useState({ open: false, mode: "new", step: null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, onConfirm: null, message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load suites
  useEffect(() => {
    async function fetchData() {
      setError("");
      try {
        const suitesRes = await fetchSuites();
        setSuites(Array.isArray(suitesRes) ? suitesRes : []);
        if (!currentSuite && suitesRes.length) {
          setCurrentSuite(suitesRes[0]);
        }
      } catch (e) {
        setError("Failed to fetch suites");
      }
    }
    fetchData();
  }, []);

  // Load steps when suite or search changes
  useEffect(() => {
    async function loadSteps() {
      if (!currentSuite) { setSteps([]); return; }
      setLoading(true);
      setError("");
      try {
        const stepsRes = await fetchTestSteps({
          suiteId: currentSuite.id,
          q: search,
          order: "",
        });
        setSteps(Array.isArray(stepsRes) ? stepsRes : []);
      } catch (e) {
        setError("Failed to load test steps");
        setSteps([]);
      }
      setLoading(false);
    }
    loadSteps();
  }, [currentSuite, search]);

  // Suite CRUD
  const handleAddSuite = () => setSuiteDialog({ open: true, mode: "new", suite: null });
  const handleEditSuite = () => setSuiteDialog({ open: true, mode: "edit", suite: currentSuite });
  const handleDeleteSuite = () => setConfirmDialog({
    open: true,
    message: "Delete this suite and ALL its test steps?",
    onConfirm: async () => {
      try {
        await deleteSuite(currentSuite.id);
        setSuites(suites.filter(s => s.id !== currentSuite.id));
        setCurrentSuite(null);
        setConfirmDialog({ ...confirmDialog, open: false });
      } catch {
        setError("Delete failed");
        setConfirmDialog({ ...confirmDialog, open: false });
      }
    }
  });

  const handleSuiteDialogSave = async (data) => {
    try {
      if (suiteDialog.mode === "new") {
        const created = await createSuite(data);
        setSuites(prev => [...prev, created]);
        setCurrentSuite(created);
      } else {
        const updated = await updateSuite(currentSuite.id, data);
        setSuites(
          suites.map((s) => (s.id === currentSuite.id ? { ...s, ...updated } : s))
        );
        setCurrentSuite({ ...currentSuite, ...updated });
      }
      setSuiteDialog({ ...suiteDialog, open: false });
    } catch {
      setError("Suite save failed");
    }
  };

  // Step CRUD
  const handleAddStep = () => setStepDialog({ open: true, mode: "new", step: null });
  const handleEditStep = (step) => setStepDialog({ open: true, mode: "edit", step });
  const handleDeleteStep = (step) =>
    setConfirmDialog({
      open: true,
      message: "Delete this test step?",
      onConfirm: async () => {
        try {
          await deleteTestStep(step.id);
          setSteps(steps.filter((s) => s.id !== step.id));
          setConfirmDialog({ ...confirmDialog, open: false });
        } catch {
          setError("Delete failed");
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });

  const handleStepDialogSave = async (data) => {
    try {
      if (stepDialog.mode === "new") {
        const created = await createTestStep({ ...data });
        setSteps((prev) => [...prev, created]);
      } else {
        const updated = await updateTestStep(stepDialog.step.id, {
          ...data,
        });
        setSteps(
          steps.map((s) =>
            s.id === stepDialog.step.id ? { ...s, ...updated } : s
          )
        );
      }
      setStepDialog({ ...stepDialog, open: false });
    } catch {
      setError("Step save failed");
    }
  };

  // UI utility
  const suiteOptions = suites.map(s => ({ id: s.id, name: s.name }));

  // --- Render ---
  return (
    <main className="dashboard-main">
      <div className="dashboard-header">
        <h2>
          {currentSuite ? currentSuite.name : "No Suite"}
          {currentSuite && (
            <span className="suite-edit-btns">
              <button className="btn-secondary btn-xs" onClick={handleEditSuite}>Edit</button>
              <button className="btn-accent btn-xs" onClick={handleDeleteSuite}>Delete</button>
            </span>
          )}
        </h2>
        <div>
          <input
            className="input search-input"
            placeholder="Search test steps..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search test steps"
            style={{ width: 220, marginRight: 16 }}
          />
          <button className="btn-primary" onClick={handleAddStep} disabled={!currentSuite}>
            + Add Step
          </button>
        </div>
      </div>
      <div style={{ margin: "8px 0" }}>
        <SuitePanel
          suite={currentSuite}
          onEdit={handleEditSuite}
          onDelete={handleDeleteSuite}
        />
      </div>
      {error && (
        <div className="error-msg">{error}</div>
      )}
      {loading ? (
        <div style={{ padding: 20, color: "#aaa" }}>Loading...</div>
      ) : (
        <TestStepTable
          steps={steps.map(s =>
            suites.length
              ? { ...s, suite_name: (suites.find(su => su.id === s.suite_id) || {}).name }
              : s
          )}
          onEdit={handleEditStep}
          onDelete={handleDeleteStep}
        />
      )}

      {/* Dialogs */}
      <SuiteDialog
        open={suiteDialog.open}
        mode={suiteDialog.mode}
        suite={suiteDialog.suite}
        onSave={handleSuiteDialogSave}
        onClose={() => setSuiteDialog({ ...suiteDialog, open: false })}
      />
      <StepDialog
        open={stepDialog.open}
        mode={stepDialog.mode}
        step={stepDialog.step}
        suiteOptions={suiteOptions}
        onSave={handleStepDialogSave}
        onClose={() => setStepDialog({ ...stepDialog, open: false })}
      />
      <ConfirmDialog
        open={confirmDialog.open}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
      />
    </main>
  );
}
