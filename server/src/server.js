import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pg from "pg";
import crypto from "crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" }));

const demo = !process.env.DATABASE_URL;
const mem = {
  users: [
    { id: "demo-student", name: "Demo Student", email: "student@scholarpro.test", passwordHash: bcrypt.hashSync("Student123!", 10), role: "student", status: "active", writerMode: null, referralCode: null },
    { id: "demo-writer", name: "Demo Writer", email: "writer@scholarpro.test", passwordHash: bcrypt.hashSync("Writer123!", 10), role: "writer", status: "active", writerMode: "public", referralCode: "WRITER-DEMO" },
    { id: "demo-admin", name: "Demo Admin", email: "admin@scholarpro.test", passwordHash: bcrypt.hashSync("Admin123!", 10), role: "admin", status: "active", writerMode: null, referralCode: null }
  ],
  wallets: {
    "demo-student": { registrationCredit: 300, pendingEarnings: 0, withdrawableBalance: 0, totalWithdrawn: 0 },
    "demo-writer": { registrationCredit: 300, pendingEarnings: 0, withdrawableBalance: 0, totalWithdrawn: 0 }
  },
  tasks: [],
  notifications: [],
  referrals: []
};

let pool;
if (!demo) {
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false }
  });
}

const id = () => crypto.randomUUID();
const sign = (u) => jwt.sign({ id: u.id, role: u.role, email: u.email }, process.env.JWT_SECRET || "demo-secret", { expiresIn: "7d" });

async function q(text, params = []) {
  if (!pool) return [];
  return (await pool.query(text, params)).rows;
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  try {
    req.user = jwt.verify(header.replace("Bearer ", ""), process.env.JWT_SECRET || "demo-secret");
    next();
  } catch {
    res.status(401).json({ error: "Authentication required" });
  }
}

function role(...roles) {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) return next();
    return res.status(403).json({ error: "Forbidden" });
  };
}

async function findUserByEmail(email) {
  if (demo) return mem.users.find((u) => u.email.toLowerCase() === String(email || "").toLowerCase());
  return (await q("SELECT * FROM users WHERE email=$1", [email]))[0] || null;
}

async function findUserById(id) {
  if (demo) return mem.users.find((u) => u.id === id) || null;
  return (await q("SELECT * FROM users WHERE id=$1", [id]))[0] || null;
}

function normalizeStatus(status) {
  const value = String(status || "open").toLowerCase().trim();
  const allowed = ["open", "assigned", "in_progress", "submitted", "under_review", "approved", "completed", "revision_required"];
  return allowed.includes(value) ? value : "open";
}

function serializeTask(task) {
  if (!task) return null;

  const title = task.title || task.assignment_title || task.assignmentTitle || "Untitled task";
  const description = task.description || task.instructions || task.assignment_instructions || "";
  const writerId = task.writer_id ?? task.writerId ?? task.assigned_writer_id ?? null;
  const status = normalizeStatus(task.status);

  return {
    id: task.id,
    jobId: task.job_id || task.jobId || task.id,
    title,
    assignmentTitle: task.assignment_title || task.assignmentTitle || title,
    subject: task.subject || "General",
    academicLevel: task.academic_level || task.academicLevel || "Undergraduate",
    description,
    instructions: task.instructions || description,
    wordCount: Number(task.word_count ?? task.wordCount ?? 0),
    pageCount: Number(task.page_count ?? task.pageCount ?? 0),
    referencingStyle: task.referencing_style || task.referencingStyle || "APA",
    deadline: task.deadline || null,
    writerPayment: Number(task.writer_payment ?? task.writerPayment ?? task.budget ?? 0),
    priority: task.priority || "Normal",
    clientFiles: Array.isArray(task.client_files) ? task.client_files : Array.isArray(task.clientFiles) ? task.clientFiles : [],
    studentId: task.student_id ?? task.studentId ?? task.clientId ?? null,
    writerId,
    writer_id: writerId,
    status,
    budget: Number(task.budget ?? task.writer_payment ?? task.writerPayment ?? 0),
    submissionContent: task.submission_content ?? task.submissionContent ?? "",
    submissionFiles: Array.isArray(task.submission_files) ? task.submission_files : Array.isArray(task.submissionFiles) ? task.submissionFiles : [],
    submissionDate: task.submission_date ?? task.submissionDate ?? null,
    revisionInstructions: task.revision_instructions ?? task.revisionInstructions ?? "",
    createdAt: task.created_at ?? task.createdAt ?? new Date().toISOString(),
    updatedAt: task.updated_at ?? task.updatedAt ?? new Date().toISOString(),
    assignedBy: task.assigned_by ?? task.assignedBy ?? null,
    assignedAt: task.assigned_at ?? task.assignedAt ?? null,
    studentName: task.studentName || null,
    writerName: task.writerName || null,
    notificationId: task.notificationId || null
  };
}

async function addNotification(userId, title, message, type = "info", metadata = {}) {
  const entry = {
    id: id(),
    userId,
    title,
    message,
    type,
    metadata,
    read: false,
    createdAt: new Date().toISOString()
  };

  if (demo) {
    mem.notifications.push(entry);
    return entry;
  }

  await q(
    "INSERT INTO notifications(user_id,title,message,type,metadata) VALUES($1,$2,$3,$4,$5)",
    [userId, title, message, type, metadata ? JSON.stringify(metadata) : JSON.stringify({})]
  );
  return entry;
}

