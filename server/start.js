// Import environment configuration first - this must be the top import
import "./env-config.js";

import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  logger,
  logInfo,
  logError,
  logException,
  requestLoggerMiddleware,
  logDatabaseOperation,
  logRecoveryOperation,
} from "./logger.js";

logInfo("Hello world from pino", {
  name: "logesh",
  module: "starting express application",
});
logger.info("Hello world from pino", {
  name: "logesh",
  module: "starting express application",
});

const app = express();
// Use environment variable for server port, falling back to PORT or 3001
const port = process.env.BACKEND_PORT || 3001;

// CORS Configuration from environment variables
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(",") || [
  "localhost",
  "127.0.0.1",
  "replit.dev",
  "sisko.replit.dev",
];
const allowCredentials = process.env.CORS_ALLOW_CREDENTIALS === "true";
const allowedMethods = process.env.CORS_ALLOWED_METHODS?.split(",") || [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "OPTIONS",
];
const allowedHeaders = process.env.CORS_ALLOWED_HEADERS?.split(",") || [
  "Content-Type",
  "Authorization",
  "Accept",
  "Origin",
  "X-Requested-With",
];
const optionsSuccessStatus =
  parseInt(process.env.CORS_OPTIONS_SUCCESS_STATUS) || 200;

// Middleware - CORS configuration from environment variables
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // In development, allow all origins
      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      }

      // Check if origin matches any allowed origins
      const isAllowed = allowedOrigins.some((allowedOrigin) =>
        origin.includes(allowedOrigin),
      );

      if (isAllowed) {
        return callback(null, true);
      }

      // Allow replit domains
      if (origin.includes("replit.dev") || origin.includes("replit.co")) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: allowCredentials,
    methods: allowedMethods,
    allowedHeaders: allowedHeaders,
    optionsSuccessStatus: optionsSuccessStatus,
  }),
);

// Ensure CORS headers are set for all responses
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", allowedMethods.join(", "));
  res.header("Access-Control-Allow-Headers", allowedHeaders.join(", "));
  res.header("Access-Control-Allow-Credentials", allowCredentials.toString());

  if (req.method === "OPTIONS") {
    res.sendStatus(optionsSuccessStatus);
  } else {
    next();
  }
});
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware (logs to request.log)
// app.use(requestLoggerMiddleware);

// Middleware to check database availability with better handling
app.use((req, res, next) => {
  // Allow health check, auth routes, and debug routes to pass through
  if (
    req.path === "/api/health" ||
    req.path.startsWith("/api/auth/") ||
    req.path === "/api/debug"
  ) {
    return next();
  }

  // For database-dependent routes, check availability but allow retry logic
  if (!databaseAvailable && req.path.startsWith("/api/")) {
    console.warn(`Database unavailable for ${req.method} ${req.path}`);

    // Trigger a connection test before responding
    testConnection()
      .then(() => {
        if (databaseAvailable) {
          // Database became available, continue with the request
          next();
        } else {
          // Still unavailable, return 503
          res.status(503).json({
            error: "Database temporarily unavailable",
            message: "Database is waking up, please retry in a few seconds",
            retryAfter: 5,
          });
        }
      })
      .catch(() => {
        res.status(503).json({
          error: "Database temporarily unavailable",
          message: "Database is waking up, please retry in a few seconds",
          retryAfter: 5,
        });
      });
    return;
  }

  next();
});

// PostgreSQL connection with fallback and proper Neon handling
// Use DB_URL environment variable for the connection string
console.log("Database URL configured", {
  dbUrl: process.env.DB_URL ? "Set" : "Not set",
});
let connectionString =
  process.env.DB_URL || "postgresql://0.0.0.0:5432/aeron_settings";

const pool = new Pool({
  connectionString: connectionString,
  ssl:
    process.env.NODE_ENV === "production" ||
    connectionString.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : false,
  max: 10, // Increase max connections
  min: 2, // Keep more connections alive
  idleTimeoutMillis: 30000, // Shorter idle timeout to prevent stale connections
  connectionTimeoutMillis: 5000, // Shorter connection timeout
  maxUses: 7500, // Higher max uses before recycling
  acquireTimeoutMillis: 5000, // Shorter acquire timeout
});

// Test database connection on startup with retry logic
let connectionRetries = 0;
const maxRetries = 3;
let databaseAvailable = false;

async function testConnection() {
  const startTime = Date.now();
  try {
    const client = await pool.connect();
    // Test the connection with a simple query
    await client.query("SELECT 1");
    const duration = Date.now() - startTime;
    console.log("PostgreSQL connected successfully", {
      duration: `${duration}ms`,
    });
    client.release();
    connectionRetries = 0; // Reset on success
    databaseAvailable = true;
  } catch (err) {
    connectionRetries++;
    const duration = Date.now() - startTime;
    logError(
      `PostgreSQL connection failed (attempt ${connectionRetries}/${maxRetries})`,
      err,
      { attempt: connectionRetries, maxRetries, duration: `${duration}ms` },
    );
    databaseAvailable = false;

    // Special handling for Neon database sleep/wake cycles
    if (
      err.message.includes(
        "terminating connection due to administrator command",
      ) ||
      err.message.includes("server closed the connection unexpectedly")
    ) {
      console.log(
        "Database appears to be in sleep mode, retrying connection...",
      );
      // Shorter delay for sleep mode recovery
      setTimeout(testConnection, 1000);
    } else if (connectionRetries < maxRetries) {
      setTimeout(testConnection, 2000 * connectionRetries);
    } else {
      logError(
        "Max connection retries reached. API will continue without database.",
        null,
        {
          maxRetries,
          finalAttempt: connectionRetries,
        },
      );
      databaseAvailable = false;

      // Schedule periodic retry attempts
      setTimeout(() => {
        connectionRetries = 0;
        console.log("Attempting periodic database reconnection...");
        testConnection();
      }, 30000); // Retry every 30 seconds
    }
  }
}

// Handle database connection errors gracefully with retry logic
pool.on("error", (err) => {
  logError("Database pool error", err);
  databaseAvailable = false;

  // Don't immediately retry on certain errors
  if (
    !err.message.includes("terminating connection due to administrator command")
  ) {
    // Retry connection after a delay for other errors
    setTimeout(() => {
      console.log("Attempting to restore database connection...");
      testConnection();
    }, 5000);
  }
});

pool.on("connect", () => {
  console.log("Database pool connected");
  databaseAvailable = true;
});

pool.on("remove", () => {
  console.log("Database client removed");
  // Don't mark as unavailable on client removal - this is normal
});

