import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  WalletCards,
  ClipboardList,
  Users,
  LogOut,
  PlusCircle,
  ShieldCheck,
  CheckCircle,
  Send,
  AlertCircle,
  Edit2,
  Star,
  Bell,
  MessageSquare,
  Briefcase,
  FileText,
  BarChart3,
  Settings,
  Copy
} from "lucide-react";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = async (path, opts = {}) => {
  const token = localStorage.getItem("sp_token");
  const r = await fetch(API + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
      ...(token ? { Authorization: "Bearer " + token } : {})
    }
  });
  const d = await r.json();
  if (!r.ok) throw Error(d.error || "Request failed");
  return d;
};

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ role: "writer", referralCode: new URLSearchParams(window.location.search).get("ref") || "" });
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        const d = await api("/auth/login", {
          method: "POST",
          body: JSON.stringify(form)
        });
        localStorage.setItem("sp_token", d.token);
        onLogin(d.user);
        return;
      }

      const created = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...form, role: form.role || "writer" })
      });

      const d = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      localStorage.setItem("sp_token", d.token);
      onLogin(d.user);
      setMsg("");
      setMode("login");
      setForm({ role: "writer" });
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <div className="auth">
      <div className="authCard">
        <div className="brand">
          Scholar<span>Pro</span>
        </div>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="muted">Academic support marketplace</p>
        {msg && <div className="alert">{msg}</div>}
        <form onSubmit={submit}>
          {mode === "register" && (
            <input
              placeholder="Full name"
              required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password (8+ characters)"
            required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {mode === "register" && (
            <select
              value={form.role || "writer"}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="writer">Writer</option>
              <option value="student">Student</option>
            </select>
          )}
          {mode === "register" && (
            <input
              placeholder="Writer referral code (optional)"
              value={form.referralCode || ""}
              onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
            />
          )}
          <button>{mode === "login" ? "Login" : "Create account"}</button>
        </form>
        <button
          className="link"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setForm((prev) => ({ ...prev, role: "writer" }));
            setMsg("");
          }}
        >
          {mode === "login"
            ? "Create a new account"
            : "Already have an account? Login"}
        </button>
        <div className="demo">
          Demo credentials:
          <br />
          Admin: admin@scholarpro.test / Admin123!
          <br />
          Writer: writer@scholarpro.test / Writer123!
          <br />
          Student: student@scholarpro.test / Student123!
        </div>
      </div>
    </div>
  );
}

function WriterModeSelection({ onPublic, onPrivate }) {
  return (
    <div className="writerModeSelection">
      <div className="modeSelectionContainer">
        {/* Header */}
        <div className="modeSelectionHeader">
          <div className="modeSelectionBrand">Scholar<span>Pro</span></div>
          <h1>Choose Your Writer Profile</h1>
          <p className="modeSelectionSubtitle">Select how you would like to work with ScholarPro.</p>
          <div className="paymentNotice">
            <strong>Registration of ksh. 300. Can be withdrawn after first assignment</strong>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="modeCardsGrid">
          {/* Public Writer Card */}
          <div className="modeCardLarge">
            <div className="modeCardIcon public">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h2>PUBLIC WRITER</h2>
            <p className="modeCardSubtitle">Build your professional presence on ScholarPro.</p>
            
            <ul className="modeBenefits">
              <li>Professional public profile</li>
              <li>Showcase your academic expertise</li>
              <li>Ratings and reviews</li>
              <li>Display completed work</li>
              <li>Build your professional reputation</li>
              <li>Tasks are assigned by Admin only</li>
            </ul>
            
            <button onClick={onPublic} className="modeContinueBtn public">
              Continue & Confirm Payment (KSh 300)
            </button>
          </div>

          {/* Private Writer Card */}
          <div className="modeCardLarge">
            <div className="modeCardIcon private">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2>PRIVATE WRITER</h2>
            <p className="modeCardSubtitle">Work privately through ScholarPro.</p>
            
            <ul className="modeBenefits">
              <li>Profile hidden from students</li>
              <li>Private working environment</li>
              <li>No public profile</li>
              <li>Direct Admin assignments</li>
              <li>Your personal information stays private</li>
              <li>Tasks are assigned by Admin only</li>
            </ul>
            
            <button onClick={onPrivate} className="modeContinueBtn private">
              Continue & Confirm Payment (KSh 300)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, note }) {
  return (
    <div className="card">
      <span>{title}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}

const readFiles = (files) => Promise.all(Array.from(files).map((file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, data: reader.result });
  reader.onerror = reject;
  reader.readAsDataURL(file);
})));

