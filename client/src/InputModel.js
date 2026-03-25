 import { useState, useEffect } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root"); // accessibility

export default function InputModal({ isOpen, onClose, onSubmit, fields }) {
  // Initialize form state, using default values if provided
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const initialData = fields.reduce((acc, f) => {
      acc[f.name] = f.default || "";
      return acc;
    }, {});
    setFormData(initialData);
  }, [fields]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Input Modal"
      style={{
        overlay: { backgroundColor: "rgba(0,0,0,0.5)" },
        content: {
          maxWidth: "400px",
          margin: "auto",
          padding: "20px",
          borderRadius: "8px",
        },
      }}
    >
      <h2 style={{ marginBottom: "15px" }}>Enter Details</h2>
      {fields.map((f) => (
        <div key={f.name} style={{ marginBottom: 10 }}>
          <label style={{ display: "block", marginBottom: 5 }}>{f.label}</label>
          <input
            type="text"
            name={f.name}
            value={formData[f.name]}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
          />
        </div>
      ))}
      <div style={{ marginTop: 15 }}>
        <button onClick={handleSubmit} style={{ padding: "8px 16px" }}>Submit</button>
        <button onClick={onClose} style={{ padding: "8px 16px", marginLeft: 10 }}>Cancel</button>
      </div>
    </Modal>
  );
}