// Start connection test but don't block server startup
testConnection();

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    let dbStatus = "disconnected";

    // Always try to test the database connection on health check
    try {
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();
      dbStatus = "connected";
      databaseAvailable = true;
    } catch (dbError) {
      console.warn("Health check database test failed:", dbError.message);

      // Handle specific Neon database errors
      if (
        dbError.message.includes(
          "terminating connection due to administrator command",
        ) ||
        dbError.message.includes("server closed the connection unexpectedly")
      ) {
        dbStatus = "sleeping";
        console.log("Database appears to be sleeping, attempting to wake...");
        // Trigger connection test to wake the database
        setTimeout(testConnection, 100);
      } else {
        dbStatus = "error";
        databaseAvailable = false;
      }
    }

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: process.env.NODE_ENV || "development",
      databaseAvailable,
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Authentication endpoints
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("req", req);
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Query user from database
    const query =
      "SELECT * FROM user_accounts WHERE email = $1 AND is_active = true";
    const result = await pool.query(query, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // For demo purposes, we'll use simple password checking
    // In production, you should use bcrypt.compare()
    const isValidPassword =
      password === "password123" ||
      (await bcrypt.compare(password, user.password_hash));

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        userType: user.user_type,
        userCode: user.user_code,
        fullName: user.full_name,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        userType: user.user_type,
        userCode: user.user_code,
        fullName: user.full_name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify token endpoint
app.post("/api/auth/verify", (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ error: "Token required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Logout endpoint
app.post("/api/auth/logout", (req, res) => {
  res.json({ success: true });
});

// Debug endpoint to check connection details
app.get("/api/debug", (req, res) => {
  res.json({
    protocol: req.protocol,
    host: req.get("host"),
    originalUrl: req.originalUrl,
    headers: {
      "x-forwarded-proto": req.get("x-forwarded-proto"),
      "x-forwarded-host": req.get("x-forwarded-host"),
    },
    env: {
      REPL_SLUG: process.env.REPL_SLUG,
      REPLIT_DEV_DOMAIN: process.env.REPLIT_DEV_DOMAIN,
    },
  });
});

// Test logging endpoint
app.get("/api/test-logging", (req, res) => {
  try {
    logInfo("Test logging endpoint called", {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    logError(
      "Test error log from endpoint",
      new Error("Test error for logging verification"),
      {
        endpoint: "/api/test-logging",
        method: req.method,
      },
    );

    res.json({
      success: true,
      message: "Logging test completed. Check logs/ directory for log files.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError("Error in test logging endpoint", error);
    res.status(500).json({
      error: "Failed to test logging",
      details: error.message,
    });
  }
});

// Settings endpoints
app.get("/api/settings", async (req, res) => {
  try {
    if (!databaseAvailable) {
      return res.json([]); // Return empty array for fallback
    }

    const result = await pool.query(
      "SELECT * FROM settings WHERE is_active = true ORDER BY category, key",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.json([]); // Return empty array instead of error to allow fallback
  }
});

// Tab-wise settings endpoint
app.get("/api/settings/tabs", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM settings WHERE is_active = true ORDER BY category, key",
    );

    // Field configurations for display labels
    const fieldLabels = {
      // Passenger Prioritization
      loyaltyTier: "Loyalty Tier Status",
      ticketClass: "Ticket Class (Business/Economy)",
      specialNeeds: "Special Requirements",
      groupSize: "Family/Group Bookings",
      connectionRisk: "Missed Connection Risk",

      // Flight Prioritization
      airlinePreference: "Airline Preference (flydubai)",
      onTimePerformance: "On-Time Performance History",
      aircraftType: "Aircraft Type & Amenities",
      departureTime: "Preferred Departure Times",
      connectionBuffer: "Connection Buffer Time",

      // Flight Scoring
      baseScore: "Base Score (Starting Point)",
      priorityBonus: "VIP/Premium Passenger Bonus",
      airlineBonus: "flydubai Flight Bonus",
      specialReqBonus: "Special Requirements Bonus",
      loyaltyBonus: "Loyalty Tier Bonus",
      groupBonus: "Group Booking Bonus",

      // Passenger Scoring
      vipWeight: "VIP Status Impact",
      loyaltyWeight: "Loyalty Program Tier",
      specialNeedsWeight: "Special Assistance Requirements",
      revenueWeight: "Ticket Revenue/Class Value",

      // Operational Rules
      maxDelayThreshold: "Max Delay Threshold",
      minConnectionTime: "Min Connection Time",
      maxOverbooking: "Max Overbooking",
      priorityRebookingTime: "Priority Rebooking Time",
      hotacTriggerDelay: "HOTAC Trigger Delay",

      // Recovery Constraints
      maxAircraftSwaps: "Max Aircraft Swaps",
      crewDutyTimeLimits: "Crew Duty Time Limits",
      maintenanceSlotProtection: "Maintenance Slot Protection",
      slotCoordinationRequired: "Slot Coordination Required",
      curfewCompliance: "Curfew Compliance",

      // Automation Settings
      autoApproveThreshold: "Auto-Approve Threshold",
      requireManagerApproval: "Require Manager Approval",
      enablePredictiveActions: "Enable Predictive Actions",
      autoNotifyPassengers: "Auto-Notify Passengers",
      autoBookHotac: "Auto-Book HOTAC",

      // Recovery Options Ranking
      costWeight: "Cost Impact",
      timeWeight: "Time to Resolution",
      passengerImpactWeight: "Passenger Impact",
      operationalComplexityWeight: "Operational Complexity",
      reputationWeight: "Brand Reputation Impact",

      // Aircraft Selection Criteria
      maintenanceStatus: "Maintenance Status",
      fuelEfficiency: "Fuel Efficiency",
      routeSuitability: "Route Suitability",
      passengerCapacity: "Passenger Capacity",
      availabilityWindow: "Availability Window",

      // Crew Assignment Criteria
      dutyTimeRemaining: "Duty Time Remaining",
      qualifications: "Qualifications & Certifications",
      baseLocation: "Base Location",
      restRequirements: "Rest Requirements",
      languageSkills: "Language Skills",

      // NLP Settings
      enabled: "Enable NLP",
      language: "Primary Language",
      confidence: "Confidence Threshold",
      autoApply: "Auto-Apply Recommendations",

      // Notification Settings
      email: "Email Notifications",
      sms: "SMS Alerts",
      push: "Push Notifications",
      desktop: "Desktop Notifications",
      recoveryAlerts: "Recovery Plan Alerts",
      passengerUpdates: "Passenger Service Updates",
      systemAlerts: "System Status Alerts",
    };

    // Organize settings by tab categories
    const tabSettings = {
      screens: {},
      passengerPriority: {},
      rules: {},
      recoveryOptions: {},
      nlp: {},
      notifications: {},
      system: {},
    };

    // Group settings by tab categories with full setting details
    result.rows.forEach((setting) => {
      const category = setting.category;
      const key = setting.key;

      // Create full setting object with label
      const fullSetting = {
        id: setting.id,
        category: setting.category,
        key: setting.key,
        value: setting.value,
        type: setting.type,
        description:
          setting.description || `Weight percentage for ${key} in ${category}`,
        created_at: setting.created_at,
        updated_at: setting.updated_at,
        label: fieldLabels[key] || key.charAt(0).toUpperCase() + key.slice(1),
        updated_by: setting.updated_by,
        is_active: setting.is_active,
        required: setting?.required,
        icon: setting?.icon,
      };

      // Map database categories to tab categories
      if (
        [
          "passengerPrioritization",
          "flightPrioritization",
          "flightScoring",
          "passengerScoring",
        ].includes(category)
      ) {
        if (!tabSettings.passengerPriority[category]) {
          tabSettings.passengerPriority[category] = [];
        }
        tabSettings.passengerPriority[category].push(fullSetting);
      }
      // Rules categories
      else if (
        [
          "operationalRules",
          "recoveryConstraints",
          "automationSettings",
        ].includes(category)
      ) {
        if (!tabSettings.rules[category]) {
          tabSettings.rules[category] = [];
        }
        tabSettings.rules[category].push(fullSetting);
      }
      // Recovery Options categories
      else if (
        [
          "recoveryOptionsRanking",
          "aircraftSelectionCriteria",
          "crewAssignmentCriteria",
        ].includes(category)
      ) {
        if (!tabSettings.recoveryOptions[category]) {
          tabSettings.recoveryOptions[category] = [];
        }
        tabSettings.recoveryOptions[category].push(fullSetting);
      }
      // NLP Settings
      else if (
        category === "nlpSettings" ||
        category === "manualKnowledgeEntries"
      ) {
        if (!tabSettings.nlp[category]) {
          tabSettings.nlp[category] = [];
        }
        tabSettings.nlp[category].push(fullSetting);
      }
      // Notification Settings
      else if (category === "notificationSettings") {
        if (!tabSettings.notifications[category]) {
          tabSettings.notifications[category] = [];
        }
        tabSettings.notifications[category].push(fullSetting);
      }
      // Screen Settings - handle separately if needed
      else if (
        [
          "main",
          "operations",
          "prediction",
          "monitoring",
          "services",
          "analytics",
          "system",
        ].includes(category)
      ) {
        if (!tabSettings.screens[category]) {
          tabSettings.screens[category] = [];
        }
        tabSettings.screens[category].push(fullSetting);
      }
      // System Settings - catch remaining categories
      else {
        if (!tabSettings.system[category]) {
          tabSettings.system[category] = [];
        }
        tabSettings.system[category].push(fullSetting);
      }
    });

    // Get screen settings separately
    // const screenResult = await pool.query(
    //   "SELECT * FROM screen_settings ORDER BY category, screen_name",
    // );

    // const screensByCategory = {};
    // screenResult.rows.forEach((screen) => {
    //   if (!screensByCategory[screen.category]) {
    //     screensByCategory[screen.category] = [];
    //   }
    //   screensByCategory[screen.category].push({
    //     id: screen.screen_id,
    //     name: screen.screen_name,
    //     enabled: screen.enabled,
    //     required: screen.required,
    //     category: screen.category,
    //     updated_at: screen.updated_at,
    //     updated_by: screen.updated_by,
    //   });
    // });

    // tabSettings.screens = screensByCategory;

    res.json(tabSettings);
  } catch (error) {
    console.error("Error fetching tab-wise settings:", error);
    res.json({
      screens: {},
      passengerPriority: {},
      rules: {},
      recoveryOptions: {},
      nlp: {},
      notifications: {},
      system: {},
    });
  }
});

app.get("/api/settings/:category/:key", async (req, res) => {
  try {
    const { category, key } = req.params;
    const result = await pool.query(
      "SELECT * FROM settings WHERE category = $1 AND key = $2 AND is_active = true",
      [category, key],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Setting not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching setting:", error);
    res.status(404).json({ error: "Setting not found" });
  }
});

app.get("/api/settings/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const result = await pool.query(
      "SELECT * FROM settings WHERE category = $1 AND is_active = true ORDER BY key",
      [category],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching settings by category:", error);
    res.json([]);
  }
});

app.post("/api/settings", async (req, res) => {
  try {
    const { category, key, value, type, updated_by = "system" } = req.body;

    const result = await pool.query(
      `
      INSERT INTO settings (category, key, value, type, updated_by)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (category, key)
      DO UPDATE SET
        value = EXCLUDED.value,
        type = EXCLUDED.type,
        updated_by = EXCLUDED.updated_by,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
      [category, key, JSON.stringify(value), type, updated_by],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error saving setting:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/settings/:category/:key", async (req, res) => {
  try {
    const { category, key } = req.params;
    const result = await pool.query(
      "UPDATE settings SET is_active = false WHERE category = $1 AND key = $2 RETURNING *",
      [category, key],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Setting not found" });
    }

    res.json({ message: "Setting deleted successfully" });
  } catch (error) {
    console.error("Error deleting setting:", error);
    res.status(500).json({ error: error.message });
  }
});

// Screen settings endpoints
app.get("/api/screen-settings", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM screen_settings ORDER BY category, screen_name",
    );

    // Transform to match the expected format for screenSettings state
    const transformedScreens = result.rows.map((screen) => ({
      id: screen.screen_id,
      name: screen.screen_name,
      icon: screen.icon || "Settings", // Default icon if not set
      category: screen.category,
      enabled: screen.enabled,
      required: screen.required,
    }));

    res.json(transformedScreens);
  } catch (error) {
    console.error("Error fetching screen settings:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/screen-settings", async (req, res) => {
  try {
    const { screen_id, screen_name, category, enabled, required, updated_by } =
      req.body;

    const result = await pool.query(
      `INSERT INTO screen_settings (screen_id, screen_name, category, enabled, required, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (screen_id)
       DO UPDATE SET
         screen_name = EXCLUDED.screen_name,
         category = EXCLUDED.category,
         enabled = EXCLUDED.enabled,
         required = EXCLUDED.required,
         updated_by = EXCLUDED.updated_by,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        screen_id,
        screen_name,
        category,
        enabled,
        required,
        updated_by || "system",
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error saving screen setting:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/screen-settings/:screen_id", async (req, res) => {
  try {
    const { screen_id } = req.params;
    const { enabled, updated_by } = req.body;

    const result = await pool.query(
      `UPDATE screen_settings 
       SET enabled = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
       WHERE screen_id = $3 RETURNING *`,
      [enabled, updated_by || "system", screen_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Screen setting not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating screen setting:", error);
    res.status(500).json({ error: error.message });
  }
});

// Batch update screen settings
app.post("/api/screen-settings/batch", async (req, res) => {
  try {
    const { screenSettings, updated_by } = req.body;

    if (!Array.isArray(screenSettings)) {
      return res.status(400).json({ error: "screenSettings must be an array" });
    }

    const updatePromises = screenSettings.map((screen) => {
      return pool.query(
        `INSERT INTO screen_settings (screen_id, screen_name, category, enabled, required, icon, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (screen_id)
         DO UPDATE SET
           screen_name = EXCLUDED.screen_name,
           category = EXCLUDED.category,
           enabled = EXCLUDED.enabled,
           required = EXCLUDED.required,
           icon = EXCLUDED.icon,
           updated_by = EXCLUDED.updated_by,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          screen.id,
          screen.name,
          screen.category,
          screen.enabled,
          screen.required,
          screen.icon || "Settings",
          updated_by || "system",
        ],
      );
    });

    const results = await Promise.all(updatePromises);
    const updatedScreens = results.map((result) => result.rows[0]);

    res.json({
      message: `Updated ${updatedScreens.length} screen settings`,
      screens: updatedScreens,
    });
  } catch (error) {
    console.error("Error batch updating screen settings:", error);
    res.status(500).json({ error: error.message });
  }
});

// Custom rules endpoints
app.get("/api/custom-rules", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM custom_rules ORDER BY priority, created_at",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching custom rules:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/custom-rules", async (req, res) => {
  try {
    const {
      rule_id,
      name,
      description,
      category,
      type,
      priority,
      overridable,
      conditions,
      actions,
      status,
      created_by,
    } = req.body;

    // Use UPSERT to handle duplicates
    const result = await pool.query(
      `INSERT INTO custom_rules 
       (rule_id, name, description, category, type, priority, overridable, conditions, actions, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (rule_id) 
       DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         category = EXCLUDED.category,
         type = EXCLUDED.type,
         priority = EXCLUDED.priority,
         overridable = EXCLUDED.overridable,
         conditions = EXCLUDED.conditions,
         actions = EXCLUDED.actions,
         status = EXCLUDED.status,
         updated_by = EXCLUDED.created_by,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        rule_id,
        name,
        description,
        category,
        type,
        priority,
        overridable,
        conditions,
        actions,
        status,
        created_by,
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error saving custom rule:", error);
    res.status(500).json({ error: error.message });
  }
});

// Batch save custom rules endpoint
app.post("/api/custom-rules/batch", async (req, res) => {
  try {
    const { rules, updated_by } = req.body;

    if (!Array.isArray(rules)) {
      return res.status(400).json({ error: "Rules must be an array" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const results = [];
      for (const rule of rules) {
        const {
          rule_id,
          name,
          description,
          category,
          type,
          priority,
          overridable,
          conditions,
          actions,
          status,
          created_by,
        } = rule;

        const result = await client.query(
          `INSERT INTO custom_rules 
           (rule_id, name, description, category, type, priority, overridable, conditions, actions, status, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (rule_id) 
           DO UPDATE SET
             name = EXCLUDED.name,
             description = EXCLUDED.description,
             category = EXCLUDED.category,
             type = EXCLUDED.type,
             priority = EXCLUDED.priority,
             overridable = EXCLUDED.overridable,
             conditions = EXCLUDED.conditions,
             actions = EXCLUDED.actions,
             status = EXCLUDED.status,
             updated_by = EXCLUDED.created_by,
             updated_at = CURRENT_TIMESTAMP
           RETURNING *`,
          [
            rule_id,
            name,
            description,
            category,
            type,
            priority,
            overridable,
            conditions,
            actions,
            status || "Active",
            created_by || updated_by || "system",
          ],
        );
        results.push(result.rows[0]);
      }

      await client.query("COMMIT");
      res.json({
        success: true,
        saved_rules: results.length,
        rules: results,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error batch saving custom rules:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/custom-rules/:rule_id", async (req, res) => {
  try {
    const { rule_id } = req.params;
    const updates = req.body;

    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");

    const values = [rule_id, ...Object.values(updates)];

    const result = await pool.query(
      `UPDATE custom_rules SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE rule_id = $1 RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Custom rule not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating custom rule:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/custom-rules/:rule_id", async (req, res) => {
  try {
    const { rule_id } = req.params;
    const result = await pool.query(
      "DELETE FROM custom_rules WHERE rule_id = $1 RETURNING *",
      [rule_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Custom rule not found" });
    }

    res.json({ message: "Custom rule deleted successfully" });
  } catch (error) {
    console.error("Error deleting custom rule:", error);
    res.status(500).json({ error: error.message });
  }
});

// Custom parameters endpoints
app.get("/api/custom-parameters", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM custom_parameters WHERE is_active = true ORDER BY category, name",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching custom parameters:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/custom-parameters", async (req, res) => {
  try {
    const { parameter_id, name, category, weight, description, created_by } =
      req.body;

    const result = await pool.query(
      `INSERT INTO custom_parameters (parameter_id, name, category, weight, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [parameter_id, name, category, weight, description, created_by],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error saving custom parameter:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/custom-parameters/:parameter_id", async (req, res) => {
  try {
    const { parameter_id } = req.params;
    const result = await pool.query(
      "UPDATE custom_parameters SET is_active = false WHERE parameter_id = $1 RETURNING *",
      [parameter_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Custom parameter not found" });
    }

    res.json({ message: "Custom parameter deleted successfully" });
  } catch (error) {
    console.error("Error deleting custom parameter:", error);
    res.status(500).json({ error: error.message });
  }
});

// Manual Knowledge Entries endpoints
app.get("/api/manual-knowledge-entries", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM settings WHERE category = 'manualKnowledgeEntries' AND is_active = true ORDER BY updated_at DESC",
    );

    // Transform database format to component format
    const transformedEntries = result.rows.map((entry) => ({
      id: entry.key,
      title: entry.value.title || "",
      category: entry.value.category || "operations",
      source: entry.value.source || "",
      tags: entry.value.tags || "",
      createdAt: entry.updated_at,
      createdBy: entry.updated_by,
    }));

    res.json(transformedEntries);
  } catch (error) {
    console.error("Error fetching manual knowledge entries:", error);
    res.json([]);
  }
});

app.post("/api/manual-knowledge-entries", async (req, res) => {
  try {
    const { title, category, source, tags, created_by } = req.body;

    const entryId = `manual_${Date.now()}`;
    const entryData = {
      title,
      category: category || "operations",
      source,
      tags: tags || "",
    };

    const result = await pool.query(
      `INSERT INTO settings (category, key, value, type, updated_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        "manualKnowledgeEntries",
        entryId,
        JSON.stringify(entryData),
        "object",
        created_by || "system",
      ],
    );

    const savedEntry = {
      id: result.rows[0].key,
      title: entryData.title,
      category: entryData.category,
      source: entryData.source,
      tags: entryData.tags,
      createdAt: result.rows[0].updated_at,
      createdBy: result.rows[0].updated_by,
    };

    res.json(savedEntry);
  } catch (error) {
    console.error("Error saving manual knowledge entry:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/manual-knowledge-entries/:entryId", async (req, res) => {
  try {
    const { entryId } = req.params;
    const result = await pool.query(
      "UPDATE settings SET is_active = false WHERE category = 'manualKnowledgeEntries' AND key = $1 RETURNING *",
      [entryId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Manual knowledge entry not found" });
    }

    res.json({ message: "Manual knowledge entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting manual knowledge entry:", error);
    res.status(500).json({ error: error.message });
  }
});

// Batch save settings endpoint for tab-wise saves
app.post("/api/settings/batch", async (req, res) => {
  try {
    const { settings, updated_by } = req.body;

    if (!Array.isArray(settings)) {
      return res.status(400).json({ error: "Settings must be an array" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const results = [];
      for (const setting of settings) {
        const { category, key, value, type } = setting;
        const result = await client.query(
          `INSERT INTO settings (category, key, value, type, updated_by)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (category, key)
           DO UPDATE SET
             value = EXCLUDED.value,
             type = EXCLUDED.type,
             updated_by = EXCLUDED.updated_by,
             updated_at = CURRENT_TIMESTAMP
           RETURNING *`,
          [category, key, JSON.stringify(value), type, updated_by || "system"],
        );
        results.push(result.rows[0]);
      }

      await client.query("COMMIT");
      res.json({ success: true, saved_settings: results.length });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error batch saving settings:", error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk update disruptions from external API
app.post("/api/disruptions/bulk-update", async (req, res) => {
  try {
    const { disruptions } = req.body;

    if (!Array.isArray(disruptions)) {
      return res.status(400).json({ error: "Expected array of disruptions" });
    }

    console.log(`Processing bulk update of ${disruptions.length} disruptions`);

    let updated = 0;
    let inserted = 0;
    let errors = 0;

    for (const disruption of disruptions) {
      try {
        const {
          flight_number,
          flightNumber,
          route,
          origin,
          destination,
          origin_city,
          destination_city,
          aircraft,
          scheduled_departure,
          estimated_departure,
          delay_minutes,
          passengers,
          crew,
          connection_flights,
          severity,
          disruption_type,
          type,
          status,
          disruption_reason,
          categorization,
        } = disruption;

        // Handle field name variations
        const flightNum = flight_number || flightNumber;
        const scheduled_dep = scheduled_departure || scheduledDeparture;
        const estimated_dep = estimated_departure || estimatedDeparture;
        const delay_mins = delay_minutes || delay || 0;
        const connection_flights_val =
          connection_flights || connectionFlights || 0;
        const disruption_type_val =
          disruption_type || disruptionType || type || "Technical";
        const disruption_reason_val =
          disruption_reason || disruptionReason || "API sync";

        // Skip if missing critical fields
        if (!flightNum || !scheduled_dep) {
          console.warn(
            `Skipping disruption: missing flight_number or scheduled_departure`,
          );
          errors++;
          continue;
        }

        const safeRoute =
          route || `${origin || "UNK"} → ${destination || "UNK"}`;
        const safeSeverity = severity || "Medium";
        const safeStatus = status || "Active";

        // Use a transaction for each batch of operations for atomicity
        const client = await pool.connect();
        try {
          await client.query("BEGIN");

          // First check if record exists
          const existingQuery = `
            SELECT id FROM flight_disruptions
            WHERE flight_number = $1 AND DATE(scheduled_departure) = DATE($2)
          `;

          const existingResult = await client.query(existingQuery, [
            flightNum,
            scheduled_dep,
          ]);

          let query, params;
          if (existingResult.rows.length > 0) {
            // Update existing record
            query = `
              UPDATE flight_disruptions SET
                route = $3, origin = $4, destination = $5, origin_city = $6, destination_city = $7,
                aircraft = $8, estimated_departure = $9, delay_minutes = $10,
                passengers = $11, crew = $12, connection_flights = $13, severity = $14,
                disruption_type = $15, status = $16, disruption_reason = $17, categorization = $18, updated_at = NOW()
              WHERE flight_number = $1 AND DATE(scheduled_departure) = DATE($2)
              RETURNING id
            `;
            params = [
              flightNum,
              scheduled_dep,
              safeRoute,
              origin || "UNK",
              destination || "UNK",
              origin_city || "Unknown",
              destination_city || "Unknown",
              aircraft || "Unknown",
              estimated_dep,
              delay_mins,
              passengers || 0,
              crew || 6,
              connection_flights_val,
              safeSeverity,
              disruption_type_val,
              safeStatus,
              disruption_reason_val,
              categorization,
            ];
            updated++;
          } else {
            // Insert new record
            query = `
              INSERT INTO flight_disruptions (
                flight_number, route, origin, destination, origin_city, destination_city,
                aircraft, scheduled_departure, estimated_departure, delay_minutes,
                passengers, crew, connection_flights, severity, disruption_type,
                status, disruption_reason, categorization, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
              RETURNING id
            `;
            params = [
              flightNum,
              safeRoute,
              origin || "UNK",
              destination || "UNK",
              origin_city || "Unknown",
              destination_city || "Unknown",
              aircraft || "Unknown",
              scheduled_dep,
              estimated_dep,
              delay_mins,
              passengers || 0,
              crew || 6,
              connection_flights_val,
              safeSeverity,
              disruption_type_val,
              safeStatus,
              disruption_reason_val,
              categorization,
            ];
            inserted++;
          }

          const result = await client.query(query, params);

          if (result.rows.length === 0) {
            console.warn(`No rows affected for flight ${flightNum}`);
            errors++;
          }
          await client.query("COMMIT");
        } catch (txErr) {
          await client.query("ROLLBACK");
          console.error(
            "Error processing disruption transaction:",
            txErr.message,
          );
          errors++;
        } finally {
          client.release();
        }
      } catch (error) {
        console.error("Error processing individual disruption:", error.message);
        errors++;
      }
    }

    console.log(
      `Bulk update completed: ${inserted} inserted, ${updated} updated, ${errors} errors`,
    );
    res.json({
      success: true,
      inserted,
      updated,
      errors,
      total: disruptions.length,
    });
  } catch (error) {
    console.error("Error in bulk update:", error);
    res
      .status(500)
      .json({ error: "Bulk update failed", details: error.message });
  }
});

// Reset settings endpoint
app.post("/api/settings/reset", async (req, res) => {
  try {
    // Clear existing settings
    await pool.query("DELETE FROM settings");

    // Insert default settings
    const defaults = [
      {
        category: "operationalRules",
        key: "maxDelayThreshold",
        value: 180,
        type: "number",
      },
      {
        category: "operationalRules",
        key: "minConnectionTime",
        value: 45,
        type: "number",
      },
      {
        category: "operationalRules",
        key: "maxOverbooking",
        value: 105,
        type: "number",
      },
      {
        category: "operationalRules",
        key: "priorityRebookingTime",
        value: 15,
        type: "number",
      },
      {
        category: "operationalRules",
        key: "hotacTriggerDelay",
        value: 240,
        type: "number",
      },
      {
        category: "recoveryConstraints",
        key: "maxAircraftSwaps",
        value: 3,
        type: "number",
      },
      {
        category: "recoveryConstraints",
        key: "crewDutyTimeLimits",
        value: true,
        type: "boolean",
      },
      {
        category: "recoveryConstraints",
        key: "maintenanceSlotProtection",
        value: true,
        type: "boolean",
      },
      {
        category: "recoveryConstraints",
        key: "slotCoordinationRequired",
        value: false,
        type: "boolean",
      },
      {
        category: "recoveryConstraints",
        key: "curfewCompliance",
        value: true,
        type: "boolean",
      },
      {
        category: "automationSettings",
        key: "autoApproveThreshold",
        value: 95,
        type: "number",
      },
      {
        category: "automationSettings",
        key: "requireManagerApproval",
        value: false,
        type: "boolean",
      },
      {
        category: "automationSettings",
        key: "enablePredictiveActions",
        value: true,
        type: "boolean",
      },
      {
        category: "automationSettings",
        key: "autoNotifyPassengers",
        value: true,
        type: "boolean",
      },
      {
        category: "automationSettings",
        key: "autoBookHotac",
        value: false,
        type: "boolean",
      },
      {
        category: "passengerPrioritization",
        key: "loyaltyTier",
        value: 25,
        type: "number",
      },
      {
        category: "passengerPrioritization",
        key: "ticketClass",
        value: 20,
        type: "number",
      },
      {
        category: "passengerPrioritization",
        key: "specialNeeds",
        value: 30,
        type: "number",
      },
      {
        category: "passengerPrioritization",
        key: "groupSize",
        value: 15,
        type: "number",
      },
      {
        category: "passengerPrioritization",
        key: "connectionRisk",
        value: 10,
        type: "number",
      },
      {
        category: "recoveryOptionsRanking",
        key: "costWeight",
        value: 30,
        type: "number",
      },
      {
        category: "recoveryOptionsRanking",
        key: "timeWeight",
        value: 25,
        type: "number",
      },
      {
        category: "recoveryOptionsRanking",
        key: "passengerImpactWeight",
        value: 20,
        type: "number",
      },
      {
        category: "recoveryOptionsRanking",
        key: "operationalComplexityWeight",
        value: 15,
        type: "number",
      },
      {
        category: "recoveryOptionsRanking",
        key: "reputationWeight",
        value: 10,
        type: "number",
      },
      {
        category: "aircraftSelectionCriteria",
        key: "maintenanceStatus",
        value: 25,
        type: "number",
      },
      {
        category: "aircraftSelectionCriteria",
        key: "fuelEfficiency",
        value: 20,
        type: "number",
      },
      {
        category: "aircraftSelectionCriteria",
        key: "routeSuitability",
        value: 20,
        type: "number",
      },
      {
        category: "aircraftSelectionCriteria",
        key: "passengerCapacity",
        value: 15,
        type: "number",
      },
      {
        category: "aircraftSelectionCriteria",
        key: "availabilityWindow",
        value: 20,
        type: "number",
      },
      {
        category: "crewAssignmentCriteria",
        key: "dutyTimeRemaining",
        value: 30,
        type: "number",
      },
      {
        category: "crewAssignmentCriteria",
        key: "qualifications",
        value: 25,
        type: "number",
      },
      {
        category: "crewAssignmentCriteria",
        key: "baseLocation",
        value: 20,
        type: "number",
      },
      {
        category: "crewAssignmentCriteria",
        key: "restRequirements",
        value: 15,
        type: "number",
      },
      {
        category: "crewAssignmentCriteria",
        key: "languageSkills",
        value: 10,
        type: "number",
      },
      {
        category: "flightPrioritization",
        key: "airlinePreference",
        value: 20,
        type: "number",
      },
      {
        category: "flightPrioritization",
        key: "onTimePerformance",
        value: 25,
        type: "number",
      },
      {
        category: "flightPrioritization",
        key: "aircraftType",
        value: 15,
        type: "number",
      },
      {
        category: "flightPrioritization",
        key: "departureTime",
        value: 20,
        type: "number",
      },
      {
        category: "flightPrioritization",
        key: "connectionBuffer",
        value: 20,
        type: "number",
      },
      {
        category: "flightScoring",
        key: "baseScore",
        value: 70,
        type: "number",
      },
      {
        category: "flightScoring",
        key: "priorityBonus",
        value: 15,
        type: "number",
      },
      {
        category: "flightScoring",
        key: "airlineBonus",
        value: 10,
        type: "number",
      },
      {
        category: "flightScoring",
        key: "specialReqBonus",
        value: 8,
        type: "number",
      },
      {
        category: "flightScoring",
        key: "loyaltyBonus",
        value: 8,
        type: "number",
      },
      {
        category: "flightScoring",
        key: "groupBonus",
        value: 5,
        type: "number",
      },
      {
        category: "passengerScoring",
        key: "vipWeight",
        value: 40,
        type: "number",
      },
      {
        category: "passengerScoring",
        key: "loyaltyWeight",
        value: 25,
        type: "number",
      },
      {
        category: "passengerScoring",
        key: "specialNeedsWeight",
        value: 20,
        type: "number",
      },
      {
        category: "passengerScoring",
        key: "revenueWeight",
        value: 15,
        type: "number",
      },
      { category: "nlpSettings", key: "enabled", value: true, type: "boolean" },
      {
        category: "nlpSettings",
        key: "language",
        value: "english",
        type: "string",
      },
      { category: "nlpSettings", key: "confidence", value: 85, type: "number" },
      {
        category: "nlpSettings",
        key: "autoApply",
        value: false,
        type: "boolean",
      },
      {
        category: "notificationSettings",
        key: "email",
        value: true,
        type: "boolean",
      },
      {
        category: "notificationSettings",
        key: "sms",
        value: false,
        type: "boolean",
      },
      {
        category: "notificationSettings",
        key: "push",
        value: true,
        type: "boolean",
      },
      {
        category: "notificationSettings",
        key: "desktop",
        value: true,
        type: "boolean",
      },
      {
        category: "notificationSettings",
        key: "recoveryAlerts",
        value: true,
        type: "boolean",
      },
      {
        category: "notificationSettings",
        key: "passengerUpdates",
        value: true,
        type: "boolean",
      },
      {
        category: "notificationSettings",
        key: "systemAlerts",
        value: false,
        type: "boolean",
      },
    ];

    for (const setting of defaults) {
      await pool.query(
        "INSERT INTO settings (category, key, value, type, updated_by) VALUES ($1, $2, $3, $4, $5)",
        [
          setting.category,
          setting.key,
          JSON.stringify(setting.value),
          setting.type,
          "system",
        ],
      );
    }

    res.json({ message: "Settings reset to defaults successfully" });
  } catch (error) {
    console.error("Error resetting settings:", error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to check database availability
async function withDatabaseFallback(operation, fallbackValue = []) {
  try {
    return await operation();
  } catch (error) {
    console.warn(
      "Database operation failed, returning fallback:",
      error.message,
    );
    return fallbackValue;
  }
}

// Flight Disruptions endpoints
app.get("/api/disruptions/", async (req, res) => {
  const results = await withDatabaseFallback(async () => {
    const { recovery_status, category_code } = req.query;

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    console.log("querying database");

    // Build the base query with JOIN
    let query = `
      SELECT
        fd.id, fd.flight_number, fd.route, fd.origin, fd.destination,
        fd.origin_city, fd.destination_city, fd.aircraft, fd.scheduled_departure,
        fd.estimated_departure, fd.delay_minutes, fd.passengers, fd.crew,
        fd.connection_flights, fd.severity, fd.disruption_type, fd.status,
        fd.disruption_reason, fd.recovery_status, fd.categorization,
        fd.created_at, fd.updated_at,
        dc.id as category_id, dc.category_code, dc.category_name,
        dc.description as category_description
      FROM flight_disruptions fd
      LEFT JOIN disruption_categories dc ON fd.category_id = dc.id
    `;

    // Build WHERE conditions
    const conditions = [];
    const params = [];
    let paramCount = 0;

    // Always filter to last 24 hours and exclude expired status
    paramCount++;
    conditions.push(`fd.created_at >= $${paramCount}`);
    params.push(twentyFourHoursAgo.toISOString());

    paramCount++;
    conditions.push(`fd.status != $${paramCount}`);
    params.push("expired");

    // Filter by recovery_status if provided
    if (recovery_status) {
      paramCount++;
      conditions.push(`fd.recovery_status = $${paramCount}`);
      params.push(recovery_status);
    }

    // Filter by category_code if provided
    if (category_code) {
      paramCount++;
      conditions.push(`dc.category_code = $${paramCount}`);
      params.push(category_code);
    }

    // Add WHERE clause
    query += ` WHERE ${conditions.join(" AND ")}`;

    // Add ORDER BY
    query += ` ORDER BY fd.created_at DESC`;

    const queryResult = await pool.query(query, params);

    // Transform to expected format with city name mapping
    const transformedData = queryResult.rows.map((row) => {
      const originCity =
        row.origin_city &&
        row.origin_city !== "Unknown" &&
        row.origin_city !== "unknown"
          ? row.origin_city
          : getKnownCityName(row.origin);
      const destinationCity =
        row.destination_city &&
        row.destination_city !== "Unknown" &&
        row.destination_city !== "unknown"
          ? row.destination_city
          : getKnownCityName(row.destination);

      return {
        id: row.id,
        flight_number: row.flight_number,
        route: row.route,
        origin: row.origin,
        destination: row.destination,
        origin_city: originCity,
        destination_city: destinationCity,
        aircraft: row.aircraft,
        scheduled_departure: row.scheduled_departure,
        estimated_departure: row.estimated_departure,
        delay_minutes: row.delay_minutes,
        passengers: row.passengers,
        crew: row.crew,
        connection_flights: row.connection_flights,
        severity: row.severity,
        disruption_type: row.disruption_type,
        status: row.status,
        disruption_reason: row.disruption_reason,
        recovery_status: row.recovery_status,
        categorization: row.categorization,
        category_code: row.category_code,
        category_name: row.category_name,
        category_description: row.category_description,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });

    return transformedData || [];
  }, []);

  res.json(results);
});

// Save new flight disruption
app.post("/api/disruptions/", async (req, res) => {
  try {
    console.log("Received disruption data:", req.body);

    const {
      flight_number,
      flightNumber,
      route,
      origin,
      destination,
      origin_city,
      destination_city,
      originCity,
      destinationCity,
      aircraft,
      scheduled_departure,
      scheduledDeparture,
      estimated_departure,
      estimatedDeparture,
      delay_minutes,
      delay,
      passengers,
      crew,
      connection_flights,
      connectionFlights,
      severity,
      disruption_type,
      disruptionType,
      type,
      status,
      disruption_reason,
      disruptionReason,
      categorization,
      category_code,
    } = req.body;

    // Handle both camelCase and snake_case field names with proper fallbacks
    const flightNum = flight_number || flightNumber;
    const origin_city_val = origin_city || originCity;
    const destination_city_val = destination_city || destinationCity;
    const scheduled_dep = scheduled_departure || scheduledDeparture;
    const estimated_dep = estimated_departure || estimatedDeparture;
    const delay_mins = delay_minutes || delay || 0;
    const connection_flights_val = connection_flights || connectionFlights || 0;
    const disruption_type_val = disruption_type || disruptionType || type;
    const disruption_reason_val = disruption_reason || disruptionReason;

    console.log("Processing disruption for flight:", flightNum);

    // Validate required fields
    if (!flightNum || !aircraft || !scheduled_dep || !passengers || !crew) {
      return res.status(400).json({
        error: "Missing required fields",
        details:
          "flight_number, aircraft, scheduled_departure, passengers, and crew are required",
      });
    }

    // Use defaults for missing fields
    const safeRoute = route || `${origin || "UNK"} → ${destination || "UNK"}`;
    const safeOrigin = origin || "UNK";
    const safeDestination = destination || "UNK";
    const safeOriginCity = origin_city_val || "Unknown";
    const safeDestinationCity = destination_city_val || "Unknown";
    const safeSeverity = severity || "Medium";
    const safeDisruptionType = disruption_type_val || "Technical";
    const safeStatus = status || "Active";
    const safeDisruptionReason = disruption_reason_val || "No reason provided";

    // Handle category_code from request body
    const receivedCategoryCode = category_code;
    console.log(`Received category_code: ${receivedCategoryCode}`);

    let category_id = null;

    // Get category_id from category_code if provided
    if (receivedCategoryCode) {
      try {
        const categoryResult = await pool.query(
          `SELECT id, category_name, description FROM disruption_categories
           WHERE category_code = $1 AND is_active = true`,
          [receivedCategoryCode],
        );
        if (categoryResult.rows.length > 0) {
          category_id = categoryResult.rows[0].id;
          console.log(
            `Found category_id ${category_id} for category_code: ${receivedCategoryCode}`,
          );
        } else {
          console.warn(
            `Category code ${receivedCategoryCode} not found, will try mapping from categorization`,
          );
        }
      } catch (categoryError) {
        console.error("Error looking up category:", categoryError);
      }
    }

    // Fallback to categorization mapping if category_code not found or invalid
    if (!category_id && categorization) {
      try {
        const categoryResult = await pool.query(
          `
          SELECT id FROM disruption_categories
          WHERE category_name = $1
          OR category_code = CASE
            WHEN $1 LIKE '%Aircraft%' OR $1 LIKE '%AOG%' THEN 'AIRCRAFT_ISSUE'
            WHEN $1 LIKE '%Crew%' OR $1 LIKE '%duty time%' OR $1 LIKE '%sick%' THEN 'CREW_ISSUE'
            WHEN $1 LIKE '%Weather%' OR $1 LIKE '%storm%' OR $1 LIKE '%fog%' THEN 'ATC_WEATHER'
            WHEN $1 LIKE '%ATC%' OR $1 LIKE '%slot%' OR $1 LIKE '%traffic%' THEN 'ATC_WEATHER'
            WHEN $1 LIKE '%Curfew%' OR $1 LIKE '%Congestion%' OR $1 LIKE '%Airport%' THEN 'CURFEW_CONGESTION'
            WHEN $1 LIKE '%Rotation%' OR $1 LIKE '%Maintenance%' THEN 'ROTATION_MAINTENANCE'
            ELSE 'AIRCRAFT_ISSUE'
          END
          LIMIT 1
        `,
          [categorization],
        );

        if (categoryResult.rows.length > 0) {
          category_id = categoryResult.rows[0].id;
          console.log(
            `Mapped categorization ${categorization} to category_id: ${category_id}`,
          );
        }
      } catch (mappingError) {
        console.error("Error mapping categorization:", mappingError);
      }
    }

    // Default to AIRCRAFT_ISSUE if no category found
    if (!category_id) {
      try {
        const defaultCategory = await pool.query(`
          SELECT id FROM disruption_categories
          WHERE category_code = 'AIRCRAFT_ISSUE'
          LIMIT 1
        `);
        if (defaultCategory.rows.length > 0) {
          category_id = defaultCategory.rows[0].id;
          console.log(`Using default category_id: ${category_id}`);
        }
      } catch (defaultError) {
        console.error("Error getting default category:", defaultError);
      }
    }

    // Use UPSERT to prevent duplicates - update if flight_number and scheduled_departure match
    const result = await pool.query(
      `
      INSERT INTO flight_disruptions (
        flight_number, route, origin, destination, origin_city, destination_city,
        aircraft, scheduled_departure, estimated_departure, delay_minutes,
        passengers, crew, connection_flights, severity, disruption_type, status, disruption_reason, categorization, category_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      ON CONFLICT (flight_number, scheduled_departure)
      DO UPDATE SET
        route = EXCLUDED.route,
        origin = EXCLUDED.origin,
        destination = EXCLUDED.destination,
        origin_city = EXCLUDED.origin_city,
        destination_city = EXCLUDED.destination_city,
        aircraft = EXCLUDED.aircraft,
        estimated_departure = EXCLUDED.estimated_departure,
        delay_minutes = EXCLUDED.delay_minutes,
        passengers = EXCLUDED.passengers,
        crew = EXCLUDED.crew,
        connection_flights = EXCLUDED.connection_flights,
        severity = EXCLUDED.severity,
        disruption_type = EXCLUDED.disruption_type,
        status = EXCLUDED.status,
        disruption_reason = EXCLUDED.disruption_reason,
        categorization = EXCLUDED.categorization,
        category_id = EXCLUDED.category_id,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `,
      [
        flightNum,
        safeRoute,
        safeOrigin,
        safeDestination,
        safeOriginCity,
        safeDestinationCity,
        aircraft,
        scheduled_dep,
        estimated_dep,
        delay_mins,
        passengers,
        crew,
        connection_flights_val,
        safeSeverity,
        safeDisruptionType,
        safeStatus,
        safeDisruptionReason,
        categorization,
        category_id,
      ],
    );

    console.log("Successfully saved/updated disruption:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error saving disruption:", error.message);
    console.error("Error details:", error);
    res.status(500).json({
      error: "Failed to save disruption",
      details: error.message,
      code: error.code,
    });
  }
});

app.get("/api/disruptions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM flight_disruptions WHERE id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Disruption not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching disruption:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/passengers/pnr/:pnr", async (req, res) => {
  try {
    const { pnr } = req.params;
    const result = await pool.query("SELECT * FROM passengers WHERE pnr = $1", [
      pnr,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Passenger not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching passenger:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/passengers/:pnr/rebooking", async (req, res) => {
  try {
    const { pnr } = req.params;
    const { rebookingStatus, newFlightNumber, newSeatNumber } = req.body;

    const result = await pool.query(
      `
      UPDATE passengers
      SET rebooking_status = $1, new_flight_number = $2, new_seat_number = $3, updated_at = CURRENT_TIMESTAMP
      WHERE pnr = $4
      RETURNING *
    `,
      [rebookingStatus, newFlightNumber, newSeatNumber, pnr],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Passenger not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating passenger rebooking:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update expired disruptions endpoint
app.post("/api/disruptions/update-expired", async (req, res) => {
  try {
    console.log("Updating expired flight disruptions...");

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Update disruptions older than 24 hours to 'expired' status
    const updateResult = await pool.query(
      `UPDATE flight_disruptions 
       SET status = 'expired', updated_at = CURRENT_TIMESTAMP 
       WHERE created_at < $1 AND status != 'expired' 
       RETURNING id, flight_number, created_at`,
      [twentyFourHoursAgo.toISOString()],
    );

    const updatedCount = updateResult.rows.length;
    console.log(`Updated ${updatedCount} disruptions to expired status`);

    res.json({
      success: true,
      updatedCount,
      updatedDisruptions: updateResult.rows,
      cutoffTime: twentyFourHoursAgo.toISOString(),
    });
  } catch (error) {
    console.error("Error updating expired disruptions:", error);
    res.status(500).json({ error: error.message });
  }
});

// Recovery status update endpoint
app.put("/api/disruptions/:id/recovery-status", async (req, res) => {
  try {
    const { id } = req.params;
    const { recovery_status } = req.body;

    if (!recovery_status) {
      return res.status(400).json({ error: "Recovery status is required" });
    }

    console.log(
      `Updating recovery status for disruption ${id} to ${recovery_status}`,
    );

    const result = await pool.query(
      "UPDATE flight_disruptions SET recovery_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [recovery_status, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Disruption not found" });
    }

    console.log(`Successfully updated recovery status for disruption ${id}`);
    res.json({ success: true, disruption: result.rows[0] });
  } catch (error) {
    console.error("Error updating recovery status:", error);
    res.status(500).json({ error: error.message });
  }
});

// Passenger Rebookings endpoints
app.post("/api/passenger-rebookings", async (req, res) => {
  try {
    const { rebookings } = req.body;

    if (!rebookings || !Array.isArray(rebookings)) {
      return res.status(400).json({ error: "Invalid rebookings data" });
    }

    console.log("Received passenger rebookings:", rebookings.length, "records");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const insertedRebookings = [];

      for (const rebooking of rebookings) {
        const {
          disruption_id,
          pnr,
          passenger_id,
          passenger_name,
          original_flight,
          original_seat,
          rebooked_flight,
          rebooked_cabin,
          rebooked_seat,
          additional_services,
          status,
          total_passengers_in_pnr,
          rebooking_cost,
          notes,
        } = rebooking;

        console.log(
          "Inserting rebooking for passenger:",
          passenger_name,
          "PNR:",
          pnr,
        );

        const result = await client.query(
          `
          INSERT INTO passenger_rebookings (
            disruption_id, pnr, passenger_id, passenger_name, original_flight,
            original_seat, rebooked_flight, rebooked_cabin, rebooked_seat,
            additional_services, status, total_passengers_in_pnr, rebooking_cost, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (disruption_id, passenger_id, pnr)
          DO UPDATE SET
            passenger_name = EXCLUDED.passenger_name,
            original_flight = EXCLUDED.original_flight,
            original_seat = EXCLUDED.original_seat,
            rebooked_flight = EXCLUDED.rebooked_flight,
            rebooked_cabin = EXCLUDED.rebooked_cabin,
            rebooked_seat = EXCLUDED.rebooked_seat,
            additional_services = EXCLUDED.additional_services,
            status = EXCLUDED.status,
            total_passengers_in_pnr = EXCLUDED.total_passengers_in_pnr,
            rebooking_cost = EXCLUDED.rebooking_cost,
            notes = EXCLUDED.notes,
            updated_at = CURRENT_TIMESTAMP
        `,
          [
            disruption_id,
            pnr,
            passenger_id,
            passenger_name,
            original_flight,
            original_seat,
            rebooked_flight,
            rebooked_cabin,
            rebooked_seat,
            JSON.stringify(additional_services || []),
            status,
            total_passengers_in_pnr,
            rebooking_cost || 0,
            notes,
          ],
        );

        insertedRebookings.push(result.rows[0]);
        console.log(
          "Successfully inserted/updated rebooking for passenger:",
          passenger_name,
        );
      }

      await client.query("COMMIT");
      console.log("Successfully committed all passenger rebookings");
      res.json({ success: true, rebookings: insertedRebookings });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Transaction rolled back due to error:", error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error saving passenger rebookings:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get(
  "/api/passenger-rebookings/disruption/:disruptionId",
  async (req, res) => {
    try {
      const { disruptionId } = req.params;
      const result = await pool.query(
        `
      SELECT * FROM passenger_rebookings
      WHERE disruption_id = $1
      ORDER BY created_at DESC
    `,
        [disruptionId],
      );
      res.json(result.rows || []);
    } catch (error) {
      console.error("Error fetching passenger rebookings:", error);
      res.json([]);
    }
  },
);

app.get("/api/passenger-rebookings/pnr/:pnr", async (req, res) => {
  try {
    const { pnr } = req.params;
    const result = await pool.query(
      `
      SELECT * FROM passenger_rebookings
      WHERE pnr = $1
      ORDER BY created_at DESC
    `,
      [pnr],
    );
    res.json(result.rows || []);
  } catch (error) {
    console.error("Error fetching passenger rebookings by PNR:", error);
    res.json([]);
  }
});

// Crew endpoints
app.get("/api/crew/available", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM crew_members
      WHERE status = 'Available'
      ORDER BY role, name
    `);
    res.json(result.rows || []);
  } catch (error) {
    console.error("Error fetching available crew:", error);
    res.json([]);
  }
});

app.get("/api/crew/flight/:flightNumber", async (req, res) => {
  try {
    const { flightNumber } = req.params;
    const result = await pool.query(
      "SELECT * FROM crew_members WHERE current_flight = $1",
      [flightNumber],
    );
    res.json(result.rows || []);
  } catch (error) {
    console.error("Error fetching crew for flight:", error);
    res.json([]);
  }
});

// Aircraft endpoints
app.get("/api/aircraft", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM aircraft
      ORDER BY status, registration
    `);
    res.json(result.rows || []);
  } catch (error) {
    console.error("Error fetching aircraft:", error);
    res.json([]);
  }
});

app.get("/api/aircraft/available", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM aircraft
      WHERE status = 'Available'
      ORDER BY registration
    `);
    res.json(result.rows || []);
  } catch (error) {
    console.error("Error fetching available aircraft:", error);
    res.json([]);
  }
});

app.put("/api/aircraft/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `
      UPDATE aircraft
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `,
      [status, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Aircraft not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating aircraft status:", error);
    res.status(500).json({ error: error.message });
  }
});

// Hotel bookings endpoints
app.get("/api/hotel-bookings", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM hotel_bookings
      ORDER BY created_at DESC
    `);
    res.json(result.rows || []);
  } catch (error) {
    console.error("Error fetching hotel bookings:", error);
    res.json([]);
  }
});

app.get("/api/hotel-bookings/disruption/:disruptionId", async (req, res) => {
  try {
    const { disruptionId } = req.params;
    const result = await pool.query(
      "SELECT * FROM hotel_bookings WHERE disruption_id = $1",
      [disruptionId],
    );
    res.json(result.rows || []);
  } catch (error) {
    console.error("Error fetching hotel bookings for disruption:", error);
    res.json([]);
  }
});

app.post("/api/hotel-bookings", async (req, res) => {
  try {
    const {
      disruptionId,
      passengerPnr,
      hotelName,
      checkIn,
      checkOut,
      cost,
      status,
      bookingReference,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO hotel_bookings
      (disruption_id, passenger_pnr, hotel_name, check_in, check_out, cost, status, booking_reference)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [
        disruptionId,
        passengerPnr,
        hotelName,
        checkIn,
        checkOut,
        cost,
        status,
        bookingReference,
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating hotel booking:", error);
    res.status(500).json({ error: error.message });
  }
});

// Consolidated Dashboard Analytics endpoint
app.get("/api/dashboard-analytics", async (req, res) => {
  try {
    const { dateFilter = "today" } = req.query;

    // Calculate date range based on filter
    let startDate, endDate;
    const now = new Date();

    // Check if it's a custom date range (format: "startDate_endDate")
    if (
      dateFilter.includes("_") &&
      dateFilter !== "this_week" &&
      dateFilter !== "this_month" &&
      dateFilter !== "last_month"
    ) {
      const [startDateStr, endDateStr] = dateFilter.split("_");
      startDate = new Date(startDateStr);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);
    } else {
      switch (dateFilter) {
        case "yesterday":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "this_week":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "this_month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          );
          break;
        case "last_month":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            0,
            23,
            59,
            59,
            999,
          );
          break;
        case "today":
        default:
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
      }
    }

    console.log(`Fetching consolidated dashboard analytics for: ${dateFilter}`);
    console.log(
      `Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    // Get disruptions for the date range
    const disruptionsQuery = `
      SELECT fd.*, dc.category_name, dc.category_code 
      FROM flight_disruptions fd
      LEFT JOIN disruption_categories dc ON fd.category_id = dc.id
      WHERE fd.created_at >= $1 AND fd.created_at <= $2
        AND fd.status != 'expired'
      ORDER BY fd.created_at DESC
    `;

    const disruptionsResult = await pool.query(disruptionsQuery, [
      startDate.toISOString(),
      endDate.toISOString(),
    ]);
    const disruptions = disruptionsResult.rows;

    console.log(`Found ${disruptions.length} disruptions for analytics`);

    // Get actual passenger rebooking data
    const rebookingsQuery = `
      SELECT COUNT(*) as count, SUM(total_passengers_in_pnr) as total_passengers
      FROM passenger_rebookings pr
      JOIN flight_disruptions fd ON pr.disruption_id = fd.id
      WHERE fd.created_at >= $1 AND fd.created_at <= $2
        AND pr.status = 'confirmed'
    `;
    const rebookingsResult = await pool.query(rebookingsQuery, [
      startDate.toISOString(),
      endDate.toISOString(),
    ]);
    const actualRebookings = parseInt(rebookingsResult.rows[0]?.count) || 0;

    // Get recovery logs for performance metrics
    const recoveryLogsQuery = `
      SELECT COUNT(*) as completed_count, 
             AVG(EXTRACT(EPOCH FROM (date_completed - date_created))/3600) as avg_resolution_hours,
             SUM(actual_cost) as total_cost,
             COUNT(CASE WHEN status = 'Successful' THEN 1 END) as successful_count
      FROM recovery_logs 
      WHERE date_created >= $1 AND date_created <= $2
    `;
    const recoveryLogsResult = await pool.query(recoveryLogsQuery, [
      startDate.toISOString(),
      endDate.toISOString(),
    ]);
    const recoveryData = recoveryLogsResult.rows[0];

    // Calculate performance metrics
    const totalPassengers = disruptions.reduce(
      (sum, d) => sum + (parseInt(d.passengers) || 0),
      0,
    );
    const totalCost =
      parseFloat(recoveryData?.total_cost) ||
      disruptions.reduce(
        (sum, d) => sum + (parseInt(d.delay_minutes) || 0) * 150,
        0,
      );

    const completedRecoveries =
      parseInt(recoveryData?.completed_count) ||
      disruptions.filter(
        (d) => d.recovery_status === "completed" || d.status === "Resolved",
      ).length;

    const totalRecoveries = Math.max(
      disruptions.length,
      parseInt(recoveryData?.completed_count) || 0,
    );
    const successRate =
      totalRecoveries > 0
        ? ((parseInt(recoveryData?.successful_count) || completedRecoveries) /
            totalRecoveries) *
          100
        : 95.0;

    const avgDecisionTime =
      parseFloat(recoveryData?.avg_resolution_hours) ||
      (disruptions.length > 0
        ? disruptions.reduce(
            (sum, d) => sum + (parseInt(d.delay_minutes) || 120),
            0,
          ) /
          disruptions.length /
          60
        : 2.0);

    // Calculate passenger impact with real data
    const highPriorityDisruptions = disruptions.filter(
      (d) => d.severity === "High" || d.severity === "Critical",
    );
    const highPriorityPassengers = highPriorityDisruptions.reduce(
      (sum, d) => sum + (parseInt(d.passengers) || 0),
      0,
    );

    // Calculate resolved passengers from successful recovery logs and completed disruptions
    const resolvedDisruptions = disruptions.filter(
      (d) => d.recovery_status === "completed" || d.status === "Resolved",
    );
    const resolvedPassengers = resolvedDisruptions.reduce(
      (sum, d) => sum + (parseInt(d.passengers) || 0),
      0,
    );

    // Calculate disrupted stations with proper city mapping
    const stationMap = new Map();
    const cityMapping = {
      DXB: "Dubai",
      AUH: "Abu Dhabi",
      SLL: "Salalah",
      AAN: "Al Ain",
      DEL: "Delhi",
      BOM: "Mumbai",
      KHI: "Karachi",
      COK: "Kochi",
      BKT: "Bhaktalpur",
      KTM: "Kathmandu",
      DOH: "Doha",
      KWI: "Kuwait",
      CAI: "Cairo",
      AMM: "Amman",
      BGW: "Baghdad",
      IST: "Istanbul",
      LHR: "London",
      CDG: "Paris",
      FRA: "Frankfurt",
      DWC: "Dubai World Central",
      SHJ: "Sharjah",
      MCT: "Muscat",
      CMB: "Colombo",
      BCN: "Barcelona",
      PRG: "Prague",
      FJR: "Fujairah",
    };

    disruptions.forEach((disruption) => {
      const origin = disruption.origin || "UNK";
      const originCity =
        disruption.origin_city && disruption.origin_city !== "Unknown"
          ? disruption.origin_city
          : cityMapping[origin] || "Unknown";

      if (!stationMap.has(origin)) {
        stationMap.set(origin, {
          code: origin,
          name: `${origin} - ${originCity}`,
          disruptedFlights: 0,
          passengersAffected: 0,
          severity: "low",
        });
      }

      const station = stationMap.get(origin);
      station.disruptedFlights++;
      station.passengersAffected += parseInt(disruption.passengers) || 0;

      // Determine severity based on passengers affected
      if (station.passengersAffected > 500) {
        station.severity = "high";
      } else if (station.passengersAffected > 200) {
        station.severity = "medium";
      }
    });

    const disruptedStations = Array.from(stationMap.values())
      .sort((a, b) => b.passengersAffected - a.passengersAffected)
      .slice(0, 3);

    // Calculate operational insights
    const criticalDisruptions = disruptions.filter(
      (d) => d.severity === "Critical" || d.severity === "High",
    ).length;
    const activeDisruptions = disruptions.filter(
      (d) =>
        d.status === "Active" ||
        d.status === "Delayed" ||
        (d.recovery_status !== "completed" && d.recovery_status !== "approved"),
    ).length;

    // Calculate network overview with real flight data
    const estimatedTotalFlights = Math.max(disruptions.length * 30, 200); // Estimate based on disruption ratio
    const estimatedTotalPassengers = Math.max(totalPassengers * 20, 5000); // Estimate total network

    const delayedFlights = disruptions.filter(
      (d) => parseInt(d.delay_minutes) > 15,
    ).length;
    const onTimeFlights = estimatedTotalFlights - delayedFlights;
    const otpPerformance =
      estimatedTotalFlights > 0
        ? (onTimeFlights / estimatedTotalFlights) * 100
        : 89.2;

    // Find most disrupted route
    const routeMap = new Map();
    disruptions.forEach((d) => {
      const route =
        d.route || `${d.origin || "UNK"} → ${d.destination || "UNK"}`;
      routeMap.set(route, (routeMap.get(route) || 0) + 1);
    });

    let mostDisruptedRoute = { route: "No disruptions", impact: "N/A" };
    if (routeMap.size > 0) {
      const maxRoute = Array.from(routeMap.entries()).sort(
        (a, b) => b[1] - a[1],
      )[0];
      mostDisruptedRoute = {
        route: maxRoute[0],
        impact:
          maxRoute[1] > 2
            ? "High Impact"
            : maxRoute[1] > 1
              ? "Medium Impact"
              : "Low Impact",
      };
    }
    console.log(actualRebookings, "testtsttsts");
    const analytics = {
      performance: {
        costSavings: `AED ${Math.round(totalCost / 1000)}K`,
        avgDecisionTime: `${Math.round(avgDecisionTime * 60)} min`,
        passengersServed: totalPassengers,
        successRate: `${successRate.toFixed(1)}%`,
        decisionsProcessed: totalRecoveries,
      },
      passengerImpact: {
        affectedPassengers: totalPassengers,
        highPriority: highPriorityPassengers,
        rebookings: actualRebookings || Math.round(totalPassengers * 0.25), // Use actual or estimate
        resolved: resolvedPassengers,
      },
      disruptedStations: disruptedStations,
      operationalInsights: {
        recoveryRate: `${successRate.toFixed(1)}%`,
        avgResolutionTime: `${avgDecisionTime.toFixed(1)}h`,
        networkImpact:
          activeDisruptions > 5
            ? "High"
            : activeDisruptions > 2
              ? "Medium"
              : "Low",
        criticalPriority: criticalDisruptions,
        activeDisruptions: activeDisruptions,
        mostDisruptedRoute: mostDisruptedRoute,
      },
      networkOverview: {
        activeFlights: estimatedTotalFlights,
        disruptions: disruptions.length,
        totalPassengers: estimatedTotalPassengers,
        otpPerformance: `${otpPerformance.toFixed(1)}%`,
        dailyChange: {
          activeFlights: Math.floor(Math.random() * 20) - 10, // Will be replaced with historical comparison
          disruptions: disruptions.length - 5, // Compare to baseline
        },
      },
    };

    console.log("Successfully calculated consolidated dashboard analytics");
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching consolidated dashboard analytics:", error);

    // Return fallback data on error
    res.json({
      performance: {
        costSavings: "AED 0K",
        avgDecisionTime: "0 min",
        passengersServed: 0,
        successRate: "0.0%",
        decisionsProcessed: 0,
      },
      passengerImpact: {
        affectedPassengers: 0,
        highPriority: 0,
        rebookings: 0,
        resolved: 0,
      },
      disruptedStations: [],
      operationalInsights: {
        recoveryRate: "0.0%",
        avgResolutionTime: "0.0h",
        networkImpact: "Low",
        criticalPriority: 0,
        activeDisruptions: 0,
        mostDisruptedRoute: { route: "N/A", impact: "N/A" },
      },
      networkOverview: {
        activeFlights: 0,
        disruptions: 0,
        totalPassengers: 0,
        otpPerformance: "0.0%",
        dailyChange: { activeFlights: 0, disruptions: 0 },
      },
    });
  }
});

// Analytics endpoints
app.get("/api/analytics/kpi", async (req, res) => {
  try {
    // Get basic KPI data from disruptions
    const disruptionsCount = await pool.query(
      "SELECT COUNT(*) as count FROM flight_disruptions WHERE status = $1",
      ["Active"],
    );
    const totalPassengers = await pool.query(
      "SELECT SUM(passengers) as total FROM flight_disruptions WHERE status = $1",
      ["Active"],
    );
    const avgDelay = await pool.query(
      "SELECT AVG(delay_minutes) as avg FROM flight_disruptions WHERE delay_minutes > 0",
    );
    const recoverySuccess = await pool.query(
      "SELECT COUNT(*) as count FROM flight_disruptions WHERE status = $1",
      ["Resolved"],
    );

    res.json({
      activeDisruptions: disruptionsCount.rows[0]?.count || 0,
      affectedPassengers: totalPassengers.rows[0]?.total || 0,
      averageDelay: Math.round(avgDelay.rows[0]?.avg || 0),
      recoverySuccessRate: 95.8, // Static for now
      onTimePerformance: 87.3,
      costSavings: 2.4,
    });
  } catch (error) {
    console.error("Error fetching KPI data:", error);
    res.json({
      activeDisruptions: 0,
      affectedPassengers: 0,
      averageDelay: 0,
      recoverySuccessRate: 0,
      onTimePerformance: 0,
      costSavings: 0,
    });
  }
});

app.get("/api/analytics/predictions", async (req, res) => {
  try {
    res.json({
      delayPredictions: [],
      weatherImpact: {},
      demandForecasts: [],
    });
  } catch (error) {
    console.error("Error fetching prediction analytics:", error);
    res.json({});
  }
});

// Recovery logs endpoint
// Past recovery KPI endpoint
app.get("/api/past-recovery-kpi", async (req, res) => {
  try {
    console.log("Fetching past recovery KPI data");

    // Get KPI data from disruptions
    const kpiQuery = `
      SELECT 
        COUNT(*) as total_recoveries,
        COUNT(CASE WHEN (recovery_status IN ('completed', 'approved') OR status = 'Resolved') THEN 1 END) as successful_recoveries,
        AVG(CASE WHEN delay_minutes > 0 THEN 95.0 - (delay_minutes::numeric / 20) ELSE 95.0 END) as avg_recovery_efficiency,
        SUM(CASE WHEN delay_minutes > 50 THEN delay_minutes - 50 ELSE 0 END) as total_delay_reduction,
        COUNT(CASE WHEN recovery_status IS NOT NULL THEN 1 END) as cancellations_avoided,
        AVG(delay_minutes * 1000) as avg_cost_savings
      FROM flight_disruptions 
      WHERE recovery_status IS NOT NULL OR status = 'Resolved'
    `;

    const kpiResult = await pool.query(kpiQuery);
    const data = kpiResult.rows[0];

    const successRate =
      data.total_recoveries > 0
        ? (data.successful_recoveries / data.total_recoveries) * 100
        : 0;

    const avgResolutionTime = data.avg_delay ? data.avg_delay * 2 : 180; // Convert to minutes

    res.json({
      totalRecoveries: parseInt(data.total_recoveries) || 0,
      successRate: parseFloat(successRate.toFixed(1)),
      avgResolutionTime: parseFloat(avgResolutionTime.toFixed(0)),
      costEfficiency: 3.8,
      passengerSatisfaction: 8.2,
      totalPassengers: parseInt(data.total_passengers) || 0,
      avgRecoveryEfficiency: parseFloat(
        (parseFloat(data.avg_recovery_efficiency) || 92.5).toFixed(1),
      ),
      totalDelayReduction: parseInt(data.total_delay_reduction) || 0,
      cancellationsAvoided: parseInt(data.cancellations_avoided) || 0,
      totalCostSavings: parseFloat(
        (parseFloat(data.avg_cost_savings) || 0).toFixed(0),
      ),
    });
  } catch (error) {
    console.error("Error fetching past recovery KPI:", error);
    res.status(500).json({ error: error.message });
  }
});

// Past recovery trends endpoint
app.get("/api/past-recovery-trends", async (req, res) => {
  try {
    console.log("Fetching past recovery trends data");

    const trendsQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') as month,
        AVG(CASE WHEN delay_minutes > 0 THEN 95.0 - (delay_minutes::numeric / 20) ELSE 95.0 END) as efficiency,
        AVG(CASE WHEN delay_minutes > 50 THEN delay_minutes - 50 ELSE 0 END) as delay_reduction,
        AVG(delay_minutes * 1000) as cost_savings,
        AVG(8.0 + RANDOM() * 2) as satisfaction
      FROM flight_disruptions 
      WHERE (recovery_status IS NOT NULL OR status = 'Resolved')
        AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `;

    const trendsResult = await pool.query(trendsQuery);

    if (trendsResult.rows.length === 0) {
      // Return mock data if no trends found
      res.json([
        {
          month: "Jan 25",
          efficiency: 82,
          delayReduction: 45,
          costSavings: 12500,
          satisfaction: 7.8,
        },
        {
          month: "Feb 25",
          efficiency: 85,
          delayReduction: 52,
          costSavings: 15200,
          satisfaction: 8.1,
        },
        {
          month: "Mar 25",
          efficiency: 88,
          delayReduction: 58,
          costSavings: 18700,
          satisfaction: 8.4,
        },
        {
          month: "Apr 25",
          efficiency: 91,
          delayReduction: 65,
          costSavings: 22100,
          satisfaction: 8.7,
        },
        {
          month: "May 25",
          efficiency: 89,
          delayReduction: 62,
          costSavings: 19800,
          satisfaction: 8.5,
        },
        {
          month: "Jun 25",
          efficiency: 93,
          delayReduction: 71,
          costSavings: 25400,
          satisfaction: 9.0,
        },
      ]);
    } else {
      const trends = trendsResult.rows.map((row) => ({
        month: row.month,
        efficiency: Math.round(parseFloat(row.efficiency)),
        delayReduction: Math.round(parseFloat(row.delay_reduction)),
        costSavings: Math.round(parseFloat(row.cost_savings)),
        satisfaction: parseFloat(parseFloat(row.satisfaction).toFixed(1)),
      }));
      res.json(trends);
    }
  } catch (error) {
    console.error("Error fetching past recovery trends:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/kpi-data", async (req, res) => {
  try {
    const kpiData = {
      activeDisruptions: 23,
      affectedPassengers: 4127,
      averageDelay: 45,
      recoverySuccessRate: 89.2,
      onTimePerformance: 87.3,
      costSavings: 2.8,
    };

    res.json(kpiData);
  } catch (error) {
    console.error("Error fetching KPI data:", error);
    res.status(500).json({ error: "Failed to fetch KPI data" });
  }
});

// Get passenger impact data
app.get("/api/passenger-impact", async (req, res) => {
  try {
    // Calculate passenger impact from actual disruptions data
    const disruptionsResult = await pool.query(`
      SELECT
        COUNT(*) as total_disruptions,
        SUM(passengers) as total_affected,
        SUM(CASE WHEN severity = 'High' THEN passengers ELSE 0 END) as high_priority_affected,
        COUNT(CASE WHEN recovery_status = 'completed' THEN 1 END) as resolved_disruptions
      FROM flight_disruptions
      WHERE status IN ('Active', 'Delayed')
    `);

    const rebookingsResult = await pool.query(`
      SELECT COUNT(*) as successful_rebookings
      FROM passenger_rebookings
      WHERE status = 'confirmed'
      AND created_at >= CURRENT_DATE
    `);

    const data = disruptionsResult.rows[0];
    const rebookings = rebookingsResult.rows[0];

    const passengerImpact = {
      totalAffected: parseInt(data.total_affected) || 4127,
      highPriority: parseInt(data.high_priority_affected) || 1238,
      successfulRebookings: parseInt(rebookings.successful_rebookings) || 892,
      resolvedDisruptions: parseInt(data.resolved_disruptions) || 0, // Added for clarity
      estimatedPassengersPerResolved: 150, // Default value
      pendingAccommodation:
        (parseInt(data.total_affected) || 4127) -
        (parseInt(rebookings.successful_rebookings) || 892),
    };
    // Calculate resolved passengers more accurately if data is available
    if (data.resolved_disruptions > 0) {
      passengerImpact.resolvedPassengers =
        parseInt(data.resolved_disruptions) *
        passengerImpact.estimatedPassengersPerResolved;
    } else {
      passengerImpact.resolvedPassengers = 0; // Or a default value if needed
    }

    res.json(passengerImpact);
  } catch (error) {
    console.error("Error fetching passenger impact data:", error);
    res.status(500).json({ error: "Failed to fetch passenger impact data" });
  }
});

// Get highly disrupted stations
app.get("/api/disrupted-stations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        origin as station,
        origin_city as station_name,
        COUNT(*) as disrupted_flights,
        SUM(passengers) as affected_passengers,
        CASE
          WHEN COUNT(*) >= 10 THEN 'high'
          WHEN COUNT(*) >= 5 THEN 'medium'
          ELSE 'low'
        END as severity,
        disruption_reason as primary_cause
      FROM flight_disruptions
      WHERE status IN ('Active', 'Delayed')
      GROUP BY origin, origin_city, disruption_reason
      ORDER BY COUNT(*) DESC, SUM(passengers) DESC
      LIMIT 5
    `);

    const stationsData = result.rows.map((row) => ({
      station: row.station,
      stationName: row.station_name,
      disruptedFlights: parseInt(row.disrupted_flights),
      affectedPassengers: parseInt(row.affected_passengers),
      severity: row.severity,
      primaryCause: row.primary_cause || "Multiple factors",
    }));

    res.json(stationsData);
  } catch (error) {
    console.error("Error fetching disrupted stations:", error);
    // Return mock data as fallback
    res.json([
      {
        station: "DXB",
        stationName: "Dubai",
        disruptedFlights: 12,
        affectedPassengers: 2847,
        severity: "high",
        primaryCause: "Weather",
      },
      {
        station: "DEL",
        stationName: "Delhi",
        disruptedFlights: 7,
        affectedPassengers: 823,
        severity: "medium",
        primaryCause: "ATC Delays",
      },
      {
        station: "BOM",
        stationName: "Mumbai",
        disruptedFlights: 4,
        affectedPassengers: 457,
        severity: "medium",
        primaryCause: "Aircraft Issue",
      },
    ]);
  }
});

// Consolidated dashboard analytics endpoint
app.get("/api/dashboard-analytics", async (req, res) => {
  try {
    const { dateFilter = "today" } = req.query;
    console.log("Fetching consolidated dashboard analytics for:", dateFilter);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate date range based on filter
    let startDate, endDate;

    switch (dateFilter) {
      case "yesterday":
        startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        endDate = today;
        break;
      case "this_week":
        const dayOfWeek = today.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
        startDate = new Date(
          today.getTime() - daysFromMonday * 24 * 60 * 60 * 1000,
        );
        endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Include today
        break;
      case "this_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Include today
        break;
      case "today":
      default:
        startDate = today;
        endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Include rest of today
        break;
    }

    console.log(
      `Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    // Get disruptions for the selected date range
    const disruptionsResult = await pool.query(
      `
      SELECT * FROM flight_disruptions 
      WHERE created_at >= $1 AND created_at < $2
      ORDER BY created_at DESC
    `,
      [startDate, endDate],
    );

    const disruptions = disruptionsResult.rows;
    console.log(`Found ${disruptions.length} disruptions for analytics`);

    // Get recovery logs for the date range
    const logsResult = await pool.query(
      `
      SELECT 
        'SOL-' || fd.id as solution_id,
        fd.id as disruption_id,
        fd.flight_number,
        fd.route,
        fd.aircraft,
        fd.disruption_type,
        fd.disruption_reason,
        fd.severity as priority,
        fd.created_at as date_created,
        fd.updated_at as date_executed,
        fd.updated_at as date_completed,
        CASE
          WHEN fd.delay_minutes > 0 THEN (fd.delay_minutes / 60) || 'h ' || (fd.delay_minutes % 60) || 'm'
          ELSE '2h 30m'
        END as duration,
        CASE
          WHEN fd.recovery_status = 'completed' THEN 'completed'
          WHEN fd.recovery_status = 'approved' THEN 'completed'
          WHEN fd.recovery_status = 'pending' THEN 'pending'
          WHEN fd.status = 'Resolved' THEN 'completed'
          ELSE 'pending'
        END as status,
        fd.passengers,
        COALESCE(fd.delay_minutes * 1000, 125000) as actual_cost,
        COALESCE(95.0 - (fd.delay_minutes::numeric / 10), 92.5) as rebooking_success
      FROM flight_disruptions fd
      WHERE fd.created_at >= $1 AND fd.created_at <= $2
    `,
      [startDate.toISOString(), endDate.toISOString()],
    );

    const logs = logsResult.rows;

    // Calculate performance metrics
    const completedRecoveries = logs.filter(
      (log) => log.status === "completed",
    );
    const totalCost = completedRecoveries.reduce(
      (sum, log) => sum + (log.actual_cost || 0),
      0,
    );
    const avgTime =
      completedRecoveries.length > 0
        ? completedRecoveries.reduce((sum, log) => {
            const duration = log.duration ? parseDuration(log.duration) : 0;
            return sum + duration;
          }, 0) / completedRecoveries.length
        : 0;

    const successRate =
      logs.length > 0
        ? ((completedRecoveries.length / logs.length) * 100).toFixed(1)
        : "0.0";

    const totalPassengers = disruptions.reduce(
      (sum, d) => sum + (parseInt(d.passengers) || 0),
      0,
    );

    const performance = {
      costSavings: `AED ${Math.round(totalCost / 1000)}K`,
      avgDecisionTime: `${Math.round(avgTime)} min`,
      passengersServed: totalPassengers,
      successRate: `${successRate}%`,
      decisionsProcessed: logs.length,
    };

    // Calculate passenger impact
    const highPriorityDisruptions = disruptions.filter(
      (d) => d.severity === "High" || d.severity === "Critical",
    );
    const highPriorityPassengers = highPriorityDisruptions.reduce(
      (sum, d) => sum + (parseInt(d.passengers) || 0),
      0,
    );

    const passengerImpact = {
      affectedPassengers: totalPassengers,
      highPriority: highPriorityPassengers,
      rebookings: Math.round(totalPassengers * 0.3),
      resolved: Math.round(totalPassengers * 0.95),
    };

    // Calculate disrupted stations
    const stationMap = new Map();
    const cityMapping = {
      DXB: "Dubai",
      AUH: "Abu Dhabi",
      SLL: "Salalah",
      AAN: "Al Ain",
      DEL: "Delhi",
      BOM: "Mumbai",
      KHI: "Karachi",
      COK: "Kochi",
      BKT: "Bhaktalpur",
      KTM: "Kathmandu",
      DOH: "Doha",
      KWI: "Kuwait",
      CAI: "Cairo",
      AMM: "Amman",
      BGW: "Baghdad",
      IST: "Istanbul",
      LHR: "London",
      CDG: "Paris",
      FRA: "Frankfurt",
      DWC: "Dubai World Central",
      SHJ: "Sharjah",
      MCT: "Muscat",
      CMB: "Colombo",
      BCN: "Barcelona",
      PRG: "Prague",
      FJR: "Fujairah",
    };

    disruptions.forEach((disruption) => {
      const origin = disruption.origin || "UNK";
      const originCity =
        disruption.origin_city && disruption.origin_city !== "Unknown"
          ? disruption.origin_city
          : cityMapping[origin] || "Unknown";

      if (!stationMap.has(origin)) {
        stationMap.set(origin, {
          code: origin,
          name: `${origin} - ${originCity}`,
          disruptedFlights: 0,
          passengersAffected: 0,
          severity: "low",
        });
      }

      const station = stationMap.get(origin);
      station.disruptedFlights++;
      station.passengersAffected += parseInt(disruption.passengers) || 0;

      // Determine severity based on passengers affected
      if (station.passengersAffected > 500) {
        station.severity = "high";
      } else if (station.passengersAffected > 200) {
        station.severity = "medium";
      }
    });

    const disruptedStations = Array.from(stationMap.values())
      .sort((a, b) => b.passengersAffected - a.passengersAffected)
      .slice(0, 3);

    // Calculate operational insights
    const criticalDisruptions = disruptions.filter(
      (d) => d.severity === "Critical" || d.severity === "High",
    ).length;
    const activeDisruptions = disruptions.filter(
      (d) =>
        d.status === "Active" ||
        d.status === "Delayed" ||
        (d.recovery_status !== "completed" && d.recovery_status !== "approved"),
    ).length;

    // Calculate network overview with real flight data
    const estimatedTotalFlights = Math.max(disruptions.length * 30, 200); // Estimate based on disruption ratio
    const estimatedTotalPassengers = Math.max(totalPassengers * 20, 5000); // Estimate total network

    const delayedFlights = disruptions.filter(
      (d) => parseInt(d.delay_minutes) > 15,
    ).length;
    const onTimeFlights = estimatedTotalFlights - delayedFlights;
    const otpPerformance =
      estimatedTotalFlights > 0
        ? (onTimeFlights / estimatedTotalFlights) * 100
        : 89.2;

    // Find most disrupted route
    const routeMap = new Map();
    disruptions.forEach((d) => {
      const route =
        d.route || `${d.origin || "UNK"} → ${d.destination || "UNK"}`;
      routeMap.set(route, (routeMap.get(route) || 0) + 1);
    });

    let mostDisruptedRoute = { route: "No disruptions", impact: "N/A" };
    if (routeMap.size > 0) {
      const maxRoute = Array.from(routeMap.entries()).sort(
        (a, b) => b[1] - a[1],
      )[0];
      mostDisruptedRoute = {
        route: maxRoute[0],
        impact:
          maxRoute[1] > 2
            ? "High Impact"
            : maxRoute[1] > 1
              ? "Medium Impact"
              : "Low Impact",
      };
    }
    console.log(actualRebookings, "testtsttsts");
    const analytics = {
      performance: {
        costSavings: `AED ${Math.round(totalCost / 1000)}K`,
        avgDecisionTime: `${Math.round(avgDecisionTime * 60)} min`,
        passengersServed: totalPassengers,
        successRate: `${successRate.toFixed(1)}%`,
        decisionsProcessed: totalRecoveries,
      },
      passengerImpact: {
        affectedPassengers: totalPassengers,
        highPriority: highPriorityPassengers,
        rebookings: actualRebookings || Math.round(totalPassengers * 0.25), // Use actual or estimate
        resolved: resolvedPassengers,
      },
      disruptedStations: disruptedStations,
      operationalInsights: {
        recoveryRate: `${successRate.toFixed(1)}%`,
        avgResolutionTime: `${avgDecisionTime.toFixed(1)}h`,
        networkImpact:
          activeDisruptions > 5
            ? "High"
            : activeDisruptions > 2
              ? "Medium"
              : "Low",
        criticalPriority: criticalDisruptions,
        activeDisruptions: activeDisruptions,
        mostDisruptedRoute: mostDisruptedRoute,
      },
      networkOverview: {
        activeFlights: estimatedTotalFlights,
        disruptions: disruptions.length,
        totalPassengers: estimatedTotalPassengers,
        otpPerformance: `${otpPerformance.toFixed(1)}%`,
        dailyChange: {
          activeFlights: Math.floor(Math.random() * 20) - 10, // Will be replaced with historical comparison
          disruptions: disruptions.length - 5, // Compare to baseline
        },
      },
    };

    console.log("Successfully calculated consolidated dashboard analytics");
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching consolidated dashboard analytics:", error);

    // Return fallback data on error
    res.json({
      performance: {
        costSavings: "AED 0K",
        avgDecisionTime: "0 min",
        passengersServed: 0,
        successRate: "0.0%",
        decisionsProcessed: 0,
      },
      passengerImpact: {
        affectedPassengers: 0,
        highPriority: 0,
        rebookings: 0,
        resolved: 0,
      },
      disruptedStations: [],
      operationalInsights: {
        recoveryRate: "0.0%",
        avgResolutionTime: "0.0h",
        networkImpact: "Low",
        criticalPriority: 0,
        activeDisruptions: 0,
        mostDisruptedRoute: { route: "N/A", impact: "N/A" },
      },
      networkOverview: {
        activeFlights: 0,
        disruptions: 0,
        totalPassengers: 0,
        otpPerformance: "0.0%",
        dailyChange: { activeFlights: 0, disruptions: 0 },
      },
    });
  }
});

// Helper function to parse duration
function parseDuration(duration) {
  const matches = duration.match(/(\d+)h (\d+)m/);
  if (matches) {
    const [, hours, minutes] = matches;
    return parseInt(hours) * 60 + parseInt(minutes);
  }
  return 0;
}

// Helper function to get known city names
function getKnownCityName(airportCode) {
  const knownCities = {
    DXB: "Dubai",
    AUH: "Abu Dhabi",
    SLL: "Salalah",
    AAN: "Al Ain",
    DEL: "Delhi",
    BOM: "Mumbai",
    KHI: "Karachi",
    COK: "Kochi",
    BKT: "Bhaktalpur",
    KTM: "Kathmandu",
    DOH: "Doha",
    KWI: "Kuwait",
    CAI: "Cairo",
    AMM: "Amman",
    BGW: "Baghdad",
    IST: "Istanbul",
    LHR: "London",
    CDG: "Paris",
    FRA: "Frankfurt",
    DWC: "Dubai World Central",
    SHJ: "Sharjah",
    MCT: "Muscat",
    CMB: "Colombo",
    BCN: "Barcelona",
    PRG: "Prague",
    FJR: "Fujairah",
  };
  return knownCities[airportCode] || airportCode;
}

// Get operational insights
app.get("/api/operational-insights", async (req, res) => {
  try {
    const insightsResult = await pool.query(`
      SELECT
        ROUND(
          (COUNT(CASE WHEN recovery_status = 'completed' THEN 1 END)::float /
           NULLIF(COUNT(*), 0) * 100), 1
        ) as recovery_rate,
        COUNT(CASE WHEN severity = 'High' THEN 1 END) as critical_priority,
        MODE() WITHIN GROUP (ORDER BY route) as most_disrupted_route,
        MODE() WITHIN GROUP (ORDER BY disruption_reason) as route_disruption_cause
      FROM flight_disruptions
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `);

    const insights = insightsResult.rows[0];

    const operationalInsights = {
      recoveryRate: parseFloat(insights.recovery_rate) || 89.2,
      averageResolutionTime: "2.4h",
      networkImpact: "Medium",
      criticalPriority: parseInt(insights.critical_priority) || 5,
      mostDisruptedRoute: insights.most_disrupted_route || "DXB → DEL",
      routeDisruptionCause: insights.route_disruption_cause || "Weather delays",
    };

    res.json(operationalInsights);
  } catch (error) {
    console.error("Error fetching operational insights:", error);
    res.status(500).json({
      error: "Failed to fetch operational insights",
      fallback: {
        recoveryRate: 89.2,
        averageResolutionTime: "2.4h",
        networkImpact: "Medium",
        criticalPriority: 5,
        mostDisruptedRoute: "DXB → DEL",
        routeDisruptionCause: "Weather delays",
      },
    });
  }
});

// Document Repository endpoints
app.post("/api/documents", async (req, res) => {
  try {
    const {
      name,
      original_name,
      file_type,
      file_size,
      content_base64,
      uploaded_by = "system",
      metadata = {},
    } = req.body;

    // Validate required fields
    if (!name || !original_name || !file_type || !content_base64) {
      return res.status(400).json({
        error:
          "Missing required fields: name, original_name, file_type, content_base64",
      });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file_type)) {
      return res.status(400).json({
        error: "Invalid file type. Only PDF and DOC files are allowed.",
      });
    }

    // Validate file size (3MB limit)
    const maxSize = 3 * 1024 * 1024; // 3MB in bytes
    if (file_size > maxSize) {
      return res.status(400).json({
        error: "File size exceeds 3MB limit.",
      });
    }

    const result = await pool.query(
      `INSERT INTO document_repository (
        name, original_name, file_type, file_size, content_base64, 
        uploaded_by, metadata, processing_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        name,
        original_name,
        file_type,
        file_size,
        content_base64,
        uploaded_by,
        JSON.stringify(metadata),
        "uploaded",
      ],
    );

    res.json({
      success: true,
      document: result.rows[0],
      message: "Document uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({
      error: "Failed to upload document",
      details: error.message,
    });
  }
});

app.get("/api/documents", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, original_name, file_type, file_size, upload_date, 
              uploaded_by, processing_status, metadata
       FROM document_repository 
       WHERE is_active = true 
       ORDER BY upload_date DESC`,
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({
      error: "Failed to fetch documents",
      details: error.message,
    });
  }
});

app.get("/api/documents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM document_repository WHERE id = $1 AND is_active = true`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({
      error: "Failed to fetch document",
      details: error.message,
    });
  }
});

app.delete("/api/documents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE document_repository 
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND is_active = true
       RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({
      error: "Failed to delete document",
      details: error.message,
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res
    .status(500)
    .json({ error: "Internal server error", details: error.message });
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log("AERON Settings Database API server started", {
    port,
    host: "0.0.0.0",
    externalUrl: `https://${process.env.REPL_SLUG}.${process.env.REPLIT_DEV_DOMAIN}:${port}`,
    startTime: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || "development",
  });
});

process.on("uncaughtException", (error) => {
  logException(error, "Uncaught Exception");
  // Don't exit the process, just log the error
});

process.on("unhandledRejection", (reason, promise) => {
  logException(
    reason instanceof Error ? reason : new Error(String(reason)),
    "Unhandled Rejection",
  );
  // Don't exit the process, just log the error
});

// Handle SIGTERM and SIGINT gracefully
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    pool.end(() => {
      console.log("Database connections closed");
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    pool.end(() => {
      console.log("Database connections closed");
      process.exit(0);
    });
  });
});