function formatDate(dateValue) {
  if (!dateValue) return "Not set";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleString();
}

async function ensureDefaultAccounts() {
  if (demo) return;

  const defaultUsers = [
    { name: "Demo Student", email: "student@scholarpro.test", passwordHash: bcrypt.hashSync("Student123!", 10), role: "student", status: "active", writerMode: null, referralCode: null },
    { name: "Demo Writer", email: "writer@scholarpro.test", passwordHash: bcrypt.hashSync("Writer123!", 10), role: "writer", status: "active", writerMode: "public", referralCode: "WRITER-DEMO" },
    { name: "Demo Admin", email: "admin@scholarpro.test", passwordHash: bcrypt.hashSync("Admin123!", 10), role: "admin", status: "active", writerMode: null, referralCode: null }
  ];

  for (const user of defaultUsers) {
    const existing = await findUserByEmail(user.email);
    if (existing) {
      if (user.referralCode && !existing.referral_code && !existing.referralCode) {
        await q("UPDATE users SET referral_code=$1 WHERE id=$2", [user.referralCode, existing.id]);
      }
      continue;
    }

    const uid = id();
    await q(
      "INSERT INTO users(id, name, email, password_hash, role, status, writer_mode, referral_code) VALUES($1,$2,$3,$4,$5,$6,$7,$8)",
      [uid, user.name, user.email, user.passwordHash, user.role, user.status, user.writerMode, user.referralCode]
    );

    await q(
      "INSERT INTO wallets(user_id, registration_credit) VALUES($1, $2)",
      [uid, user.role === "student" || user.role === "writer" ? 300 : 0]
    );
  }
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "ScholarPro API", demoMode: demo });
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role = "student", referralCode } = req.body || {};
  if (!name || !email || !password || !["student", "writer"].includes(role)) {
    return res.status(400).json({ error: "Name, email, password and valid role are required" });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  if (await findUserByEmail(email)) {
    return res.status(409).json({ error: "Email already registered" });
  }

  let referrer = null;
  if (referralCode) {
    referrer = demo
      ? mem.users.find((candidate) => candidate.role === "writer" && candidate.referralCode === String(referralCode).trim().toUpperCase())
      : (await q("SELECT id FROM users WHERE role='writer' AND referral_code=$1", [String(referralCode).trim().toUpperCase()]))[0];
    if (!referrer) return res.status(400).json({ error: "Invalid writer referral code" });
  }

  const user = {
    id: id(),
    name,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role,
    status: "pending",
    referralCode: role === "writer" ? `WRITER-${crypto.randomBytes(4).toString("hex").toUpperCase()}` : null
  };

  if (demo) {
    mem.users.push(user);
    mem.wallets[user.id] = { registrationCredit: 0, pendingEarnings: 0, withdrawableBalance: 0, totalWithdrawn: 0 };
    if (referrer) {
      mem.wallets[referrer.id].withdrawableBalance += 100;
      mem.referrals.push({ referrerId: referrer.id, referredId: user.id, amount: 100 });
    }
  } else {
    await q("INSERT INTO users(id, name, email, password_hash, role, status, referral_code) VALUES($1,$2,$3,$4,$5,'pending',$6)", [user.id, user.name, user.email, user.passwordHash, user.role, user.referralCode]);
    await q("INSERT INTO wallets(user_id) VALUES($1)", [user.id]);
    if (referrer) {
      await q("UPDATE wallets SET withdrawable_balance = withdrawable_balance + 100 WHERE user_id=$1", [referrer.id]);
      await q("INSERT INTO referrals(referrer_id, referred_id, amount) VALUES($1,$2,100)", [referrer.id, user.id]);
      await q("INSERT INTO wallet_transactions(user_id, type, amount, withdrawable, reference) VALUES($1,'referral_bonus',100,true,$2)", [referrer.id, `REF-${user.id}`]);
    }
  }

  res.json({
    message: "Account created. KSh 300 registration payment is required.",
    user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
    paymentRequired: 300
  });
});

app.post("/api/auth/login", async (req, res) => {
  const email = req.body.email || "";
  const password = req.body.password || "";
  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash || user.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Check if user is banned
  if (user.status === "banned") {
    return res.status(403).json({ error: "Your account has been banned from the platform. Please contact support." });
  }

  res.json({
    token: sign(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      writerMode: user.writer_mode || user.writerMode
    }
  });
});

app.get("/api/me", auth, async (req, res) => {
  // Handle demo IDs even in postgres mode
  const isDemoId = req.user.id.toString().includes("demo");
  
  const user = demo || isDemoId
    ? mem.users.find((u) => u.id === req.user.id)
    : (await q("SELECT id, name, email, role, status, writer_mode, referral_code FROM users WHERE id=$1", [req.user.id]))[0];

  if (!user) return res.status(404).json({ error: "User not found" });

  const wallet = demo || isDemoId
    ? mem.wallets[req.user.id]
    : (await q("SELECT registration_credit AS \"registrationCredit\", pending_earnings AS \"pendingEarnings\", withdrawable_balance AS \"withdrawableBalance\", total_withdrawn AS \"totalWithdrawn\" FROM wallets WHERE user_id=$1", [req.user.id]))[0];

  res.json({
    user: { ...user, writerMode: user.writer_mode || user.writerMode, referralCode: user.referral_code || user.referralCode },
    wallet: wallet || { registrationCredit: 0, pendingEarnings: 0, withdrawableBalance: 0, totalWithdrawn: 0 }
  });
});