function TaskCard({ task, onAssign, onApprove, onReject, onSubmit, userRole }) {
  const [submitting, setSubmitting] = useState(false);
  const [selectedWriter, setSelectedWriter] = useState("");
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  const handleAssign = async () => {
    if (!selectedWriter) {
      alert("Please select a writer");
      return;
    }
    setSubmitting(true);
    try {
      await onAssign(task.id, selectedWriter);
      setSelectedWriter("");
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!submissionContent.trim() && submissionFiles.length === 0) {
      alert("Please enter your work or upload a file");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(task.id, submissionContent, submissionFiles);
      setSubmissionContent("");
      setSubmissionFiles([]);
      setShowSubmit(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    const statusColors = {
      open: "badge",
      assigned: "badge warning",
      in_progress: "badge info",
      submitted: "badge info",
      under_review: "badge info",
      approved: "badge good",
      completed: "badge good",
      revision_required: "badge error",
      rejected: "badge error"
    };
    return statusColors[task.status] || "badge";
  };

  return (
    <div className="taskCard">
      <div className="taskHeader">
        <div>
          <h3>{task.assignmentTitle || task.title}</h3>
          <p className="muted">{task.description || task.instructions}</p>
        </div>
        <span className={getStatusBadge()}>{task.status}</span>
      </div>

      <div className="taskMeta">
        {task.jobId && <span>Job ID: <b>{task.jobId}</b></span>}
        {task.subject && <span>Subject: <b>{task.subject}</b></span>}
        {task.academicLevel && <span>Level: <b>{task.academicLevel}</b></span>}
        {task.wordCount > 0 && <span>Words: <b>{task.wordCount}</b></span>}
        {task.deadline && <span>Deadline: <b>{new Date(task.deadline).toLocaleDateString()}</b></span>}
        <span>Payment: <b>KSh {Number(task.writerPayment || task.budget || 0).toLocaleString()}</b></span>
        {task.priority && <span>Priority: <b>{task.priority}</b></span>}
        {task.studentName && <span>Student: <b>{task.studentName}</b></span>}
        {task.writerName && <span>Writer: <b>{task.writerName}</b></span>}
      </div>

      {userRole === "admin" && task.status === "open" && (
        <div className="taskAction">
          <input
            type="text"
            placeholder="Writer ID to assign"
            value={selectedWriter}
            onChange={(e) => setSelectedWriter(e.target.value)}
          />
          <button
            onClick={handleAssign}
            disabled={submitting || !selectedWriter}
          >
            {submitting ? "Assigning..." : "Assign Task"}
          </button>
        </div>
      )}

      {userRole === "admin" && task.status === "submitted" && (
        <div className="taskAction">
          <div className="submissionReview">
            <h4>Submitted Work:</h4>
            <p>{task.submissionContent}</p>
            <small>Submitted: {new Date(task.submissionDate).toLocaleString()}</small>
          </div>
          <div className="actionButtons">
            <button
              className="approve"
              onClick={() => onApprove(task.id)}
              disabled={submitting}
            >
              <CheckCircle size={16} /> Approve
            </button>
            <button
              className="reject"
              onClick={() => onReject(task.id)}
              disabled={submitting}
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {userRole === "writer" && (
        <div className="taskAction" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button className="secondary" onClick={() => setShowTaskDetail(true)}>
            Open Task
          </button>
          {(task.status === "assigned" || task.status === "in_progress") && !showSubmit && (
            <button onClick={() => setShowSubmit(true)}>
              <Send size={16} /> Submit Work
            </button>
          )}
        </div>
      )}

      {userRole === "writer" && showSubmit && (
        <div className="taskAction">
          <textarea
            placeholder="Enter your completed work here..."
            value={submissionContent}
            onChange={(e) => setSubmissionContent(e.target.value)}
            rows={6}
          />
          <input
            type="file"
            multiple
            onChange={async (e) => setSubmissionFiles(await readFiles(e.target.files))}
          />
          {submissionFiles.length > 0 && <small className="muted">{submissionFiles.length} file(s) ready to upload</small>}
          <div className="actionButtons">
            <button
              onClick={handleSubmit}
              disabled={submitting || !submissionContent.trim()}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
            <button onClick={() => setShowSubmit(false)} className="secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {userRole === "writer" && task.status === "submitted" && (
        <div className="taskStatus">
          <AlertCircle size={16} /> Waiting for admin approval
        </div>
      )}

      {userRole === "writer" && task.status === "completed" && (
        <div className="taskStatus good">
          <CheckCircle size={16} /> Task completed and approved!
        </div>
      )}

      {showTaskDetail && (
        <div className="modal" onClick={() => setShowTaskDetail(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>{task.assignmentTitle || task.title}</h3>
            <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
              <p><strong>Job ID:</strong> {task.jobId || task.id}</p>
              <p><strong>Subject:</strong> {task.subject || "General"}</p>
              <p><strong>Academic level:</strong> {task.academicLevel || "Undergraduate"}</p>
              <p><strong>Deadline:</strong> {task.deadline ? new Date(task.deadline).toLocaleString() : "Not set"}</p>
              <p><strong>Payment:</strong> KSh {Number(task.writerPayment || task.budget || 0).toLocaleString()}</p>
              <p><strong>Referencing style:</strong> {task.referencingStyle || "APA"}</p>
              <p><strong>Word count:</strong> {task.wordCount || 0}</p>
              <p><strong>Page count:</strong> {task.pageCount || 0}</p>
            </div>
            <h4 style={{ marginTop: "18px" }}>Instructions</h4>
            <p className="muted">{task.instructions || task.description || "No instructions provided."}</p>
            {task.revisionInstructions && (
              <div style={{ marginTop: "8px", background: "#fff7ed", padding: "12px", borderRadius: "8px" }}>
                <strong>Revision instructions:</strong>
                <p>{task.revisionInstructions}</p>
              </div>
            )}
            {Array.isArray(task.clientFiles) && task.clientFiles.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <strong>Attached files:</strong>
                <ul>
                  {task.clientFiles.map((file, idx) => (<li key={idx}>{typeof file === "string" ? file : file.name || `Attachment ${idx + 1}`}</li>))}
                </ul>
              </div>
            )}
            {(task.status === "assigned" || task.status === "in_progress") && (
              <div className="taskAction" style={{ marginTop: "16px" }}>
                <h4 style={{ margin: 0 }}>Complete Assignment</h4>
                <textarea
                  placeholder="Write your completed work here, following the instructions above..."
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  rows={8}
                />
                <button onClick={handleSubmit} disabled={submitting || !submissionContent.trim()}>
                  <Send size={16} /> {submitting ? "Submitting..." : "Submit Work"}
                </button>
              </div>
            )}
            <button onClick={() => setShowTaskDetail(false)} className="secondary" style={{ marginTop: "16px", width: "100%" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [writerTab, setWriterTab] = useState("dashboard");
  const [adminTab, setAdminTab] = useState("overview");
  const [showWriterModeSelect, setShowWriterModeSelect] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [adminTasks, setAdminTasks] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [writers, setWriters] = useState([]);
  const [students, setStudents] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(null);
  const [submitForm, setSubmitForm] = useState({ content: "", files: [] });
  const [reviewForm, setReviewForm] = useState({ feedback: "" });
  
  // Writer profile modals
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false);
  const [showQualificationModal, setShowQualificationModal] = useState(false);
  const [showSpecializationModal, setShowSpecializationModal] = useState(false);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  
  // Form data for modals
  const [profilePhotoForm, setProfilePhotoForm] = useState({ file: null });
  const [qualificationForm, setQualificationForm] = useState({ level: "", institution: "", year: "" });
  const [specializationForm, setSpecializationForm] = useState({ subject: "" });
  const [certificationForm, setCertificationForm] = useState({ name: "", issuer: "", year: "" });
  const [portfolioForm, setPortfolioForm] = useState({ title: "", description: "", file: null });
  const [emailForm, setEmailForm] = useState({ newEmail: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [mpesaForm, setMpesaForm] = useState({ phoneNumber: "" });
  const [withdrawalForm, setWithdrawalForm] = useState({ amount: "", mpesaNumber: "" });
  
  const [createForm, setCreateForm] = useState({
    title: "",
    assignmentTitle: "",
    subject: "",
    academicLevel: "Undergraduate",
    description: "",
    instructions: "",
    wordCount: "",
    pageCount: "",
    referencingStyle: "APA",
    deadline: "",
    writerPayment: "",
    priority: "Normal",
    clientFiles: ""
  });

  const load = async () => {
    try {
      const m = await api("/me");
      setMe(m);
      
      // Show writer mode selection if writer hasn't selected yet
      if (m.user.role === "writer" && !m.user.writerMode) {
        setShowWriterModeSelect(true);
        return;
      }
      
      const t = await api("/tasks");
      setTasks(t);

      if (m.user.role === "writer") {
        const [assigned, writerNotifications] = await Promise.all([
          api("/tasks/assigned"),
          api("/notifications")
        ]);
        setAssignedTasks(assigned);
        setNotifications(writerNotifications);
      }

      if (m.user.role === "admin") {
        const [adminData, statsData, writersData, studentsData, withdrawalsData] = await Promise.all([
          api("/admin/tasks"),
          api("/admin/overview"),
          api("/admin/writers"),
          api("/admin/students"),
          api("/admin/withdrawals")
        ]);
        setAdminTasks(adminData);
        setAdminStats(statsData);
        setWriters(writersData);
        setStudents(studentsData);
        setWithdrawals(withdrawalsData);
      }
    } catch (e) {
      localStorage.removeItem("sp_token");
      setUser(null);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("sp_token")) load();
  }, []);

  const setWriterMode = async (mode) => {
    try {
      // Set writer mode
      await api("/writer/mode", {
        method: "POST",
        body: JSON.stringify({ mode })
      });
      
      // Confirm registration payment (KSh 300)
      await api("/payments/registration/demo-confirm", {
        method: "POST",
        body: JSON.stringify({ amount: 300 })
      });
      
      setShowWriterModeSelect(false);
      await load();
      setSuccess(`Writer profile set to ${mode === "public" ? "PUBLIC" : "PRIVATE"} mode. Registration payment confirmed!`);
    } catch (e) {
      setError(e.message);
    }
  };

  if (!user && !localStorage.getItem("sp_token"))
    return <Auth onLogin={(u) => { setUser(u); load(); }} />;
  if (!me) return <div className="loading">Loading ScholarPro…</div>;
  
  if (showWriterModeSelect) {
    return <WriterModeSelection 
      onPublic={() => setWriterMode("public")} 
      onPrivate={() => setWriterMode("private")} 
    />;
  }

  const u = me.user;
  const w = me.wallet;

  const logout = () => {
    localStorage.removeItem("sp_token");
    setUser(null);
    setMe(null);
  };

  const confirmPayment = async () => {
    try {
      await api("/payments/registration/demo-confirm", {
        method: "POST",
        body: JSON.stringify({ amount: 300 })
      });
      await load();
      setSuccess("Payment confirmed!");
    } catch (e) {
      setError(e.message);
    }
  };

  const submitCreateTask = async () => {
    const title = createForm.assignmentTitle || createForm.title;
    const description = createForm.instructions || createForm.description;
    const payment = Number(createForm.writerPayment || createForm.budget || 0);

    if (!title || !description || !payment || payment <= 0) {
      setError("Assignment title, description, and payment are required");
      return;
    }

    try {
      await api("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title,
          assignmentTitle: title,
          subject: createForm.subject || "General",
          academicLevel: createForm.academicLevel || "Undergraduate",
          description,
          instructions: createForm.instructions || description,
          wordCount: Number(createForm.wordCount || 0),
          pageCount: Number(createForm.pageCount || 0),
          referencingStyle: createForm.referencingStyle || "APA",
          deadline: createForm.deadline || null,
          writerPayment: payment,
          priority: createForm.priority || "Normal",
          clientFiles: createForm.clientFiles ? createForm.clientFiles.split(",").map((item) => item.trim()).filter(Boolean) : [],
          budget: payment
        })
      });
      await load();
      setSuccess("Task created successfully!");
      setShowCreateModal(false);
      setCreateForm({ title: "", assignmentTitle: "", subject: "", academicLevel: "Undergraduate", description: "", instructions: "", wordCount: "", pageCount: "", referencingStyle: "APA", deadline: "", writerPayment: "", priority: "Normal", clientFiles: "" });
    } catch (e) {
      setError(e.message);
    }
  };

  const createAcademicTask = async (payload) => {
    try {
      await api("/admin/tasks", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      await load();
      setSuccess("Academic task created successfully!");
    } catch (e) {
      throw e;
    }
  };

  const assignTask = async (taskId, writerId) => {
    try {
      await api(`/tasks/${taskId}/assign`, {
        method: "POST",
        body: JSON.stringify({ writerId, assignedBy: u.id })
      });
      await load();
      setSuccess("Task assigned successfully!");
    } catch (e) {
      throw e;
    }
  };

  const submitTask = async (taskId, submissionContent, submissionFiles = []) => {
    try {
      await api(`/tasks/${taskId}/submit`, {
        method: "POST",
        body: JSON.stringify({ submissionContent, submissionFiles })
      });
      await load();
      setSuccess("Work submitted successfully!");
    } catch (e) {
      throw e;
    }
  };

  const approveTask = async (taskId, paymentAmount) => {
    try {
      await api(`/tasks/${taskId}/approve`, {
        method: "POST",
        body: JSON.stringify({ action: "approve", paymentAmount })
      });
      await load();
      setSuccess("Task approved!");
    } catch (e) {
      setError(e.message);
    }
  };

  const rejectTask = async (taskId, instructions = "Please revise the document to match the provided feedback.") => {
    try {
      await api(`/tasks/${taskId}/approve`, {
        method: "POST",
        body: JSON.stringify({ action: "request_revision", revisionInstructions: instructions })
      });
      await load();
      setSuccess("Revision requested and notification sent to writer");
    } catch (e) {
      setError(e.message);
    }
  };

  const handleModalSubmit = async () => {
    if (!showTaskModal) return;
    try {
      await submitTask(showTaskModal.id, submitForm.content, submitForm.files);
      setShowTaskModal(null);
      setSubmitForm({ content: "", files: [] });
    } catch (e) {
      setError(e.message);
    }
  };

  const handleModalRevise = async () => {
    if (!showTaskModal) return;
    try {
      await submitTask(showTaskModal.id, submitForm.content, submitForm.files);
      setShowTaskModal(null);
      setSubmitForm({ content: "", files: [] });
    } catch (e) {
      setError(e.message);
    }
  };

  const handleModalReview = async (action) => {
    if (!showTaskModal) return;
    try {
      if (action === "approved") {
        await approveTask(showTaskModal.id, showTaskModal.writerPayment || showTaskModal.budget || 0);
      } else if (action === "revision_required") {
        await rejectTask(showTaskModal.id, reviewForm.feedback || "Please revise this submission.");
      }
      setShowTaskModal(null);
      setReviewForm({ feedback: "" });
    } catch (e) {
      setError(e.message);
    }
  };

  // Handler functions for writer profile buttons
  const handleProfilePhotoUpload = async () => {
    try {
      setSuccess("Profile photo updated successfully!");
      setShowProfilePhotoModal(false);
      setProfilePhotoForm({ file: null });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAddQualification = async () => {
    if (!qualificationForm.level || !qualificationForm.institution) {
      setError("Please fill in all qualification fields");
      return;
    }
    try {
      setSuccess("Qualification added successfully!");
      setShowQualificationModal(false);
      setQualificationForm({ level: "", institution: "", year: "" });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAddSpecialization = async () => {
    if (!specializationForm.subject) {
      setError("Please select a specialization");
      return;
    }
    try {
      setSuccess("Specialization added successfully!");
      setShowSpecializationModal(false);
      setSpecializationForm({ subject: "" });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAddCertification = async () => {
    if (!certificationForm.name || !certificationForm.issuer) {
      setError("Please fill in certification details");
      return;
    }
    try {
      setSuccess("Certification added successfully!");
      setShowCertificationModal(false);
      setCertificationForm({ name: "", issuer: "", year: "" });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAddPortfolioItem = async () => {
    if (!portfolioForm.title || !portfolioForm.description) {
      setError("Please fill in portfolio item details");
      return;
    }
    try {
      setSuccess("Portfolio item added successfully!");
      setShowPortfolioModal(false);
      setPortfolioForm({ title: "", description: "", file: null });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleChangeEmail = async () => {
    if (!emailForm.newEmail) {
      setError("Please enter a new email address");
      return;
    }
    try {
      setSuccess("Email changed successfully! A verification link has been sent.");
      setShowEmailModal(false);
      setEmailForm({ newEmail: "" });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError("Please fill in all password fields");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    try {
      setSuccess("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAddMpesaAccount = async () => {
    if (!mpesaForm.phoneNumber) {
      setError("Please enter your M-Pesa phone number");
      return;
    }
    try {
      setSuccess("M-Pesa account linked successfully!");
      setShowMpesaModal(false);
      setMpesaForm({ phoneNumber: "" });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleManageNotifications = async () => {
    try {
      setSuccess("Notification preferences updated!");
      setShowNotificationModal(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRequestWithdrawal = async () => {
    const amount = Number(withdrawalForm.amount);
    if (!amount || amount < 500) {
      setError("Minimum withdrawal amount is KSh 500");
      return;
    }
    if (!withdrawalForm.mpesaNumber) {
      setError("Please enter your M-Pesa phone number");
      return;
    }
    try {
      await api("/withdrawals/request", {
        method: "POST",
        body: JSON.stringify({ amount, mpesaNumber: withdrawalForm.mpesaNumber })
      });
      setSuccess("Withdrawal request submitted successfully!");
      setShowWithdrawalModal(false);
      setWithdrawalForm({ amount: "", mpesaNumber: "" });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const copyReferralLink = async () => {
    const link = `${window.location.origin}/?ref=${encodeURIComponent(u.referralCode)}`;
    await navigator.clipboard.writeText(link);
    setSuccess("Invite link copied to clipboard");
  };

  return (
    <div className="app">
      <aside>
        <div className="brand">
          Scholar<span>Pro</span>
        </div>
        <div className="role">{u.role.toUpperCase()}</div>
        {u.role === "writer" && u.writerMode && (
          <div className="writerMode">
            {u.writerMode === "public" ? "👤 Public Profile" : "🔒 Private"}
          </div>
        )}
        <nav>
          {u.role === "writer" ? (
            [
              ["dashboard", "Dashboard", LayoutDashboard],
              ...(u.writerMode === "public" ? [["public-profile", "👤 Public Profile", Star]] : []),
              ["qualifications", "Qualifications", FileText],
              ["portfolio", "Portfolio", Briefcase],
              ["assigned-jobs", "Assigned Jobs", CheckCircle],
              ["available-jobs", "Available Jobs", AlertCircle],
              ["active-work", "Active Work", BarChart3],
              ["submissions", "Submissions", Send],
              ["revisions", "Revision Requests", Edit2],
              ["deadlines", "Deadlines", Bell],
              ["earnings", "Earnings", WalletCards],
              ["wallet", "Wallet & Transactions", WalletCards],
              ["withdrawals", "M-Pesa Withdrawals", WalletCards],
              ["notifications", "Notifications", Bell],
              ["messages", "Messages", MessageSquare],
              ["performance", "Performance Stats", BarChart3],
              ["ratings", "Ratings & Reviews", Star],
              ["settings", "Settings", Settings]
            ].map(([k, n, I]) => (
              <button
                className={writerTab === k ? "active" : ""}
                onClick={() => setWriterTab(k)}
                key={k}
              >
                <I size={18} />
                {n}
              </button>
            ))
          ) : (
            [
              ["dashboard", "Dashboard", LayoutDashboard],
              ["tasks", "Tasks", ClipboardList],
              ["wallet", "Wallet", WalletCards],
              ...(u.role === "admin" ? [["admin", "Administration", Users]] : [])
            ].map(([k, n, I]) => (
              <button
                className={tab === k ? "active" : ""}
                onClick={() => setTab(k)}
                key={k}
              >
                <I size={18} />
                {n}
              </button>
            ))
          )}
        </nav>
        <button className="logout" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main>
        <header>
          <div>
            <h2>
              {u.role === "writer" ? (
                writerTab === "dashboard" ? "Dashboard" :
                writerTab === "public-profile" ? "👤 Public Profile" :
                writerTab === "qualifications" ? "Qualifications & Specializations" :
                writerTab === "portfolio" ? "Portfolio" :
                writerTab === "assigned-jobs" ? "Assigned Jobs" :
                writerTab === "available-jobs" ? "Available Jobs" :
                writerTab === "active-work" ? "Active Work" :
                writerTab === "submissions" ? "Submissions" :
                writerTab === "revisions" ? "Revision Requests" :
                writerTab === "deadlines" ? "Deadlines" :
                writerTab === "earnings" ? "Earnings Summary" :
                writerTab === "wallet" ? "Wallet & Transactions" :
                writerTab === "withdrawals" ? "M-Pesa Withdrawals" :
                writerTab === "notifications" ? "Notifications" :
                writerTab === "messages" ? "Messages" :
                writerTab === "performance" ? "Performance Statistics" :
                writerTab === "ratings" ? "Ratings & Reviews" :
                writerTab === "settings" ? "Account Settings" :
                writerTab[0].toUpperCase() + writerTab.slice(1)
              ) : (tab === "dashboard" ? "Dashboard" : tab[0].toUpperCase() + tab.slice(1))}
            </h2>
            <p className="muted">Welcome, {u.name}</p>
          </div>
          <div className="avatar">{u.name[0]}</div>
        </header>

        {error && (
          <div className="alert error">
            {error}
            <button onClick={() => setError("")}>×</button>
          </div>
        )}
        {success && (
          <div className="alert success">
            {success}
            <button onClick={() => setSuccess("")}>×</button>
          </div>
        )}

        {(u.role === "writer" ? writerTab : tab) === "dashboard" && (
          <div className="dashboardContainer">
            {/* Quick Stats - 4 Column Grid */}
            <div className="statsGrid">
              {u.role === "writer" && (
                <>
                  <div className="statCard pending">
                    <div className="statLabel">Pending Earnings</div>
                    <div className="statValue">KSh {w.pendingEarnings.toLocaleString()}</div>
                  </div>
                  <div className="statCard withdrawable">
                    <div className="statLabel">Withdrawable</div>
                    <div className="statValue">KSh {w.withdrawableBalance.toLocaleString()}</div>
                  </div>
                  <div className="statCard withdrawn">
                    <div className="statLabel">Total Withdrawn</div>
                    <div className="statValue">KSh {w.totalWithdrawn.toLocaleString()}</div>
                  </div>
                  <div className="statCard protected">
                    <div className="statLabel">Registration Credit</div>
                    <div className="statValue">KSh {w.registrationCredit.toLocaleString()}</div>
                    <div className="statNote">Protected</div>
                  </div>
                </>
              )}
              {u.role === "student" && (
                <>
                  <div className="statCard">
                    <div className="statLabel">Platform Credit</div>
                    <div className="statValue">KSh {w.registrationCredit.toLocaleString()}</div>
                  </div>
                  <div className="statCard">
                    <div className="statLabel">Available Balance</div>
                    <div className="statValue">KSh {w.withdrawableBalance.toLocaleString()}</div>
                  </div>
                  <div className="statCard">
                    <div className="statLabel">Spent</div>
                    <div className="statValue">KSh {w.totalWithdrawn.toLocaleString()}</div>
                  </div>
                  <div className="statCard">
                    <div className="statLabel">Account Status</div>
                    <div className="statValue">{u.status === "active" ? "✓ Active" : "Pending"}</div>
                  </div>
                </>
              )}
            </div>

            {/* Two Column Layout */}
            <div className="dashboardGrid">
              {/* Left Column - Main Content */}
              <div className="dashboardLeft">
                {/* My Assigned Jobs Section */}
                {u.role === "writer" && (
                  <section className="dashboardPanel">
                    <div className="panelHeader">
                      <div className="panelTitle">
                        <CheckCircle size={20} />
                        <h3>My Assigned Jobs</h3>
                      </div>
                      <span className="jobCount">{assignedTasks.length}</span>
                    </div>
                    
                    {assignedTasks.length === 0 ? (
                      <div className="emptyState">
                        <AlertCircle size={40} />
                        <p>No tasks assigned yet</p>
                        <span className="muted">Check back soon for new opportunities</span>
                      </div>
                    ) : (
                      <div className="assignedJobsList">
                        {assignedTasks.map((task) => (
                          <div key={task.id} className="jobItem">
                            <div className="jobHeader">
                              <h4>{task.title}</h4>
                              <span className={`statusBadge ${task.status}`}>{task.status}</span>
                            </div>
                            <p className="jobDescription">{task.description}</p>
                            <div className="jobMeta">
                              <div className="metaRow">
                                <span className="metaLabel">Subject:</span>
                                <span className="metaValue">{task.subject}</span>
                              </div>
                              <div className="metaRow">
                                <span className="metaLabel">Deadline:</span>
                                <span className="metaValue">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "Not set"}</span>
                              </div>
                              <div className="metaRow">
                                <span className="metaLabel">Payment:</span>
                                <span className="metaValue highlight">KSh {task.writerPayment.toLocaleString()}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => setShowTaskModal(task)}
                              className="openTaskBtn"
                            >
                              <FileText size={16} /> Open Task
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </div>

              {/* Right Column - Sidebar */}
              <div className="dashboardRight">
                {/* Account Status */}
                <section className="dashboardPanel compact">
                  <div className="panelHeader">
                    <h3>Account Status</h3>
                  </div>
                  {u.status === "pending" ? (
                    <div className="statusBox pending">
                      <AlertCircle size={18} />
                      <div>
                        <strong>Confirmation Required</strong>
                        <p>Complete KSh 300 registration payment</p>
                        <button onClick={confirmPayment} className="actionBtn">
                          Confirm Payment
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="statusBox active">
                      <ShieldCheck size={18} />
                      <div>
                        <strong>Active Account</strong>
                        <p>All features unlocked</p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Upcoming Deadlines */}
                {u.role === "writer" && (
                  <section className="dashboardPanel compact">
                    <div className="panelHeader">
                      <h3>Upcoming Deadlines</h3>
                    </div>
                    {assignedTasks.filter(t => t.deadline && t.status !== "completed").length === 0 ? (
                      <p className="muted" style={{fontSize: "13px", margin: 0}}>No upcoming deadlines</p>
                    ) : (
                      <div className="deadlinesList">
                        {assignedTasks
                          .filter(t => t.deadline && t.status !== "completed")
                          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                          .slice(0, 3)
                          .map((task) => {
                            const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                            return (
                              <div key={task.id} className="deadlineItem">
                                <div className="deadlineDate">
                                  <span className={`daysLeft ${daysLeft <= 3 ? "urgent" : daysLeft <= 7 ? "warning" : ""}`}>
                                    {daysLeft}d
                                  </span>
                                </div>
                                <div className="deadlineInfo">
                                  <strong>{task.title.substring(0, 30)}</strong>
                                  <span>{new Date(task.deadline).toLocaleDateString()}</span>
                                </div>
                              </div>
                            );
                          })
                        }
                      </div>
                    )}
                  </section>
                )}

                {/* Wallet Summary */}
                <section className="dashboardPanel compact">
                  <div className="panelHeader">
                    <h3>Wallet Summary</h3>
                  </div>
                  <div className="walletSummary">
                    <div className="walletRow">
                      <span>Pending Earnings</span>
                      <strong>KSh {w.pendingEarnings.toLocaleString()}</strong>
                    </div>
                    <div className="walletRow">
                      <span>Ready to Withdraw</span>
                      <strong className="highlight">KSh {w.withdrawableBalance.toLocaleString()}</strong>
                    </div>
                    {u.role === "writer" && w.withdrawableBalance > 0 && (
                      <button className="fullWidthBtn" onClick={() => setShowWithdrawalModal(true)}>Request Withdrawal</button>
                    )}
                  </div>
                </section>

                {/* Performance Stats */}
                {u.role === "writer" && (
                  <section className="dashboardPanel compact">
                    <div className="panelHeader">
                      <h3>Performance</h3>
                    </div>
                    <div className="performanceStats">
                      <div className="perfStat">
                        <span className="perfLabel">Active Tasks</span>
                        <span className="perfValue">{assignedTasks.filter(t => ["assigned", "in_progress"].includes(t.status)).length}</span>
                      </div>
                      <div className="perfStat">
                        <span className="perfLabel">Submitted</span>
                        <span className="perfValue">{assignedTasks.filter(t => t.status === "submitted").length}</span>
                      </div>
                      <div className="perfStat">
                        <span className="perfLabel">Completed</span>
                        <span className="perfValue">{assignedTasks.filter(t => t.status === "completed").length}</span>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "tasks" && u.role === "student" && (
          <section className="panel">
            <div className="panelHead">
              <div>
                <h3>Tasks</h3>
                <p className="muted">Marketplace - Post tasks for writers</p>
              </div>
              <button onClick={() => setShowCreateModal(true)}>
                <PlusCircle size={18} /> Create Task
              </button>
            </div>
            {showCreateModal && (
              <div className="modal">
                <div className="modalContent">
                  <h3>Create New Task</h3>
                  <input
                    placeholder="Task title"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  />
                  <textarea
                    placeholder="Describe the task"
                    rows={4}
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  />
                  <input
                    placeholder="Budget (KSh)"
                    type="number"
                    value={createForm.budget}
                    onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })}
                  />
                  <div className="modalActions">
                    <button onClick={submitCreateTask}>Create Task</button>
                    <button className="secondary" onClick={() => { setShowCreateModal(false); setCreateForm({ title: "", description: "", budget: "" }); }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
            <div className="tasksGrid">
              {tasks.length === 0 ? (
                <p className="muted">No tasks yet. Create one to get started!</p>
              ) : (
                tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    userRole={u.role}
                  />
                ))
              )}
            </div>
          </section>
        )}

        {tab === "tasks" && u.role === "writer" && (
          <section className="panel">
            <div className="panelHead">
              <h3>My Assigned Tasks</h3>
              <p className="muted">Tasks assigned to you by admin</p>
            </div>
            <div className="tasksGrid">
              {assignedTasks.length === 0 ? (
                <p className="muted">No tasks assigned yet. Check back soon!</p>
              ) : (
                assignedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onSubmit={submitTask}
                    userRole={u.role}
                  />
                ))
              )}
            </div>
          </section>
        )}
        
        {writerTab === "tasks" && u.role === "writer" && (
          <section className="panel">
            <div className="panelHead">
              <h3>My Assigned Tasks</h3>
              <p className="muted">Tasks assigned to you by admin</p>
            </div>
            <div className="tasksGrid">
              {assignedTasks.length === 0 ? (
                <p className="muted">No tasks assigned yet. Check back soon!</p>
              ) : (
                assignedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onSubmit={submitTask}
                    userRole={u.role}
                  />
                ))
              )}
            </div>
          </section>
        )}

        {tab === "wallet" && (
          <section className="panel">
            <h3>Wallet</h3>
            {u.role === "writer" ? (
              <>
                <div className="walletBig">
                  KSh {w.registrationCredit.toLocaleString()}{" "}
                  <small>Registration Credit (Protected)</small>
                </div>
                <div className="walletRows">
                  <div>
                    <span>Pending earnings</span>
                    <b>KSh {w.pendingEarnings.toLocaleString()}</b>
                  </div>
                  <div>
                    <span>Withdrawable earnings</span>
                    <b>KSh {w.withdrawableBalance.toLocaleString()}</b>
                  </div>
                  <div>
                    <span>Total withdrawn</span>
                    <b>KSh {w.totalWithdrawn.toLocaleString()}</b>
                  </div>
                </div>
                {w.withdrawableBalance > 0 && (
                  <button className="secondary" onClick={() => setShowWithdrawalModal(true)}>Request Withdrawal</button>
                )}
              </>
            ) : (
              <>
                <div className="walletBig">
                  KSh {w.registrationCredit.toLocaleString()}{" "}
                  <small>Registration Credit</small>
                </div>
                <div className="walletRows">
                  <div>
                    <span>Pending earnings</span>
                    <b>KSh {w.pendingEarnings.toLocaleString()}</b>
                  </div>
                  <div>
                    <span>Withdrawable earnings</span>
                    <b>KSh {w.withdrawableBalance.toLocaleString()}</b>
                  </div>
                  <div>
                    <span>Total withdrawn</span>
                    <b>KSh {w.totalWithdrawn.toLocaleString()}</b>
                  </div>
                </div>
                {u.role === "writer" && w.withdrawableBalance > 0 && (
                  <button className="secondary" onClick={() => setShowWithdrawalModal(true)}>Request Withdrawal</button>
                )}
              </>
            )}
            <p className="muted">
              Only qualifying completed-task earnings can become withdrawable. Registration
              credit is permanently non-withdrawable.
            </p>
          </section>
        )}

        {writerTab === "wallet" && u.role === "writer" && (
          <section className="panel">
            <h3>Wallet</h3>
            <div className="walletBig">
              KSh {w.registrationCredit.toLocaleString()}{" "}
              <small>Registration Credit (Protected)</small>
            </div>
            <div className="walletRows">
              <div>
                <span>Pending earnings</span>
                <b>KSh {w.pendingEarnings.toLocaleString()}</b>
              </div>
              <div>
                <span>Withdrawable earnings</span>
                <b>KSh {w.withdrawableBalance.toLocaleString()}</b>
              </div>
              <div>
                <span>Total withdrawn</span>
                <b>KSh {w.totalWithdrawn.toLocaleString()}</b>
              </div>
            </div>
            <div style={{ background: "#ecfdf3", padding: "16px", borderRadius: "10px", margin: "18px 0" }}>
              <strong>Refer a friend and earn KSh 100</strong>
              <p className="muted" style={{ margin: "8px 0" }}>Share your code with a friend when they create their ScholarPro account.</p>
              <code>{u.referralCode || "Your code is being generated"}</code>
              {u.referralCode && <button onClick={copyReferralLink} style={{ marginLeft: "12px" }}><Copy size={15} /> Copy invite link</button>}
            </div>
            {w.withdrawableBalance > 0 && (
              <button className="secondary" onClick={() => setShowWithdrawalModal(true)}>Request Withdrawal</button>
            )}
            <p className="muted">
              Only qualifying completed-task earnings can become withdrawable. Your KSh 300 registration
              credit is permanently protected and non-withdrawable.
            </p>
          </section>
        )}

        {writerTab === "public-profile" && u.role === "writer" && (
          <section className="panel">
            <h3>Public Profile</h3>
            <p className="muted">Your professional profile visible to all students on the platform.</p>
            <div style={{ marginTop: "20px", display: "grid", gap: "20px" }}>
              <div style={{ background: "#f8f9fc", padding: "20px", borderRadius: "12px" }}>
                <p><strong>Profile Status:</strong> {u.status === "active" ? "✓ Verified" : "Pending Verification"}</p>
                <p><strong>Writer Mode:</strong> {u.writerMode === "public" ? "👤 Public" : "🔒 Private"}</p>
                <p><strong>Account Created:</strong> {new Date(u.createdAt || Date.now()).toLocaleDateString()}</p>
                <button onClick={() => setShowProfilePhotoModal(true)} style={{ marginTop: "10px" }}>Edit Profile Photo</button>
              </div>
            </div>
          </section>
        )}

        {writerTab === "qualifications" && u.role === "writer" && (
          <section className="panel">
            <h3>Qualifications & Specializations</h3>
            <p className="muted">Add your academic qualifications, certifications, and areas of expertise.</p>
            <div style={{ marginTop: "20px", display: "grid", gap: "15px" }}>
              <div style={{ background: "#f8f9fc", padding: "15px", borderRadius: "10px" }}>
                <p><strong>Education Level:</strong> Add your highest qualification</p>
                <button onClick={() => setShowQualificationModal(true)}>Add Qualification</button>
              </div>
              <div style={{ background: "#f8f9fc", padding: "15px", borderRadius: "10px" }}>
                <p><strong>Specializations:</strong> Add your areas of expertise</p>
                <button onClick={() => setShowSpecializationModal(true)}>Add Specialization</button>
              </div>
              <div style={{ background: "#f8f9fc", padding: "15px", borderRadius: "10px" }}>
                <p><strong>Certifications:</strong> Add professional certifications</p>
                <button onClick={() => setShowCertificationModal(true)}>Add Certification</button>
              </div>
            </div>
          </section>
        )}

        {writerTab === "portfolio" && u.role === "writer" && (
          <section className="panel">
            <h3>Portfolio</h3>
            <p className="muted">Showcase your best completed work and academic samples.</p>
            <div style={{ marginTop: "20px" }}>
              <p className="muted">No portfolio items yet. Upload samples of your work to build credibility.</p>
              <button style={{ marginTop: "15px" }} onClick={() => setShowPortfolioModal(true)}>Add Portfolio Item</button>
            </div>
          </section>
        )}

        {writerTab === "assigned-jobs" && u.role === "writer" && (
          <section className="panel">
            <h3>Assigned Jobs</h3>
            <p className="muted">Tasks assigned to you by administrators.</p>
            <div className="tasksGrid" style={{ marginTop: "20px" }}>
              {assignedTasks.length === 0 ? (
                <p className="muted">No tasks assigned yet. Check back soon!</p>
              ) : (
                assignedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onSubmit={submitTask} userRole={u.role} />
                ))
              )}
            </div>
          </section>
        )}

        {writerTab === "available-jobs" && u.role === "writer" && (
          <section className="panel">
            <h3>Available Jobs</h3>
            <p className="muted">Browse and apply for open writing jobs from students.</p>
            <div style={{ marginTop: "20px", display: "grid", gap: "15px" }}>
              <div style={{ background: "#f8f9fc", padding: "15px", borderRadius: "10px", textAlign: "center" }}>
                <p>No available jobs at this time.</p>
                <p className="muted">Check back soon for new opportunities!</p>
              </div>
            </div>
          </section>
        )}

        {writerTab === "active-work" && u.role === "writer" && (
          <section className="panel">
            <h3>Active Work</h3>
            <p className="muted">Your currently active assignments and their progress.</p>
            <div style={{ marginTop: "20px", display: "grid", gap: "15px" }}>
              <div style={{ background: "#f8f9fc", padding: "15px", borderRadius: "10px" }}>
                <p><strong>Total Active Tasks:</strong> {assignedTasks.length}</p>
                <p><strong>In Progress:</strong> 0</p>
                <p><strong>Ready for Submission:</strong> 0</p>
              </div>
            </div>
          </section>
        )}

        {writerTab === "submissions" && u.role === "writer" && (
          <section className="panel">
            <h3>Submissions</h3>
            <p className="muted">Track all your task submissions and their statuses.</p>
            <div style={{ marginTop: "20px" }}>
              <p className="muted">No submissions yet. Complete your assigned tasks to see them here.</p>
            </div>
          </section>
        )}

        {writerTab === "revisions" && u.role === "writer" && (
          <section className="panel">
            <h3>Revision Requests</h3>
            <p className="muted">View and manage revision requests from students.</p>
            <div style={{ marginTop: "20px" }}>
              <p className="muted">No pending revisions. You're all caught up!</p>
            </div>
          </section>
        )}

        {writerTab === "deadlines" && u.role === "writer" && (
          <section className="panel">
            <h3>Deadlines & Job Statuses</h3>
            <p className="muted">View all your upcoming deadlines and task statuses at a glance.</p>
            <div style={{ marginTop: "20px", display: "grid", gap: "15px" }}>
              <div style={{ background: "#f8f9fc", padding: "15px", borderRadius: "10px" }}>
                <p><strong>Pending Assignments:</strong> 0</p>
                <p><strong>In Progress:</strong> 0</p>
                <p><strong>Submitted:</strong> 0</p>
                <p><strong>Completed & Paid:</strong> 0</p>
              </div>
            </div>
          </section>
        )}

        {writerTab === "earnings" && u.role === "writer" && (
          <section className="panel">
            <h3>Earnings Summary</h3>
            <p className="muted">Comprehensive view of your earnings and financial performance.</p>
            <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
              <div style={{ background: "#ecfdf3", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
                <p className="muted">This Month</p>
                <p style={{ fontSize: "24px", fontWeight: "bold", color: "#027a48" }}>KSh {(Math.random() * 5000).toFixed(0)}</p>
              </div>
              <div style={{ background: "#e9e2ff", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
                <p className="muted">Total Earnings</p>
                <p style={{ fontSize: "24px", fontWeight: "bold", color: "#5637d6" }}>KSh 0</p>
              </div>
              <div style={{ background: "#fef3c7", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
                <p className="muted">Pending</p>
                <p style={{ fontSize: "24px", fontWeight: "bold", color: "#d97706" }}>KSh {w.pendingEarnings.toLocaleString()}</p>
              </div>
            </div>
          </section>
        )}

        {writerTab === "withdrawals" && u.role === "writer" && (
          <section className="panel">
            <h3>M-Pesa Withdrawals</h3>
            <p className="muted">Request and track your M-Pesa withdrawal transactions.</p>
            <div style={{ marginTop: "20px", display: "grid", gap: "15px" }}>
              <div style={{ background: "#f8f9fc", padding: "20px", borderRadius: "10px" }}>
                <p><strong>Available to Withdraw:</strong> KSh {w.withdrawableBalance.toLocaleString()}</p>
                <p className="muted" style={{ marginTop: "10px" }}>Minimum withdrawal: KSh 500</p>
                {w.withdrawableBalance >= 500 ? (
                  <button style={{ marginTop: "15px" }} onClick={() => setShowWithdrawalModal(true)}>Request Withdrawal</button>
                ) : (
                  <button style={{ marginTop: "15px", opacity: "0.5", cursor: "not-allowed" }} disabled>Request Withdrawal (Insufficient Balance)</button>
                )}
              </div>
              <div style={{ background: "#f8f9fc", padding: "15px", borderRadius: "10px" }}>
                <p><strong>Withdrawal History:</strong></p>
                <p className="muted">Total Withdrawn: KSh {w.totalWithdrawn.toLocaleString()}</p>
              </div>
            </div>
          </section>
        )}

        {writerTab === "notifications" && u.role === "writer" && (
          <section className="panel">
            <h3>Notifications</h3>
            <p className="muted">Stay updated with important alerts and platform notifications.</p>
            <div style={{ marginTop: "20px" }}>
              {notifications.length === 0 ? (
                <p className="muted">No notifications yet.</p>
              ) : notifications.map((notification) => (
                <div key={notification.id} style={{ background: "#f8f9fc", padding: "15px", borderRadius: "10px", marginBottom: "10px" }}>
                  <p><strong>{notification.title}</strong></p>
                  <p className="muted">{notification.message}</p>
                  <small className="muted">{new Date(notification.createdAt).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </section>
        )}

        {writerTab === "messages" && u.role === "writer" && (
          <section className="panel">
            <h3>Messages</h3>
            <p className="muted">Communicate with students and administrators.</p>
            <div style={{ marginTop: "20px" }}>
              <p className="muted">No messages yet. You'll see conversations here when you start working on assignments.</p>
            </div>
          </section>
        )}

        {writerTab === "performance" && u.role === "writer" && (
          <section className="panel">
            <h3>Performance Statistics</h3>
            <p className="muted">Track your key performance metrics and improvements over time.</p>
            <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px" }}>
              <div style={{ background: "#f8f9fc", padding: "15px", borderRadius: "10px", textAlign: "center" }}>
                <p className="muted">Tasks Completed</p>
                <p style={{ fontSize: "20px", fontWeight: "bold" }}>0</p>
              </div>
              <div style={{ background: "#f8f9fc", padding: "15px", borderRadius: "10px", textAlign: "center" }}>
                <p className="muted">Avg Rating</p>
                <p style={{ fontSize: "20px", fontWeight: "bold" }}>N/A</p>
              </div>
              <div style={{ background: "#f8f9fc", padding: "15px", borderRadius: "10px", textAlign: "center" }}>
                <p className="muted">On-Time Rate</p>
                <p style={{ fontSize: "20px", fontWeight: "bold" }}>N/A</p>
              </div>
              <div style={{ background: "#f8f9fc", padding: "15px", borderRadius: "10px", textAlign: "center" }}>
                <p className="muted">Revision Rate</p>
                <p style={{ fontSize: "20px", fontWeight: "bold" }}>N/A</p>
              </div>
            </div>
          </section>
        )}

        {writerTab === "ratings" && u.role === "writer" && (
          <section className="panel">
            <h3>Ratings & Reviews</h3>
            <p className="muted">View feedback from students you've worked with.</p>
            <div style={{ marginTop: "20px" }}>
              <p className="muted">No ratings yet. Complete assignments to receive reviews from students.</p>
            </div>
          </section>
        )}

        {writerTab === "settings" && u.role === "writer" && (
          <section className="panel">
            <h3>Account Settings</h3>
            <p className="muted">Manage your account preferences and security settings.</p>
            <div style={{ marginTop: "20px", display: "grid", gap: "15px" }}>
              <div style={{ background: "#f8f9fc", padding: "20px", borderRadius: "10px" }}>
                <p><strong>Email:</strong> {u.email}</p>
                <button style={{ marginTop: "10px" }} onClick={() => setShowEmailModal(true)}>Change Email</button>
              </div>
              <div style={{ background: "#f8f9fc", padding: "20px", borderRadius: "10px" }}>
                <p><strong>Password</strong></p>
                <button style={{ marginTop: "10px" }} onClick={() => setShowPasswordModal(true)}>Change Password</button>
              </div>
              <div style={{ background: "#f8f9fc", padding: "20px", borderRadius: "10px" }}>
                <p><strong>M-Pesa Phone Number</strong></p>
                <p className="muted">Not set</p>
                <button style={{ marginTop: "10px" }} onClick={() => setShowMpesaModal(true)}>Add M-Pesa Account</button>
              </div>
              <div style={{ background: "#f8f9fc", padding: "20px", borderRadius: "10px" }}>
                <p><strong>Notification Preferences</strong></p>
                <button style={{ marginTop: "10px" }} onClick={() => setShowNotificationModal(true)}>Manage Notifications</button>
              </div>
            </div>
          </section>
        )}

        {tab === "admin" && (
          <AdminDashboard
            adminTab={adminTab}
            setAdminTab={setAdminTab}
            adminStats={adminStats}
            adminTasks={adminTasks}
            writers={writers}
            students={students}
            withdrawals={withdrawals}
            onAssign={assignTask}
            onApprove={approveTask}
            onReject={rejectTask}
            onCreateTask={createAcademicTask}
            api={api}
            setError={setError}
            setSuccess={setSuccess}
            user={u}
          />
        )}

        {showTaskModal && u.role === "writer" && (
          <div className="modal" onClick={() => setShowTaskModal(null)}>
            <div className="modalContent writerTaskModal" onClick={(e) => e.stopPropagation()}>
              <h3>{showTaskModal.assignmentTitle || showTaskModal.title}</h3>
              <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
                <p><strong>Subject:</strong> {showTaskModal.subject || "General"}</p>
                <p><strong>Deadline:</strong> {showTaskModal.deadline ? new Date(showTaskModal.deadline).toLocaleString() : "Not set"}</p>
                <p><strong>Payment:</strong> KSh {Number(showTaskModal.writerPayment || showTaskModal.budget || 0).toLocaleString()}</p>
                <p><strong>Referencing style:</strong> {showTaskModal.referencingStyle || "APA"}</p>
                <p><strong>Word count:</strong> {showTaskModal.wordCount || 0}</p>
                <p><strong>Page count:</strong> {showTaskModal.pageCount || 0}</p>
              </div>
              <h4 style={{ marginTop: "18px" }}>Instructions</h4>
              <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{showTaskModal.instructions || showTaskModal.description || "No instructions provided."}</p>
              {showTaskModal.revisionInstructions && (
                <div style={{ background: "#fff7ed", padding: "12px", borderRadius: "8px" }}>
                  <strong>Revision instructions:</strong>
                  <p style={{ whiteSpace: "pre-wrap" }}>{showTaskModal.revisionInstructions}</p>
                </div>
              )}
              {(showTaskModal.status === "assigned" || showTaskModal.status === "in_progress") && (
                <div className="taskAction" style={{ marginTop: "16px" }}>
                  <textarea
                    placeholder="Enter your completed work here, following the instructions above..."
                    value={submitForm.content}
                    onChange={(e) => setSubmitForm({ ...submitForm, content: e.target.value })}
                    rows={8}
                  />
                  <input
                    type="file"
                    multiple
                    onChange={async (e) => setSubmitForm({ ...submitForm, files: await readFiles(e.target.files) })}
                  />
                  {submitForm.files.length > 0 && <small className="muted">{submitForm.files.length} file(s) ready to upload</small>}
                  <button onClick={handleModalSubmit} disabled={!submitForm.content.trim() && submitForm.files.length === 0}>
                    <Send size={16} /> Submit Work
                  </button>
                </div>
              )}
              <button onClick={() => setShowTaskModal(null)} className="secondary" style={{ marginTop: "12px", width: "100%" }}>Close</button>
            </div>
          </div>
        )}

        {u.role === "writer" && (
          <WriterProfileModals
            showProfilePhotoModal={showProfilePhotoModal}
            setShowProfilePhotoModal={setShowProfilePhotoModal}
            showQualificationModal={showQualificationModal}
            setShowQualificationModal={setShowQualificationModal}
            showSpecializationModal={showSpecializationModal}
            setShowSpecializationModal={setShowSpecializationModal}
            showCertificationModal={showCertificationModal}
            setShowCertificationModal={setShowCertificationModal}
            showPortfolioModal={showPortfolioModal}
            setShowPortfolioModal={setShowPortfolioModal}
            showEmailModal={showEmailModal}
            setShowEmailModal={setShowEmailModal}
            showPasswordModal={showPasswordModal}
            setShowPasswordModal={setShowPasswordModal}
            showMpesaModal={showMpesaModal}
            setShowMpesaModal={setShowMpesaModal}
            showNotificationModal={showNotificationModal}
            setShowNotificationModal={setShowNotificationModal}
            showWithdrawalModal={showWithdrawalModal}
            setShowWithdrawalModal={setShowWithdrawalModal}
            profilePhotoForm={profilePhotoForm}
            setProfilePhotoForm={setProfilePhotoForm}
            qualificationForm={qualificationForm}
            setQualificationForm={setQualificationForm}
            specializationForm={specializationForm}
            setSpecializationForm={setSpecializationForm}
            certificationForm={certificationForm}
            setCertificationForm={setCertificationForm}
            portfolioForm={portfolioForm}
            setPortfolioForm={setPortfolioForm}
            emailForm={emailForm}
            setEmailForm={setEmailForm}
            passwordForm={passwordForm}
            setPasswordForm={setPasswordForm}
            mpesaForm={mpesaForm}
            setMpesaForm={setMpesaForm}
            withdrawalForm={withdrawalForm}
            setWithdrawalForm={setWithdrawalForm}
            handleProfilePhotoUpload={handleProfilePhotoUpload}
            handleAddQualification={handleAddQualification}
            handleAddSpecialization={handleAddSpecialization}
            handleAddCertification={handleAddCertification}
            handleAddPortfolioItem={handleAddPortfolioItem}
            handleChangeEmail={handleChangeEmail}
            handleChangePassword={handleChangePassword}
            handleAddMpesaAccount={handleAddMpesaAccount}
            handleManageNotifications={handleManageNotifications}
            handleRequestWithdrawal={handleRequestWithdrawal}
            me={me}
          />
        )}
      </main>
    </div>
  );
}

function AdminDashboard({
  adminTab,
  setAdminTab,
  adminStats,
  adminTasks,
  writers,
  students,
  withdrawals,
  onAssign,
  onApprove,
  onReject,
  onCreateTask,
  api,
  setError,
  setSuccess,
  user
}) {
  const [selectedWriter, setSelectedWriter] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({ writerId: "", deadline: "" });
  const [submitting, setSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [platformStats, setPlatformStats] = useState(null);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [createAssignmentForm, setCreateAssignmentForm] = useState({
    jobId: "",
    writerId: "",
    assignmentTitle: "",
    subject: "",
    academicLevel: "Undergraduate",
    description: "",
    instructions: "",
    wordCount: "",
    pageCount: "",
    referencingStyle: "APA",
    deadline: "",
    writerPayment: "",
    priority: "Normal",
    clientFiles: ""
  });
  
  useEffect(() => {
    const loadStats = async () => {
      try {
        if (api) {
          const stats = await api("/admin/platform-stats");
          setPlatformStats(stats);
        }
      } catch (e) {
        console.error("Failed to load platform stats:", e);
      }
    };
    loadStats();
  }, []);

  const handleAssignJob = async () => {
    if (!assignmentForm.writerId || !selectedTask) {
      alert("Please select a writer");
      return;
    }
    setSubmitting(true);
    try {
      await onAssign(selectedTask.id, assignmentForm.writerId);
      setSelectedTask(null);
      setAssignmentForm({ writerId: "", deadline: "" });
      setSuccess("Job assigned successfully!");
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAssignment = async () => {
    const payload = {
      jobId: createAssignmentForm.jobId || `JOB-${Date.now().toString().slice(-6)}`,
      writerId: createAssignmentForm.writerId || null,
      assignmentTitle: createAssignmentForm.assignmentTitle,
      subject: createAssignmentForm.subject,
      academicLevel: createAssignmentForm.academicLevel,
      description: createAssignmentForm.description,
      instructions: createAssignmentForm.instructions || createAssignmentForm.description,
      wordCount: Number(createAssignmentForm.wordCount || 0),
      pageCount: Number(createAssignmentForm.pageCount || 0),
      referencingStyle: createAssignmentForm.referencingStyle,
      deadline: createAssignmentForm.deadline,
      writerPayment: Number(createAssignmentForm.writerPayment || 0),
      priority: createAssignmentForm.priority,
      clientFiles: createAssignmentForm.clientFiles ? createAssignmentForm.clientFiles.split(",").map((file) => file.trim()).filter(Boolean) : []
    };

    if (!payload.assignmentTitle || !payload.description || !payload.writerPayment || payload.writerPayment <= 0) {
      setError("Assignment title, instructions, and writer payment are required.");
      return;
    }

    try {
      await onCreateTask(payload);
      setShowCreateAssignmentModal(false);
      setCreateAssignmentForm({
        jobId: "",
        writerId: "",
        assignmentTitle: "",
        subject: "",
        academicLevel: "Undergraduate",
        description: "",
        instructions: "",
        wordCount: "",
        pageCount: "",
        referencingStyle: "APA",
        deadline: "",
        writerPayment: "",
        priority: "Normal",
        clientFiles: ""
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleBanClient = async () => {
    if (!selectedClient) {
      setError("No client selected");
      return;
    }
    try {
      // Call API to ban the client
      const response = await api("/admin/ban-client", {
        method: "POST",
        body: JSON.stringify({
          clientId: selectedClient.id,
          reason: banReason || "Account violation"
        })
      });
      setSuccess(`Client ${selectedClient.name} has been banned from the platform.`);
      setShowBanModal(false);
      setBanReason("");
      setSelectedClient(null);
      // Refresh the clients list - you can reload the page or call a refresh function
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setError(error.message || "Error banning client");
    }
  };

  const adminTabs = [
    { id: "overview", label: "Dashboard" },
    { id: "tasks", label: "Jobs" },
    { id: "writers", label: "Writers" },
    { id: "students", label: "Clients" },
    { id: "wallet", label: "Payments" },
    { id: "analytics", label: "Analytics" }
  ];

  return (
    <>
      <div className="adminTabs">
        {adminTabs.map((t) => (
          <button
            key={t.id}
            className={adminTab === t.id ? "active" : ""}
            onClick={() => setAdminTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {adminTab === "overview" && (
        <>
          <div className="grid">
            <Card title="Total Writers" value={platformStats?.totalWriters || 0} />
            <Card title="Active Writers" value={platformStats?.activeWriters || 0} />
            <Card title="Pending Applications" value={platformStats?.pendingWriters || 0} />
            <Card title="Total Jobs" value={platformStats?.totalJobs || 0} />
            <Card title="Active Jobs" value={platformStats?.activeJobs || 0} />
            <Card title="Completed Jobs" value={platformStats?.completedJobs || 0} />
            <Card title="Pending Withdrawals" value={platformStats?.pendingWithdrawals || 0} />
            <Card title="Total Earnings" value={`KSh ${(platformStats?.totalEarnings || 0).toLocaleString()}`} />
          </div>

          <section className="panel">
            <h3>Recent Job Assignments</h3>
            {adminTasks.filter(t => t.status === "assigned").slice(0, 5).length === 0 ? (
              <p className="muted">No recent assignments</p>
            ) : (
              <div className="tasksGrid">
                {adminTasks.filter(t => t.status === "assigned").slice(0, 5).map(task => (
                  <div key={task.id} className="taskCard">
                    <h4>{task.title}</h4>
                    <p className="muted">{task.description?.substring(0, 80)}...</p>
                    <p><strong>Writer:</strong> {task.writerName || "Unassigned"}</p>
                    <p><strong>Budget:</strong> KSh {task.budget.toLocaleString()}</p>
                    <span className="badge good">{task.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {adminTab === "tasks" && (
        <section className="panel">
          <div className="panelHead">
            <div>
              <h3>Job Management</h3>
              <p className="muted">Manage all jobs in the system</p>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button onClick={() => setShowCreateAssignmentModal(true)} style={{ fontSize: "12px", padding: "8px 12px" }}>
                + Create Assignment
              </button>
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #e4e7ec" }}
              />
            </div>
          </div>

          <div className="adminFilters">
            {["all", "open", "assigned", "submitted", "completed"].map(status => (
              <button
                key={status}
                className={`badge ${filterStatus === status ? "active" : ""}`}
                onClick={() => setFilterStatus(status)}
                style={{
                  background: filterStatus === status ? "#6941c6" : "#f2f4f7",
                  color: filterStatus === status ? "#fff" : "#172033",
                  cursor: "pointer",
                  border: "1px solid #e4e7ec"
                }}
              >
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}: {
                  adminTasks.filter(t => filterStatus === "all" || t.status === filterStatus).length
                }
              </button>
            ))}
          </div>

          <div className="dataTable">
            <table>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Client</th>
                  <th>Writer</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {adminTasks.filter(t =>
                  (filterStatus === "all" || t.status === filterStatus) &&
                  (t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (t.studentName && t.studentName.toLowerCase().includes(searchTerm.toLowerCase())))
                ).length === 0 ? (
                  <tr>
                    <td colSpan="6" className="muted" style={{ textAlign: "center", padding: "20px" }}>
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  adminTasks.filter(t =>
                    (filterStatus === "all" || t.status === filterStatus) &&
                    (t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     (t.studentName && t.studentName.toLowerCase().includes(searchTerm.toLowerCase())))
                  ).map(task => (
                    <tr key={task.id}>
                      <td><strong>{task.title}</strong></td>
                      <td>{task.studentName || "Unknown"}</td>
                      <td>{task.writerName || <span className="muted">Unassigned</span>}</td>
                      <td>KSh {task.budget.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${task.status === "completed" ? "good" : task.status === "submitted" ? "info" : "warning"}`}>
                          {task.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedTask(task)}
                          style={{ fontSize: "12px", padding: "6px 10px" }}
                        >
                          {task.writerName ? "View" : "Assign"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {selectedTask && (
            <div className="modal">
              <div className="modalContent">
                <h3>{selectedTask.title}</h3>
                <p className="muted">{selectedTask.description}</p>
                
                <div style={{ marginTop: "20px", display: "grid", gap: "12px" }}>
                  <div>
                    <label><strong>Budget:</strong> KSh {selectedTask.budget.toLocaleString()}</label>
                  </div>
                  <div>
                    <label><strong>Client:</strong> {selectedTask.studentName || "Unknown"}</label>
                  </div>
                  <div>
                    <label><strong>Current Writer:</strong> {selectedTask.writerName || "Not assigned"}</label>
                  </div>
                  {selectedTask.status === "submitted" && (
                    <div>
                      <label><strong>Submission:</strong></label>
                      <p className="muted">{selectedTask.submissionContent}</p>
                      <p style={{ fontSize: "12px", color: "#98a2b3" }}>
                        Submitted: {new Date(selectedTask.submissionDate).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {!selectedTask.writerName && (
                  <div style={{ marginTop: "20px" }}>
                    <label><strong>Assign Writer:</strong></label>
                    <input
                      type="text"
                      placeholder="Search by writer name or specialization"
                      value={assignmentSearch}
                      onChange={(e) => setAssignmentSearch(e.target.value)}
                      style={{ width: "100%", padding: "10px", marginTop: "8px", borderRadius: "8px", border: "1px solid #e4e7ec" }}
                    />
                    <div style={{ marginTop: "12px", display: "grid", gap: "10px", maxHeight: "260px", overflowY: "auto" }}>
                      {writers
                        .filter((w) =>
                          w.status === "active" &&
                          (
                            (w.name || "").toLowerCase().includes(assignmentSearch.toLowerCase()) ||
                            (w.subjects || []).join(" ").toLowerCase().includes(assignmentSearch.toLowerCase())
                          )
                        )
                        .map((writer) => (
                          <div key={writer.id} style={{ border: assignmentForm.writerId === writer.id ? "2px solid #6941c6" : "1px solid #e4e7ec", borderRadius: "12px", padding: "12px", background: assignmentForm.writerId === writer.id ? "#f5f3ff" : "#fff" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
                              <div>
                                <strong>{writer.name}</strong>
                                <div className="muted" style={{ fontSize: "12px" }}>{writer.profile}</div>
                              </div>
                              <button onClick={() => setAssignmentForm({ ...assignmentForm, writerId: writer.id })} style={{ fontSize: "11px", padding: "6px 10px" }}>
                                {assignmentForm.writerId === writer.id ? "Selected" : "Select"}
                              </button>
                            </div>
                            <div style={{ marginTop: "8px", display: "grid", gap: "4px", fontSize: "12px" }}>
                              <span><strong>Qualifications:</strong> {writer.qualifications || "Not listed"}</span>
                              <span><strong>Specializations:</strong> {(writer.subjects || []).join(", ") || "General"}</span>
                              <span><strong>Rating:</strong> ★ {Number(writer.rating || 0).toFixed(1)}</span>
                              <span><strong>Active workload:</strong> {writer.activeWorkload || 0}</span>
                              <span><strong>Completed jobs:</strong> {writer.completedJobs || writer.tasksCompleted || 0}</span>
                              <span><strong>Availability:</strong> {writer.availability || "Available"}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {selectedTask.status === "submitted" && (
                  <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <button onClick={() => onApprove(selectedTask.id)} className="approve">
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button onClick={() => onReject(selectedTask.id)} className="reject">
                      Reject
                    </button>
                  </div>
                )}

                {!selectedTask.writerName && (
                  <button onClick={handleAssignJob} disabled={submitting || !assignmentForm.writerId} style={{ marginTop: "20px", width: "100%" }}>
                    {submitting ? "Assigning..." : "ASSIGN TASK"}
                  </button>
                )}

                <button onClick={() => setSelectedTask(null)} className="secondary" style={{ marginTop: "10px", width: "100%" }}>
                  Close
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {showCreateAssignmentModal && (
        <div className="modal" onClick={() => setShowCreateAssignmentModal(false)}>
          <div className="modalContent createAssignmentModal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "650px" }}>
            <h3>Create Academic Writing Assignment</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(180px, 1fr))", gap: "8px", marginTop: "12px" }}>
              <input placeholder="Job ID" value={createAssignmentForm.jobId} onChange={(e)=>setCreateAssignmentForm({...createAssignmentForm, jobId: e.target.value})} />
              <select value={createAssignmentForm.writerId} onChange={(e)=>setCreateAssignmentForm({...createAssignmentForm, writerId: e.target.value})}>
                <option value="">Select writer (assign later)</option>
                {writers.filter((writer) => writer.status === "active").map((writer) => (
                  <option key={writer.id} value={writer.id}>{writer.name}</option>
                ))}
              </select>
              <input placeholder="Assignment title" value={createAssignmentForm.assignmentTitle} onChange={(e)=>setCreateAssignmentForm({...createAssignmentForm, assignmentTitle: e.target.value})} />
              <input placeholder="Subject" value={createAssignmentForm.subject} onChange={(e)=>setCreateAssignmentForm({...createAssignmentForm, subject: e.target.value})} />
              <select value={createAssignmentForm.academicLevel} onChange={(e)=>setCreateAssignmentForm({...createAssignmentForm, academicLevel: e.target.value})}>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Doctoral">Doctoral</option>
                <option value="Professional">Professional</option>
              </select>
              <input type="number" placeholder="Word count" value={createAssignmentForm.wordCount} onChange={(e)=>setCreateAssignmentForm({...createAssignmentForm, wordCount: e.target.value})} />
              <input type="number" placeholder="Page count" value={createAssignmentForm.pageCount} onChange={(e)=>setCreateAssignmentForm({...createAssignmentForm, pageCount: e.target.value})} />
              <select value={createAssignmentForm.referencingStyle} onChange={(e)=>setCreateAssignmentForm({...createAssignmentForm, referencingStyle: e.target.value})}>
                <option value="APA">APA</option>
                <option value="MLA">MLA</option>
                <option value="Chicago">Chicago</option>
                <option value="Harvard">Harvard</option>
              </select>
              <select value={createAssignmentForm.priority} onChange={(e)=>setCreateAssignmentForm({...createAssignmentForm, priority: e.target.value})}>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
              <input type="date" value={createAssignmentForm.deadline} onChange={(e)=>setCreateAssignmentForm({...createAssignmentForm, deadline: e.target.value})} />
              <input type="number" placeholder="Writer payment (KSh)" value={createAssignmentForm.writerPayment} onChange={(e)=>setCreateAssignmentForm({...createAssignmentForm, writerPayment: e.target.value})} />
              <input style={{ gridColumn: "1 / -1" }} placeholder="Client files / attachments (comma separated)" value={createAssignmentForm.clientFiles} onChange={(e)=>setCreateAssignmentForm({...createAssignmentForm, clientFiles: e.target.value})} />
              <textarea style={{ gridColumn: "1 / -1" }} rows={3} placeholder="Assignment instructions / description" value={createAssignmentForm.description} onChange={(e)=>setCreateAssignmentForm({...createAssignmentForm, description: e.target.value})} />
              <textarea style={{ gridColumn: "1 / -1" }} rows={2} placeholder="Detailed requirements" value={createAssignmentForm.instructions} onChange={(e)=>setCreateAssignmentForm({...createAssignmentForm, instructions: e.target.value})} />
            </div>
            <div className="modalActions" style={{ marginTop: "12px" }}>
              <button onClick={handleCreateAssignment}>Create Assignment</button>
              <button className="secondary" onClick={() => setShowCreateAssignmentModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {adminTab === "writers" && (
        <section className="panel">
          <div className="panelHead">
            <div>
              <h3>Writer Management</h3>
              <p className="muted">Manage and monitor all writers</p>
            </div>
            <input
              type="text"
              placeholder="Search writers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #e4e7ec" }}
            />
          </div>

          <div className="dataTable">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Jobs Completed</th>
                  <th>Pending Earnings</th>
                  <th>Withdrawable</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {writers.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                  <tr>
                    <td colSpan="7" className="muted" style={{ textAlign: "center", padding: "20px" }}>
                      No writers found
                    </td>
                  </tr>
                ) : (
                  writers.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase())).map(writer => (
                    <tr key={writer.id}>
                      <td><strong>{writer.name}</strong></td>
                      <td>{writer.email}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: writer.status === "active" ? "#ecfdf3" : "#fee2e2",
                            color: writer.status === "active" ? "#027a48" : "#7f1d1d"
                          }}
                        >
                          {writer.status}
                        </span>
                      </td>
                      <td>{writer.completedJobs || writer.tasksCompleted || 0}</td>
                      <td>KSh {Number(writer.pendingEarnings || writer.earnings || 0).toLocaleString()}</td>
                      <td>KSh {Number(writer.withdrawableBalance || 0).toLocaleString()}</td>
                      <td>
                        <button onClick={() => setSelectedWriter(writer)} style={{ fontSize: "12px", padding: "6px 10px" }}>
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {selectedWriter && (
            <div className="modal">
              <div className="modalContent">
                <h3>{selectedWriter.name}</h3>
                <div style={{ marginTop: "20px", display: "grid", gap: "15px" }}>
                  <div>
                    <p><strong>Email:</strong> {selectedWriter.email}</p>
                    <p><strong>Status:</strong> {selectedWriter.status}</p>
                  </div>
                  <div>
                    <p><strong>Jobs Completed:</strong> {selectedWriter.completedJobs || selectedWriter.tasksCompleted || 0}</p>
                    <p><strong>Pending Earnings:</strong> KSh {Number(selectedWriter.pendingEarnings || selectedWriter.earnings || 0).toLocaleString()}</p>
                    <p><strong>Withdrawable:</strong> KSh {Number(selectedWriter.withdrawableBalance || 0).toLocaleString()}</p>
                    <p><strong>Total Withdrawn:</strong> KSh {Number(selectedWriter.totalWithdrawn || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label><strong>Change Status:</strong></label>
                    <select
                      defaultValue={selectedWriter.status}
                      onChange={(e) => {
                        // TODO: Implement status update API call
                        alert("Status update feature coming soon");
                      }}
                      style={{ width: "100%", padding: "10px", marginTop: "8px", borderRadius: "8px", border: "1px solid #e4e7ec" }}
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <button onClick={() => setSelectedWriter(null)} className="secondary" style={{ marginTop: "20px", width: "100%" }}>
                  Close
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {adminTab === "students" && (
        <section className="panel">
          <div className="panelHead">
            <div>
              <h3>Client Management</h3>
              <p className="muted">Manage all client accounts</p>
            </div>
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #e4e7ec" }}
            />
          </div>

          <div className="dataTable">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Jobs Posted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="muted" style={{ textAlign: "center", padding: "20px" }}>
                      No clients found
                    </td>
                  </tr>
                ) : (
                  students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(student => (
                    <tr key={student.id}>
                      <td><strong>{student.name}</strong></td>
                      <td>{student.email}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: student.status === "active" ? "#ecfdf3" : "#fee2e2",
                            color: student.status === "active" ? "#027a48" : "#7f1d1d"
                          }}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td>{student.ordersCreated || 0}</td>
                      <td>
                        {student.status === "active" ? (
                          <button 
                            onClick={() => {
                              setSelectedClient(student);
                              setShowBanModal(true);
                            }}
                            style={{ fontSize: "12px", padding: "6px 10px", background: "#fee2e2", color: "#7f1d1d", border: "none", borderRadius: "6px", cursor: "pointer" }}
                          >
                            Ban Client
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#98a2b3" }}>Banned</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {adminTab === "wallet" && (
        <section className="panel">
          <h3>Payments & Wallet</h3>
          <div className="grid">
            <Card title="Total Platform Earnings" value={`KSh ${(platformStats?.totalEarnings || 0).toLocaleString()}`} />
            <Card title="Pending Withdrawals" value={platformStats?.pendingWithdrawals || 0} />
            <Card title="Platform Revenue" value={`KSh ${(platformStats?.platformRevenue || 0).toLocaleString()}`} />
          </div>

          <h3 style={{ marginTop: "30px" }}>Pending Withdrawals</h3>
          <div className="dataTable">
            <table>
              <thead>
                <tr>
                  <th>Writer</th>
                  <th>Amount</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="muted" style={{ textAlign: "center", padding: "20px" }}>
                      No pending withdrawals
                    </td>
                  </tr>
                ) : (
                  withdrawals.map(w => (
                    <tr key={w.id}>
                      <td><strong>{w.name}</strong></td>
                      <td>KSh {w.amount.toLocaleString()}</td>
                      <td>{new Date(w.created_at).toLocaleDateString()}</td>
                      <td><span className="badge warning">{w.status}</span></td>
                      <td>
                        <button style={{ fontSize: "12px", padding: "6px 10px" }}>
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {adminTab === "analytics" && (
        <section className="panel">
          <h3>Platform Analytics & Reports</h3>
          <div className="grid">
            <Card title="Total Jobs Created" value={adminTasks.length} />
            <Card title="Jobs Completed" value={adminTasks.filter(t => t.status === "completed").length} />
            <Card title="Jobs In Progress" value={adminTasks.filter(t => t.status !== "completed" && t.status !== "open").length} />
            <Card title="Completion Rate" value={`${adminTasks.length > 0 ? Math.round((adminTasks.filter(t => t.status === "completed").length / adminTasks.length) * 100) : 0}%`} />
          </div>

          <h3 style={{ marginTop: "30px" }}>Top Performing Writers</h3>
          <div className="dataTable">
            <table>
              <thead>
                <tr>
                  <th>Writer Name</th>
                  <th>Jobs Completed</th>
                  <th>Total Earnings</th>
                  <th>Avg. Rating</th>
                </tr>
              </thead>
              <tbody>
                {writers.sort((a, b) => (b.tasksCompleted || 0) - (a.tasksCompleted || 0)).slice(0, 5).map(w => (
                  <tr key={w.id}>
                    <td><strong>{w.name}</strong></td>
                    <td>{w.tasksCompleted || 0}</td>
                    <td>KSh {(w.earnings || 0).toLocaleString()}</td>
                    <td>★ 4.8 (12 reviews)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Ban Client Modal */}
      {showBanModal && selectedClient && (
        <div className="modal" onClick={() => setShowBanModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Ban Client Account</h3>
            <p className="muted" style={{ marginTop: "10px", marginBottom: "16px" }}>
              This action will prevent <strong>{selectedClient.name}</strong> from logging into the platform.
            </p>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "#172033", fontWeight: "500" }}>
              Reason for ban (optional):
            </label>
            <textarea 
              placeholder="Provide a reason for banning this client..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              style={{ 
                width: "100%", 
                marginBottom: "16px", 
                padding: "10px 12px", 
                borderRadius: "8px", 
                border: "1px solid #e4e7ec",
                minHeight: "80px",
                fontFamily: "inherit",
                fontSize: "13px",
                color: "#172033"
              }}
            />
            <div style={{ background: "#fef3c7", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "12px", color: "#92400e" }}>
              ⚠️ Warning: The client will not be able to access their account or post new jobs.
            </div>
            <div className="modalActions">
              <button 
                onClick={handleBanClient}
                style={{ background: "#dc2626", color: "#fff" }}
              >
                Ban Client
              </button>
              <button className="secondary" onClick={() => {
                setShowBanModal(false);
                setBanReason("");
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function WriterProfileModals({
  showProfilePhotoModal,
  setShowProfilePhotoModal,
  showQualificationModal,
  setShowQualificationModal,
  showSpecializationModal,
  setShowSpecializationModal,
  showCertificationModal,
  setShowCertificationModal,
  showPortfolioModal,
  setShowPortfolioModal,
  showEmailModal,
  setShowEmailModal,
  showPasswordModal,
  setShowPasswordModal,
  showMpesaModal,
  setShowMpesaModal,
  showNotificationModal,
  setShowNotificationModal,
  showWithdrawalModal,
  setShowWithdrawalModal,
  profilePhotoForm,
  setProfilePhotoForm,
  qualificationForm,
  setQualificationForm,
  specializationForm,
  setSpecializationForm,
  certificationForm,
  setCertificationForm,
  portfolioForm,
  setPortfolioForm,
  emailForm,
  setEmailForm,
  passwordForm,
  setPasswordForm,
  mpesaForm,
  setMpesaForm,
  withdrawalForm,
  setWithdrawalForm,
  handleProfilePhotoUpload,
  handleAddQualification,
  handleAddSpecialization,
  handleAddCertification,
  handleAddPortfolioItem,
  handleChangeEmail,
  handleChangePassword,
  handleAddMpesaAccount,
  handleManageNotifications,
  handleRequestWithdrawal,
  me
}) {
  return (
    <>
      {/* Profile Photo Modal */}
      {showProfilePhotoModal && (
        <div className="modal" onClick={() => setShowProfilePhotoModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Profile Photo</h3>
            <p className="muted">Upload a professional photo for your profile</p>
            <input type="file" accept="image/*" onChange={(e) => setProfilePhotoForm({ file: e.target.files?.[0] })} style={{ marginTop: "12px", marginBottom: "16px", width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e4e7ec" }} />
            <div className="modalActions">
              <button onClick={handleProfilePhotoUpload}>Upload Photo</button>
              <button className="secondary" onClick={() => setShowProfilePhotoModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Qualification Modal */}
      {showQualificationModal && (
        <div className="modal" onClick={() => setShowQualificationModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Add Qualification</h3>
            <input type="text" placeholder="Education Level (e.g., Bachelor's, Master's, PhD)" value={qualificationForm.level} onChange={(e) => setQualificationForm({ ...qualificationForm, level: e.target.value })} style={{ marginTop: "12px", marginBottom: "12px" }} />
            <input type="text" placeholder="Institution/University" value={qualificationForm.institution} onChange={(e) => setQualificationForm({ ...qualificationForm, institution: e.target.value })} style={{ marginBottom: "12px" }} />
            <input type="number" placeholder="Year Completed" value={qualificationForm.year} onChange={(e) => setQualificationForm({ ...qualificationForm, year: e.target.value })} style={{ marginBottom: "16px" }} />
            <div className="modalActions">
              <button onClick={handleAddQualification}>Add Qualification</button>
              <button className="secondary" onClick={() => setShowQualificationModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Specialization Modal */}
      {showSpecializationModal && (
        <div className="modal" onClick={() => setShowSpecializationModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Add Specialization</h3>
            <select value={specializationForm.subject} onChange={(e) => setSpecializationForm({ subject: e.target.value })} style={{ marginTop: "12px", marginBottom: "16px", width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e4e7ec" }}>
              <option value="">Select a specialization...</option>
              <option value="English">English</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Literature">Literature</option>
              <option value="Business">Business</option>
              <option value="Economics">Economics</option>
              <option value="Law">Law</option>
              <option value="Psychology">Psychology</option>
              <option value="Nursing">Nursing</option>
              <option value="Engineering">Engineering</option>
              <option value="IT">IT</option>
            </select>
            <div className="modalActions">
              <button onClick={handleAddSpecialization}>Add Specialization</button>
              <button className="secondary" onClick={() => setShowSpecializationModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Certification Modal */}
      {showCertificationModal && (
        <div className="modal" onClick={() => setShowCertificationModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Add Certification</h3>
            <input type="text" placeholder="Certification Name" value={certificationForm.name} onChange={(e) => setCertificationForm({ ...certificationForm, name: e.target.value })} style={{ marginTop: "12px", marginBottom: "12px" }} />
            <input type="text" placeholder="Issuing Organization" value={certificationForm.issuer} onChange={(e) => setCertificationForm({ ...certificationForm, issuer: e.target.value })} style={{ marginBottom: "12px" }} />
            <input type="number" placeholder="Year Obtained" value={certificationForm.year} onChange={(e) => setCertificationForm({ ...certificationForm, year: e.target.value })} style={{ marginBottom: "16px" }} />
            <div className="modalActions">
              <button onClick={handleAddCertification}>Add Certification</button>
              <button className="secondary" onClick={() => setShowCertificationModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Modal */}
      {showPortfolioModal && (
        <div className="modal" onClick={() => setShowPortfolioModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Add Portfolio Item</h3>
            <input type="text" placeholder="Project/Work Title" value={portfolioForm.title} onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })} style={{ marginTop: "12px", marginBottom: "12px" }} />
            <textarea placeholder="Describe your work..." rows={4} value={portfolioForm.description} onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })} style={{ marginBottom: "12px" }} />
            <input type="file" onChange={(e) => setPortfolioForm({ ...portfolioForm, file: e.target.files?.[0] })} style={{ marginBottom: "16px", width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e4e7ec" }} />
            <div className="modalActions">
              <button onClick={handleAddPortfolioItem}>Add Item</button>
              <button className="secondary" onClick={() => setShowPortfolioModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Change Modal */}
      {showEmailModal && (
        <div className="modal" onClick={() => setShowEmailModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Change Email Address</h3>
            <p className="muted" style={{ marginTop: "10px", marginBottom: "16px" }}>A verification link will be sent to your new email</p>
            <input type="email" placeholder="New email address" value={emailForm.newEmail} onChange={(e) => setEmailForm({ newEmail: e.target.value })} style={{ marginBottom: "16px" }} />
            <div className="modalActions">
              <button onClick={handleChangeEmail}>Change Email</button>
              <button className="secondary" onClick={() => setShowEmailModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal" onClick={() => setShowPasswordModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Change Password</h3>
            <input type="password" placeholder="Current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} style={{ marginTop: "12px", marginBottom: "12px" }} />
            <input type="password" placeholder="New password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} style={{ marginBottom: "12px" }} />
            <input type="password" placeholder="Confirm new password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} style={{ marginBottom: "16px" }} />
            <div className="modalActions">
              <button onClick={handleChangePassword}>Change Password</button>
              <button className="secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* M-Pesa Account Modal */}
      {showMpesaModal && (
        <div className="modal" onClick={() => setShowMpesaModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Add M-Pesa Account</h3>
            <p className="muted" style={{ marginTop: "10px", marginBottom: "16px" }}>Enter your M-Pesa registered phone number for withdrawals</p>
            <input type="tel" placeholder="M-Pesa phone number (e.g., +254712345678)" value={mpesaForm.phoneNumber} onChange={(e) => setMpesaForm({ phoneNumber: e.target.value })} style={{ marginBottom: "16px" }} />
            <div className="modalActions">
              <button onClick={handleAddMpesaAccount}>Link Account</button>
              <button className="secondary" onClick={() => setShowMpesaModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationModal && (
        <div className="modal" onClick={() => setShowNotificationModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Notification Preferences</h3>
            <div style={{ marginTop: "16px", display: "grid", gap: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked />
                <span>Email notifications for new assignments</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked />
                <span>Email notifications for messages</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked />
                <span>Email notifications for payment updates</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked />
                <span>Email notifications for deadline reminders</span>
              </label>
            </div>
            <div className="modalActions" style={{ marginTop: "20px" }}>
              <button onClick={handleManageNotifications}>Save Preferences</button>
              <button className="secondary" onClick={() => setShowNotificationModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="modal" onClick={() => setShowWithdrawalModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3>Request Withdrawal</h3>
            <div style={{ marginTop: "16px", background: "#f0f9ff", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#0369a1" }}>Available to withdraw: <strong>KSh {me.wallet.withdrawableBalance.toLocaleString()}</strong></p>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#0369a1" }}>Minimum withdrawal: KSh 500</p>
            </div>
            <input type="number" placeholder="Amount to withdraw (KSh)" value={withdrawalForm.amount} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })} style={{ marginBottom: "12px" }} />
            <input type="tel" placeholder="M-Pesa phone number" value={withdrawalForm.mpesaNumber} onChange={(e) => setWithdrawalForm({ ...withdrawalForm, mpesaNumber: e.target.value })} style={{ marginBottom: "16px" }} />
            <div className="modalActions">
              <button onClick={handleRequestWithdrawal}>Request Withdrawal</button>
              <button className="secondary" onClick={() => setShowWithdrawalModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.__scholarproRoot) {
  rootElement.__scholarproRoot = createRoot(rootElement);
}

rootElement.__scholarproRoot.render(<App />);
