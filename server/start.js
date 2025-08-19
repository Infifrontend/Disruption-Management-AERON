import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
const port = process.env.API_PORT || 3001;

// Middleware - More permissive CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow all localhost and replit.dev origins
      if (
        origin.includes("localhost") ||
        origin.includes("replit.dev") ||
        origin.includes("sisko.replit.dev")
      ) {
        return callback(null, true);
      }

      // Allow all other origins for now (can be restricted later)
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
    optionsSuccessStatus: 200,
  }),
);

// Ensure CORS headers are set for all responses
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept, Origin, X-Requested-With",
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection with fallback and proper Neon handling
let connectionString =
  process.env.DATABASE_URL || "postgresql://0.0.0.0:5432/aeron_settings";

// Handle Neon database connection with proper endpoint parameter
if (connectionString && connectionString.includes("neon.tech")) {
  try {
    const url = new URL(connectionString);
    const endpointId = url.hostname.split(".")[0];

    // Add endpoint parameter for Neon compatibility
    const params = new URLSearchParams(url.search);
    params.set("options", `endpoint=${endpointId}`);
    params.set("sslmode", "require");

    // Reconstruct URL with proper parameters
    url.search = params.toString();
    connectionString = url.toString();

    console.log(
      "🔧 Configured connection for Neon database with endpoint:",
      endpointId,
    );
  } catch (error) {
    console.error("⚠️ Error configuring Neon connection:", error.message);
  }
}

const pool = new Pool({
  connectionString: connectionString,
  ssl:
    process.env.NODE_ENV === "production" ||
    connectionString.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : false,
  max: 5, // Reduced maximum connections to prevent exhaustion
  min: 1, // Keep at least one connection alive
  idleTimeoutMillis: 60000, // Keep connections alive longer
  connectionTimeoutMillis: 10000, // Increased timeout for better reliability
  maxUses: 1000, // Reduced max uses to recycle connections more frequently
  acquireTimeoutMillis: 8000, // Timeout for acquiring connections
});

// Test database connection on startup with retry logic
let connectionRetries = 0;
const maxRetries = 3;
let databaseAvailable = false;

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL connected successfully");
    client.release();
    connectionRetries = 0; // Reset on success
    databaseAvailable = true;
  } catch (err) {
    connectionRetries++;
    console.log(
      `⚠️ PostgreSQL connection failed (attempt ${connectionRetries}/${maxRetries}):`,
      err.message,
    );
    databaseAvailable = false;

    if (connectionRetries < maxRetries) {
      setTimeout(testConnection, 2000 * connectionRetries); // Shorter retry intervals
    } else {
      console.log(
        "❌ Max connection retries reached. API will continue without database.",
      );
      databaseAvailable = false;
    }
  }
}

// Start connection test but don't block server startup
testConnection();

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Test database connection with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    let databaseStatus = "disconnected";
    try {
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();
      databaseStatus = "connected";
      clearTimeout(timeoutId);
    } catch (dbError) {
      console.warn("Database health check failed:", dbError.message);
      databaseStatus = "disconnected";
    }

    // Return healthy even if database is down (API can function in fallback mode)
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      protocol: req.protocol,
      host: req.get("host"),
      database: databaseStatus,
      server: "running",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(200).json({
      status: "healthy",
      error: "Database unavailable but server running",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      server: "running",
    });
  }
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

// Settings endpoints
app.get("/api/settings", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM settings WHERE is_active = true ORDER BY category, key",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.json([]); // Return empty array instead of error to allow fallback
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
  const result = await withDatabaseFallback(async () => {
    const { recovery_status, category_code } = req.query;

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

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Add ORDER BY
    query += ` ORDER BY fd.created_at DESC`;

    const queryResult = await pool.query(query, params);
    return queryResult.rows || [];
  }, []);

  res.json(result);
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
            WHEN $1 LIKE '%Weather%' OR $1 LIKE '%ATC%' THEN 'ATC_WEATHER'
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
app.get("/api/recovery-logs", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM recovery_logs
      ORDER BY date_created DESC
      LIMIT 50
    `);
    res.json(result.rows || []);
  } catch (error) {
    console.error("Error fetching recovery logs:", error);
    res.json([]);
  }
});

// Update flight recovery status
app.put("/api/disruptions/:id/recovery-status", async (req, res) => {
  try {
    const { id } = req.params;
    const { recovery_status } = req.body;

    const result = await pool.query(
      `UPDATE flight_disruptions
       SET recovery_status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [recovery_status, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Flight disruption not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating flight recovery status:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get recovery options by disruption ID
app.get("/api/recovery-options/:disruptionId", async (req, res) => {
  try {
    const { disruptionId } = req.params;

    // First try to get from detailed recovery options table
    const detailedResult = await pool.query(
      `
      SELECT rod.*, dc.category_name, dc.category_code
      FROM recovery_options_detailed rod
      LEFT JOIN disruption_categories dc ON rod.category_id = dc.id
      WHERE rod.disruption_id = $1
      ORDER BY rod.confidence DESC, rod.priority ASC
    `,
      [disruptionId],
    );

    if (detailedResult.rows.length > 0) {
      res.json(detailedResult.rows);
      return;
    }

    // Fallback to original recovery options table
    const result = await pool.query(
      `
      SELECT * FROM recovery_options
      WHERE disruption_id = $1
      ORDER BY confidence DESC, id ASC
    `,
      [disruptionId],
    );

    const pendingRecoveryOptionResult = await pool.query(
      `SELECT
          prs.*,
          fd.flight_number, fd.route, fd.origin, fd.destination, fd.aircraft,
          fd.passengers, fd.crew, fd.severity, fd.disruption_reason,
          fd.scheduled_departure, fd.estimated_departure, fd.delay_minutes
        FROM pending_recovery_solutions prs
        LEFT JOIN flight_disruptions fd ON prs.disruption_id = fd.id
        WHERE prs.disruption_id = $1
        ORDER BY prs.submitted_at DESC
      `,
      [disruptionId],
    );

    let response = result.rows.map((option) => {
      if (!pendingRecoveryOptionResult.rows.length > 0) {
        return option;
      }

      const pending_recovery_option = pendingRecoveryOptionResult.rows[0];
      option["pending_recovery_solutions"] = {};
      if (option.id == pending_recovery_option.option_id) {
        option["pending_recovery_solutions"] = pending_recovery_option || {};
      }
      return option;
    });

    res.json(response || []);
  } catch (error) {
    console.error("Error fetching recovery options:", error);
    res.json([]);
  }
});

// Recovery Categories endpoints
app.get("/api/recovery-categories", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM disruption_categories
      WHERE is_active = true
      ORDER BY priority_level, category_name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching recovery categories:", error);
    res.status(500).json({ error: error.message });
  }
});

// Recovery Option Templates endpoints
app.get("/api/recovery-templates/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const result = await pool.query(
      `
      SELECT * FROM recovery_option_templates
      WHERE category_id = $1 AND is_active = true
      ORDER BY title
    `,
      [categoryId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching recovery templates:", error);
    res.json([]);
  }
});

