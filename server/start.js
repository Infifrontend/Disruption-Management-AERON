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
    const queryResult = await pool.query(`
      SELECT id, flight_number, route, origin, destination, origin_city, destination_city,
             aircraft, scheduled_departure, estimated_departure, delay_minutes,
             passengers, crew, connection_flights, severity, disruption_type, status,
             disruption_reason, created_at, updated_at
      FROM flight_disruptions
      ORDER BY created_at DESC
    `);
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
    const safeRoute =
      route || `${origin || "UNK"} → ${destination || "UNK"}`;
    const safeOrigin = origin || "UNK";
    const safeDestination = destination || "UNK";
    const safeOriginCity = origin_city_val || "Unknown";
    const safeDestinationCity = destination_city_val || "Unknown";
    const safeSeverity = severity || "Medium";
    const safeDisruptionType = disruption_type_val || "Technical";
    const safeStatus = status || "Active";
    const safeDisruptionReason = disruption_reason_val || "No reason provided";

    // Use UPSERT to prevent duplicates - update if flight_number and scheduled_departure match
    const result = await pool.query(
      `
      INSERT INTO flight_disruptions (
        flight_number, route, origin, destination, origin_city, destination_city,
        aircraft, scheduled_departure, estimated_departure, delay_minutes,
        passengers, crew, connection_flights, severity, disruption_type, status, disruption_reason, categorization
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
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
      ],
    );

    console.log("Successfully saved/updated disruption:", result.rows[0]);
    res.json(result.rows[0]);
    ``;
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

// Recovery Options endpoints
app.get("/api/recovery-options/:disruptionId", async (req, res) => {
  try {
    const { disruptionId } = req.params;

    // First try to get from detailed recovery options table
    const detailedResult = await pool.query(
      `
      SELECT rod.*, dc.category_name
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
    res.json(result.rows || []);
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

    // First get the disruption details
    const result = await pool.query(
      `
      SELECT * FROM flight_disruptions
      WHERE id = $1
    `,
      [numericDisruptionId],
    );

    if (result.rows.length === 0) {
      console.log(`No disruption found for ID: ${disruptionId}`);
      // Instead of returning 404, create a placeholder disruption for generation
      const placeholderDisruption = {
        id: numericDisruptionId,
        flight_number: `FLIGHT-${numericDisruptionId}`,
        disruption_type: "Technical",
        severity: "Medium",
        passengers: 150,
        aircraft: "Unknown",
        delay_minutes: 0,
        disruption_reason: "System generated recovery options",
      };

      console.log("Creating recovery options for placeholder disruption");
      const { generateRecoveryOptionsForDisruption } = await import(
        "./recovery-generator.js"
      );
      const { options, steps } = generateRecoveryOptionsForDisruption(
        placeholderDisruption,
      );

      return res.json({
        success: true,
        optionsCount: options.length,
        stepsCount: steps.length,
        message: `Generated ${options.length} placeholder recovery options`,
        isPlaceholder: true,
      });
    }

    const disruption = result.rows[0];
    console.log(
      "Found disruption:",
      disruption.flight_number,
      "Type:",
      disruption.disruption_type,
    );

    // Generate recovery options using the recovery generator
    const { generateRecoveryOptionsForDisruption } = await import(
      "./recovery-generator.js"
    );
    const { options, steps } = generateRecoveryOptionsForDisruption(disruption);

    console.log(
      `Generated ${options.length} options and ${steps.length} steps`,
    );

    // Insert recovery options into database
    let optionsCount = 0;
    for (const option of options) {
      try {
        // Check if option already exists
        const existingOption = await pool.query(
          "SELECT id FROM recovery_options WHERE disruption_id = $1 AND title = $2",
          [
            numericDisruptionId,
            option.title || `Recovery Option ${options.indexOf(option) + 1}`,
          ],
        );

        if (existingOption.rows.length > 0) {
          // Update existing option
          await pool.query(
            `
            UPDATE recovery_options SET
              description = $3, cost = $4, timeline = $5, confidence = $6,
              impact = $7, status = $8, updated_at = CURRENT_TIMESTAMP
            WHERE disruption_id = $1 AND title = $2
          `,
            [
              numericDisruptionId,
              option.title || `Recovery Option ${options.indexOf(option) + 1}`,
              option.description || "Recovery option details",
              option.cost || "TBD",
              option.timeline || "TBD",
              option.confidence || 80,
              option.impact || "Medium",
              option.status || "generated",
            ],
          );
        } else {
          // Insert new option
          await pool.query(
            `
            INSERT INTO recovery_options (
              disruption_id, title, description, cost, timeline,
              confidence, impact, status, priority, advantages, considerations,
              resource_requirements, cost_breakdown, timeline_details,
              risk_assessment, technical_specs, metrics, rotation_plan
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          `,
            [
              numericDisruptionId,
              option.title || `Recovery Option ${options.indexOf(option) + 1}`,
              option.description || "Recovery option details",
              option.cost || "TBD",
              option.timeline || "TBD",
              option.confidence || 80,
              option.impact || "Medium",
              option.status || "generated",
              options.indexOf(option) + 1, // priority
              option.advantages || [],
              option.considerations || [],
              option.resourceRequirements
                ? JSON.stringify(option.resourceRequirements)
                : null,
              option.costBreakdown
                ? JSON.stringify(option.costBreakdown)
                : null,
              option.timelineDetails
                ? JSON.stringify(option.timelineDetails)
                : null,
              option.riskAssessment
                ? JSON.stringify(option.riskAssessment)
                : null,
              option.technicalSpecs
                ? JSON.stringify(option.technicalSpecs)
                : null,
              option.metrics ? JSON.stringify(option.metrics) : null,
              option.rotationPlan ? JSON.stringify(option.rotationPlan) : null,
            ],
          );
        }
        optionsCount++;
      } catch (insertError) {
        console.error("Error inserting recovery option:", insertError);
      }
    }

    // Insert recovery steps into database
    let stepsCount = 0;
    for (const step of steps) {
      try {
        // Check if step already exists
        const existingStep = await pool.query(
          "SELECT id FROM recovery_steps WHERE disruption_id = $1 AND step_number = $2",
          [numericDisruptionId, step.step],
        );

        if (existingStep.rows.length > 0) {
          // Update existing step
          await pool.query(
            `
            UPDATE recovery_steps SET
              title = $3, status = $4, timestamp = $5, system = $6,
              details = $7, step_data = $8, updated_at = CURRENT_TIMESTAMP
            WHERE disruption_id = $1 AND step_number = $2
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
        } else {
          // Insert new step
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
      } catch (insertError) {
        console.error("Error inserting recovery step:", insertError);
      }
    }

    console.log(
      `Successfully saved ${optionsCount} options and ${stepsCount} steps`,
    );

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

// Debug endpoint to check recovery steps table
app.get("/api/debug/recovery-steps", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM recovery_steps ORDER BY disruption_id, step_number",
    );
    res.json({
      totalSteps: result.rows.length,
      steps: result.rows,
    });
  } catch (error) {
    console.error("Error fetching all recovery steps:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate and save recovery options for a disruption
app.post("/api/generate-recovery-options/:disruptionId", async (req, res) => {
  try {
    const { disruptionId } = req.params;
    console.log(
      `Generating recovery options for disruption ID: ${disruptionId}`,
    );

    // First get the disruption details
    const disruptionResult = await pool.query(
      "SELECT * FROM flight_disruptions WHERE id = $1::integer OR flight_number = $1",
      [disruptionId],
    );

    if (disruptionResult.rows.length === 0) {
      return res.status(404).json({ error: "Disruption not found" });
    }

    const disruption = disruptionResult.rows[0];
    console.log("Found disruption:", disruption.flight_number);

    // Check if recovery steps already exist (not just options)
    const existingSteps = await pool.query(
      "SELECT COUNT(*) as count FROM recovery_steps WHERE disruption_id = $1",
      [disruptionId],
    );

    const existingOptions = await pool.query(
      "SELECT COUNT(*) as count FROM recovery_options WHERE disruption_id = $1",
      [disruptionId],
    );

    if (existingOptions.rows[0].count > 0 && existingSteps.rows[0].count > 0) {
      return res.json({
        message: "Recovery options and steps already exist",
        exists: true,
        optionsCount: existingOptions.rows[0].count,
        stepsCount: existingSteps.rows[0].count,
      });
    }

    // Generate recovery options based on disruption type
    const { generateRecoveryOptionsForDisruption } = await import(
      "./recovery-generator.js"
    );

    const { options, steps } = generateRecoveryOptionsForDisruption(disruption);
    console.log(
      `Generated ${options.length} options and ${steps.length} steps`,
    );

    // Clear existing data if partially generated
    await pool.query("DELETE FROM recovery_steps WHERE disruption_id = $1", [
      disruptionId,
    ]);
    await pool.query("DELETE FROM recovery_options WHERE disruption_id = $1", [
      disruptionId,
    ]);

    // Save recovery steps first
    for (const step of steps) {
      console.log(`Saving step ${step.step}: ${step.title}`);
      // Check if step already exists
      const existingStep = await pool.query(
        "SELECT id FROM recovery_steps WHERE disruption_id = $1 AND step_number = $2",
        [disruptionId, step.step],
      );

      if (existingStep.rows.length > 0) {
        // Update existing step
        await pool.query(
          `
          UPDATE recovery_steps SET
            title = $3, status = $4, timestamp = $5, system = $6,
            details = $7, step_data = $8, updated_at = CURRENT_TIMESTAMP
          WHERE disruption_id = $1 AND step_number = $2
        `,
          [
            disruptionId,
            step.step,
            step.title,
            step.status,
            step.timestamp,
            step.system,
            step.details,
            step.data ? JSON.stringify(step.data) : null,
          ],
        );
      } else {
        // Insert new step
        await pool.query(
          `
          INSERT INTO recovery_steps (
            disruption_id, step_number, title, status, timestamp,
            system, details, step_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
          [
            disruptionId,
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
    }

    // Save recovery options
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      console.log(`Saving option ${i + 1}: ${option.title}`);

      // Ensure all required fields have defaults
      const optionData = {
        title: option.title || option.option_name || `Recovery Option ${i + 1}`,
        description: option.description || "Recovery option details",
        cost: option.cost || "TBD",
        timeline:
          option.timeline || option.duration_minutes
            ? `${option.duration_minutes} minutes`
            : "TBD",
        confidence: option.confidence || 80,
        impact: option.impact || option.passenger_impact || "Medium",
        status: option.status || "generated",
        advantages: option.advantages || [],
        considerations: option.considerations || [],
        resourceRequirements:
          option.resourceRequirements || option.resource_requirements || {},
        costBreakdown: option.costBreakdown || option.cost_breakdown || {},
        timelineDetails:
          option.timelineDetails || option.timeline_details || {},
        riskAssessment: option.riskAssessment || option.risk_assessment || {},
        technicalSpecs: option.technicalSpecs || option.technical_specs || {},
        metrics: option.metrics || {},
        rotationPlan: option.rotationPlan || option.rotation_plan || {},
      };

      await pool.query(
        `
        INSERT INTO recovery_options (
          disruption_id, title, description, cost, timeline,
          confidence, impact, status, priority, advantages, considerations,
          resource_requirements, cost_breakdown, timeline_details,
          risk_assessment, technical_specs, metrics, rotation_plan
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `,
        [
          disruptionId,
          optionData.title,
          optionData.description,
          optionData.cost,
          optionData.timeline,
          optionData.confidence,
          optionData.impact,
          optionData.status,
          i + 1, // priority based on order
          optionData.advantages,
          optionData.considerations,
          optionData.resourceRequirements
            ? JSON.stringify(optionData.resourceRequirements)
            : null,
          optionData.costBreakdown
            ? JSON.stringify(optionData.costBreakdown)
            : null,
          optionData.timelineDetails
            ? JSON.stringify(optionData.timelineDetails)
            : null,
          optionData.riskAssessment
            ? JSON.stringify(optionData.riskAssessment)
            : null,
          optionData.technicalSpecs
            ? JSON.stringify(optionData.technicalSpecs)
            : null,
          optionData.metrics ? JSON.stringify(optionData.metrics) : null,
          optionData.rotationPlan
            ? JSON.stringify(optionData.rotationPlan)
            : null,
        ],
      );
    }

    console.log("Successfully saved all recovery options and steps");
    res.json({
      success: true,
      optionsCount: options.length,
      stepsCount: steps.length,
      message: `Generated ${options.length} recovery options and ${steps.length} steps`,
    });
  } catch (error) {
    console.error("Error generating recovery options:", error);
    res.status(500).json({
      error: "Failed to generate recovery options",
      details: error.message,
    });
  }
});

// Recovery Options endpoint - Main endpoint for loading recovery options
app.get("/api/recovery-options/:disruptionId", async (req, res) => {
  try {
    const { disruptionId } = req.params;
    console.log(`Fetching recovery options for disruption ID: ${disruptionId}`);

    // First try the detailed recovery options table
    let result = await pool.query(
      `
      SELECT rod.*, dc.category_name, dc.category_code
      FROM recovery_options_detailed rod
      LEFT JOIN disruption_categories dc ON rod.category_id = dc.id
      WHERE rod.disruption_id = $1
      ORDER BY rod.priority ASC, rod.confidence DESC
    `,
      [disruptionId],
    );

    // If no detailed options found, try the regular recovery options table
    if (result.rows.length === 0) {
      result = await pool.query(
        `SELECT * FROM recovery_options WHERE disruption_id = $1 ORDER BY created_at DESC`,
        [disruptionId],
      );
      console.log(`Found ${result.rows.length} basic recovery options`);
    } else {
      console.log(`Found ${result.rows.length} detailed recovery options`);
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching recovery options:", error);
    res.status(500).json({ error: error.message });
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
      return res.status(404).json({ error: "Recovery option details not found" });
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

// Map disruption type to category code
app.post("/api/map-disruption-category", async (req, res) => {
  try {
    const { disruptionType, disruptionReason } = req.body;

    if (!disruptionType) {
      return res.status(400).json({ error: "Disruption type is required" });
    }

    const lowerType = disruptionType.toLowerCase();
    const lowerReason = (disruptionReason || "").toLowerCase();

    let categoryCode;

    // Map disruption to category code
    if (
      lowerType.includes("technical") ||
      lowerReason.includes("maintenance") ||
      lowerReason.includes("aog") ||
      lowerReason.includes("aircraft") ||
      lowerReason.includes("engine") ||
      lowerReason.includes("hydraulics") ||
      lowerReason.includes("bird strike")
    ) {
      categoryCode = "AIRCRAFT_ISSUE";
    } else if (
      lowerType.includes("crew") ||
      lowerReason.includes("crew") ||
      lowerReason.includes("duty time") ||
      lowerReason.includes("sick") ||
      lowerReason.includes("fatigue")
    ) {
      categoryCode = "CREW_ISSUE";
    } else if (
      lowerType.includes("weather") ||
      lowerReason.includes("weather") ||
      lowerReason.includes("atc") ||
      lowerReason.includes("fog") ||
      lowerReason.includes("storm") ||
      lowerReason.includes("wind")
    ) {
      categoryCode = "ATC_WEATHER";
    } else if (
      lowerType.includes("curfew") ||
      lowerReason.includes("curfew") ||
      lowerReason.includes("congestion") ||
      lowerReason.includes("airport") ||
      lowerReason.includes("runway") ||
      lowerReason.includes("gate")
    ) {
      categoryCode = "CURFEW_CONGESTION";
    } else if (
      lowerType.includes("rotation") ||
      lowerReason.includes("rotation") ||
      lowerReason.includes("misalignment") ||
      lowerReason.includes("schedule")
    ) {
      categoryCode = "ROTATION_MAINTENANCE";
    } else {
      categoryCode = "AIRCRAFT_ISSUE"; // Default fallback
    }

    // Get category name from database
    const categoryResult = await pool.query(
      "SELECT category_name FROM disruption_categories WHERE category_code = $1",
      [categoryCode],
    );

    if (categoryResult.rows.length > 0) {
      res.json({
        categoryCode,
        categoryName: categoryResult.rows[0].category_name,
      });
    } else {
      // Fallback if category not found in database
      res.json({
        categoryCode: "AIRCRAFT_ISSUE",
        categoryName: "Aircraft Issue",
      });
    }
  } catch (error) {
    console.error("Error mapping disruption to category:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate recovery options based on category code
app.post("/api/recovery-options/generate-by-category/:categoryCode", async (req, res) => {
  try {
    const { categoryCode } = req.params;
    const { flightData } = req.body;

    console.log(`Generating recovery options for category: ${categoryCode}`);

    // Validate category code exists
    const categoryResult = await pool.query(
      "SELECT * FROM disruption_categories WHERE category_code = $1 AND is_active = true",
      [categoryCode]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        error: "Category not found",
        categoryCode: categoryCode
      });
    }

    const category = categoryResult.rows[0];

    // Create a mock disruption for the generator
    const mockDisruption = {
      id: flightData?.id || 999999,
      flight_number: flightData?.flightNumber || "TEST-FLIGHT",
      disruption_type: "Technical", // Will be mapped by category
      disruption_reason: flightData?.disruptionReason || category.description,
      severity: flightData?.severity || "Medium",
      passengers: flightData?.passengers || 150,
      aircraft: flightData?.aircraft || "B737-800",
      delay_minutes: flightData?.delay || 0,
      origin: flightData?.origin || "DXB",
      destination: flightData?.destination || "Unknown",
      ...flightData
    };

    // Generate recovery options using the recovery generator
    const { generateRecoveryOptionsForDisruption } = await import("./recovery-generator.js");
    const { options, steps } = generateRecoveryOptionsForDisruption(mockDisruption);

    // Add category information to each option
    const enhancedOptions = options.map(option => ({
      ...option,
      category_code: categoryCode,
      category_name: category.category_name,
      category_id: category.id
    }));

    res.json({
      success: true,
      categoryCode,
      categoryName: category.category_name,
      options: enhancedOptions,
      steps: steps,
      optionsCount: enhancedOptions.length,
      stepsCount: steps.length
    });

  } catch (error) {
    console.error("Error generating recovery options by category:", error);
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
      success: true,
      option: {
        ...option,
        advantages: option.advantages || [],
        considerations: option.considerations || [],
        resourceRequirements: option.resource_requirements || {},
        costBreakdown: option.cost_breakdown || {},
        timelineDetails: option.timeline_details || {},
        riskAssessment: option.risk_assessment || {},
        technicalSpecs: option.technical_specs || {},
        metrics: option.metrics || {},
        rotationPlan: option.rotation_plan || {},
      },
    });
  } catch (error) {
    console.error("Recovery Service: Error fetching option details:", error);
    res.status(500).json({
      error: "Failed to fetch recovery option details",
      details: error.message,
    });
  }
});

// Get detailed rotation plan data for a recovery option
app.get("/api/recovery-option/:optionId/rotation-plan", async (req, res) => {
  try {
    const { optionId } = req.params;

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
        return res.status(404).json({
          error: "Rotation plan not found for this option",
          optionId: optionId,
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

    // First try to get from technical_specifications table
    let result = await pool.query(
      `
      SELECT * FROM technical_specifications WHERE recovery_option_id = $1
    `,
      [optionId],
    );

    if (result.rows.length === 0) {
      // Fallback: try to get from recovery_options table
      result = await pool.query(
        `
        SELECT technical_specs FROM recovery_options WHERE id = $1
      `,
        [optionId],
      );

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

      // Ensure technicalSpecs is an object before accessing properties
      if (!technicalSpecs || typeof technicalSpecs !== "object") {
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

    const result = await pool.query(`
      SELECT ro.*, rs.* 
      FROM recovery_options ro
      LEFT JOIN recovery_steps rs ON ro.disruption_id = rs.disruption_id
      WHERE ro.id = $1 OR ro.option_id = $1
      ORDER BY rs.step_order
    `, [optionId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recovery option not found' });
    }

    // Group the data
    const option = result.rows[0];
    const steps = result.rows.filter(row => row.step_order).map(row => ({
      id: row.step_id,
      action: row.action,
      duration: row.duration,
      responsible: row.responsible_team,
      location: row.location,
      estimatedCost: row.estimated_cost,
      criticalPath: row.critical_path,
      status: row.step_status
    }));

    res.json({
      ...option,
      steps: steps
    });
  } catch (error) {
    console.error('Error fetching recovery option details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pending Recovery Solutions endpoints
app.post('/api/pending-recovery-solutions', async (req, res) => {
  try {
    const {
      disruption_id, option_id, option_title, option_description, cost, timeline,
      confidence, impact, status, full_details, rotation_impact, submitted_by, approval_required
    } = req.body;

    // Check if this combination already exists
    const existingCheck = await pool.query(`
      SELECT id FROM pending_recovery_solutions 
      WHERE disruption_id = $1 AND option_id = $2
    `, [disruption_id, option_id]);

    if (existingCheck.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Duplicate entry', 
        message: 'This recovery solution is already pending for this flight.' 
      });
    }

    const result = await pool.query(`
      INSERT INTO pending_recovery_solutions 
      (disruption_id, option_id, option_title, option_description, cost, timeline, 
       confidence, impact, status, full_details, rotation_impact, submitted_by, approval_required)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      disruption_id, option_id, option_title, option_description, cost, timeline,
      confidence, impact, status, JSON.stringify(full_details), JSON.stringify(rotation_impact),
      submitted_by, approval_required
    ]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving pending recovery solution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/pending-recovery-solutions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT prs.*, fd.flight_number, fd.route, fd.origin, fd.destination, fd.aircraft
      FROM pending_recovery_solutions prs
      LEFT JOIN flight_disruptions fd ON prs.disruption_id = fd.id
      ORDER BY prs.submitted_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pending recovery solutions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update flight recovery status
app.put('/api/flight-recovery-status/:flightId', async (req, res) => {
  try {
    const { flightId } = req.params;
    const { recovery_status } = req.body;

    const result = await pool.query(`
      UPDATE flight_disruptions 
      SET recovery_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [recovery_status, flightId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating flight recovery status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update pending solution status
app.put('/api/pending-recovery-solutions/:solutionId/status', async (req, res) => {
  try {
    const { solutionId } = req.params;
    const { status } = req.body;

    const result = await pool.query(`
      UPDATE pending_recovery_solutions 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, solutionId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pending solution not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating pending solution status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update disruption status
app.put('/api/disruptions/:disruptionId/status', async (req, res) => {
  try {
    const { disruptionId } = req.params;
    const { status } = req.body;

    const result = await pool.query(`
      UPDATE flight_disruptions 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, disruptionId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Disruption not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating disruption status:', error);
    res.status(500).json({ error: 'Internal server error' });
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