app.post("/api/payments/registration/demo-confirm", auth, async (req, res) => {
  if (Number(req.body.amount) !== 300) {
    return res.status(400).json({ error: "Registration fee is KSh 300" });
  }

  if (demo) {
    const wallet = mem.wallets[req.user.id];
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });
    if (wallet.registrationCredit >= 300) return res.status(409).json({ error: "Registration payment already credited" });
    wallet.registrationCredit = 300;
    const user = mem.users.find((u) => u.id === req.user.id);
    if (user) user.status = "active";
  } else {
    await q("UPDATE users SET status='active' WHERE id=$1", [req.user.id]);
    await q("UPDATE wallets SET registration_credit=300 WHERE user_id=$1", [req.user.id]);
    await q("INSERT INTO wallet_transactions(user_id, type, amount, withdrawable, reference) VALUES($1,'registration_credit',300,false,$2)", [req.user.id, "REG-" + id()]);
  }

  res.json({ message: "Registration payment confirmed. KSh 300 non-withdrawable credit applied." });
});

app.post("/api/writer/mode", auth, role("writer"), async (req, res) => {
  const { mode } = req.body || {};
  if (!["public", "private"].includes(mode)) {
    return res.status(400).json({ error: "Mode must be 'public' or 'private'" });
  }

  if (demo) {
    const user = mem.users.find((u) => u.id === req.user.id);
    if (user) user.writerMode = mode;
  } else {
    await q("UPDATE users SET writer_mode=$1 WHERE id=$2", [mode, req.user.id]);
  }

  res.json({ message: `Writer mode set to ${mode}`, writerMode: mode });
});