// Generate and save recovery options for a disruption
app.post("/api/recovery-options/generate/:disruptionId", async (req, res) => {
  try {
    const { disruptionId } = req.params;
    console.log(
      `Generating recovery options for disruption ID: ${disruptionId}`,
    );

    // Validate disruptionId
    if (
      !disruptionId ||
      disruptionId === "undefined" ||
      disruptionId === "null"
    ) {
      return res.status(400).json({
        error: "Invalid disruption ID",
        optionsCount: 0,
        stepsCount: 0,
      });
    }

    // Convert disruptionId to integer for database query
    const numericDisruptionId = parseInt(disruptionId);
    if (isNaN(numericDisruptionId)) {
      return res.status(400).json({
        error: "Invalid disruption ID format",
        optionsCount: 0,
        stepsCount: 0,
      });
    }

    // First get the disruption details with category information
    const result = await pool.query(
      `
      SELECT fd.*, dc.category_code, dc.category_name
      FROM flight_disruptions fd
      LEFT JOIN disruption_categories dc ON fd.category_id = dc.id
      WHERE fd.id = $1::integer
    `,
      [numericDisruptionId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Disruption not found",
        optionsCount: 0,
        stepsCount: 0,
      });
    }

    const disruptionData = result.rows[0];
    console.log("Found disruption:", disruptionData.flight_number);

    // Check if recovery steps already exist (not just options)
    const existingSteps = await pool.query(
      "SELECT COUNT(*) as count FROM recovery_steps WHERE disruption_id = $1",
      [numericDisruptionId],
    );

    const existingOptions = await pool.query(
      "SELECT COUNT(*) as count FROM recovery_options WHERE disruption_id = $1",
      [numericDisruptionId],
    );

    if (existingOptions.rows[0].count > 0 && existingSteps.rows[0].count > 0) {
      return res.json({
        success: true,
        message: "Recovery options and steps already exist",
        exists: true,
        optionsCount: parseInt(existingOptions.rows[0].count),
        stepsCount: parseInt(existingSteps.rows[0].count),
      });
    }

    // Generate recovery options based on disruption type
    const { generateRecoveryOptionsForDisruption } = await import(
      "./recovery-generator.js"
    );

    // Get category information from disruption
    const categoryInfo = {
      category_code: disruptionData.category_code,
      category_name: disruptionData.categorization,
      category_id: disruptionData.category_id,
    };

    console.log("Using category info:", categoryInfo);

    const { options, steps } = generateRecoveryOptionsForDisruption(
      disruptionData,
      categoryInfo,
    );

    console.log(
      `Generated ${options.length} options and ${steps.length} steps`,
    );

    let optionsCount = 0;
    let stepsCount = 0;

    // Save recovery steps
    for (const step of steps) {
      try {
        // First check if step already exists
        const existingStep = await pool.query(
          "SELECT id FROM recovery_steps WHERE disruption_id = $1 AND step_number = $2",
          [numericDisruptionId, step.step],
        );

        if (existingStep.rows.length === 0) {
          await pool.query(
            `
            INSERT INTO recovery_steps (
              disruption_id, step_number, title, status, timestamp,
              system, details, step_data
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
            [
              numericDisruptionId,
              step.step,
              step.title,
              step.status,
              step.timestamp,
              step.system,
              step.details,
              step.data ? JSON.stringify(step.data) : null,
            ],
          );
        }
        stepsCount++;
      } catch (error) {
        console.error("Error saving recovery step:", error);
      }
    }

    // Save recovery options
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      try {
        // Check if option already exists
        const existingOption = await pool.query(
          "SELECT id FROM recovery_options WHERE disruption_id = $1 AND title = $2",
          [numericDisruptionId, option.title || `Recovery Option ${i + 1}`],
        );

        if (existingOption.rows.length === 0) {
          const insertQuery = `
            INSERT INTO recovery_options (
              disruption_id, title, description, cost, timeline, confidence,
              impact, status, priority, advantages, considerations,
              resource_requirements, cost_breakdown, timeline_details,
              risk_assessment, technical_specs, metrics, rotation_plan,
              impact_area, impact_summary, crew_available
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
            )
            ON CONFLICT (disruption_id, title) DO UPDATE SET
              description = EXCLUDED.description,
              cost = EXCLUDED.cost,
              timeline = EXCLUDED.timeline,
              confidence = EXCLUDED.confidence,
              impact = EXCLUDED.impact,
              status = EXCLUDED.status,
              priority = EXCLUDED.priority,
              advantages = EXCLUDED.advantages,
              considerations = EXCLUDED.considerations,
              resource_requirements = EXCLUDED.resource_requirements,
              cost_breakdown = EXCLUDED.cost_breakdown,
              timeline_details = EXCLUDED.timeline_details,
              risk_assessment = EXCLUDED.risk_assessment,
              technical_specs = EXCLUDED.technical_specs,
              metrics = EXCLUDED.metrics,
              rotation_plan = EXCLUDED.rotation_plan,
              impact_area = EXCLUDED.impact_area,
              impact_summary = EXCLUDED.impact_summary,
              updated_at = CURRENT_TIMESTAMP
              crew_available = EXCLUDED.crew_available
            RETURNING id`;

          // Ensure arrays are properly formatted for PostgreSQL
          const formatArrayForPostgres = (arr) => {
            if (!arr || !Array.isArray(arr)) return [];
            return arr;
          };

          // Safely stringify JSON fields, handling null/undefined
          const safeStringify = (obj) => {
            if (obj === null || obj === undefined) return null;
            if (typeof obj === "string") return obj;
            try {
              return JSON.stringify(obj);
            } catch (e) {
              console.warn("Failed to stringify object:", obj);
              return "{}";
            }
          };

          const values = [
            numericDisruptionId,
            option.title || `Recovery Option ${i + 1}`,
            option.description || "Recovery option details",
            option.cost || "TBD",
            option.timeline || "TBD",
            option.confidence || 80,
            option.impact || "Medium",
            option.status || "generated",
            i + 1, // priority
            formatArrayForPostgres(option.advantages), // Pass as array, not JSON string
            formatArrayForPostgres(option.considerations), // Pass as array, not JSON string
            safeStringify(
              option.resourceRequirements || option.resource_requirements || {},
            ),
            safeStringify(option.costBreakdown || option.cost_breakdown || {}),
            safeStringify(
              option.timelineDetails || option.timeline_details || {},
            ),
            safeStringify(
              option.riskAssessment || option.risk_assessment || {},
            ),
            safeStringify(
              option.technicalSpecs || option.technical_specs || {},
            ),
            safeStringify(option.metrics || {}),
            safeStringify(option.rotationPlan || option.rotation_plan || {}),
            safeStringify(option.impact_area || []), // Convert to JSON string
            option.impact_summary || "",
            safeStringify(option.crew_available || {}),
          ];

          try {
            await pool.query(insertQuery, values);
            console.log(`Successfully saved recovery option: ${option.title}`);
          } catch (insertError) {
            console.error(
              `Failed to save recovery option "${option.title}":`,
              insertError.message,
            );
            console.error(
              "Values causing error:",
              values.map((val, idx) => ({
                index: idx,
                type: typeof val,
                value:
                  typeof val === "string" && val.length > 100
                    ? val.substring(0, 100) + "..."
                    : val,
              })),
            );
            throw insertError;
          }
        }
        optionsCount++;
      } catch (error) {
        console.error("Error saving recovery option:", error);
      }
    }

    console.log("Successfully saved all recovery options and steps");
    res.json({
      success: true,
      optionsCount,
      stepsCount,
      message: `Generated ${optionsCount} recovery options and ${stepsCount} steps`,
    });
  } catch (error) {
    console.error("Error generating recovery options:", error);
    res.status(500).json({
      error: "Failed to generate recovery options",
      details: error.message,
    });
  }
});

// Recovery Option Details endpoint
app.get("/api/recovery-option-details/:optionId", async (req, res) => {
  try {
    const { optionId } = req.params;
    console.log(`Fetching details for recovery option ID: ${optionId}`);

    const result = await pool.query(
      `
      SELECT rod.*, dc.category_name, dc.category_code
      FROM recovery_options_detailed rod
      LEFT JOIN disruption_categories dc ON rod.category_id = dc.id
      WHERE rod.option_id = $1
    `,
      [optionId],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Recovery option details not found" });
    }

    console.log(`Found details for recovery option: ${optionId}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching recovery option details:", error);
    res.status(500).json({ error: error.message });
  }
});

// Detailed Recovery Options endpoints (keep for backward compatibility)
app.get("/api/recovery-options-detailed/:disruptionId", async (req, res) => {
  try {
    const { disruptionId } = req.params;
    console.log(
      `Fetching detailed recovery options for disruption ID: ${disruptionId}`,
    );

    const result = await pool.query(
      `
      SELECT rod.*, dc.category_name, dc.category_code
      FROM recovery_options_detailed rod
      LEFT JOIN disruption_categories dc ON rod.category_id = dc.id
      WHERE rod.disruption_id = $1
      ORDER BY rod.priority ASC, rod.confidence DESC
    `,
      [disruptionId],
    );

    console.log(`Found ${result.rows.length} detailed recovery options`);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching detailed recovery options:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/disruption-categories", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM disruption_categories
      WHERE is_active = true
      ORDER BY priority_level ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching disruption categories:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/recovery-option-templates", async (req, res) => {
  try {
    const { category_id } = req.query;
    let query = `
      SELECT rot.*, dc.category_name, dc.category_code
      FROM recovery_option_templates rot
      LEFT JOIN disruption_categories dc ON rot.category_id = dc.id
      WHERE rot.is_active = true
    `;
    const params = [];

    if (category_id) {
      query += ` AND rot.category_id = $1`;
      params.push(category_id);
    }

    query += ` ORDER BY dc.priority_level ASC, rot.title ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching recovery option templates:", error);
    res.status(500).json({ error: error.message });
  }
});

// Recovery Steps Detailed endpoint
app.get("/api/recovery-steps-detailed/:disruptionId", async (req, res) => {
  try {
    const { disruptionId } = req.params;
    const { option_id } = req.query;

    // Convert disruptionId to integer
    const numericDisruptionId = parseInt(disruptionId);
    if (isNaN(numericDisruptionId)) {
      return res.status(400).json({ error: "Invalid disruption ID format" });
    }

    console.log(
      `Fetching detailed recovery steps for disruption ID: ${disruptionId}`,
    );

    // Check if recovery_steps_detailed table exists, if not fall back to recovery_steps
    let query, params;

    try {
      // Try detailed steps table first
      query = `
        SELECT rsd.*, dc.category_name, dc.category_code
        FROM recovery_steps_detailed rsd
        LEFT JOIN disruption_categories dc ON rsd.category_id = dc.id
        WHERE rsd.disruption_id = $1
      `;
      params = [numericDisruptionId];

      if (option_id) {
        query += ` AND rsd.option_id = $2`;
        params.push(option_id);
      }

      query += ` ORDER BY rsd.step_number ASC`;

      const result = await pool.query(query, params);

      if (result.rows.length > 0) {
        console.log(`Found ${result.rows.length} detailed recovery steps`);
        return res.json(result.rows);
      }
    } catch (detailedError) {
      console.log(
        "Detailed steps table not available, falling back to regular steps",
      );
    }

    // Fallback to regular recovery_steps table
    query = `
      SELECT
        id,
        disruption_id,
        step_number,
        title,
        status,
        timestamp,
        system,
        details,
        step_data,
        created_at,
        updated_at,
        NULL as category_name,
        NULL as category_code
      FROM recovery_steps
      WHERE disruption_id = $1
      ORDER BY step_number ASC
    `;
    params = [numericDisruptionId];

    const result = await pool.query(query, params);
    console.log(`Found ${result.rows.length} fallback recovery steps`);
    res.json(result.rows || []);
  } catch (error) {
    console.error("Error fetching detailed recovery steps:", error);
    res.status(500).json({
      error: "Failed to fetch recovery steps",
      details: error.message,
    });
  }
});

// Recovery Steps endpoints
app.get("/api/recovery-steps/:disruptionId", async (req, res) => {
  try {
    const { disruptionId } = req.params;
    console.log(`Fetching recovery steps for disruption ID: ${disruptionId}`);

    const result = await pool.query(
      `
      SELECT * FROM recovery_steps
      WHERE disruption_id = $1
      ORDER BY step_number ASC
    `,
      [disruptionId],
    );

    console.log(
      `Found ${result.rows.length} recovery steps for disruption ${disruptionId}`,
    );
    res.json(result.rows || []);
  } catch (error) {
    console.error("Error fetching recovery steps:", error);
    res.status(500).json({ error: error.message, rows: [] });
  }
});

app.post("/api/recovery-steps", async (req, res) => {
  try {
    const {
      disruption_id,
      step_number,
      title,
      status,
      timestamp,
      system,
      details,
      step_data,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO recovery_steps (
        disruption_id, step_number, title, status, timestamp,
        system, details, step_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [
        disruption_id,
        step_number,
        title,
        status || "pending",
        timestamp,
        system,
        details,
        step_data ? JSON.stringify(step_data) : null,
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error saving recovery step:", error);
    res.status(500).json({ error: error.message });
  }
});

// Map disruption type to category
app.post("/api/map-disruption-category", async (req, res) => {
  try {
    const { disruptionType, disruptionReason } = req.body;

    console.log("Mapping disruption to category:", {
      disruptionType,
      disruptionReason,
    });

    // Try to find matching category based on disruption type and reason
    let query = `
      SELECT category_code, category_name, priority_level
      FROM disruption_categories
      WHERE is_active = true AND (
        LOWER(category_name) LIKE LOWER($1) OR
        LOWER(description) LIKE LOWER($1)
    `;
    const params = [`%${disruptionType || ""}%`];

    if (disruptionReason) {
      query += ` OR LOWER(category_name) LIKE LOWER($2) OR LOWER(description) LIKE LOWER($2)`;
      params.push(`%${disruptionReason}%`);
    }

    query += `) ORDER BY priority_level ASC LIMIT 1`;

    const result = await pool.query(query, params);

    if (result.rows.length > 0) {
      res.json({
        categoryCode: result.rows[0].category_code,
        categoryName: result.rows[0].category_name,
        priorityLevel: result.rows[0].priority_level,
      });
    } else {
      // Fallback mapping based on common patterns
      let categoryCode = "OTHER";
      const lowerType = (disruptionType || "").toLowerCase();
      const lowerReason = (disruptionReason || "").toLowerCase();

      if (
        lowerType.includes("aircraft") ||
        lowerType.includes("technical") ||
        lowerReason.includes("maintenance") ||
        lowerReason.includes("aog")
      ) {
        categoryCode = "AIRCRAFT_ISSUE";
      } else if (
        lowerType.includes("crew") ||
        lowerReason.includes("crew") ||
        lowerReason.includes("duty") ||
        lowerReason.includes("fatigue")
      ) {
        categoryCode = "CREW_ISSUE";
      } else if (
        lowerType.includes("weather") ||
        lowerReason.includes("weather") ||
        lowerReason.includes("storm") ||
        lowerReason.includes("fog")
      ) {
        categoryCode = "ATC_WEATHER";
      } else if (
        lowerType.includes("atc") ||
        lowerReason.includes("atc") ||
        lowerReason.includes("slot") ||
        lowerReason.includes("traffic")
      ) {
        categoryCode = "ATC_WEATHER";
      }

      res.json({ categoryCode, categoryName: categoryCode.replace("_", " ") });
    }
  } catch (error) {
    console.error("Error mapping disruption to category:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get recovery options by category
app.get("/api/recovery-options/category/:categoryCode", async (req, res) => {
  try {
    const { categoryCode } = req.params;

    const result = await pool.query(
      `
      SELECT rot.*, dc.category_name, dc.category_code
      FROM recovery_option_templates rot
      JOIN disruption_categories dc ON rot.category_id = dc.id
      WHERE dc.category_code = $1 AND rot.is_active = true AND dc.is_active = true
      ORDER BY rot.title ASC
    `,
      [categoryCode],
    );

    res.json(result.rows || []);
  } catch (error) {
    console.error("Error fetching recovery options by category:", error);
    res.json([]);
  }
});

// Get recovery option details
app.get("/api/recovery-option/:optionId", async (req, res) => {
  try {
    const { optionId } = req.params;

    const result = await pool.query(
      "SELECT * FROM recovery_options WHERE id = $1",
      [optionId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Recovery option not found",
        optionId: optionId,
      });
    }

    const option = result.rows[0];

    res.json({
      ...option,
      advantages: option.advantages || [],
      considerations: option.considerations || [],
      resourceRequirements: option.resource_requirements || {},
      costBreakdown: option.cost_breakdown || {},
      timelineDetails: option.timeline_details || {},
      riskAssessment: option.risk_assessment || {},
      metrics: option.metrics || {},
    });
  } catch (error) {
    console.error("Recovery Service: Error fetching option details:", error);
    res.status(500).json({
      error: "Failed to fetch recovery option details",
      details: error.message,
    });
  }
});

// Get recovery options by ID (alternative endpoint for crew information)
app.get("/api/recovery-options/:optionId", async (req, res) => {
  try {
    const { optionId } = req.params;

    const result = await pool.query(
      "SELECT * FROM recovery_options WHERE id = $1",
      [optionId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Recovery option not found",
        optionId: optionId,
      });
    }

    const option = result.rows[0];

    // Parse rotation_plan to extract crew data
    let rotationPlan = {};
    if (option.rotation_plan) {
      try {
        rotationPlan =
          typeof option.rotation_plan === "string"
            ? JSON.parse(option.rotation_plan)
            : option.rotation_plan;
      } catch (e) {
        console.log("Failed to parse rotation_plan JSON");
        rotationPlan = {};
      }
    }

    // Enhanced response with crew information
    const enhancedOption = {
      ...option,
      advantages: option.advantages || [],
      considerations: option.considerations || [],
      resourceRequirements: option.resource_requirements || {},
      costBreakdown: option.cost_breakdown || {},
      timelineDetails: option.timeline_details || {},
      riskAssessment: option.risk_assessment || {},
      metrics: option.metrics || {},
      rotation_plan: rotationPlan,
      crew: rotationPlan.crew || rotationPlan.crewData || [],
      crewConstraints: rotationPlan.crewConstraints || {},
      operationalConstraints: rotationPlan.operationalConstraints || {},
    };

    res.json(enhancedOption);
  } catch (error) {
    console.error("Recovery Service: Error fetching recovery option:", error);
    res.status(500).json({
      error: "Failed to fetch recovery option",
      details: error.message,
    });
  }
});

// Get detailed rotation plan data for a recovery option
app.get("/api/recovery-option/:optionId/rotation-plan", async (req, res) => {
  try {
    const { optionId } = req.params;
    console.log(`Fetching rotation plan for option ${optionId}`);

    // First try to get from rotation_plan_details table
    let result = await pool.query(
      `
      SELECT * FROM rotation_plan_details WHERE recovery_option_id = $1
    `,
      [optionId],
    );

    if (result.rows.length === 0) {
      // Fallback: try to get from recovery_options table
      result = await pool.query(
        `
        SELECT rotation_plan FROM recovery_options WHERE id = $1
      `,
        [optionId],
      );

      if (result.rows.length === 0) {
        console.log(
          `No rotation plan found for option ${optionId}, generating sample data`,
        );

        // Generate sample crew data for the rotation plan
        const sampleRotationPlan = {
          aircraftOptions: [
            {
              reg: "A6-FED",
              type: "B737-800 (189Y)",
              etops: { status: "available", value: "180min" },
              cabinMatch: { status: "exact", value: "Exact" },
              availability: "Available Now",
              assigned: { status: "none", value: "None" },
              turnaround: "45 min",
              maintenance: { status: "current", value: "Current" },
              recommended: true,
            },
          ],
          crewData: [
            {
              name: "Captain Mohammed Al-Zaabi",
              type: "Captain",
              status: "Available",
              location: "Dubai Airport Hotel",
              availability: "Available",
              dutyTime: "2h 15m remaining",
              nextAssignment: "FZ892 - 16:30",
              qualifications: ["B737-800", "B737-MAX8"],
              experience: "15 years",
            },
            {
              name: "F/O Sarah Rahman",
              type: "First Officer",
              status: "On Duty",
              location: "Crew Rest Area Terminal 2",
              availability: "Available",
              dutyTime: "4h 30m remaining",
              nextAssignment: "Available for assignment",
              qualifications: ["B737-800", "B737-MAX8"],
              experience: "8 years",
            },
            {
              name: "Fatima Al-Mansouri",
              type: "Senior Flight Attendant",
              status: "Available",
              location: "Crew Lounge Level 3",
              availability: "Available",
              dutyTime: "3h 45m remaining",
              nextAssignment: "Standby until 18:00",
              qualifications: ["Safety Instructor", "First Aid"],
              experience: "12 years",
            },
            {
              name: "Ahmed Hassan",
              type: "Flight Attendant",
              status: "Available",
              location: "Crew Lounge Level 3",
              availability: "Available",
              dutyTime: "5h 10m remaining",
              nextAssignment: "FZ215 - 19:45",
              qualifications: ["Service Excellence", "Emergency Response"],
              experience: "5 years",
            },
            {
              name: "Amira Khalil",
              type: "Flight Attendant",
              status: "Available",
              location: "Crew Lounge Level 3",
              availability: "Available",
              dutyTime: "4h 20m remaining",
              nextAssignment: "Available for assignment",
              qualifications: ["Multi-lingual", "Medical Training"],
              experience: "3 years",
            },
            {
              name: "Omar Abdullah",
              type: "Flight Attendant",
              status: "Available",
              location: "Crew Lounge Level 3",
              availability: "Available",
              dutyTime: "6h 00m remaining",
              nextAssignment: "Standby until 20:00",
              qualifications: ["Customer Service", "Security"],
              experience: "7 years",
            },
          ],
          nextSectors: [
            {
              flight: "FZ892",
              route: "DXB → BOM",
              departure: "16:30",
              aircraft: "A6-FED",
              status: "On Schedule",
            },
          ],
          operationalConstraints: {
            gateCompatibility: {
              status: "compatible",
              details: "Gate A24 suitable for B737-800",
            },
            slotCapacity: {
              status: "available",
              details: "Slot confirmed for departure window",
            },
            curfewViolation: {
              status: "compliant",
              details: "Departure within curfew hours",
            },
            passengerConnections: {
              status: "manageable",
              details: "12 connecting passengers, 90min connection time",
            },
          },
          costBreakdown: {
            delayCost: 15000,
            fuelEfficiency: "Standard consumption",
            hotelTransport: 0,
            eu261Risk: "Low",
          },
          recommendation: {
            aircraft: "A6-FED",
            reason: "Optimal crew availability and aircraft readiness",
          },
        };

        return res.json({
          success: true,
          rotationPlan: sampleRotationPlan,
        });
      }

      // Return the rotation_plan JSON field
      const rotationPlan = result.rows[0].rotation_plan || {};

      res.json({
        success: true,
        rotationPlan: {
          aircraftOptions: rotationPlan.aircraftOptions || [],
          crewData: rotationPlan.crewData || [],
          nextSectors: rotationPlan.nextSectors || [],
          operationalConstraints: rotationPlan.operationalConstraints || {},
          costBreakdown: rotationPlan.costBreakdown || {},
          recommendation: rotationPlan.recommendation || {},
        },
      });
    } else {
      const rotationPlan = result.rows[0];

      res.json({
        success: true,
        rotationPlan: {
          aircraftOptions: rotationPlan.aircraft_options || [],
          crewData: rotationPlan.crew_data || [],
          nextSectors: rotationPlan.next_sectors || [],
          operationalConstraints: rotationPlan.operational_constraints || {},
          costBreakdown: rotationPlan.cost_breakdown || {},
          recommendation: rotationPlan.recommendation || {},
        },
      });
    }
  } catch (error) {
    console.error("Error fetching rotation plan:", error);
    res.status(500).json({
      error: "Failed to fetch rotation plan details",
      details: error.message,
    });
  }
});

// Get detailed cost analysis for a recovery option
app.get("/api/recovery-option/:optionId/cost-analysis", async (req, res) => {
  try {
    const { optionId } = req.params;

    // First try to get from cost_analysis_details table
    let result = await pool.query(
      `
      SELECT * FROM cost_analysis_details WHERE recovery_option_id = $1
    `,
      [optionId],
    );

    if (result.rows.length === 0) {
      // Fallback: try to get from recovery_options table
      result = await pool.query(
        `
        SELECT cost_breakdown FROM recovery_options WHERE id = $1
      `,
        [optionId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Cost analysis not found for this option",
          optionId: optionId,
        });
      }

      // Parse and return the cost_breakdown JSON field
      let costBreakdown = result.rows[0].cost_breakdown;
      if (typeof costBreakdown === "string") {
        try {
          costBreakdown = JSON.parse(costBreakdown);
        } catch (e) {
          costBreakdown = [];
        }
      }

      res.json({
        success: true,
        costAnalysis: {
          costCategories: Array.isArray(costBreakdown) ? costBreakdown : [],
          totalCost: 0,
          costComparison: {},
          savingsAnalysis: {},
        },
      });
    } else {
      const costAnalysis = result.rows[0];

      res.json({
        success: true,
        costAnalysis: {
          costCategories: costAnalysis.cost_categories || [],
          totalCost: costAnalysis.total_cost || 0,
          costComparison: costAnalysis.cost_comparison || {},
          savingsAnalysis: costAnalysis.savings_analysis || {},
        },
      });
    }
  } catch (error) {
    console.error("Error fetching cost analysis:", error);
    res.status(500).json({
      error: "Failed to fetch cost analysis details",
      details: error.message,
    });
  }
});

// Get detailed timeline for a recovery option
app.get("/api/recovery-option/:optionId/timeline", async (req, res) => {
  try {
    const { optionId } = req.params;

    // First try to get from timeline_details table
    let result = await pool.query(
      `
      SELECT * FROM timeline_details WHERE recovery_option_id = $1
    `,
      [optionId],
    );

    if (result.rows.length === 0) {
      // Fallback: try to get from recovery_options table
      result = await pool.query(
        `
        SELECT timeline_details FROM recovery_options WHERE id = $1
      `,
        [optionId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Timeline details not found for this option",
          optionId: optionId,
        });
      }

      // Parse and return the timeline_details JSON field
      let timelineDetails = result.rows[0].timeline_details;
      if (typeof timelineDetails === "string") {
        try {
          timelineDetails = JSON.parse(timelineDetails);
        } catch (e) {
          timelineDetails = [];
        }
      }

      res.json({
        success: true,
        timeline: {
          timelineSteps: Array.isArray(timelineDetails) ? timelineDetails : [],
          criticalPath: {},
          dependencies: [],
          milestones: [],
        },
      });
    } else {
      const timeline = result.rows[0];

      res.json({
        success: true,
        timeline: {
          timelineSteps: timeline.timeline_steps || [],
          criticalPath: timeline.critical_path || {},
          dependencies: timeline.dependencies || [],
          milestones: timeline.milestones || [],
        },
      });
    }
  } catch (error) {
    console.error("Error fetching timeline details:", error);
    res.status(500).json({
      error: "Failed to fetch timeline details",
      details: error.message,
    });
  }
});

// Get detailed resource requirements for a recovery option
app.get("/api/recovery-option/:optionId/resources", async (req, res) => {
  try {
    const { optionId } = req.params;

    // First try to get from resource_details table
    let result = await pool.query(
      `
      SELECT * FROM resource_details WHERE recovery_option_id = $1
    `,
      [optionId],
    );

    if (result.rows.length === 0) {
      // Fallback: try to get from recovery_options table
      result = await pool.query(
        `
        SELECT resource_requirements FROM recovery_options WHERE id = $1
      `,
        [optionId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Resource details not found for this option",
          optionId: optionId,
        });
      }

      // Parse and return the resource_requirements JSON field
      let resourceRequirements = result.rows[0].resource_requirements;
      if (typeof resourceRequirements === "string") {
        try {
          resourceRequirements = JSON.parse(resourceRequirements);
        } catch (e) {
          resourceRequirements = [];
        }
      }

      // Ensure resourceRequirements is an array before filtering
      if (!Array.isArray(resourceRequirements)) {
        resourceRequirements = [];
      }

      res.json({
        success: true,
        resources: {
          personnelRequirements: resourceRequirements.filter(
            (r) => r.type === "Personnel",
          ),
          equipmentRequirements: resourceRequirements.filter(
            (r) => r.type === "Equipment",
          ),
          facilityRequirements: resourceRequirements.filter(
            (r) => r.type === "Facility",
          ),
          availabilityStatus: {},
        },
      });
    } else {
      const resources = result.rows[0];

      res.json({
        success: true,
        resources: {
          personnelRequirements: resources.personnel_requirements || [],
          equipmentRequirements: resources.equipment_requirements || [],
          facilityRequirements: resources.facility_requirements || [],
          availabilityStatus: resources.availability_status || {},
        },
      });
    }
  } catch (error) {
    console.error("Error fetching resource details:", error);
    res.status(500).json({
      error: "Failed to fetch resource details",
      details: error.message,
    });
  }
});

// Get technical specifications for a recovery option
app.get("/api/recovery-option/:optionId/technical", async (req, res) => {
  try {
    const { optionId } = req.params;
    console.log("option id =>", optionId);
    // First try to get from technical_specifications table
    let result = await pool.query(
      `
      SELECT * FROM technical_specifications WHERE recovery_option_id = $1
    `,
      [optionId],
    );

    if (result.rows.length === 0) {
      // Fallback: try to get from recovery_options table
      console.log("calling recovery option");
      result = await pool.query(
        `
        SELECT technical_specs FROM recovery_options WHERE id = $1
      `,
        [optionId],
      );

      console.log("recovery option details ==>", result);
      console.log("recovery option ==>", result.rows[0]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Technical specifications not found for this option",
          optionId: optionId,
        });
      }

      // Parse and return the technical_specs JSON field
      let technicalSpecs = result.rows[0].technical_specs || {};
      if (typeof technicalSpecs === "string") {
        try {
          technicalSpecs = JSON.parse(technicalSpecs);
        } catch (e) {
          technicalSpecs = {};
        }
      }
      console.log("technicalSpecs ==>", technicalSpecs);
      // Ensure technicalSpecs is an object before accessing properties
      if (!technicalSpecs || typeof technicalSpecs !== "object") {
        console.log("matna da");
        technicalSpecs = {};
      }

      res.json({
        success: true,
        technical: {
          aircraftSpecs:
            technicalSpecs.aircraftRequirements ||
            technicalSpecs.aircraftSpecs ||
            {},
          operationalConstraints: technicalSpecs.operationalConstraints || {},
          regulatoryRequirements:
            technicalSpecs.regulatoryCompliance ||
            technicalSpecs.regulatoryRequirements ||
            [],
          weatherLimitations: technicalSpecs.weatherLimitations || {},
          weatherMinimums: technicalSpecs.weatherMinimums || [],
          alternateAirports: technicalSpecs.alternateAirports || [],
          fuelConsiderations: technicalSpecs.fuelConsiderations || [],
        },
      });
    } else {
      const technical = result.rows[0];

      res.json({
        success: true,
        technical: {
          aircraftSpecs: technical.aircraft_specs || {},
          operationalConstraints: technical.operational_constraints || {},
          regulatoryRequirements: technical.regulatory_requirements || [],
          weatherLimitations: technical.weather_limitations || {},
          weatherMinimums: technical.weather_minimums || [],
          alternateAirports: technical.alternate_airports || [],
          fuelConsiderations: technical.fuel_considerations || [],
        },
      });
    }
  } catch (error) {
    console.error("Error fetching technical specifications:", error);
    res.status(500).json({
      error: "Failed to fetch technical specifications",
      details: error.message,
      success: false,
      technical: {
        aircraftSpecs: {},
        operationalConstraints: {},
        regulatoryRequirements: [],
        weatherLimitations: {},
      },
    });
  }
});

// Get recovery option details
app.get("/api/recovery-option-details/:optionId", async (req, res) => {
  try {
    const { optionId } = req.params;
    console.log(`Fetching recovery option details for ID: ${optionId}`);

    // First try to get from recovery_options table
    const result = await pool.query(
      `SELECT * FROM recovery_options WHERE id = $1`,
      [optionId],
    );

    if (result.rows.length === 0) {
      console.log(`No recovery option found for ID: ${optionId}`);
      return res.status(404).json({
        error: "Recovery option details not found",
        optionId: optionId,
      });
    }

    const option = result.rows[0];
    console.log(`Found recovery option: ${option.title}`);

    // Parse JSON fields safely
    const parseJsonField = (field) => {
      if (!field) return {};
      if (typeof field === "string") {
        try {
          return JSON.parse(field);
        } catch (e) {
          return {};
        }
      }
      return field;
    };

    // Transform the data to match the expected format
    const detailedOption = {
      ...option,
      costBreakdown: parseJsonField(option.cost_breakdown),
      timelineDetails: parseJsonField(option.timeline_details),
      resourceRequirements: parseJsonField(option.resource_requirements),
      riskAssessment: parseJsonField(option.risk_assessment),
      technicalSpecs: parseJsonField(option.technical_specs),
      metrics: parseJsonField(option.metrics),
      rotationPlan: parseJsonField(option.rotation_plan),
    };

    console.log(`Returning detailed option data for ID: ${optionId}`);
    res.json(detailedOption);
  } catch (error) {
    console.error("Error fetching recovery option details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Pending Recovery Solutions endpoints
app.post("/api/pending-recovery-solutions", async (req, res) => {
  try {
    console.log("Received pending recovery solution request:", req.body);

    const {
      disruption_id,
      option_id,
      option_title,
      option_description,
      estimated_cost,
      estimated_delay,
      passenger_impact,
      operational_complexity,
      resource_requirements,
      timeline_details,
      approval_status = "pending",
      created_by = "system",
      notes,
      passenger_rebooking,
      crew_hotel_assignments,
      // Legacy fields for backward compatibility
      cost,
      timeline,
      confidence,
      impact,
      status = "Pending",
      full_details = {},
      rotation_impact = {},
      submitted_by = "system",
      approval_required = true,
    } = req.body;

    // Validate required fields
    if (!disruption_id || !option_id || !option_title) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: disruption_id, option_id, option_title",
      });
    }

    // Check if pending_recovery_solutions table exists
    const tableCheck = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'pending_recovery_solutions'
    `);

    if (tableCheck.rows.length === 0) {
      console.log("Creating pending_recovery_solutions table...");

      // Create the table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS pending_recovery_solutions (
          id SERIAL PRIMARY KEY,
          disruption_id INTEGER REFERENCES flight_disruptions(id),
          option_id VARCHAR(255),
          option_title TEXT,
          option_description TEXT,
          cost VARCHAR(255),
          timeline VARCHAR(255),
          confidence INTEGER,
          impact TEXT,
          status VARCHAR(50) DEFAULT 'Pending',
          full_details JSONB,
          rotation_impact JSONB,
          submitted_by VARCHAR(255),
          approval_required BOOLEAN DEFAULT true,
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log("Created pending_recovery_solutions table");
    }

    // Check if this combination already exists
    const existingCheck = await pool.query(
      `
      SELECT id FROM pending_recovery_solutions
      WHERE disruption_id = $1 AND option_id = $2
    `,
      [disruption_id, option_id],
    );

    if (existingCheck.rows.length > 0) {
      return res.status(409).json({
        error: "Duplicate entry",
        message: "This recovery solution is already pending for this flight.",
      });
    }

    // Handle optional passenger rebooking data
    let passengerRebookingSuccess = true;
    let passengerRebookingCount = 0;
    if (
      passenger_rebooking &&
      Array.isArray(passenger_rebooking) &&
      passenger_rebooking.length > 0
    ) {
      console.log(
        `Processing ${passenger_rebooking.length} passenger rebooking records`,
      );

      for (const rebooking of passenger_rebooking) {
        try {
          // Minimal validation - check for required fields
          if (
            !rebooking.pnr ||
            !rebooking.passenger_id ||
            !rebooking.passenger_name
          ) {
            console.warn(
              "Skipping passenger rebooking record due to missing required fields:",
              rebooking,
            );
            continue;
          }

          await pool.query(
            `
            INSERT INTO passenger_rebookings (
              disruption_id, pnr, passenger_id, passenger_name, original_flight,
              original_seat, rebooked_flight, rebooked_cabin, rebooked_seat,
              rebooking_date, additional_services, status, total_passengers_in_pnr,
              rebooking_cost, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            ON CONFLICT (disruption_id, passenger_id, pnr)
            DO UPDATE SET
              passenger_name = EXCLUDED.passenger_name,
              original_flight = EXCLUDED.original_flight,
              original_seat = EXCLUDED.original_seat,
              rebooked_flight = EXCLUDED.rebooked_flight,
              rebooked_cabin = EXCLUDED.rebooked_cabin,
              rebooked_seat = EXCLUDED.rebooked_seat,
              rebooking_date = EXCLUDED.rebooking_date,
              additional_services = EXCLUDED.additional_services,
              status = EXCLUDED.status,
              total_passengers_in_pnr = EXCLUDED.total_passengers_in_pnr,
              rebooking_cost = EXCLUDED.rebooking_cost,
              notes = EXCLUDED.notes,
              updated_at = CURRENT_TIMESTAMP
          `,
            [
              disruption_id,
              rebooking.pnr,
              rebooking.passenger_id,
              rebooking.passenger_name,
              rebooking.original_flight,
              rebooking.original_seat,
              rebooking.rebooked_flight,
              rebooking.rebooked_cabin,
              rebooking.rebooked_seat,
              rebooking.rebooking_date || new Date().toISOString(),
              JSON.stringify(rebooking.additional_services || []),
              "confirmed", // Always set status to 'confirmed'
              rebooking.total_passengers_in_pnr || 1,
              rebooking.rebooking_cost || 0,
              rebooking.notes || null,
            ],
          );
          passengerRebookingCount++;
        } catch (rebookingError) {
          console.error(
            "Error inserting passenger rebooking record:",
            rebookingError,
          );
          passengerRebookingSuccess = false;
          // Continue processing other records
        }
      }
      console.log(
        `Successfully processed ${passengerRebookingCount} passenger rebooking records`,
      );
    }

    // Handle optional crew hotel assignments data
    let crewHotelSuccess = true;
    let crewHotelCount = 0;
    if (
      crew_hotel_assignments &&
      Array.isArray(crew_hotel_assignments) &&
      crew_hotel_assignments.length > 0
    ) {
      console.log(
        `Processing ${crew_hotel_assignments.length} crew hotel assignment records`,
      );

      for (const assignment of crew_hotel_assignments) {
        try {
          // Minimal validation - check for required fields
          if (
            !assignment.crew_member ||
            !assignment.hotel_name ||
            !assignment.check_in_date ||
            !assignment.check_out_date
          ) {
            console.warn(
              "Skipping crew hotel assignment record due to missing required fields:",
              assignment,
            );
            continue;
          }

          await pool.query(
            `
            INSERT INTO crew_hotel_assignments (
              disruption_id, crew_member, hotel_name, hotel_location, check_in_date,
              check_out_date, room_number, special_requests, assignment_status,
              total_cost, booking_reference, transport_details, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `,
            [
              disruption_id,
              JSON.stringify(assignment.crew_member),
              assignment.hotel_name,
              assignment.hotel_location,
              assignment.check_in_date,
              assignment.check_out_date,
              assignment.room_number,
              assignment.special_requests,
              assignment.assignment_status || "assigned",
              assignment.total_cost || 0,
              assignment.booking_reference,
              JSON.stringify(assignment.transport_details || {}),
              assignment.created_by || submitted_by || "system",
            ],
          );
          crewHotelCount++;
        } catch (crewError) {
          console.error(
            "Error inserting crew hotel assignment record:",
            crewError,
          );
          crewHotelSuccess = false;
          // Continue processing other records
        }
      }
      console.log(
        `Successfully processed ${crewHotelCount} crew hotel assignment records`,
      );
    }

    // Insert main pending recovery solution
    const result = await pool.query(
      `
      INSERT INTO pending_recovery_solutions (
        disruption_id, option_id, option_title, option_description,
        cost, timeline, confidence, impact, status, full_details,
        rotation_impact, submitted_by, approval_required
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `,
      [
        disruption_id,
        String(option_id),
        option_title,
        option_description || notes,
        estimated_cost || cost,
        timeline_details || timeline,
        confidence,
        passenger_impact || impact,
        approval_status || status,
        JSON.stringify({
          ...full_details,
          passenger_impact,
          operational_complexity,
          resource_requirements,
          timeline_details,
          passenger_rebooking: passenger_rebooking || [],
          crew_hotel_assignments: crew_hotel_assignments || [],
        }),
        JSON.stringify(rotation_impact),
        created_by || submitted_by,
        approval_required,
      ],
    );

    // Update flight disruption status
    const updatedFlightDisruption = await pool.query(
      `
      UPDATE flight_disruptions SET recovery_status = 'pending', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `,
      [disruption_id],
    );

    console.log(
      "Successfully saved pending recovery solution:",
      result.rows[0],
    );

    // Include processing results in response
    const response = {
      success: true,
      ...result.rows[0],
      processing_results: {
        passenger_rebooking: {
          processed: passengerRebookingCount,
          success: passengerRebookingSuccess,
        },
        crew_hotel_assignments: {
          processed: crewHotelCount,
          success: crewHotelSuccess,
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error saving pending recovery solution:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

app.get("/api/pending-recovery-solutions", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        prs.*,
        fd.flight_number, fd.route, fd.origin, fd.destination, fd.aircraft,
        fd.passengers, fd.crew, fd.severity, fd.disruption_reason,
        fd.scheduled_departure, fd.estimated_departure, fd.delay_minutes
      FROM pending_recovery_solutions prs
      LEFT JOIN flight_disruptions fd ON prs.disruption_id = fd.id
      ORDER BY prs.submitted_at DESC
    `);

    // Enhance each solution with additional data
    const enhancedSolutions = await Promise.all(
      result.rows.map(async (solution) => {
        // Get recovery steps
        const stepsResult = await pool.query(
          `
        SELECT * FROM recovery_steps
        WHERE disruption_id = $1
        ORDER BY step_number ASC
      `,
          [solution.disruption_id],
        );

        // Get crew information
        const crewResult = await pool.query(
          `
        SELECT cm.* FROM crew_members cm
        JOIN crew_disruption_mapping cdm ON cm.id = cdm.crew_member_id
        WHERE cdm.disruption_id = $1
      `,
          [solution.disruption_id],
        );

        // Get passenger information
        const passengerResult = await pool.query(
          `
        SELECT * FROM passengers
        WHERE flight_number = $1
        LIMIT 10
      `,
          [solution.flight_number],
        );

        // Get recovery option details for cost analysis
        let costAnalysis = {};
        let operationsUser = "Operations Manager";

        if (solution.option_id) {
          const optionResult = await pool.query(
            `
          SELECT cost_breakdown, resource_requirements, technical_specs
          FROM recovery_options
          WHERE id = $1
        `,
            [solution.option_id],
          );

          if (optionResult.rows.length > 0) {
            const option = optionResult.rows[0];
            costAnalysis = {
              breakdown: option.cost_breakdown || {},
              resources: option.resource_requirements || {},
              technical: option.technical_specs || {},
            };
          }
        }

        return {
          ...solution,
          operations_user: operationsUser,
          crew_information: crewResult.rows.map((crew) => ({
            id: crew.id,
            name: crew.name,
            role: crew.role,
            status: crew.status,
            dutyTime: crew.duty_time_remaining + " hours",
            restTime: 24 - crew.duty_time_remaining + " hours",
            location: crew.base_location,
            experience: crew.qualifications
              ? crew.qualifications.join(", ")
              : "Standard",
            qualifications: crew.qualifications || [],
          })),
          passenger_information: passengerResult.rows.map((passenger) => ({
            id: passenger.id,
            name: passenger.name,
            pnr: passenger.pnr,
            seatNumber: passenger.seat_number,
            ticketClass: passenger.ticket_class,
            loyaltyTier: passenger.loyalty_tier,
            specialNeeds: passenger.special_needs,
            rebookingStatus: passenger.rebooking_status || "Pending",
          })),
          recovery_steps: stepsResult.rows.map((step, index) => ({
            id: step.id,
            action: step.title,
            description: step.details,
            duration: "15-30 minutes",
            responsible: step.system || "Operations Team",
            location: "Operations Center",
            estimatedCost: Math.floor(Math.random() * 5000) + 1000,
            criticalPath: index < 2,
            status: step.status,
          })),
          cost_analysis: {
            totalCost: solution.cost || "$50,000",
            breakdown: costAnalysis.breakdown || {
              operations: 25000,
              crew: 10000,
              passengers: 8000,
              logistics: 7000,
            },
            costPerPassenger: Math.round(
              parseInt(solution.cost?.replace(/[^0-9]/g, "") || "50000") /
                (solution.passengers || 150),
            ),
            comparison: {
              industryAverage: 287,
              savings: 15000,
              roi: "25%",
            },
          },
        };
      }),
    );

    res.json(enhancedSolutions);
  } catch (error) {
    console.error("Error fetching pending recovery solutions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update flight recovery status
app.put("/api/flight-recovery-status/:flightId", async (req, res) => {
  try {
    const { flightId } = req.params;
    const { recovery_status } = req.body;

    const result = await pool.query(
      `UPDATE flight_disruptions
       SET recovery_status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [recovery_status, flightId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Flight not found",
        flightId: flightId,
      });
    }

    res.json({
      success: true,
      message: "Flight recovery status updated successfully",
      flight: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating flight recovery status:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Get individual pending recovery solution
app.get("/api/pending-recovery-solutions/:solutionId", async (req, res) => {
  try {
    const { solutionId } = req.params;

    const result = await pool.query(
      `
      SELECT
        prs.*,
        fd.flight_number, fd.route, fd.origin, fd.destination, fd.aircraft,
        fd.passengers, fd.crew, fd.severity, fd.disruption_reason,
        fd.scheduled_departure, fd.estimated_departure, fd.delay_minutes
      FROM pending_recovery_solutions prs
      LEFT JOIN flight_disruptions fd ON prs.disruption_id = fd.id
      WHERE prs.id = $1
    `,
      [solutionId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Pending solution not found" });
    }

    // Get additional details for the solution
    const solution = result.rows[0];

    // Get recovery steps
    const stepsResult = await pool.query(
      `
      SELECT * FROM recovery_steps
      WHERE disruption_id = $1
      ORDER BY step_number ASC
    `,
      [solution.disruption_id],
    );

    // Get crew information
    const crewResult = await pool.query(
      `
      SELECT cm.* FROM crew_members cm
      JOIN crew_disruption_mapping cdm ON cm.id = cdm.crew_member_id
      WHERE cdm.disruption_id = $1
    `,
      [solution.disruption_id],
    );

    // Get passenger information
    const passengerResult = await pool.query(
      `
      SELECT * FROM passengers
      WHERE flight_number = $1
      LIMIT 10
    `,
      [solution.flight_number],
    );

    // Enhanced solution with additional data
    const enhancedSolution = {
      ...solution,
      recovery_steps: stepsResult.rows,
      crew_information: crewResult.rows,
      passenger_information: passengerResult.rows,
      operations_user: solution.submitted_by || "Operations Manager",
    };

    res.json(enhancedSolution);
  } catch (error) {
    console.error("Error fetching pending solution:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// Update pending solution status
app.put(
  "/api/pending-recovery-solutions/:solutionId/status",
  async (req, res) => {
    try {
      const { solutionId } = req.params;
      const { status } = req.body;

      const result = await pool.query(
        `
      UPDATE pending_recovery_solutions
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `,
        [status, solutionId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Pending solution not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating pending solution status:", error);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  },
);

// Update disruption status
app.put("/api/disruptions/:disruptionId/status", async (req, res) => {
  try {
    const { disruptionId } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `
      UPDATE flight_disruptions
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `,
      [status, disruptionId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Disruption not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating disruption status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Past recovery Logs endpoint
app.get("/api/past-recovery-logs", async (req, res) => {
  try {
    const { status, category, priority, dateRange } = req.query;

    let query = `
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
          WHEN fd.recovery_status = 'completed' THEN 'Successful'
          WHEN fd.recovery_status = 'in_progress' THEN 'Partial'
          ELSE 'Successful'
        END as status,
        fd.passengers as affected_passengers,
        COALESCE(fd.delay_minutes * 1000, 125000) as actual_cost,
        COALESCE(fd.delay_minutes * 1100, 130000) as estimated_cost,
        CASE
          WHEN fd.delay_minutes > 0 THEN ROUND(((fd.delay_minutes * 1100 - fd.delay_minutes * 1000) / (fd.delay_minutes * 1100)::numeric * 100), 1)
          ELSE -3.8
        END as cost_variance,
        COALESCE(95.0 - (fd.delay_minutes::numeric / 10), 92.5) as otp_impact,
        'Option A' as solution_chosen,
        3 as total_options,
        'Operations Manager' as executed_by,
        'System Auto-approval' as approved_by,
        COALESCE(8.0 + RANDOM() * 2, 8.2) as passenger_satisfaction,
        COALESCE(90.0 + RANDOM() * 10, 94.1) as rebooking_success,
        fd.categorization,
        true as cancellation_avoided,
        COALESCE(fd.delay_minutes, 155) as potential_delay_minutes,
        COALESCE(fd.delay_minutes, 155) as actual_delay_minutes,
        COALESCE(CASE WHEN fd.delay_minutes > 100 THEN fd.delay_minutes - 100 ELSE 0 END, 0) as delay_reduction_minutes,
        fd.disruption_type as disruption_category,
        COALESCE(95.0 - (fd.delay_minutes::numeric / 20), 92.5) as recovery_efficiency,
        CASE
          WHEN fd.delay_minutes > 300 THEN 'High'
          WHEN fd.delay_minutes > 100 THEN 'Medium'
          ELSE 'Low'
        END as network_impact,
        CASE
          WHEN fd.delay_minutes > 300 THEN 3
          WHEN fd.delay_minutes > 100 THEN 1
          ELSE 0
        END as downstream_flights_affected,
        '{}'::jsonb as details,
        fd.created_at
      FROM flight_disruptions fd
      WHERE fd.recovery_status = 'completed'
    `;

    const params = [];
    let paramCount = 0;

    // Add filters
    if (status && status !== "all") {
      paramCount++;
      query += ` AND fd.recovery_status = $${paramCount}`;
      params.push(status);
    }

    if (category && category !== "all") {
      paramCount++;
      query += ` AND (fd.categorization = $${paramCount} OR fd.disruption_type = $${paramCount})`;
      params.push(category);
    }

    if (priority && priority !== "all") {
      paramCount++;
      query += ` AND fd.severity = $${paramCount}`;
      params.push(priority);
    }

    if (dateRange && dateRange !== "all") {
      paramCount++;
      if (dateRange === "last7days") {
        query += ` AND fd.created_at >= NOW() - INTERVAL '7 days'`;
      } else if (dateRange === "last30days") {
        query += ` AND fd.created_at >= NOW() - INTERVAL '30 days'`;
      }
    }

    query += ` ORDER BY fd.created_at DESC LIMIT 50`;

    console.log("Executing past recovery logs query:", query);
    console.log("With parameters:", params);

    const result = await pool.query(query, params);

    // Transform numeric fields
    const transformedData = result.rows.map((row) => ({
      ...row,
      affected_passengers: parseInt(row.affected_passengers) || 0,
      actual_cost: parseFloat(row.actual_cost) || 0,
      estimated_cost: parseFloat(row.estimated_cost) || 0,
      cost_variance: parseFloat(row.cost_variance) || 0,
      otp_impact: parseFloat(row.otp_impact) || 0,
      passenger_satisfaction: parseFloat(row.passenger_satisfaction) || 0,
      rebooking_success: parseFloat(row.rebooking_success) || 0,
      potential_delay_minutes: parseInt(row.potential_delay_minutes) || 0,
      actual_delay_minutes: parseInt(row.actual_delay_minutes) || 0,
      delay_reduction_minutes: parseInt(row.delay_reduction_minutes) || 0,
      recovery_efficiency: parseFloat(row.recovery_efficiency) || 0,
      downstream_flights_affected:
        parseInt(row.downstream_flights_affected) || 0,
    }));

    if (transformedData.length === 0) {
      // Return mock data if no real data exists
      console.log("No past recovery data found, returning mock data");
      res.json(getMockPastRecoveryData());
    } else {
      res.json(transformedData);
    }
  } catch (error) {
    console.error("Error fetching past recovery logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mock data function for past recovery logs
function getMockPastRecoveryData() {
  const mockData = [];
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    const created_at = new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000); // within last 30 days
    const delay_minutes = Math.floor(Math.random() * 300);
    const passengers = Math.floor(Math.random() * 300) + 50;
    const severity = ["Low", "Medium", "High"][Math.floor(Math.random() * 3)];
    const disruption_type = ["Weather", "Technical", "ATC", "Crew", "Other"][
      Math.floor(Math.random() * 5)
    ];
    const disruption_reason =
      disruption_type === "Weather"
        ? "Severe weather conditions"
        : disruption_type === "Technical"
          ? "Engine issue detected"
          : disruption_type === "ATC"
            ? "Air traffic control restrictions"
            : disruption_type === "Crew"
              ? "Crew duty time exceeded"
              : "Unforeseen circumstances";
    const categorization =
      severity === "High" ? disruption_type : disruption_reason;

    mockData.push({
      solution_id: `SOL-${created_at.getFullYear()}-${String(mockData.length + 1).padStart(3, "0")}`,
      disruption_id: String(100 + mockData.length),
      flight_number: `FL${Math.floor(100 + Math.random() * 1000)}`,
      route: `${["DXB", "LHR", "JFK", "SIN"][Math.floor(Math.random() * 4)]} → ${["BOM", "AMS", "LAX", "HKG"][Math.floor(Math.random() * 4)]}`,
      aircraft: ["B737-800", "A320", "B777", "A350"][
        Math.floor(Math.random() * 4)
      ],
      disruption_type: disruption_type,
      disruption_reason: disruption_reason,
      priority: severity,
      date_created: created_at.toISOString(),
      date_executed: new Date(
        created_at.getTime() + delay_minutes * 60000,
      ).toISOString(),
      date_completed: new Date(
        created_at.getTime() +
          (delay_minutes + Math.floor(Math.random() * 60)) * 60000,
      ).toISOString(),
      duration: `${Math.floor(delay_minutes / 60)}h ${delay_minutes % 60}m`,
      status: "Successful",
      affected_passengers: passengers,
      actual_cost: Math.round(delay_minutes * 1000 + passengers * 25),
      estimated_cost: Math.round(delay_minutes * 1100 + passengers * 30),
      cost_variance:
        Math.round(
          ((delay_minutes * 1100 +
            passengers * 30 -
            (delay_minutes * 1000 + passengers * 25)) /
            (delay_minutes * 1100 + passengers * 30)) *
            100 *
            10,
        ) / 10,
      otp_impact: Math.round(95.0 - (delay_minutes / 10) * 10) / 10,
      solution_chosen: "Option A",
      total_options: 3,
      executed_by: "Operations Manager",
      approved_by: "System Auto-approval",
      passenger_satisfaction: Math.round(8.0 + Math.random() * 2 * 10) / 10,
      rebooking_success: Math.round(90.0 + Math.random() * 10 * 10) / 10,
      categorization: categorization,
      cancellation_avoided: true,
      potential_delay_minutes: Math.round(delay_minutes * 1.2),
      actual_delay_minutes: delay_minutes,
      delay_reduction_minutes: Math.max(0, delay_minutes - 100),
      disruption_category: disruption_type,
      recovery_efficiency: Math.round(95.0 - (delay_minutes / 20) * 10) / 10,
      network_impact:
        delay_minutes > 300 ? "High" : delay_minutes > 100 ? "Medium" : "Low",
      downstream_flights_affected:
        delay_minutes > 300 ? 3 : delay_minutes > 100 ? 1 : 0,
      details: JSON.stringify({}),
      created_at: created_at.toISOString(),
    });
  }
  return mockData;
}

// Past recovery KPI data
app.get("/api/past-recovery-kpi", async (req, res) => {
  try {
    console.log("Fetching past recovery KPI data");

    const query = `
      SELECT
        COUNT(*) as total_recoveries,
        COUNT(CASE WHEN fd.status = 'Resolved' OR fd.recovery_status = 'completed' THEN 1 END) as successful_recoveries,
        AVG(CASE WHEN fd.delay_minutes IS NOT NULL THEN fd.delay_minutes ELSE 120 END) as avg_resolution_time,
        AVG(CASE WHEN fd.passengers IS NOT NULL THEN fd.passengers ELSE 180 END) as avg_passengers,
        SUM(CASE WHEN fd.passengers IS NOT NULL THEN fd.passengers ELSE 180 END) as total_passengers,
        AVG(CASE WHEN fd.delay_minutes <= 30 THEN 95.0 WHEN fd.delay_minutes <= 120 THEN 88.0 ELSE 82.0 END) as avg_recovery_efficiency,
        SUM(CASE WHEN fd.delay_minutes IS NOT NULL THEN GREATEST(0, (fd.delay_minutes + 30) - fd.delay_minutes) ELSE 25 END) as total_delay_reduction,
        COUNT(CASE WHEN fd.status = 'Resolved' OR fd.delay_minutes IS NULL OR fd.delay_minutes > 240 THEN 1 END) as cancellations_avoided,
        AVG(CASE WHEN fd.delay_minutes <= 30 THEN 8.5 WHEN fd.delay_minutes <= 120 THEN 7.8 ELSE 7.2 END) as avg_satisfaction,
        SUM(CASE WHEN fd.delay_minutes IS NOT NULL THEN ((fd.delay_minutes * 165 + fd.passengers * 55) - (fd.delay_minutes * 150 + fd.passengers * 50)) ELSE 5000 END) as total_cost_savings
      FROM flight_disruptions fd
      WHERE fd.created_at >= NOW() - INTERVAL '6 months'
    `;

    const result = await pool.query(query);
    const data = result.rows[0];

    const kpiData = {
      totalRecoveries: parseInt(data.total_recoveries) || 0,
      successRate:
        data.successful_recoveries && data.total_recoveries
          ? (parseFloat(data.successful_recoveries) /
              parseFloat(data.total_recoveries)) *
            100
          : 0,
      avgResolutionTime: parseFloat(data.avg_resolution_time) || 0,
      costEfficiency: 5.2, // Average cost variance
      passengerSatisfaction: parseFloat(data.avg_satisfaction) || 0,
      totalPassengers: parseInt(data.total_passengers) || 0,
      avgRecoveryEfficiency: parseFloat(data.avg_recovery_efficiency) || 0,
      totalDelayReduction: parseInt(data.total_delay_reduction) || 0,
      cancellationsAvoided: parseInt(data.cancellations_avoided) || 0,
      totalCostSavings: parseFloat(data.total_cost_savings) || 0,
    };

    res.json(kpiData);
  } catch (error) {
    console.error("Error fetching past recovery KPI:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Past recovery trends endpoint
app.get("/api/past-recovery-trends", async (req, res) => {
  try {
    console.log("Fetching past recovery trends data");

    const query = `
      SELECT
        TO_CHAR(DATE_TRUNC('month', fd.created_at), 'Mon YY') as month,
        AVG(CASE WHEN fd.delay_minutes <= 30 THEN 95.0 WHEN fd.delay_minutes <= 120 THEN 88.0 ELSE 82.0 END) as efficiency,
        AVG(CASE WHEN fd.delay_minutes IS NOT NULL THEN GREATEST(0, (fd.delay_minutes + 30) - fd.delay_minutes) ELSE 25 END) as delay_reduction,
        AVG(CASE WHEN fd.delay_minutes IS NOT NULL THEN ((fd.delay_minutes * 165 + fd.passengers * 55) - (fd.delay_minutes * 150 + fd.passengers * 50)) ELSE 5000 END) as cost_savings,
        AVG(CASE WHEN fd.delay_minutes <= 30 THEN 8.5 WHEN fd.delay_minutes <= 120 THEN 7.8 ELSE 7.2 END) as satisfaction
      FROM flight_disruptions fd
      WHERE fd.created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', fd.created_at)
      ORDER BY DATE_TRUNC('month', fd.created_at)
    `;

    const result = await pool.query(query);

    const trendData = result.rows.map((row) => ({
      month: row.month,
      efficiency: Math.round(parseFloat(row.efficiency) || 0),
      delayReduction: Math.round(parseFloat(row.delay_reduction) || 0),
      costSavings: Math.round(parseFloat(row.cost_savings) || 0),
      satisfaction: Math.round((parseFloat(row.satisfaction) || 0) * 10) / 10,
    }));

    res.json(trendData);
  } catch (error) {
    console.error("Error fetching past recovery trends:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get KPI data
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
      WHERE status = 'Active' OR status = 'Delayed'
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
  console.log(
    `🚀 AERON Settings Database API server running on http://0.0.0.0:${port}`,
  );
  console.log(
    `🌐 External access: https://${process.env.REPL_SLUG}.${process.env.REPLIT_DEV_DOMAIN}:${port}`,
  );
  console.log(`📊 Server started successfully at ${new Date().toISOString()}`);
});

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received, closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    pool.end(() => {
      console.log("Database pool closed");
      process.exit(0);
    });
  });
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Don't exit the process, just log the error
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit the process, just log the error
});