app.get("/api/tasks", auth, async (req, res) => {
  if (demo) {
    return res.json(mem.tasks.map(serializeTask).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }

  const rows = await q("SELECT * FROM tasks ORDER BY created_at DESC");
  res.json(rows.map(serializeTask));
});

app.get("/api/tasks/assigned", auth, role("writer"), async (req, res) => {
  try {
    if (demo) {
      const assigned = mem.tasks.filter((task) => task.writerId === req.user.id).map(serializeTask).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      return res.json(assigned);
    }

    const rows = await q(
      "SELECT * FROM tasks WHERE writer_id=$1 ORDER BY updated_at DESC",
      [req.user.id]
    );
    res.json(rows.map(serializeTask));
  } catch (err) {
    console.error("Error in /api/tasks/assigned:", err);
    res.status(500).json({ error: "Failed to fetch assigned tasks", details: err.message });
  }
});

app.get("/api/tasks/:id", auth, async (req, res) => {
  if (demo) {
    const task = mem.tasks.find((item) => item.id === req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    return res.json(serializeTask(task));
  }

  const rows = await q("SELECT * FROM tasks WHERE id=$1", [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: "Task not found" });
  res.json(serializeTask(rows[0]));
});

app.post("/api/tasks", auth, async (req, res) => {
  const payload = req.body || {};
  const title = payload.title || payload.assignmentTitle || "New academic task";
  const description = payload.description || payload.instructions || "";
  const budget = Number(payload.budget ?? payload.writerPayment ?? 0);

  if (!title || !description || !budget || budget <= 0) {
    return res.status(400).json({ error: "Task title, description, and valid payment are required" });
  }

  const item = {
    id: id(),
    jobId: payload.jobId || `JOB-${Date.now().toString().slice(-6)}`,
    title,
    assignmentTitle: payload.assignmentTitle || title,
    subject: payload.subject || "General",
    academicLevel: payload.academicLevel || "Undergraduate",
    description,
    instructions: payload.instructions || description,
    wordCount: Number(payload.wordCount || 0),
    pageCount: Number(payload.pageCount || 0),
    referencingStyle: payload.referencingStyle || "APA",
    deadline: payload.deadline || null,
    writerPayment: budget,
    priority: payload.priority || "Normal",
    clientFiles: Array.isArray(payload.clientFiles) ? payload.clientFiles : [],
    studentId: payload.studentId || req.user.id,
    writerId: payload.writerId || null,
    status: payload.status || "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignmentStatus: payload.status || "open",
    assignedBy: payload.assignedBy || null,
    assignedAt: payload.assignedAt || null,
    budget,
    studentName: null,
    writerName: null
  };

  if (demo) {
    mem.tasks.unshift(item);
    return res.status(201).json({ message: "Task created successfully", task: serializeTask(item) });
  }

  const taskId = id();
  await q(
    `INSERT INTO tasks(
      id, student_id, title, description, instructions, subject, academic_level, word_count, page_count,
      referencing_style, deadline, writer_payment, priority, client_files, status, writer_id, assigned_by,
      assigned_at, budget, created_by, created_at, updated_at
    ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,
    [
      taskId,
      item.studentId,
      item.title,
      item.description,
      item.instructions,
      item.subject,
      item.academicLevel,
      item.wordCount,
      item.pageCount,
      item.referencingStyle,
      item.deadline,
      item.writerPayment,
      item.priority,
      JSON.stringify(item.clientFiles),
      item.status,
      item.writerId,
      item.assignedBy,
      item.assignedAt,
      item.budget,
      req.user.id,
      item.createdAt,
      item.updatedAt
    ]
  );

  const createdTask = { ...item, id: taskId };
  res.status(201).json({ message: "Task created successfully", task: serializeTask(createdTask) });
});

app.post("/api/admin/tasks", auth, role("admin"), async (req, res) => {
  const payload = req.body || {};
  const assignmentTitle = payload.assignmentTitle || payload.title || "New academic task";
  const subject = payload.subject || "General";
  const academicLevel = payload.academicLevel || "Undergraduate";
  const description = payload.description || payload.instructions || "";
  const writerPayment = Number(payload.writerPayment ?? payload.budget ?? 0);
  const writerId = payload.writerId || null;

  if (!assignmentTitle || !description || !writerPayment || writerPayment <= 0) {
    return res.status(400).json({ error: "Assignment title, description, and writer payment are required" });
  }

  if (writerId) {
    const writer = demo
      ? mem.users.find((user) => user.id === writerId && user.role === "writer" && user.status === "active")
      : await findUserById(writerId);
    if (!writer || writer.role !== "writer" || writer.status !== "active") {
      return res.status(400).json({ error: "Selected writer is not active or does not exist" });
    }
  }

  const item = {
    id: id(),
    jobId: payload.jobId || `JOB-${Date.now().toString().slice(-6)}`,
    title: assignmentTitle,
    assignmentTitle,
    subject,
    academicLevel,
    description,
    instructions: payload.instructions || description,
    wordCount: Number(payload.wordCount || 0),
    pageCount: Number(payload.pageCount || 0),
    referencingStyle: payload.referencingStyle || "APA",
    deadline: payload.deadline || null,
    writerPayment,
    priority: payload.priority || "Normal",
    clientFiles: Array.isArray(payload.clientFiles) ? payload.clientFiles : [],
    studentId: payload.studentId || req.user.id,
    writerId,
    assignedBy: writerId ? req.user.id : null,
    assignedAt: writerId ? new Date().toISOString() : null,
    status: writerId ? "assigned" : "open",
    budget: writerPayment,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (demo) {
    mem.tasks.unshift(item);
    if (writerId) await addNotification(writerId, "New Assignment", `You were assigned task "${item.title}".`, "assignment", { taskId: item.id });
    return res.status(201).json({ message: "Academic task created successfully", task: serializeTask(item) });
  }

  const taskId = id();
  await q(
    `INSERT INTO tasks(
      id, student_id, title, description, instructions, job_id, assignment_title, subject, academic_level,
      word_count, page_count, referencing_style, deadline, writer_payment, priority, client_files,
      status, writer_id, assigned_by, assigned_at, budget, created_by, created_at, updated_at
    ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`,
    [
      taskId,
      item.studentId,
      item.title,
      item.description,
      item.instructions,
      item.jobId,
      item.assignmentTitle,
      item.subject,
      item.academicLevel,
      item.wordCount,
      item.pageCount,
      item.referencingStyle,
      item.deadline,
      item.writerPayment,
      item.priority,
      JSON.stringify(item.clientFiles),
      item.status,
      item.writerId,
      item.assignedBy,
      item.assignedAt,
      item.budget,
      req.user.id,
      item.createdAt,
      item.updatedAt
    ]
  );

  if (writerId) await addNotification(writerId, "New Assignment", `You were assigned task "${item.title}".`, "assignment", { taskId: taskId });
  res.status(201).json({ message: "Academic task created successfully", task: serializeTask({ ...item, id: taskId }) });
});

app.get("/api/admin/tasks", auth, role("admin"), async (req, res) => {
  if (demo) {
    const tasks = mem.tasks
      .map((task) => {
        const student = mem.users.find((u) => u.id === task.studentId);
        const writer = task.writerId ? mem.users.find((u) => u.id === task.writerId) : null;
        return { ...serializeTask(task), studentName: student?.name || "Unknown", writerName: writer?.name || null };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(tasks);
  }

  const rows = await q(`
    SELECT t.*, u1.name AS "studentName", u2.name AS "writerName"
    FROM tasks t
    LEFT JOIN users u1 ON t.student_id = u1.id
    LEFT JOIN users u2 ON t.writer_id = u2.id
    ORDER BY t.updated_at DESC
  `);
  res.json(rows.map((row) => ({ ...serializeTask(row), studentName: row.studentName || "Unknown", writerName: row.writerName || null })));
});

app.get("/api/admin/overview", auth, role("admin"), async (req, res) => {
  if (demo) {
    const tasks = mem.tasks;
    const writers = mem.users.filter((u) => u.role === "writer");
    const students = mem.users.filter((u) => u.role === "student");
    return res.json({
      newOrders: tasks.filter((t) => t.status === "open").length,
      unassignedOrders: tasks.filter((t) => t.status === "open").length,
      assignedTasks: tasks.filter((t) => t.status === "assigned").length,
      submittedTasks: tasks.filter((t) => t.status === "submitted").length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
      totalWriters: writers.length,
      totalStudents: students.length,
      totalEarnings: Object.values(mem.wallets).reduce((sum, w) => sum + Number(w.registrationCredit || 0), 0)
    });
  }

  const [stats, writersCount, studentsCount, registrationEarnings] = await Promise.all([
    q(`SELECT
      (SELECT COUNT(*) FROM tasks WHERE status='open') AS open,
      (SELECT COUNT(*) FROM tasks WHERE status='assigned') AS assigned,
      (SELECT COUNT(*) FROM tasks WHERE status='submitted') AS submitted,
      (SELECT COUNT(*) FROM tasks WHERE status='completed') AS completed`),
    q("SELECT COUNT(*)::int AS count FROM users WHERE role='writer'"),
    q("SELECT COUNT(*)::int AS count FROM users WHERE role='student'"),
    q("SELECT COALESCE(SUM(registration_credit), 0)::float AS total FROM wallets")
  ]);

  const current = stats[0] || {};
  res.json({
    newOrders: Number(current.open || 0),
    unassignedOrders: Number(current.open || 0),
    assignedTasks: Number(current.assigned || 0),
    submittedTasks: Number(current.submitted || 0),
    completedTasks: Number(current.completed || 0),
    totalWriters: Number(writersCount[0]?.count || 0),
    totalStudents: Number(studentsCount[0]?.count || 0),
    totalEarnings: Number(registrationEarnings[0]?.total || 0)
  });
});

app.get("/api/admin/platform-stats", auth, role("admin"), async (req, res) => {
  if (demo) {
    return res.json({
      totalWriters: mem.users.filter((u) => u.role === "writer").length,
      activeWriters: mem.users.filter((u) => u.role === "writer" && u.status === "active").length,
      pendingWriters: mem.users.filter((u) => u.role === "writer" && u.status === "pending").length,
      totalJobs: mem.tasks.length,
      activeJobs: mem.tasks.filter((t) => t.status !== "completed").length,
      completedJobs: mem.tasks.filter((t) => t.status === "completed").length,
      pendingWithdrawals: 0,
      totalEarnings: Object.values(mem.wallets).reduce((sum, w) => sum + Number(w.registrationCredit || 0), 0),
      platformRevenue: Object.values(mem.wallets).reduce((sum, w) => sum + Number(w.registrationCredit || 0), 0)
    });
  }

  const [writers, activeWriters, pendingWriters, totalJobs, activeJobs, completedJobs, pendingWithdrawals, totalEarnings] = await Promise.all([
    q("SELECT COUNT(*)::int AS count FROM users WHERE role='writer'"),
    q("SELECT COUNT(*)::int AS count FROM users WHERE role='writer' AND status='active'"),
    q("SELECT COUNT(*)::int AS count FROM users WHERE role='writer' AND status='pending'"),
    q("SELECT COUNT(*)::int AS count FROM tasks"),
    q("SELECT COUNT(*)::int AS count FROM tasks WHERE status!='completed'"),
    q("SELECT COUNT(*)::int AS count FROM tasks WHERE status='completed'"),
    q("SELECT COUNT(*)::int AS count FROM withdrawals WHERE status='pending'"),
    q("SELECT COALESCE(SUM(registration_credit), 0)::float AS total FROM wallets")
  ]);

  res.json({
    totalWriters: Number(writers[0]?.count || 0),
    activeWriters: Number(activeWriters[0]?.count || 0),
    pendingWriters: Number(pendingWriters[0]?.count || 0),
    totalJobs: Number(totalJobs[0]?.count || 0),
    activeJobs: Number(activeJobs[0]?.count || 0),
    completedJobs: Number(completedJobs[0]?.count || 0),
    pendingWithdrawals: Number(pendingWithdrawals[0]?.count || 0),
    totalEarnings: Number(totalEarnings[0]?.total || 0)
  });
});

app.get("/api/admin/writers", auth, role("admin"), async (req, res) => {
  if (demo) {
    const list = mem.users
      .filter((u) => u.role === "writer")
      .map((writer) => ({
        id: writer.id,
        name: writer.name,
        email: writer.email,
        status: writer.status,
        profile: "Academic writing specialist",
        qualifications: "Bachelor's or Master's degree",
        subjects: ["Research", "Essays", "Dissertations", "Reports"],
        rating: 4.8,
        activeWorkload: mem.tasks.filter((t) => t.writerId === writer.id && ["assigned", "in_progress", "submitted", "under_review", "revision_required"].includes(t.status)).length,
        completedJobs: mem.tasks.filter((t) => t.writerId === writer.id && ["completed", "approved"].includes(t.status)).length,
        availability: mem.tasks.filter((t) => t.writerId === writer.id && ["assigned", "in_progress", "submitted", "under_review", "revision_required"].includes(t.status)).length < 3 ? "Available" : "Busy",
        earnings: mem.wallets[writer.id]?.pendingEarnings || 0,
        pendingEarnings: mem.wallets[writer.id]?.pendingEarnings || 0,
        withdrawableBalance: mem.wallets[writer.id]?.withdrawableBalance || 0,
        totalWithdrawn: mem.wallets[writer.id]?.totalWithdrawn || 0
      }));
    return res.json(list);
  }

  const rows = await q(`
    SELECT u.id, u.name, u.email, u.status,
      'Academic writing specialist' AS profile,
      'Bachelor''s or Master''s degree' AS qualifications,
      'Research, Essays, Dissertations, Reports' AS subjects,
      4.8 AS rating,
      (SELECT COUNT(*) FROM tasks WHERE writer_id=u.id AND status IN ('assigned','in_progress','submitted','under_review','revision_required')) AS "activeWorkload",
      (SELECT COUNT(*) FROM tasks WHERE writer_id=u.id AND status IN ('completed','approved')) AS "completedJobs",
      COALESCE(w.pending_earnings, 0) AS "pendingEarnings",
      COALESCE(w.withdrawable_balance, 0) AS "withdrawableBalance",
      COALESCE(w.total_withdrawn, 0) AS "totalWithdrawn"
    FROM users u
    LEFT JOIN wallets w ON u.id = w.user_id
    WHERE u.role='writer'
    ORDER BY u.name
  `);

  res.json(rows.map((writer) => ({
    ...writer,
    subjects: String(writer.subjects || "Research, Essays, Dissertations, Reports").split(",").map((item) => item.trim()).filter(Boolean),
    rating: Number(writer.rating || 4.8),
    activeWorkload: Number(writer.activeWorkload || 0),
    completedJobs: Number(writer.completedJobs || 0),
    earnings: Number(writer.pendingEarnings || 0),
    pendingEarnings: Number(writer.pendingEarnings || 0),
    withdrawableBalance: Number(writer.withdrawableBalance || 0),
    totalWithdrawn: Number(writer.totalWithdrawn || 0),
    availability: Number(writer.activeWorkload || 0) < 3 ? "Available" : "Busy"
  })));
});

app.get("/api/admin/students", auth, role("admin"), async (req, res) => {
  if (demo) {
    return res.json(mem.users.filter((u) => u.role === "student").map((student) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      status: student.status,
      ordersCreated: mem.tasks.filter((t) => t.studentId === student.id).length
    })));
  }

  const rows = await q(`
    SELECT u.id, u.name, u.email, u.status,
      (SELECT COUNT(*) FROM tasks WHERE student_id=u.id) AS "ordersCreated"
    FROM users u
    WHERE u.role='student'
    ORDER BY u.name
  `);
  res.json(rows);
});

app.get("/api/admin/withdrawals", auth, role("admin"), async (req, res) => {
  if (demo) return res.json([]);
  const rows = await q(`
    SELECT w.id, w.user_id, u.name, u.email, w.amount, w.status, w.created_at
    FROM withdrawals w
    JOIN users u ON w.user_id = u.id
    WHERE w.status='pending'
    ORDER BY w.created_at DESC
  `);
  res.json(rows);
});

app.get("/api/notifications", auth, async (req, res) => {
  if (demo) {
    return res.json(mem.notifications.filter((n) => n.userId === req.user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }

  const rows = await q(
    "SELECT id, user_id AS \"userId\", title, message, type, metadata, read_flag AS read, created_at AS \"createdAt\" FROM notifications WHERE user_id=$1 ORDER BY created_at DESC",
    [req.user.id]
  );
  res.json(rows);
});

app.post("/api/tasks/:id/assign", auth, role("admin"), async (req, res) => {
  const writerId = req.body.writerId || req.body.writer_id;
  if (!writerId) return res.status(400).json({ error: "Writer selection is required" });

  const assignedBy = req.body.assignedBy || req.user.id;

  if (demo) {
    const task = mem.tasks.find((item) => item.id === req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const writer = mem.users.find((u) => u.id === writerId && u.role === "writer");
    if (!writer) return res.status(404).json({ error: "Writer not found" });

    task.writerId = writerId;
    task.writer_id = writerId;
    task.assignedBy = assignedBy;
    task.assignedAt = new Date().toISOString();
    task.status = "assigned";
    task.updatedAt = new Date().toISOString();
    task.writerName = writer.name;

    await addNotification(writerId, "New Assignment", `You were assigned task "${task.title}".`, "assignment", { taskId: task.id });
    return res.json(serializeTask(task));
  }

  const writer = await findUserById(writerId);
  if (!writer || writer.role !== "writer") return res.status(404).json({ error: "Writer not found" });

  const rows = await q(
    "UPDATE tasks SET writer_id=$1, assigned_by=$2, assigned_at=NOW(), status='assigned', updated_at=NOW() WHERE id=$3 RETURNING *",
    [writerId, assignedBy, req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: "Task not found" });

  await addNotification(writerId, "New Assignment", `You were assigned task "${rows[0].title}".`, "assignment", { taskId: rows[0].id });
  res.json(serializeTask(rows[0]));
});

app.post("/api/tasks/:id/progress", auth, role("writer"), async (req, res) => {
  const taskId = req.params.id;
  if (demo) {
    const task = mem.tasks.find((item) => item.id === taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (task.writerId !== req.user.id) return res.status(403).json({ error: "You are not assigned to this task" });
    task.status = "in_progress";
    task.updatedAt = new Date().toISOString();
    return res.json(serializeTask(task));
  }

  const rows = await q("UPDATE tasks SET status='in_progress', updated_at=NOW() WHERE id=$1 AND writer_id=$2 RETURNING *", [taskId, req.user.id]);
  if (rows.length === 0) return res.status(404).json({ error: "Task not found or you are not assigned to it" });
  res.json(serializeTask(rows[0]));
});

app.post("/api/tasks/:id/submit", auth, role("writer"), async (req, res) => {
  const { submissionContent, submissionFiles = [] } = req.body || {};
  if ((!submissionContent || String(submissionContent).trim().length === 0) && (!Array.isArray(submissionFiles) || submissionFiles.length === 0)) {
    return res.status(400).json({ error: "Written work or at least one submission file is required" });
  }

  if (demo) {
    const task = mem.tasks.find((item) => item.id === req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (task.writerId !== req.user.id) return res.status(403).json({ error: "You are not assigned to this task" });

    task.submissionContent = submissionContent;
    task.submissionFiles = Array.isArray(submissionFiles) ? submissionFiles : [];
    task.submissionDate = new Date().toISOString();
    task.status = "submitted";
    task.updatedAt = new Date().toISOString();
    return res.json(serializeTask(task));
  }

  const rows = await q(
    "UPDATE tasks SET submission_content=$1, submission_files=$2, submission_date=NOW(), status='submitted', updated_at=NOW() WHERE id=$3 AND writer_id=$4 RETURNING *",
    [submissionContent, JSON.stringify(submissionFiles), req.params.id, req.user.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: "Task not found or you are not assigned to it" });
  res.json(serializeTask(rows[0]));
});

app.post("/api/tasks/:id/revise", auth, role("writer"), async (req, res) => {
  const { submissionContent, submissionFiles = [] } = req.body || {};
  if (!submissionContent || String(submissionContent).trim().length === 0) {
    return res.status(400).json({ error: "Revised submission content is required" });
  }

  if (demo) {
    const task = mem.tasks.find((item) => item.id === req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (task.writerId !== req.user.id) return res.status(403).json({ error: "You are not assigned to this task" });

    task.submissionContent = submissionContent;
    task.submissionFiles = Array.isArray(submissionFiles) ? submissionFiles : [];
    task.status = "submitted";
    task.updatedAt = new Date().toISOString();
    return res.json({ message: "Revision submitted", task: serializeTask(task) });
  }

  const rows = await q(
    "UPDATE tasks SET submission_content=$1, submission_files=$2, status='submitted', updated_at=NOW() WHERE id=$3 AND writer_id=$4 RETURNING *",
    [submissionContent, JSON.stringify(submissionFiles), req.params.id, req.user.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: "Task not found or you are not assigned to it" });
  res.json({ message: "Revision submitted", task: serializeTask(rows[0]) });
});

app.post("/api/tasks/:id/review", auth, role("admin"), async (req, res) => {
  const taskId = req.params.id;
  if (demo) {
    const task = mem.tasks.find((item) => item.id === taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    task.status = "under_review";
    task.updatedAt = new Date().toISOString();
    return res.json({ message: "Task moved to under review", task: serializeTask(task) });
  }

  const rows = await q("UPDATE tasks SET status='under_review', updated_at=NOW() WHERE id=$1 RETURNING *", [taskId]);
  if (rows.length === 0) return res.status(404).json({ error: "Task not found" });
  res.json({ message: "Task moved to under review", task: serializeTask(rows[0]) });
});

app.post("/api/tasks/:id/approve", auth, role("admin"), async (req, res) => {
  const taskId = req.params.id;
  const action = String(req.body.action || "approve").toLowerCase();
  const revisionInstructions = req.body.revisionInstructions || req.body.instructions || "Please revise the document to match the provided feedback.";

  const task = demo
    ? mem.tasks.find((item) => item.id === taskId)
    : (await q("SELECT * FROM tasks WHERE id=$1", [taskId]))[0];

  if (!task) return res.status(404).json({ error: "Task not found" });

  const writerId = task.writer_id ?? task.writerId;

  if (action === "approve") {
    const requestedPayment = Number(req.body.paymentAmount);
    const taskPayment = Number(task.writer_payment ?? task.writerPayment ?? task.budget ?? 0);
    const paymentAmount = requestedPayment > 0 ? requestedPayment : taskPayment;

    if (demo) {
      if (writerId) {
        const wallet = mem.wallets[writerId];
        if (wallet) {
          wallet.pendingEarnings = Number(wallet.pendingEarnings || 0) + paymentAmount;
          wallet.totalWithdrawn = Number(wallet.totalWithdrawn || 0);
        }

        await addNotification(writerId, "Task Approved", `Your task "${task.title}" was approved and payment of KSh ${paymentAmount.toLocaleString()} is pending settlement.`, "payment", { taskId, amount: paymentAmount });
      }

      task.status = "completed";
      task.updatedAt = new Date().toISOString();
      task.submissionDate = task.submissionDate || new Date().toISOString();
      return res.json({ message: "Task approved", status: "completed", task: serializeTask(task) });
    }

    if (writerId) {
      await q("UPDATE wallets SET pending_earnings = pending_earnings + $1 WHERE user_id = $2", [paymentAmount, writerId]);
      await q("INSERT INTO wallet_transactions(user_id, type, amount, withdrawable, reference) VALUES($1,'task_payment',$2,true,$3)", [writerId, paymentAmount, `TASK-${Date.now()}`]);
    }

    const rows = await q("UPDATE tasks SET status='completed', updated_at=NOW() WHERE id=$1 RETURNING *", [taskId]);
    if (writerId) {
      await addNotification(writerId, "Task Approved", `Your task "${task.title}" was approved and payment of KSh ${paymentAmount.toLocaleString()} is pending settlement.`, "payment", { taskId, amount: paymentAmount });
    }
    return res.json({ message: "Task approved", status: "completed", task: serializeTask(rows[0]) });
  }

  if (action === "request_revision" || action === "reject") {
    if (demo) {
      task.status = "revision_required";
      task.revisionInstructions = revisionInstructions;
      task.updatedAt = new Date().toISOString();
      if (writerId) {
        await addNotification(writerId, "Revision Required", `Admin requested revisions for "${task.title}".`, "revision", { taskId, instructions: revisionInstructions });
      }
      return res.json({ message: "Revision requested", status: "revision_required", task: serializeTask(task) });
    }

    const rows = await q("UPDATE tasks SET status='revision_required', revision_instructions=$1, updated_at=NOW() WHERE id=$2 RETURNING *", [revisionInstructions, taskId]);
    if (writerId) {
      await addNotification(writerId, "Revision Required", `Admin requested revisions for "${task.title}".`, "revision", { taskId, instructions: revisionInstructions });
    }
    return res.json({ message: "Revision requested", status: "revision_required", task: serializeTask(rows[0]) });
  }

  return res.status(400).json({ error: "Unsupported approval action" });
});

app.post("/api/admin/tasks/:id/revision", auth, role("admin"), async (req, res) => {
  const { instructions = "Please revise the submitted work according to the feedback." } = req.body || {};
  const taskId = req.params.id;

  if (demo) {
    const task = mem.tasks.find((item) => item.id === taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    task.status = "revision_required";
    task.revisionInstructions = instructions;
    task.updatedAt = new Date().toISOString();
    if (task.writerId) {
      await addNotification(task.writerId, "Revision Required", `Revision instructions were added for "${task.title}".`, "revision", { taskId, instructions });
    }
    return res.json({ message: "Revision requested", task: serializeTask(task) });
  }

  const rows = await q("UPDATE tasks SET status='revision_required', revision_instructions=$1, updated_at=NOW() WHERE id=$2 RETURNING *", [instructions, taskId]);
  if (rows.length === 0) return res.status(404).json({ error: "Task not found" });
  if (rows[0].writer_id) {
    await addNotification(rows[0].writer_id, "Revision Required", `Revision instructions were added for "${rows[0].title}".`, "revision", { taskId, instructions });
  }
  res.json({ message: "Revision requested", task: serializeTask(rows[0]) });
});

app.get("/api/admin/writer/:id", auth, role("admin"), async (req, res) => {
  if (demo) {
    const writer = mem.users.find((u) => u.id === req.params.id && u.role === "writer");
    if (!writer) return res.status(404).json({ error: "Writer not found" });
    return res.json({
      id: writer.id,
      name: writer.name,
      email: writer.email,
      status: writer.status,
      writerMode: writer.writerMode,
      activeWorkload: mem.tasks.filter((t) => t.writerId === writer.id && ["assigned", "in_progress", "submitted", "under_review", "revision_required"].includes(t.status)).length,
      completedJobs: mem.tasks.filter((t) => t.writerId === writer.id && ["completed", "approved"].includes(t.status)).length,
      earnings: mem.wallets[writer.id]?.totalWithdrawn || 0,
      pendingEarnings: mem.wallets[writer.id]?.pendingEarnings || 0,
      wallet: mem.wallets[writer.id]
    });
  }

  const rows = await q(
    `SELECT u.id, u.name, u.email, u.status, u.writer_mode AS "writerMode",
      (SELECT COUNT(*) FROM tasks WHERE writer_id=u.id AND status IN ('assigned','in_progress','submitted','under_review','revision_required')) AS "activeWorkload",
      (SELECT COUNT(*) FROM tasks WHERE writer_id=u.id AND status IN ('completed','approved')) AS "completedJobs",
      COALESCE(w.total_withdrawn, 0) AS earnings,
      COALESCE(w.pending_earnings, 0) AS "pendingEarnings",
      w.registration_credit AS "registrationCredit",
      w.withdrawable_balance AS "withdrawableBalance"
    FROM users u
    LEFT JOIN wallets w ON u.id = w.user_id
    WHERE u.id=$1 AND u.role='writer'`,
    [req.params.id]
  );

  if (rows.length === 0) return res.status(404).json({ error: "Writer not found" });
  res.json(rows[0]);
});

app.post("/api/admin/writer/:id/status", auth, role("admin"), async (req, res) => {
  const { status } = req.body || {};
  if (!status || !["active", "suspended", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  if (demo) {
    const writer = mem.users.find((u) => u.id === req.params.id && u.role === "writer");
    if (!writer) return res.status(404).json({ error: "Writer not found" });
    writer.status = status;
    return res.json({ message: `Writer status updated to ${status}` });
  }

  await q("UPDATE users SET status=$1 WHERE id=$2 AND role='writer'", [status, req.params.id]);
  res.json({ message: `Writer status updated to ${status}` });
});

// Ban client endpoint
app.post("/api/admin/ban-client", auth, role("admin"), async (req, res) => {
  const { clientId, reason } = req.body || {};
  if (!clientId) {
    return res.status(400).json({ error: "Client ID is required" });
  }

  // Handle demo IDs even in postgres mode
  if (demo || clientId.toString().includes("demo")) {
    const client = mem.users.find((u) => u.id === clientId && u.role === "student");
    if (!client) return res.status(404).json({ error: "Client not found" });
    client.status = "banned";
    return res.json({ 
      message: `Client ${client.name} has been banned`,
      client: { id: client.id, name: client.name, status: client.status }
    });
  }

  const rows = await q(
    "UPDATE users SET status=$1 WHERE id=$2 AND role='student' RETURNING id, name, email, status",
    ["banned", clientId]
  );
  
  if (rows.length === 0) {
    return res.status(404).json({ error: "Client not found" });
  }

  res.json({ 
    message: `Client has been banned`,
    client: rows[0]
  });
});

if (!demo) {
  await ensureDefaultAccounts();
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`ScholarPro API running on ${process.env.PORT || 4000} (${demo ? "demo" : "postgres"} mode)`);
});
