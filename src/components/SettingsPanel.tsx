"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  useSettingsStorage,
  SettingsFieldConfig,
} from "../utils/settingsStorage";
import { SettingField } from "./SettingField";
import { DynamicSettingsRenderer } from "./DynamicSettingsRenderer";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Slider } from "./ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Settings,
  Save,
  RotateCcw,
  Users,
  MessageSquare,
  Brain,
  Globe,
  Shield,
  Bell,
  Palette,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Star,
  Target,
  Plane,
  Crown,
  Clock,
  DollarSign,
  Route,
  UserCheck,
  Award,
  TrendingUp,
  Gauge,
  Zap,
  Activity,
  BarChart3,
  Info,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings2,
  Sliders,
  Calculator,
  User,
  Package,
  FileText,
  Wrench,
  Users2,
  GitBranch,
  Network,
  Workflow,
  Building,
  MapPin,
  Timer,
  Fuel,
  Wind,
  CloudRain,
  Navigation,
  Calendar,
  BarChart,
  TrendingDown,
  Coffee,
  Wifi,
  Dumbbell,
  Edit,
  AlertTriangle,
  Lock,
  Unlock,
  CheckSquare,
  Square,
  ArrowUp,
  ArrowDown,
  Loader2,
  XCircle,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { databaseService } from "../services/databaseService";

// Define NotificationKey type for better type safety
type NotificationKey =
  | "email"
  | "sms"
  | "push"
  | "desktop"
  | "recoveryAlerts"
  | "passengerUpdates"
  | "systemAlerts";

// Define Screen type
type Screen = {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  required: boolean;
  icon: React.ElementType;
};

// Define a placeholder for updateScreenSetting function if it's not defined elsewhere
// In a real scenario, this would be passed as a prop or imported
const updateScreenSetting = (screenId: string, enabled: boolean) => {
  console.log(`Screen ${screenId} toggled to ${enabled}`);
  // Implement actual state update logic here
};

// Types for Document Upload
type UploadedDocument = {
  id?: string; // Added for database ID
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
};

type FileUploadProgress = {
  name: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
};

export function SettingsPanel({
  screenSettings,
  onScreenSettingsChange,
}): JSX.Element {
  console.log(screenSettings, "tesssttttttt");
  const [activeTab, setActiveTab] = useState("screens");
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error" | "success"
  >("idle");
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);
  const settingsStore = useSettingsStorage();
  const [fieldConfigurations, setFieldConfigurations] = useState<
    Record<string, SettingsFieldConfig[]>
  >({});
  const [rawTabSettings, setRawTabSettings] = useState<any>({});

  // Database-backed state - initialized empty and populated from API
  const [nlpSettings, setNlpSettings] = useState({});

  // Rule Configuration State - initialized empty and populated from API
  const [ruleConfiguration, setRuleConfiguration] = useState({
    operationalRules: {},
    recoveryConstraints: {},
    automationSettings: {},
  });

  // Custom Rules Management State - initialized empty and populated from API
  const [customRules, setCustomRules] = useState([]);

  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    category: "Operational",
    type: "Soft",
    overridable: true,
    priority: 3,
    conditions: "",
    actions: "",
  });

  const [showAddRuleForm, setShowAddRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  // Consolidated Recovery Configuration State - initialized empty and populated from API
  const [recoveryConfiguration, setRecoveryConfiguration] = useState({
    recoveryOptionsRanking: {},
    aircraftSelectionCriteria: {},
    crewAssignmentCriteria: {},
  });

  console.log(recoveryConfiguration, "ssssssssssssssssssssss");

  // Passenger Priority Configuration State - initialized empty and populated from API
  const [passengerPriorityConfig, setPassengerPriorityConfig] = useState({
    passengerPrioritization: {},
    flightPrioritization: {},
    flightScoring: {},
    passengerScoring: {},
  });

  const [customParameters, setCustomParameters] = useState([]);
  const [newParameter, setNewParameter] = useState({
    name: "",
    category: "recoveryOptionsRanking",
    weight: 10,
    description: "",
  });

  // Document Repository State
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress[]>([]);

  // Manual Knowledge Entry State
  const [manualEntries, setManualEntries] = useState<any[]>([]);
  const [newManualEntry, setNewManualEntry] = useState({
    title: '',
    category: 'operations',
    source: '',
    tags: ''
  });
  const [showAddEntryForm, setShowAddEntryForm] = useState(false);

  // Load settings from database on component mount
  useEffect(() => {
    loadSettingsFromDatabase();
    loadCustomRulesFromDatabase();
    loadDocumentsFromDatabase();
    loadManualEntriesFromDatabase();
    checkDatabaseConnection();
    // Initialize field configurations
    setFieldConfigurations(settingsStore.getFieldConfigurations());
  }, []);

  const checkDatabaseConnection = async () => {
    const connected = settingsStore.getDatabaseStatus();
    setIsDatabaseConnected(connected);
  };

  const loadCustomRulesFromDatabase = async () => {
    try {
      const rules = await databaseService.getAllCustomRules();
      console.log("Loaded custom rules from database:", rules);

      // Transform database format to component format
      const transformedRules = rules.map((rule) => ({
        id: rule.rule_id,
        name: rule.name,
        description: rule.description,
        category: rule.category,
        type: rule.type,
        priority: rule.priority,
        overridable: rule.overridable,
        conditions: rule.conditions || "",
        actions: rule.actions,
        status: rule.status,
        createdBy: rule.created_by,
        createdDate: rule.created_at
          ? new Date(rule.created_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      }));

      setCustomRules(transformedRules);
    } catch (error) {
      console.error("Failed to load custom rules from database:", error);
      // Keep existing rules if database load fails
    }
  };

  const loadDocumentsFromDatabase = async () => {
    try {
      const documents = await databaseService.getAllDocuments();
      console.log("Loaded documents from database:", documents);

      // Transform database format to component format
      const transformedDocs = documents.map((doc) => ({
        id: doc.id, // Assuming the database service returns an ID
        name: doc.original_name,
        size: doc.file_size,
        type: doc.file_type,
        uploadedAt: new Date(doc.upload_date),
      }));

      setUploadedDocuments(transformedDocs);
    } catch (error) {
      console.error("Failed to load documents from database:", error);
      // Keep existing documents if database load fails
    }
  };

  const loadManualEntriesFromDatabase = async () => {
    try {
      // Use the dedicated manual knowledge entries endpoint
      const entries = await databaseService.getAllManualKnowledgeEntries();
      console.log("Loaded manual entries from database:", entries);

      setManualEntries(entries);
    } catch (error) {
      console.error("Failed to load manual entries from database:", error);
      // Keep existing entries if database load fails
    }
  };

  const loadSettingsFromDatabase = async () => {
    setIsLoading(true);

    try {
      // Load tab-wise organized settings from the database
      const tabSettings = await settingsStore.getTabSettings();
      console.log("Loaded tab-wise settings:", tabSettings);

      // Store raw settings for dynamic rendering
      setRawTabSettings(tabSettings);

      // Helper function to convert array of settings to key-value object
      const convertArrayToObject = (settingsArray) => {
        if (!Array.isArray(settingsArray)) return {};
        const obj = {};
        settingsArray.forEach((setting) => {
          obj[setting.key] = setting.value;
        });
        return obj;
      };

      // Helper function to load category settings from tab data
      const loadCategorySettings = (tabData, categoryKey) => {
        if (
          tabData &&
          tabData[categoryKey] &&
          Array.isArray(tabData[categoryKey])
        ) {
          return convertArrayToObject(tabData[categoryKey]);
        }
        return {};
      };

      // Load NLP Settings from nlp tab
      const newNlpSettings = loadCategorySettings(
        tabSettings.nlp,
        "nlpSettings",
      );

      // Load Rule Configuration from rules tab
      const newRuleConfig = {
        operationalRules: loadCategorySettings(
          tabSettings.rules,
          "operationalRules",
        ),
        recoveryConstraints: loadCategorySettings(
          tabSettings.rules,
          "recoveryConstraints",
        ),
        automationSettings: loadCategorySettings(
          tabSettings.rules,
          "automationSettings",
        ),
      };

      // Load Recovery Options Configuration from recoveryOptions tab
      const newRecoveryConfig = {
        recoveryOptionsRanking: loadCategorySettings(
          tabSettings.recoveryOptions,
          "recoveryOptionsRanking",
        ),
        aircraftSelectionCriteria: loadCategorySettings(
          tabSettings.recoveryOptions,
          "aircraftSelectionCriteria",
        ),
        crewAssignmentCriteria: loadCategorySettings(
          tabSettings.recoveryOptions,
          "crewAssignmentCriteria",
        ),
      };

      // Add empty customParameters arrays if they don't exist
      if (!newRecoveryConfig.recoveryOptionsRanking.customParameters) {
        newRecoveryConfig.recoveryOptionsRanking.customParameters = [];
      }
      if (!newRecoveryConfig.aircraftSelectionCriteria.customParameters) {
        newRecoveryConfig.aircraftSelectionCriteria.customParameters = [];
      }
      if (!newRecoveryConfig.crewAssignmentCriteria.customParameters) {
        newRecoveryConfig.crewAssignmentCriteria.customParameters = [];
      }

      // Load Passenger Priority Configuration from passengerPriority tab
      const newPriorityConfig = {
        passengerPrioritization: loadCategorySettings(
          tabSettings.passengerPriority,
          "passengerPrioritization",
        ),
        flightPrioritization: loadCategorySettings(
          tabSettings.passengerPriority,
          "flightPrioritization",
        ),
        flightScoring: loadCategorySettings(
          tabSettings.passengerPriority,
          "flightScoring",
        ),
        passengerScoring: loadCategorySettings(
          tabSettings.passengerPriority,
          "passengerScoring",
        ),
      };

      // Load Notification Settings from notifications tab
      const newNotificationSettings = loadCategorySettings(
        tabSettings.notifications,
        "notificationSettings",
      );

      // Load Document Repository settings - handled by separate function
      // Documents are loaded by loadDocumentsFromDatabase() function

      // Update state with loaded settings
      setNlpSettings(newNlpSettings);
      setRuleConfiguration(newRuleConfig);
      setRecoveryConfiguration(newRecoveryConfig);
      setPassengerPriorityConfig(newPriorityConfig);
      setNotificationSettings(newNotificationSettings);

      console.log("Settings loaded successfully from database");
      console.log("NLP Settings:", newNlpSettings);
      console.log("Rule Configuration:", newRuleConfig);
      console.log("Recovery Configuration:", newRecoveryConfig);
      console.log("Priority Configuration:", newPriorityConfig);
      console.log("Notification Settings:", newNotificationSettings);
    } catch (error) {
      console.error("Failed to load settings from database:", error);
      setSaveStatus("error");
    } finally {
      setIsLoading(false);
      setSaveStatus("idle");
    }
  };

  // Notification settings - initialized empty and populated from API
  const [notificationSettings, setNotificationSettings] = useState({});

  const handleScreenToggle = (screenId) => {
    const updatedSettings = screenSettings.map((screen) => {
      if (screen.id === screenId && !screen.required) {
        return { ...screen, enabled: !screen.enabled };
      }
      return screen;
    });
    onScreenSettingsChange(updatedSettings);
  };

  const handleNlpToggle = (setting) => {
    const newValue = !nlpSettings[setting];

    setNlpSettings((prev) => ({
      ...prev,
      [setting]: newValue,
    }));
  };

  const handleNlpChange = (setting, value) => {
    setNlpSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleNotificationToggle = (setting) => {
    const newValue = !notificationSettings[setting];

    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: newValue,
    }));
  };

  // Rule Configuration Handlers
  const handleRuleConfigChange = (category, parameter, value) => {
    const actualValue = Array.isArray(value) ? value[0] : value;

    setRuleConfiguration((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parameter]: actualValue,
      },
    }));
  };

  const handleRuleToggle = (category, parameter) => {
    const oldValue = ruleConfiguration[category][parameter];
    const newValue = !oldValue;

    setRuleConfiguration((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parameter]: newValue,
      },
    }));
  };

  // Custom Rules Handlers
  const handleAddRule = async () => {
    if (newRule.name.trim() && newRule.description.trim()) {
      const rule = {
        id: `RULE-${String(customRules.length + 6).padStart(3, "0")}`,
        ...newRule,
        createdBy: "user@flydubai.com",
        createdDate: new Date().toISOString().split("T")[0],
        status: "Active",
      };

      try {
        // Save to database
        const success = await databaseService.saveCustomRule({
          rule_id: rule.id,
          name: rule.name,
          description: rule.description,
          category: rule.category,
          type: rule.type,
          priority: rule.priority,
          overridable: rule.overridable,
          conditions: rule.conditions,
          actions: rule.actions,
          status: rule.status,
          created_by: rule.createdBy,
        });

        if (success) {
          setCustomRules((prev) => [...prev, rule]);
          setNewRule({
            name: "",
            description: "",
            category: "Operational",
            type: "Soft",
            overridable: true,
            priority: 3,
            conditions: "",
            actions: "",
          });
          setShowAddRuleForm(false);
        } else {
          console.error("Failed to save custom rule to database");
        }
      } catch (error) {
        console.error("Error saving custom rule:", error);
      }
    }
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setNewRule(rule);
    setShowAddRuleForm(true);
  };

  const handleUpdateRule = async () => {
    if (editingRule && newRule.name.trim() && newRule.description.trim()) {
      try {
        // Update in database
        const success = await databaseService.updateCustomRule(editingRule.id, {
          name: newRule.name,
          description: newRule.description,
          category: newRule.category,
          type: newRule.type,
          priority: newRule.priority,
          overridable: newRule.overridable,
          conditions: newRule.conditions,
          actions: newRule.actions,
          status: newRule.status,
          updated_by: "user",
        });

        if (success) {
          setCustomRules((prev) =>
            prev.map((rule) =>
              rule.id === editingRule.id ? { ...rule, ...newRule } : rule,
            ),
          );
          setEditingRule(null);
          setNewRule({
            name: "",
            description: "",
            category: "Operational",
            type: "Soft",
            overridable: true,
            priority: 3,
            conditions: "",
            actions: "",
          });
          setShowAddRuleForm(false);
        } else {
          console.error("Failed to update custom rule in database");
        }
      } catch (error) {
        console.error("Error updating custom rule:", error);
      }
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      // Delete from database
      const success = await databaseService.deleteCustomRule(ruleId);

      if (success) {
        setCustomRules((prev) => prev.filter((rule) => rule.id !== ruleId));
      } else {
        console.error("Failed to delete custom rule from database");
      }
    } catch (error) {
      console.error("Error deleting custom rule:", error);
    }
  };

  const handleToggleRuleStatus = async (ruleId) => {
    const rule = customRules.find((r) => r.id === ruleId);
    if (!rule) return;

    const newStatus = rule.status === "Active" ? "Inactive" : "Active";

    try {
      // Update status in database
      const success = await databaseService.updateCustomRule(ruleId, {
        status: newStatus,
        updated_by: "user",
      });

      if (success) {
        setCustomRules((prev) =>
          prev.map((rule) =>
            rule.id === ruleId ? { ...rule, status: newStatus } : rule,
          ),
        );
      } else {
        console.error("Failed to update rule status in database");
      }
    } catch (error) {
      console.error("Error updating rule status:", error);
    }
  };

  const handleMovePriority = async (ruleId, direction) => {
    const ruleIndex = customRules.findIndex((rule) => rule.id === ruleId);
    if (ruleIndex === -1) return;

    const rule = customRules[ruleIndex];
    let targetRule = null;

    if (direction === "up" && rule.priority > 1) {
      targetRule = customRules.find((r) => r.priority === rule.priority - 1);
    } else if (direction === "down") {
      targetRule = customRules.find((r) => r.priority === rule.priority + 1);
    }

    if (targetRule) {
      try {
        // Update both rules in database
        const success1 = await databaseService.updateCustomRule(rule.id, {
          priority: targetRule.priority,
          updated_by: "user",
        });

        const success2 = await databaseService.updateCustomRule(targetRule.id, {
          priority: rule.priority,
          updated_by: "user",
        });

        if (success1 && success2) {
          setCustomRules((prev) => {
            const newRules = [...prev];
            const ruleToUpdate = newRules.find((r) => r.id === rule.id);
            const targetToUpdate = newRules.find((r) => r.id === targetRule.id);

            if (ruleToUpdate && targetToUpdate) {
              const tempPriority = ruleToUpdate.priority;
              ruleToUpdate.priority = targetToUpdate.priority;
              targetToUpdate.priority = tempPriority;
            }

            return newRules.sort((a, b) => a.priority - b.priority);
          });
        } else {
          console.error("Failed to update rule priorities in database");
        }
      } catch (error) {
        console.error("Error updating rule priorities:", error);
      }
    }
  };

  // Recovery Configuration Handlers
  const handleRecoveryConfigChange = (section, parameter, value) => {
    const actualValue = Array.isArray(value) ? value[0] : value;

    // Calculate what the new total would be for this section
    const currentTotal = calculateTotalWeight(null, section);
    const currentValue = recoveryConfiguration[section][parameter] || 0;
    const newTotal = currentTotal - currentValue + actualValue;

    // Only allow the change if it doesn't exceed 100%
    if (newTotal <= 100) {
      setRecoveryConfiguration((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [parameter]: actualValue,
        },
      }));
    }
  };

  // Custom Parameter Weight Change Handler
  const handleCustomParameterWeightChange = (section, paramId, newWeight) => {
    // Calculate what the new total would be for this section
    const currentTotal = calculateTotalWeight(null, section);
    const param = recoveryConfiguration[section].customParameters.find(p => p.id === paramId);
    const currentWeight = param ? param.weight : 0;
    const newTotal = currentTotal - currentWeight + newWeight;

    // Only allow the change if it doesn't exceed 100%
    if (newTotal <= 100) {
      setRecoveryConfiguration((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          customParameters: prev[section].customParameters.map(param =>
            param.id === paramId
              ? { ...param, weight: newWeight }
              : param
          ),
        },
      }));
    }
  };

  // Passenger Priority Configuration Handlers
  const handlePriorityConfigChange = (category, parameter, value) => {
    const newValue = Array.isArray(value) ? value[0] : Number(value) || 0;
    const currentValue = passengerPriorityConfig[category][parameter] || 0;
    const difference = newValue - currentValue;

    if (difference === 0) return;

    // Get all parameters in this category except the one being changed
    const otherParams = Object.keys(passengerPriorityConfig[category]).filter(
      key => key !== parameter
    );

    // Calculate current total of other parameters
    const otherParamsTotal = otherParams.reduce(
      (sum, key) => sum + (passengerPriorityConfig[category][key] || 0), 0
    );

    // If increasing and would exceed 100%, redistribute from other parameters
    if (difference > 0) {
      const maxPossibleIncrease = Math.min(difference, otherParamsTotal);
      const finalValue = currentValue + maxPossibleIncrease;

      if (maxPossibleIncrease <= 0) return; // Can't increase

      // Redistribute the weight proportionally from other parameters
      const redistributeAmount = maxPossibleIncrease;
      const newConfig = { ...passengerPriorityConfig[category] };

      // Set the new value for the changed parameter
      newConfig[parameter] = finalValue;

      // Redistribute from other parameters proportionally
      if (otherParamsTotal > 0) {
        otherParams.forEach(key => {
          const currentParamValue = newConfig[key] || 0;
          const proportion = currentParamValue / otherParamsTotal;
          const reduction = redistributeAmount * proportion;
          newConfig[key] = Math.max(0, Math.round((currentParamValue - reduction) * 10) / 10);
        });
      }

      setPassengerPriorityConfig((prev) => ({
        ...prev,
        [category]: newConfig,
      }));
    } else {
      // If decreasing, just update the value
      setPassengerPriorityConfig((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [parameter]: newValue,
        },
      }));
    }
  };

  const handleAddCustomParameter = () => {
    if (newParameter.name.trim()) {
      const parameter = {
        id: `custom_${Date.now()}`,
        ...newParameter,
        isCustom: true,
      };

      // Add to the appropriate category
      setRecoveryConfiguration((prev) => ({
        ...prev,
        [newParameter.category]: {
          ...prev[newParameter.category],
          customParameters: [
            ...prev[newParameter.category].customParameters,
            parameter,
          ],
        },
      }));

      setCustomParameters((prev) => [...prev, parameter]);
      setNewParameter({
        name: "",
        category: "recoveryOptionsRanking",
        weight: 10,
        description: "",
      });
    }
  };

  const handleRemoveCustomParameter = (id, category) => {
    setRecoveryConfiguration((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        customParameters: prev[category].customParameters.filter(
          (p) => p.id !== id,
        ),
      },
    }));
    setCustomParameters((prev) => prev.filter((p) => p.id !== id));
  };

  const showSaveStatus = () => {
    setSaveStatus("saving");
    // Add slight delay to show saving status
    setTimeout(() => {
      setSaveStatus("saved");
    }, 300);

    setTimeout(() => setSaveStatus("idle"), 2500);
  };

  // Tab-wise save functions
  const saveScreenSettings = async () => {
    setSaveStatus("saving");
    try {
      console.log(screenSettings, "Screen");

      // Use the dedicated screen settings batch save API
      const success = await databaseService.batchSaveScreenSettings(
        screenSettings,
        "user",
      );

      if (success) {
        showSaveStatus();
        // Notify parent component about the changes
        onScreenSettingsChange(screenSettings);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Failed to save screen settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const savePassengerPrioritySettings = async () => {
    setSaveStatus("saving");
    try {
      const categoryMapping = {
        passengerPrioritization: "passengerPrioritization",
        flightPrioritization: "flightPrioritization",
        flightScoring: "flightScoring",
        passengerScoring: "passengerScoring",
      };

      const success = await settingsStore.saveSettingsFromState(
        passengerPriorityConfig,
        categoryMapping,
        "user",
      );

      if (success) {
        showSaveStatus();
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Failed to save passenger priority settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const saveRuleSettings = async () => {
    setSaveStatus("saving");
    try {
      // Save rule configuration settings
      const categoryMapping = {
        operationalRules: "operationalRules",
        recoveryConstraints: "recoveryConstraints",
        automationSettings: "automationSettings",
      };

      const configSuccess = await settingsStore.saveSettingsFromState(
        ruleConfiguration,
        categoryMapping,
        "user",
      );

      // Save custom rules to database
      let rulesSuccess = true;
      for (const rule of customRules) {
        const ruleSuccess = await databaseService.saveCustomRule({
          rule_id: rule.id,
          name: rule.name,
          description: rule.description,
          category: rule.category,
          type: rule.type,
          priority: rule.priority,
          overridable: rule.overridable,
          conditions: rule.conditions,
          actions: rule.actions,
          status: rule.status,
          created_by: rule.createdBy || "user",
        });
        if (!ruleSuccess) {
          rulesSuccess = false;
          break;
        }
      }

      if (configSuccess && rulesSuccess) {
        showSaveStatus();
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Failed to save rule settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const saveRecoverySettings = async () => {
    setSaveStatus("saving");
    try {
      // Validate weight totals for each section before saving
      const sections = ['recoveryOptionsRanking', 'aircraftSelectionCriteria', 'crewAssignmentCriteria'];
      const validationErrors = [];

      for (const section of sections) {
        const totalWeight = calculateTotalWeight(null, section);
        if (totalWeight > 100) {
          validationErrors.push(`${section}: Total weight (${totalWeight}%) exceeds 100%`);
        }

        // Additional validation for custom parameters
        const customParametersWeight = recoveryConfiguration[section].customParameters?.reduce((sum, p) => sum + p.weight, 0) || 0;
        const baseParametersWeight = Object.keys(recoveryConfiguration[section])
          .filter(key => key !== "customParameters")
          .reduce((sum, key) => sum + (recoveryConfiguration[section][key] || 0), 0);

        if (customParametersWeight + baseParametersWeight > 100) {
          validationErrors.push(`${section}: Custom parameters weight (${customParametersWeight}%) plus base parameters weight (${baseParametersWeight}%) exceeds 100%`);
        }
      }

      if (validationErrors.length > 0) {
        console.error("Validation errors:", validationErrors);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
        return;
      }

      const categoryMapping = {
        recoveryOptionsRanking: "recoveryOptionsRanking",
        aircraftSelectionCriteria: "aircraftSelectionCriteria",
        crewAssignmentCriteria: "crewAssignmentCriteria",
      };

      const success = await settingsStore.saveSettingsFromState(
        recoveryConfiguration,
        categoryMapping,
        "user",
      );

      if (success) {
        showSaveStatus();
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Failed to save recovery settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const saveNlpSettings = async () => {
    setSaveStatus("saving");
    try {
      const categoryMapping = {
        nlpSettings: "nlpSettings",
        documentRepository: "documentRepository",
        manualKnowledgeEntries: "manualKnowledgeEntries",
      };

      // Combine NLP settings, document repository data, and manual entries
      const stateToSave = {
        nlpSettings: nlpSettings,
        documentRepository: uploadedDocuments,
        manualKnowledgeEntries: manualEntries,
      };

      const success = await settingsStore.saveSettingsFromState(
        stateToSave,
        categoryMapping,
        "user",
      );

      if (success) {
        showSaveStatus();
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Failed to save NLP settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const saveNotificationSettings = async () => {
    setSaveStatus("saving");
    try {
      const categoryMapping = {
        notificationSettings: "notificationSettings",
      };

      // Create a wrapper object for the notificationSettings
      const stateWrapper = { notificationSettings };

      const success = await settingsStore.saveSettingsFromState(
        stateWrapper,
        categoryMapping,
        "user",
      );

      if (success) {
        showSaveStatus();
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Failed to save notification settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const saveSystemSettings = async () => {
    setSaveStatus("saving");
    try {
      // Convert system settings from rawTabSettings to settings format for batch save
      const settingsToSave = [];

      if (rawTabSettings?.system) {
        Object.entries(rawTabSettings.system).forEach(
          ([categoryKey, categorySettings]) => {
            if (Array.isArray(categorySettings)) {
              categorySettings.forEach((setting) => {
                console.log(setting, "setting");
                settingsToSave.push({
                  category: categoryKey,
                  key: setting.key,
                  value: setting.value,
                  type: setting.type || "string",
                });
              });
            }
          },
        );
      }

      if (settingsToSave.length > 0) {
        // Create a state object for system settings
        const systemState = {};
        settingsToSave.forEach((setting) => {
          if (!systemState[setting.category]) {
            systemState[setting.category] = {};
          }
          systemState[setting.category][setting.key] = setting.value;
        });

        // Create category mapping
        const categoryMapping = {};
        Object.keys(systemState).forEach((category) => {
          categoryMapping[category] = category;
        });

        const success = await settingsStore.saveSettingsFromState(
          systemState,
          categoryMapping,
          "user",
        );

        if (success) {
          showSaveStatus();
        } else {
          setSaveStatus("error");
          setTimeout(() => setSaveStatus("idle"), 3000);
        }
      } else {
        // No system settings to save, just show success
        showSaveStatus();
      }
    } catch (error) {
      console.error("Failed to save system settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleSaveAllSettings = async () => {
    setSaveStatus("saving");
    try {
      // Save all settings
      await savePassengerPrioritySettings();
      await saveRuleSettings();
      await saveRecoverySettings();
      await saveNlpSettings();
      await saveNotificationSettings();
      await saveSystemSettings();

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save all settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleResetAllSettings = async () => {
    try {
      setSaveStatus("saving");
      await settingsStore.resetToDefaults();
      await loadSettingsFromDatabase();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to reset settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const calculateTotalWeight = (category, section = null) => {
    let baseWeights: any = 0;
    let customWeights: any = 0;

    if (section) {
      // For recovery configuration sections
      const data = recoveryConfiguration[section];
      if (data) {
        const baseParams = Object.keys(data).filter(
          (key) => key !== "customParameters",
        );
        baseWeights = baseParams.reduce(
          (sum, key) => sum + (data[key] || 0),
          0,
        );
        customWeights =
          data.customParameters?.reduce((sum, p) => sum + (p.weight || 0), 0) || 0;
      }
    } else {
      // For passenger priority configuration
      const baseParams = Object.values(passengerPriorityConfig[category] || {});
      baseWeights = baseParams.reduce(
        (sum: number, val) => sum + Number(val || 0),
        0,
      );
      customWeights = customParameters
        .filter((p) => p.category === category)
        .reduce((sum, p) => sum + (p.weight || 0), 0);
    }

    return baseWeights + customWeights;
  };

  const getAvailableWeight = (
    category,
    section = null,
    currentParam = null,
    currentValue = 0,
  ) => {
    const total = calculateTotalWeight(category, section);
    let adjustedCurrentValue = currentValue;

    // For custom parameters, find the current weight by ID
    if (section && typeof currentParam === 'string' && currentParam.startsWith('custom_')) {
      const param = recoveryConfiguration[section]?.customParameters?.find(p => p.id === currentParam);
      adjustedCurrentValue = param ? param.weight : 0;
    }

    const remaining = 100 - total + adjustedCurrentValue;
    return Math.max(0, remaining);
  };

  const getWeightColor = (weight) => {
    if (weight >= 25) return "text-red-600";
    if (weight >= 15) return "text-orange-600";
    if (weight >= 10) return "text-blue-600";
    return "text-gray-600";
  };

  const getParameterIcon = (param) => {
    const icons = {
      // Recovery Options
      costWeight: DollarSign,
      timeWeight: Clock,
      passengerImpactWeight: Users,
      operationalComplexityWeight: Settings2,
      reputationWeight: Star,

      // Aircraft Selection
      maintenanceStatus: Wrench,
      fuelEfficiency: Fuel,
      routeSuitability: Route,
      passengerCapacity: Users2,
      availabilityWindow: Calendar,

      // Crew Assignment
      dutyTimeRemaining: Clock,
      qualifications: Award,
      baseLocation: MapPin,
      restRequirements: Coffee,
      languageSkills: Globe,

      // Passenger Priority
      loyaltyTier: Crown,
      ticketClass: Star,
      specialNeeds: Shield,
      groupSize: Users,
      connectionRisk: Clock,
      airlinePreference: Plane,
      onTimePerformance: Target,
      aircraftType: Settings2,
      departureTime: Clock,
      connectionBuffer: Route,
      baseScore: Gauge,
      priorityBonus: Award,
      airlineBonus: Plane,
      specialReqBonus: Shield,
      loyaltyBonus: Crown,
      groupBonus: Users,
      vipWeight: Crown,
      loyaltyWeight: Star,
      specialNeedsWeight: Shield,
      revenueWeight: DollarSign,
    };
    return icons[param] || Settings;
  };

  const getRuleTypeColor = (type) => {
    return type === "Hard"
      ? "bg-red-100 text-red-800 border-red-200"
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getRuleStatusColor = (status) => {
    return status === "Active"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getRuleCategoryIcon = (category) => {
    const icons = {
      Weather: CloudRain,
      "Passenger Service": Users,
      "Crew Management": Users2,
      Financial: DollarSign,
      Maintenance: Wrench,
      Operational: Settings2,
      Safety: Shield,
      Security: Lock,
    };
    return icons[category] || FileText;
  };

  const categories = {
    main: { name: "Main", color: "text-flydubai-blue" },
    operations: { name: "Operations", color: "text-flydubai-blue" },
    prediction: { name: "Prediction", color: "text-flydubai-navy" },
    monitoring: { name: "Monitoring", color: "text-flydubai-navy" },
    services: { name: "Services", color: "text-flydubai-blue" },
    analytics: { name: "Analytics", color: "text-flydubai-navy" },
    system: { name: "System", color: "text-gray-600" },
  };

  const updateScreenSetting = (screenId: string, enabled: boolean) => {
    const updatedSettings = screenSettings.map((screen: Screen) => {
      if (screen.id === screenId && !screen.required) {
        return { ...screen, enabled: enabled };
      }
      return screen;
    });
    onScreenSettingsChange(updatedSettings);
  };

  const updateSystemSetting = (
    categoryKey: string,
    settingKey: string,
    value: any,
  ) => {
    setRawTabSettings((prev) => ({
      ...prev,
      system: {
        ...prev.system,
        [categoryKey]: prev.system[categoryKey].map((setting) =>
          setting.key === settingKey ? { ...setting, value: value } : setting,
        ),
      },
    }));
  };

  // Document Upload Handlers
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const MAX_FILE_SIZE_MB = 3;
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    const newUploads: FileUploadProgress[] = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        newUploads.push({ name: file.name, progress: 0, status: 'error', error: 'Invalid file type. Only PDF and DOC files are allowed.' });
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        newUploads.push({ name: file.name, progress: 0, status: 'error', error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.` });
        continue;
      }

      newUploads.push({ name: file.name, progress: 0, status: 'uploading' });
    }

    setUploadProgress(prev => [...prev, ...newUploads]);

    for (const file of files) {
      // Check validation again in case the above loop was skipped or file was modified
      if (!allowedTypes.includes(file.type) || file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        continue; // Already handled above, or skip if not validated
      }

      try {
        // Convert file to base64
        const base64Content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:mime;base64, prefix
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Save to database
        const success = await databaseService.saveDocument({
          name: file.name,
          original_name: file.name,
          file_type: file.type,
          file_size: file.size,
          content_base64: base64Content,
          uploaded_by: 'user',
          metadata: {
            uploadDate: new Date().toISOString(),
            category: 'nlp_documents'
          }
        });

        if (success) {
          setUploadProgress(prev => prev.map(p => p.name === file.name ? {...p, progress: 100, status: 'completed'} : p));
          setUploadedDocuments(prev => [...prev, {
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date(),
          }]);
          console.log('Document saved to database successfully:', file.name);
        } else {
          setUploadProgress(prev => prev.map(p => p.name === file.name ? {...p, progress: 0, status: 'error', error: 'Failed to save to database'} : p));
        }
      } catch (error) {
        console.error('Error saving document:', error);
        setUploadProgress(prev => prev.map(p => p.name === file.name ? {...p, progress: 0, status: 'error', error: 'Upload failed'} : p));
      }
    }
  };

  const handleRemoveDocument = async (indexToRemove: number) => {
    const documentToRemove = uploadedDocuments[indexToRemove];
    if (!documentToRemove || !documentToRemove.id) {
      console.error("Cannot remove document: ID is missing.");
      setUploadedDocuments(prev => prev.filter((_, index) => index !== indexToRemove)); // Still remove from UI
      return;
    }

    try {
      const success = await databaseService.deleteDocument(documentToRemove.id);

      if (success) {
        setUploadedDocuments(prev => prev.filter((_, index) => index !== indexToRemove));
        console.log('Document deleted from database and list:', documentToRemove.name);
      } else {
        console.error('Failed to delete document from database.');
        // Optionally, keep it in the UI or show an error to the user
      }
    } catch (error) {
      console.error('Error removing document:', error);
    }
  };


  // Manual Knowledge Entry Handlers
  const handleAddManualEntry = async () => {
    if (newManualEntry.title.trim() && newManualEntry.source.trim()) {
      const entry = {
        id: `manual_${Date.now()}`,
        ...newManualEntry,
        createdAt: new Date().toISOString(),
        createdBy: 'user@flydubai.com',
      };

      try {
        // Save individual entry to database
        const success = await databaseService.saveSetting(
          'manualKnowledgeEntries',
          entry.id,
          {
            title: entry.title,
            category: entry.category,
            source: entry.source,
            tags: entry.tags,
          },
          'object',
          'user'
        );

        if (success) {
          setManualEntries(prev => [...prev, entry]);
          setNewManualEntry({
            title: '',
            category: 'operations',
            source: '',
            tags: ''
          });
          setShowAddEntryForm(false);
          console.log('Manual entry saved successfully:', entry.id);
        } else {
          console.error('Failed to save manual entry to database');
        }
      } catch (error) {
        console.error('Error saving manual entry:', error);
      }
    }
  };

  const handleDeleteManualEntry = async (entryId: string) => {
    try {
      const success = await databaseService.deleteSetting('manualKnowledgeEntries', entryId);

      if (success) {
        setManualEntries(prev => prev.filter(entry => entry.id !== entryId));
        console.log('Manual entry deleted successfully:', entryId);
      } else {
        console.error('Failed to delete manual entry from database');
      }
    } catch (error) {
      console.error('Error deleting manual entry:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="spinner-flydubai mx-auto mb-4"></div>
          <p className="text-flydubai-blue">Loading Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-flydubai-navy">
            AERON Settings
          </h2>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">
              Configure system preferences and operational parameters
            </p>

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-flydubai-blue">
                <div className="spinner-flydubai"></div>
                Loading...
              </div>
            )}
            {saveStatus === "saving" && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="spinner-flydubai"></div>
                Saving...
              </div>
            )}
            {saveStatus === "saved" && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Saved to Database
              </div>
            )}
            {saveStatus === "error" && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                Database Error
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="screens">Screen Settings</TabsTrigger>
          <TabsTrigger value="passenger-priority">
            Passenger Priority
          </TabsTrigger>
          <TabsTrigger value="rules">Rule Configuration</TabsTrigger>
          <TabsTrigger value="recovery-options">Recovery Options</TabsTrigger>
          <TabsTrigger value="nlp">Natural Language</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Screen Settings */}
        <TabsContent value="screens" className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-5 w-5 text-flydubai-blue" />
                <CardTitle className="text-flydubai-navy">
                  Screen Visibility Configuration
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                Control which screens are available in the AERON interface.
                Required screens cannot be disabled.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {screenSettings.length > 0 ? (
                <>
                  {/* Main Category */}
                  {screenSettings.filter((screen) => screen.category === "main")
                    .length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-flydubai-blue uppercase tracking-wider">
                        Main
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {screenSettings
                          .filter((screen) => screen.category === "main")
                          .map((screen) => (
                            <div
                              key={screen.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className=" font-medium">
                                  {screen.name}
                                </div>
                                {screen.required && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-gray-600"
                                  >
                                    Required
                                  </Badge>
                                )}
                              </div>
                              <Switch
                                checked={screen.enabled}
                                onCheckedChange={(checked) =>
                                  updateScreenSetting(screen.id, checked)
                                }
                                disabled={screen.required}
                                className={
                                  screen.enabled
                                    ? "data-[state=checked]:bg-flydubai-blue"
                                    : ""
                                }
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Operations Category */}
                  {screenSettings.filter(
                    (screen) => screen.category === "operations",
                  ).length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-flydubai-blue uppercase tracking-wider">
                        Operations
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {screenSettings
                          .filter((screen) => screen.category === "operations")
                          .map((screen) => (
                            <div
                              key={screen.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className=" font-medium">
                                  {screen.name}
                                </div>
                                {screen.required && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-gray-600"
                                  >
                                    Required
                                  </Badge>
                                )}
                              </div>
                              <Switch
                                checked={screen.enabled}
                                onCheckedChange={(checked) =>
                                  updateScreenSetting(screen.id, checked)
                                }
                                disabled={screen.required}
                                className={
                                  screen.enabled
                                    ? "data-[state=checked]:bg-flydubai-blue"
                                    : ""
                                }
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Prediction Category */}
                  {screenSettings.filter(
                    (screen) => screen.category === "prediction",
                  ).length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-flydubai-blue uppercase tracking-wider">
                        Prediction
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {screenSettings
                          .filter((screen) => screen.category === "prediction")
                          .map((screen) => (
                            <div
                              key={screen.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className=" font-medium">
                                  {screen.name}
                                </div>
                                {screen.required && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-gray-600"
                                  >
                                    Required
                                  </Badge>
                                )}
                              </div>
                              <Switch
                                checked={screen.enabled}
                                onCheckedChange={(checked) =>
                                  updateScreenSetting(screen.id, checked)
                                }
                                disabled={screen.required}
                                className={
                                  screen.enabled
                                    ? "data-[state=checked]:bg-flydubai-blue"
                                    : ""
                                }
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Monitoring Category */}
                  {screenSettings.filter(
                    (screen) => screen.category === "monitoring",
                  ).length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-flydubai-blue uppercase tracking-wider">
                        Monitoring
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {screenSettings
                          .filter((screen) => screen.category === "monitoring")
                          .map((screen) => (
                            <div
                              key={screen.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className=" font-medium">
                                  {screen.name}
                                </div>
                                {screen.required && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-gray-600"
                                  >
                                    Required
                                  </Badge>
                                )}
                              </div>
                              <Switch
                                checked={screen.enabled}
                                onCheckedChange={(checked) =>
                                  updateScreenSetting(screen.id, checked)
                                }
                                disabled={screen.required}
                                className={
                                  screen.enabled
                                    ? "data-[state=checked]:bg-flydubai-blue"
                                    : ""
                                }
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Services Category */}
                  {screenSettings.filter(
                    (screen) => screen.category === "services",
                  ).length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-flydubai-blue uppercase tracking-wider">
                        Services
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {screenSettings
                          .filter((screen) => screen.category === "services")
                          .map((screen) => (
                            <div
                              key={screen.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className=" font-medium">
                                  {screen.name}
                                </div>
                                {screen.required && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-gray-600"
                                  >
                                    Required
                                  </Badge>
                                )}
                              </div>
                              <Switch
                                checked={screen.enabled}
                                onCheckedChange={(checked) =>
                                  updateScreenSetting(screen.id, checked)
                                }
                                disabled={screen.required}
                                className={
                                  screen.enabled
                                    ? "data-[state=checked]:bg-flydubai-blue"
                                    : ""
                                }
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Analytics Category */}
                  {screenSettings.filter(
                    (screen) => screen.category === "analytics",
                  ).length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-flydubai-blue uppercase tracking-wider">
                        Analytics
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {screenSettings
                          .filter((screen) => screen.category === "analytics")
                          .map((screen) => (
                            <div
                              key={screen.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className=" font-medium">
                                  {screen.name}
                                </div>
                                {screen.required && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-gray-600"
                                  >
                                    Required
                                  </Badge>
                                )}
                              </div>
                              <Switch
                                checked={screen.enabled}
                                onCheckedChange={(checked) =>
                                  updateScreenSetting(screen.id, checked)
                                }
                                disabled={screen.required}
                                className={
                                  screen.enabled
                                    ? "data-[state=checked]:bg-flydubai-blue"
                                    : ""
                                }
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* System Category */}
                  {screenSettings.filter(
                    (screen) => screen.category === "system",
                  ).length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-flydubai-blue uppercase tracking-wider">
                        System
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {screenSettings
                          .filter((screen) => screen.category === "system")
                          .map((screen) => (
                            <div
                              key={screen.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className=" font-medium">
                                  {screen.name}
                                </div>
                                {screen.required && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-gray-600"
                                  >
                                    Required
                                  </Badge>
                                )}
                              </div>
                              <Switch
                                checked={screen.enabled}
                                onCheckedChange={(checked) =>
                                  updateScreenSetting(screen.id, checked)
                                }
                                disabled={screen.required}
                                className={
                                  screen.enabled
                                    ? "data-[state=checked]:bg-flydubai-blue"
                                    : ""
                                }
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No screen settings available</p>
                  <p className="text-sm mt-2">
                    Screen settings will appear here when loaded from the
                    database
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-6 border-t">
                <Button
                  onClick={saveScreenSettings}
                  disabled={saveStatus === "saving"}
                  className="min-w-[120px] btn-flydubai-primary"
                >
                  {saveStatus === "saving" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : saveStatus === "success" ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Saved
                    </>
                  ) : saveStatus === "error" ? (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Error
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Screen Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Passenger Priority Configuration */}
        <TabsContent value="passenger-priority" className="space-y-6">
          {/* Overview Card */}
          <Card className="border-flydubai-blue bg-blue-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-flydubai-blue">
                    <UserCheck className="h-5 w-5" />
                    Passenger Priority Configuration
                  </CardTitle>
                  <p className="text-sm text-blue-700">
                    Configure how passengers are prioritized and how flights are
                    scored for different passenger types. These settings
                    directly impact the rebooking algorithms and recovery
                    decision-making.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Configuration Impact:</strong> Changes to these
                  settings will affect all future passenger rebooking operations
                  and flight recommendations. Current active bookings will
                  continue using existing parameters.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Configuration Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Passenger Prioritization Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Users className="h-5 w-5" />
                  Passenger Prioritization Criteria
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure weightage for determining passenger priority order
                  during disruptions.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(
                  passengerPriorityConfig.passengerPrioritization,
                ).map(([key, value]) => {
                  const Icon = getParameterIcon(key);
                  // Get label from API response data
                  const settingData =
                    rawTabSettings?.passengerPriority?.passengerPrioritization?.find(
                      (setting) => setting.key === key,
                    );
                  const label =
                    settingData?.label ||
                    key.charAt(0).toUpperCase() + key.slice(1);

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-flydubai-blue" />
                          <Label className="text-sm font-medium">{label}</Label>
                        </div>
                        <Badge
                          className={`${getWeightColor(value)} bg-transparent border`}
                        >
                          {value}%
                        </Badge>
                      </div>
                      <Slider
                        value={
                          Array.isArray(value) ? value : [Number(value) || 0]
                        }
                        onValueChange={(newValue) =>
                          handlePriorityConfigChange(
                            "passengerPrioritization",
                            key,
                            newValue,
                          )
                        }
                        max={100}
                        min={0}
                        step={5}
                        className="w-full slider-flydubai"
                      />
                    </div>
                  );
                })}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-flydubai-navy">
                      Total Weight:
                    </span>
                    <Badge
                      className={
                        calculateTotalWeight("passengerPrioritization") === 100
                          ? "bg-green-100 text-green-800"
                          : calculateTotalWeight("passengerPrioritization") >
                              100
                            ? "bg-red-100 text-red-800"
                            : "bg-orange-100 text-orange-800"
                      }
                    >
                      {calculateTotalWeight("passengerPrioritization")}% / 100%
                    </Badge>
                  </div>
                  {calculateTotalWeight("passengerPrioritization") > 100 && (
                    <p className="text-xs text-red-600 mt-1">
                      ❌ Total weight exceeds 100%. Please reduce some values.
                    </p>
                  )}
                  {calculateTotalWeight("passengerPrioritization") < 100 &&
                    calculateTotalWeight("passengerPrioritization") !== 100 && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Recommended total: 100%. Current deviation may affect
                        prioritization accuracy.
                      </p>
                    )}
                  {calculateTotalWeight("passengerPrioritization") === 100 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Perfect weight distribution.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Flight Prioritization for Passengers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Plane className="h-5 w-5" />
                  Flight Prioritization for Passengers
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure how flights are ranked and recommended to different
                  passenger types.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(
                  passengerPriorityConfig.flightPrioritization,
                ).map(([key, value]) => {
                  const Icon = getParameterIcon(key);
                  // Get label from API response data
                  const settingData =
                    rawTabSettings?.passengerPriority?.flightPrioritization?.find(
                      (setting) => setting.key === key,
                    );
                  const label =
                    settingData?.label ||
                    key.charAt(0).toUpperCase() + key.slice(1);

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-flydubai-blue" />
                          <Label className="text-sm font-medium">{label}</Label>
                        </div>
                        <Badge
                          className={`${getWeightColor(value)} bg-transparent border`}
                        >
                          {value}%
                        </Badge>
                      </div>
                      <Slider
                        value={
                          Array.isArray(value) ? value : [Number(value) || 0]
                        }
                        onValueChange={(newValue) =>
                          handlePriorityConfigChange(
                            "flightPrioritization",
                            key,
                            newValue,
                          )
                        }
                        max={100}
                        min={0}
                        step={5}
                        className="w-full slider-flydubai"
                      />
                    </div>
                  );
                })}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-flydubai-navy">
                      Total Weight:
                    </span>
                    <Badge
                      className={
                        calculateTotalWeight("flightPrioritization") === 100
                          ? "bg-green-100 text-green-800"
                          : calculateTotalWeight("flightPrioritization") > 100
                            ? "bg-red-100 text-red-800"
                            : "bg-orange-100 text-orange-800"
                      }
                    >
                      {calculateTotalWeight("flightPrioritization")}% / 100%
                    </Badge>
                  </div>
                  {calculateTotalWeight("flightPrioritization") > 100 && (
                    <p className="text-xs text-red-600 mt-1">
                      ❌ Total weight exceeds 100%. Please reduce some values.
                    </p>
                  )}
                  {calculateTotalWeight("flightPrioritization") < 100 &&
                    calculateTotalWeight("flightPrioritization") !== 100 && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Recommended total: 100%. Current deviation may affect
                        prioritization accuracy.
                      </p>
                    )}
                  {calculateTotalWeight("flightPrioritization") === 100 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Perfect weight distribution.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Flight Scoring Algorithm */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Calculator className="h-5 w-5" />
                  Flight Scoring Algorithm
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure base scores and bonus points for flight suitability
                  calculations.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(passengerPriorityConfig.flightScoring).map(
                  ([key, value]) => {
                    const Icon = getParameterIcon(key);
                    // Get label from API response data
                    const settingData =
                      rawTabSettings?.passengerPriority?.flightScoring?.find(
                        (setting) => setting.key === key,
                      );
                    const label =
                      settingData?.label ||
                      key.charAt(0).toUpperCase() + key.slice(1);

                    const maxValue = key === "baseScore" ? 100 : 20;

                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-flydubai-blue" />
                            <Label className="text-sm font-medium">
                              {label}
                            </Label>
                          </div>
                          <Badge
                            className={`${getWeightColor(value)} bg-transparent border`}
                          >
                            {value}%
                          </Badge>
                        </div>
                        <Slider
                          value={
                            Array.isArray(value) ? value : [Number(value) || 0]
                          }
                          onValueChange={(newValue) =>
                            handlePriorityConfigChange(
                              "flightScoring",
                              key,
                              newValue,
                            )
                          }
                          max={
                            key === "baseScore"
                              ? maxValue
                              : Math.min(
                                  maxValue,
                                  getAvailableWeight(
                                    "flightScoring",
                                    null,
                                    key,
                                    value,
                                  ),
                                )
                          }
                          min={key === "baseScore" ? 50 : 0}
                          step={1}
                          className="w-full slider-flydubai"
                        />
                      </div>
                    );
                  },
                )}

                <Alert className="border-blue-200 bg-blue-50">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-xs">
                    <strong>Scoring Example:</strong> VIP passenger on flydubai
                    flight = {passengerPriorityConfig.flightScoring.baseScore}{" "}
                    (base) +{" "}
                    {passengerPriorityConfig.flightScoring.priorityBonus} (VIP)
                    + {passengerPriorityConfig.flightScoring.airlineBonus}{" "}
                    (flydubai) ={" "}
                    {passengerPriorityConfig.flightScoring.baseScore +
                      passengerPriorityConfig.flightScoring.priorityBonus +
                      passengerPriorityConfig.flightScoring.airlineBonus}
                    % match
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Passenger Scoring Algorithm */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Activity className="h-5 w-5" />
                  Passenger Scoring Algorithm
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure weightage for overall passenger importance scoring
                  during recovery operations.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(passengerPriorityConfig.passengerScoring).map(
                  ([key, value]) => {
                    const Icon = getParameterIcon(key);
                    // Get label from API response data
                    const settingData =
                      rawTabSettings?.passengerPriority?.passengerScoring?.find(
                        (setting) => setting.key === key,
                      );
                    const label =
                      settingData?.label ||
                      key.charAt(0).toUpperCase() + key.slice(1);

                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-flydubai-blue" />
                            <Label className="text-sm font-medium">
                              {label}
                            </Label>
                          </div>
                          <Badge
                            className={`${getWeightColor(value)} bg-transparent border`}
                          >
                            {value}%
                          </Badge>
                        </div>
                        <Slider
                          value={
                            Array.isArray(value) ? value : [Number(value) || 0]
                          }
                          onValueChange={(newValue) =>
                            handlePriorityConfigChange(
                              "passengerScoring",
                              key,
                              newValue,
                            )
                          }
                          max={100}
                          min={0}
                          step={5}
                          className="w-full slider-flydubai"
                        />
                      </div>
                    );
                  },
                )}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-flydubai-navy">
                      Total Weight:
                    </span>
                    <Badge
                      className={
                        calculateTotalWeight("passengerScoring") === 100
                          ? "bg-green-100 text-green-800"
                          : calculateTotalWeight("passengerScoring") > 100
                            ? "bg-red-100 text-red-800"
                            : "bg-orange-100 text-orange-800"
                      }
                    >
                      {calculateTotalWeight("passengerScoring")}% / 100%
                    </Badge>
                  </div>
                  {calculateTotalWeight("passengerScoring") > 100 && (
                    <p className="text-xs text-red-600 mt-1">
                      ❌ Total weight exceeds 100%. Please reduce some values.
                    </p>
                  )}
                  {calculateTotalWeight("passengerScoring") < 100 &&
                    calculateTotalWeight("passengerScoring") !== 100 && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Recommended total: 100%. Current deviation may affect
                        prioritization accuracy.
                      </p>
                    )}
                  {calculateTotalWeight("passengerScoring") === 100 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Perfect weight distribution.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div class="flex justify-end">
            <Button
              onClick={savePassengerPrioritySettings}
              className="btn-flydubai-primary"
              disabled={isLoading || saveStatus === "saving"}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveStatus === "saving" ? "Saving..." : "Save Priority Settings"}
            </Button>
          </div>
        </TabsContent>
        {/* Enhanced Rule Configuration */}
        <TabsContent value="rules" className="space-y-6">
          <Card className="border-flydubai-blue bg-blue-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-flydubai-blue">
                    <FileText className="h-5 w-5" />
                    Rule Configuration
                  </CardTitle>
                  <p className="text-sm text-blue-700">
                    Configure operational rules, constraints, automation
                    settings, and custom business rules that govern AERON's
                    decision-making process.
                  </p>
                </div>
                {/* <Button
                  onClick={saveRuleSettings}
                  className="btn-flydubai-primary"
                  disabled={isLoading || saveStatus === "saving"}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveStatus === "saving" ? "Saving..." : "Save Rule Settings"}
                </Button> */}
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Operational Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Settings2 className="h-5 w-5" />
                  Operational Rules
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Define thresholds and limits for operational decisions.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {fieldConfigurations?.operationalRules?.map((fieldConfig) => (
                  <SettingField
                    key={fieldConfig.key}
                    config={fieldConfig}
                    value={ruleConfiguration.operationalRules[fieldConfig.key]}
                    onChange={(key, value) =>
                      handleRuleConfigChange("operationalRules", key, value)
                    }
                    onToggle={(key) =>
                      handleRuleToggle("operationalRules", key)
                    }
                  />
                ))}
              </CardContent>
            </Card>

            {/* Recovery Constraints */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Shield className="h-5 w-5" />
                  Recovery Constraints
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Set constraints and safety limits for recovery operations.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {fieldConfigurations?.recoveryConstraints?.map(
                  (fieldConfig) => (
                    <SettingField
                      key={fieldConfig.key}
                      config={fieldConfig}
                      value={
                        ruleConfiguration.recoveryConstraints[fieldConfig.key]
                      }
                      onChange={(key, value) =>
                        handleRuleConfigChange(
                          "recoveryConstraints",
                          key,
                          value,
                        )
                      }
                      onToggle={(key) =>
                        handleRuleToggle("recoveryConstraints", key)
                      }
                    />
                  ),
                )}
              </CardContent>
            </Card>

            {/* Automation Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Zap className="h-5 w-5" />
                  Automation Settings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure automation behavior and approval thresholds.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {fieldConfigurations?.automationSettings?.map((fieldConfig) => (
                  <SettingField
                    key={fieldConfig.key}
                    config={fieldConfig}
                    value={
                      ruleConfiguration.automationSettings[fieldConfig.key]
                    }
                    onChange={(key, value) =>
                      handleRuleConfigChange("automationSettings", key, value)
                    }
                    onToggle={(key) =>
                      handleRuleToggle("automationSettings", key)
                    }
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Custom Rules Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                    <GitBranch className="h-5 w-5" />
                    Custom Business Rules
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage custom operational rules with hard/soft
                    classification and override permissions.
                  </p>
                </div>
                <Button
                  onClick={() => setShowAddRuleForm(true)}
                  className="btn-flydubai-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add Rule Form */}
              {showAddRuleForm && (
                <Card className="mb-6 border-dashed border-2 border-gray-300">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      {editingRule ? "Edit Rule" : "Create New Rule"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rule-name">Rule Name</Label>
                        <Input
                          id="rule-name"
                          placeholder="e.g., Emergency Weather Protocol"
                          value={newRule.name}
                          onChange={(e) =>
                            setNewRule((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rule-category">Category</Label>
                        <Select
                          value={newRule.category}
                          onValueChange={(value) =>
                            setNewRule((prev) => ({ ...prev, category: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Operational">
                              Operational
                            </SelectItem>
                            <SelectItem value="Weather">Weather</SelectItem>
                            <SelectItem value="Passenger Service">
                              Passenger Service
                            </SelectItem>
                            <SelectItem value="Crew Management">
                              Crew Management
                            </SelectItem>
                            <SelectItem value="Financial">Financial</SelectItem>
                            <SelectItem value="Maintenance">
                              Maintenance
                            </SelectItem>
                            <SelectItem value="Safety">Safety</SelectItem>
                            <SelectItem value="Security">Security</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rule-type">Rule Type</Label>
                        <Select
                          value={newRule.type}
                          onValueChange={(value) =>
                            setNewRule((prev) => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hard">
                              Hard Rule (Must be followed)
                            </SelectItem>
                            <SelectItem value="Soft">
                              Soft Rule (Guideline)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rule-priority">Priority Level</Label>
                        <Select
                          value={newRule.priority.toString()}
                          onValueChange={(value) =>
                            setNewRule((prev) => ({
                              ...prev,
                              priority: parseInt(value),
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Critical</SelectItem>
                            <SelectItem value="2">2 - High</SelectItem>
                            <SelectItem value="3">3 - Medium</SelectItem>
                            <SelectItem value="4">4 - Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rule-description">Description</Label>
                      <Textarea
                        id="rule-description"
                        placeholder="Describe what this rule does and when it applies..."
                        value={newRule.description}
                        onChange={(e) =>
                          setNewRule((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rule-conditions">
                          Conditions (When)
                        </Label>
                        <Textarea
                          id="rule-conditions"
                          placeholder="e.g., Weather.Severity > High AND Delay > 180 minutes"
                          value={newRule.conditions}
                          onChange={(e) =>
                            setNewRule((prev) => ({
                              ...prev,
                              conditions: e.target.value,
                            }))
                          }
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rule-actions">Actions (Then)</Label>
                        <Textarea
                          id="rule-actions"
                          placeholder="e.g., Trigger HOTAC booking, Send passenger notifications"
                          value={newRule.actions}
                          onChange={(e) =>
                            setNewRule((prev) => ({
                              ...prev,
                              actions: e.target.value,
                            }))
                          }
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">
                          Allow Override
                        </Label>
                        <p className="text-xs text-gray-600">
                          Can this rule be overridden by operators with
                          appropriate permissions?
                        </p>
                      </div>
                      <Switch
                        checked={newRule.overridable}
                        onCheckedChange={(checked) =>
                          setNewRule((prev) => ({
                            ...prev,
                            overridable: checked,
                          }))
                        }
                        className="switch-flydubai"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddRuleForm(false);
                          setEditingRule(null);
                          setNewRule({
                            name: "",
                            description: "",
                            category: "Operational",
                            type: "Soft",
                            overridable: true,
                            priority: 3,
                            conditions: "",
                            actions: "",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={editingRule ? handleUpdateRule : handleAddRule}
                        disabled={
                          !newRule.name.trim() || !newRule.description.trim()
                        }
                        className="btn-flydubai-primary"
                      >
                        {editingRule ? "Update Rule" : "Create Rule"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rules Table */}
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Override</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customRules
                      .sort((a, b) => a.priority - b.priority)
                      .map((rule) => {
                        const CategoryIcon = getRuleCategoryIcon(rule.category);
                        return (
                          <TableRow key={rule.id} className="hover:bg-blue-50">
                            <TableCell>
                              <div className="flex items-start gap-3">
                                <CategoryIcon className="h-4 w-4 text-flydubai-blue mt-1 flex-shrink-0" />
                                <div>
                                  <div className="font-medium">{rule.name}</div>
                                  <div className="text-sm text-gray-600 max-w-md">
                                    {rule.description}
                                  </div>
                                  {rule.conditions && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      <strong>When:</strong> {rule.conditions}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {rule.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getRuleTypeColor(rule.type)}>
                                <div className="flex items-center gap-1">
                                  {rule.type === "Hard" ? (
                                    <Lock className="h-3 w-3" />
                                  ) : (
                                    <Unlock className="h-3 w-3" />
                                  )}
                                  {rule.type}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={
                                    rule.priority === 1
                                      ? "priority-critical"
                                      : rule.priority === 2
                                        ? "priority-high"
                                        : rule.priority === 3
                                          ? "priority-medium"
                                          : "priority-low"
                                  }
                                >
                                  P{rule.priority}
                                </Badge>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleMovePriority(rule.id, "up")
                                    }
                                    disabled={rule.priority === 1}
                                    className="h-6 w-6 p-0"
                                  >
                                    <ArrowUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleMovePriority(rule.id, "down")
                                    }
                                    className="h-6 w-6 p-0"
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {rule.overridable ? (
                                  <CheckSquare className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Square className="h-4 w-4 text-gray-400" />
                                )}
                                <span className="text-sm">
                                  {rule.overridable ? "Yes" : "No"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getRuleStatusColor(rule.status)}
                              >
                                {rule.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleToggleRuleStatus(rule.id)
                                  }
                                  className="h-8 w-8 p-0"
                                >
                                  {rule.status === "Active" ? (
                                    <Eye className="h-3 w-3" />
                                  ) : (
                                    <EyeOff className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditRule(rule)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteRule(rule.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>

                {customRules.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No custom rules configured</p>
                    <p className="text-sm">
                      Click "Add Rule" to create your first custom business rule
                    </p>
                  </div>
                )}
              </div>

              {/* Rule Statistics */}
              {customRules.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-flydubai-blue">
                      {customRules.filter((r) => r.status === "Active").length}
                    </div>
                    <div className="text-xs text-gray-600">Active Rules</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-red-600">
                      {customRules.filter((r) => r.type === "Hard").length}
                    </div>
                    <div className="text-xs text-gray-600">Hard Rules</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {customRules.filter((r) => r.type === "Soft").length}
                    </div>
                    <div className="text-xs text-gray-600">Soft Rules</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {customRules.filter((r) => r.overridable).length}
                    </div>
                    <div className="text-xs text-gray-600">Overridable</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button at Bottom */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={saveRuleSettings}
              className="btn-flydubai-primary"
              disabled={isLoading || saveStatus === "saving"}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveStatus === "saving" ? "Saving..." : "Save Rule Settings"}
            </Button>
          </div>
        </TabsContent>

        {/* Consolidated Recovery Options */}
        <TabsContent value="recovery-options" className="space-y-6">
          <Card className="border-flydubai-blue bg-blue-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-flydubai-blue">
                    <BarChart3 className="h-5 w-5" />
                    Recovery Operations Configuration
                  </CardTitle>
                  <p className="text-sm text-blue-700">
                    Configure weightage criteria for recovery options ranking,
                    aircraft selection, and crew assignment during disruptions.
                    These settings work together to optimize recovery
                    decision-making.
                  </p>
                </div>
                {/* <Button
                  onClick={saveRecoverySettings}
                  className="btn-flydubai-primary"
                  disabled={isLoading || saveStatus === "saving"}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveStatus === "saving" ? "Saving..." : "Save Recovery Settings"}
                </Button> */}
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recovery Options Ranking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <BarChart3 className="h-5 w-5" />
                  Recovery Options Ranking
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Adjust the importance of different factors when evaluating
                  recovery options.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(recoveryConfiguration.recoveryOptionsRanking)
                  .filter(([key]) => key !== "customParameters")
                  .map(([key, value]) => {
                    const Icon = getParameterIcon(key);
                    // Get label from API response data
                    const settingData =
                      rawTabSettings?.recoveryOptions?.recoveryOptionsRanking?.find(
                        (setting) => setting.key === key,
                      );
                    const label =
                      settingData?.label ||
                      key.charAt(0).toUpperCase() + key.slice(1);

                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-flydubai-blue" />
                            <Label className="text-sm font-medium">
                              {label}
                            </Label>
                          </div>
                          <Badge
                            className={`${getWeightColor(value)} bg-transparent border`}
                          >
                            {value}%
                          </Badge>
                        </div>
                        <Slider
                          value={
                            Array.isArray(value) ? value : [Number(value) || 0]
                          }
                          onValueChange={(newValue) =>
                            handleRecoveryConfigChange(
                              "recoveryOptionsRanking",
                              key,
                              newValue,
                            )
                          }
                          max={100}
                          min={0}
                          step={5}
                          className="w-full slider-flydubai"
                        />
                      </div>
                    );
                  })}

                {/* Custom Parameters */}
                {recoveryConfiguration.recoveryOptionsRanking.customParameters.map(
                  (param) => (
                    <div
                      key={param.id}
                      className="space-y-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-600" />
                          <Label className="text-sm font-medium">
                            {param.name}
                          </Label>
                          <Badge variant="outline" className="text-xs">
                            Custom
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${getWeightColor(param.weight)} bg-transparent border`}
                          >
                            {param.weight}%
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleRemoveCustomParameter(
                                param.id,
                                "recoveryOptionsRanking",
                              )
                            }
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {param.description}
                      </p>
                      <Slider
                        value={[param.weight]}
                        onValueChange={(newValue) =>
                          handleCustomParameterWeightChange(
                            "recoveryOptionsRanking",
                            param.id,
                            newValue[0]
                          )
                        }
                        max={100}
                        min={0}
                        step={5}
                        className="w-full slider-flydubai"
                      />
                    </div>
                  ),
                )}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-flydubai-navy">
                      Total Weight:
                    </span>
                    <Badge
                      className={
                        calculateTotalWeight(null, "recoveryOptionsRanking") ===
                        100
                          ? "bg-green-100 text-green-800"
                          : calculateTotalWeight(
                                null,
                                "recoveryOptionsRanking",
                              ) > 100
                            ? "bg-red-100 text-red-800"
                            : "bg-orange-100 text-orange-800"
                      }
                    >
                      {calculateTotalWeight(null, "recoveryOptionsRanking")}% /
                      100%
                    </Badge>
                  </div>
                  {calculateTotalWeight(null, "recoveryOptionsRanking") >
                    100 && (
                    <p className="text-xs text-red-600 mt-1">
                      ❌ Total weight exceeds 100%. Please reduce some values.
                    </p>
                  )}
                  {calculateTotalWeight(null, "recoveryOptionsRanking") < 100 &&
                    calculateTotalWeight(null, "recoveryOptionsRanking") !==
                      100 && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Recommended total: 100%. Current deviation may affect
                        prioritization accuracy.
                      </p>
                    )}
                  {calculateTotalWeight(null, "recoveryOptionsRanking") ===
                    100 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Perfect weight distribution.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Aircraft Selection Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Plane className="h-5 w-5" />
                  Aircraft Selection Criteria
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Adjust the importance of different factors when selecting
                  aircraft for recovery.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(recoveryConfiguration.aircraftSelectionCriteria)
                  .filter(([key]) => key !== "customParameters")
                  .map(([key, value]) => {
                    const Icon = getParameterIcon(key);
                    // Get label from API response data
                    const settingData =
                      rawTabSettings?.recoveryOptions?.aircraftSelectionCriteria?.find(
                        (setting) => setting.key === key,
                      );
                    const label =
                      settingData?.label ||
                      key.charAt(0).toUpperCase() + key.slice(1);

                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-flydubai-blue" />
                            <Label className="text-sm font-medium">
                              {label}
                            </Label>
                          </div>
                          <Badge
                            className={`${getWeightColor(value)} bg-transparent border`}
                          >
                            {value}%
                          </Badge>
                        </div>
                        <Slider
                          value={
                            Array.isArray(value) ? value : [Number(value) || 0]
                          }
                          onValueChange={(newValue) =>
                            handleRecoveryConfigChange(
                              "aircraftSelectionCriteria",
                              key,
                              newValue,
                            )
                          }
                          max={100}
                          min={0}
                          step={5}
                          className="w-full slider-flydubai"
                        />
                      </div>
                    );
                  })}

                {/* Custom Parameters */}
                {recoveryConfiguration.aircraftSelectionCriteria.customParameters.map(
                  (param) => (
                    <div
                      key={param.id}
                      className="space-y-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-600" />
                          <Label className="text-sm font-medium">
                            {param.name}
                          </Label>
                          <Badge variant="outline" className="text-xs">
                            Custom
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${getWeightColor(param.weight)} bg-transparent border`}
                          >
                            {param.weight}%
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleRemoveCustomParameter(
                                param.id,
                                "aircraftSelectionCriteria",
                              )
                            }
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {param.description}
                      </p>
                      <Slider
                        value={[param.weight]}
                        onValueChange={(newValue) =>
                          handleCustomParameterWeightChange(
                            "aircraftSelectionCriteria",
                            param.id,
                            newValue[0]
                          )
                        }
                        max={100}
                        min={0}
                        step={5}
                        className="w-full slider-flydubai"
                      />
                    </div>
                  ),
                )}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-flydubai-navy">
                      Total Weight:
                    </span>
                    <Badge
                      className={
                        calculateTotalWeight(
                          null,
                          "aircraftSelectionCriteria",
                        ) === 100
                          ? "bg-green-100 text-green-800"
                          : calculateTotalWeight(
                                null,
                                "aircraftSelectionCriteria",
                              ) > 100
                            ? "bg-red-100 text-red-800"
                            : "bg-orange-100 text-orange-800"
                      }
                    >
                      {calculateTotalWeight(null, "aircraftSelectionCriteria")}%
                      / 100%
                    </Badge>
                  </div>
                  {calculateTotalWeight(null, "aircraftSelectionCriteria") >
                    100 && (
                    <p className="text-xs text-red-600 mt-1">
                      ❌ Total weight exceeds 100%. Please reduce some values.
                    </p>
                  )}
                  {calculateTotalWeight(null, "aircraftSelectionCriteria") <
                    100 &&
                    calculateTotalWeight(null, "aircraftSelectionCriteria") !==
                      100 && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Recommended total: 100%. Current deviation may affect
                        prioritization accuracy.
                      </p>
                    )}
                  {calculateTotalWeight(null, "aircraftSelectionCriteria") ===
                    100 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Perfect weight distribution.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Crew Assignment Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Users2 className="h-5 w-5" />
                  Crew Assignment Criteria
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Adjust the importance of different factors when assigning crew
                  for recovery flights.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(recoveryConfiguration.crewAssignmentCriteria)
                  .filter(([key]) => key !== "customParameters")
                  .map(([key, value]) => {
                    const Icon = getParameterIcon(key);
                    // Get label from API response data
                    const settingData =
                      rawTabSettings?.recoveryOptions?.crewAssignmentCriteria?.find(
                        (setting) => setting.key === key,
                      );
                    const label =
                      settingData?.label ||
                      key.charAt(0).toUpperCase() + key.slice(1);

                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-flydubai-blue" />
                            <Label className="text-sm font-medium">
                              {label}
                            </Label>
                          </div>
                          <Badge
                            className={`${getWeightColor(value)} bg-transparent border`}
                          >
                            {value}%
                          </Badge>
                        </div>
                        <Slider
                          value={
                            Array.isArray(value) ? value : [Number(value) || 0]
                          }
                          onValueChange={(newValue) =>
                            handleRecoveryConfigChange(
                              "crewAssignmentCriteria",
                              key,
                              newValue,
                            )
                          }
                          max={100}
                          min={0}
                          step={5}
                          className="w-full slider-flydubai"
                        />
                      </div>
                    );
                  })}

                {/* Custom Parameters */}
                {recoveryConfiguration.crewAssignmentCriteria.customParameters.map(
                  (param) => (
                    <div
                      key={param.id}
                      className="space-y-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-600" />
                          <Label className="text-sm font-medium">
                            {param.name}
                          </Label>
                          <Badge variant="outline" className="text-xs">
                            Custom
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${getWeightColor(param.weight)} bg-transparent border`}
                          >
                            {param.weight}%
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleRemoveCustomParameter(
                                param.id,
                                "crewAssignmentCriteria",
                              )
                            }
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {param.description}
                      </p>
                      <Slider
                        value={[param.weight]}
                        onValueChange={(newValue) =>
                          handleCustomParameterWeightChange(
                            "crewAssignmentCriteria",
                            param.id,
                            newValue[0]
                          )
                        }
                        max={100}
                        min={0}
                        step={5}
                        className="w-full slider-flydubai"
                      />
                    </div>
                  ),
                )}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-flydubai-navy">
                      Total Weight:
                    </span>
                    <Badge
                      className={
                        calculateTotalWeight(null, "crewAssignmentCriteria") ===
                        100
                          ? "bg-green-100 text-green-800"
                          : calculateTotalWeight(
                                null,
                                "crewAssignmentCriteria",
                              ) > 100
                            ? "bg-red-100 text-red-800"
                            : "bg-orange-100 text-orange-800"
                      }
                    >
                      {calculateTotalWeight(null, "crewAssignmentCriteria")}% /
                      100%
                    </Badge>
                  </div>
                  {calculateTotalWeight(null, "crewAssignmentCriteria") >
                    100 && (
                    <p className="text-xs text-red-600 mt-1">
                      ❌ Total weight exceeds 100%. Please reduce some values.
                    </p>
                  )}
                  {calculateTotalWeight(null, "crewAssignmentCriteria") < 100 &&
                    calculateTotalWeight(null, "crewAssignmentCriteria") !==
                      100 && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ Recommended total: 100%. Current deviation may affect
                        prioritization accuracy.
                      </p>
                    )}
                  {calculateTotalWeight(null, "crewAssignmentCriteria") ===
                    100 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Perfect weight distribution.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Custom Parameter Section */}
          <Card className="border-dashed border-2 border-gray-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Plus className="h-5 w-5" />
                Add Custom Parameter
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create custom parameters for recovery options, aircraft
                selection, or crew assignment.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="param-name">Parameter Name</Label>
                  <Input
                    id="param-name"
                    placeholder="e.g., 'Weather Risk Factor'"
                    value={newParameter.name}
                    onChange={(e) =>
                      setNewParameter((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="param-category">Category</Label>
                  <Select
                    value={newParameter.category}
                    onValueChange={(value) =>
                      setNewParameter((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recoveryOptionsRanking">
                        Recovery Options Ranking
                      </SelectItem>
                      <SelectItem value="aircraftSelectionCriteria">
                        Aircraft Selection Criteria
                      </SelectItem>
                      <SelectItem value="crewAssignmentCriteria">
                        Crew Assignment Criteria
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="param-weight">Weight</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[newParameter.weight]}
                      onValueChange={(value) =>
                        setNewParameter((prev) => ({
                          ...prev,
                          weight: value[0],
                        }))
                      }
                      max={50}
                      min={0}
                      step={5}
                      className="flex-1"
                    />
                    <Badge className="bg-gray-100 text-gray-800 min-w-[50px]">
                      {newParameter.weight}%
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="param-description">Description</Label>
                  <Textarea
                    id="param-description"
                    placeholder="Describe how this parameter affects the selection process..."
                    value={newParameter.description}
                    onChange={(e) =>
                      setNewParameter((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleAddCustomParameter}
                  disabled={!newParameter.name.trim()}
                  className="btn-flydubai-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Parameter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recovery Configuration Summary */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <TrendingUp className="h-5 w-5" />
                Recovery Configuration Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-green-800 mb-3">
                    Recovery Options Priority
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cost Impact:</span>
                      <span className="font-medium">
                        {
                          recoveryConfiguration.recoveryOptionsRanking
                            .costWeight
                        }
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time to Resolution:</span>
                      <span className="font-medium">
                        {
                          recoveryConfiguration.recoveryOptionsRanking
                            .timeWeight
                        }
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passenger Impact:</span>
                      <span className="font-medium">
                        {
                          recoveryConfiguration.recoveryOptionsRanking
                            .passengerImpactWeight
                        }
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-green-800 mb-3">
                    Aircraft Selection Priority
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Maintenance Status:</span>
                      <span className="font-medium">
                        {
                          recoveryConfiguration.aircraftSelectionCriteria
                            .maintenanceStatus
                        }
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fuel Efficiency:</span>
                      <span className="font-medium">
                        {
                          recoveryConfiguration.aircraftSelectionCriteria
                            .fuelEfficiency
                        }
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Route Suitability:</span>
                      <span className="font-medium">
                        {
                          recoveryConfiguration.aircraftSelectionCriteria
                            .routeSuitability
                        }
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-green-800 mb-3">
                    Crew Assignment Priority
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Duty Time Remaining:</span>
                      <span className="font-medium">
                        {
                          recoveryConfiguration.crewAssignmentCriteria
                            .dutyTimeRemaining
                        }
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Qualifications:</span>
                      <span className="font-medium">
                        {
                          recoveryConfiguration.crewAssignmentCriteria
                            .qualifications
                        }
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Location:</span>
                      <span className="font-medium">
                        {
                          recoveryConfiguration.crewAssignmentCriteria
                            .baseLocation
                        }
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button at Bottom */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={saveRecoverySettings}
              className="btn-flydubai-primary"
              disabled={isLoading || saveStatus === "saving"}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveStatus === "saving" ? "Saving..." : "Save Recovery Settings"}
            </Button>
          </div>
        </TabsContent>

        {/* Natural Language Processing */}
        <TabsContent value="nlp" className="space-y-6">
          {/* Overview Card */}
          <Card className="border-flydubai-blue bg-blue-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-flydubai-blue">
                    <Brain className="h-5 w-5" />
                    Natural Language & Knowledge Repository
                  </CardTitle>
                  <p className="text-sm text-blue-700 mt-1">
                    Manage natural language processing and manage the native knowledge networks that enhance recovery algorithms. Upload documents and add contextual information during recovery options generation.
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NLP Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <Settings className="h-5 w-5" />
                  Natural Language Processing
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure natural language recognition and transcription settings.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">Enable NLP</div>
                  </div>
                  <Switch
                    checked={nlpSettings.enabled || false}
                    onCheckedChange={() => handleNlpToggle("enabled")}
                    className={
                      nlpSettings.enabled
                        ? "data-[state=checked]:bg-flydubai-blue"
                        : ""
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Primary Language</Label>
                  <Select
                    value={nlpSettings.language || "english"}
                    onValueChange={(value) => handleNlpChange("language", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="arabic">Arabic</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="urdu">Urdu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Confidence Threshold</Label>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {nlpSettings.confidence || 85}%
                    </Badge>
                  </div>
                  <Slider
                    value={[nlpSettings.confidence || 85]}
                    onValueChange={(value) => handleNlpChange("confidence", value[0])}
                    max={100}
                    min={50}
                    step={5}
                    className="w-full slider-flydubai"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">Auto-Apply Recommendations</div>
                  </div>
                  <Switch
                    checked={nlpSettings.autoApply || false}
                    onCheckedChange={() => handleNlpToggle("autoApply")}
                    className={
                      nlpSettings.autoApply
                        ? "data-[state=checked]:bg-flydubai-blue"
                        : ""
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Repository Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                  <BarChart3 className="h-5 w-5" />
                  Repository Status
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Overview of knowledge repository status and processing statistics.
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-blue-900">
                      Document Processing
                    </span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Live Updated
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-900">
                        {uploadedDocuments.length}
                      </div>
                      <div className="text-xs text-blue-700">Total Documents</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {uploadedDocuments.filter(doc => doc.type === 'application/pdf').length}
                      </div>
                      <div className="text-xs text-blue-700">PDF Files</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Repository */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                    <FileText className="h-5 w-5" />
                    Document Repository
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload and manage operational documentation for recovery algorithm.
                  </p>
                </div>
                <Button
                  className="btn-flydubai-primary"
                  onClick={() => document.getElementById('document-upload')?.click()}
                >
                  Upload Documents
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center bg-blue-50">
                <input
                  id="document-upload"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <FileText className="h-12 w-12 mx-auto text-blue-400 mb-4" />
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Upload Operational Documents
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Drag and drop files here, or click to browse. Only PDF and DOC files under 3MB are allowed.
                </p>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('document-upload')?.click()}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Choose Files
                </Button>
              </div>

              {/* Upload Progress */}
              {uploadProgress.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Upload Progress:</h4>
                  {uploadProgress.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{file.name}</div>
                        {file.status === 'error' && (
                          <div className="text-xs text-red-600">{file.error}</div>
                        )}
                      </div>
                      <div className="w-24">
                        {file.status === 'uploading' && (
                          <Progress value={file.progress} className="h-2" />
                        )}
                        {file.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {file.status === 'error' && (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Uploaded Documents List */}
              {uploadedDocuments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Uploaded Documents:</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {uploadedDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-medium text-sm">{doc.name}</div>
                            <div className="text-xs text-gray-500">
                              {(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {doc.type === 'application/pdf' ? 'PDF' : 'DOC'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDocument(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Knowledge Entry */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                    <Edit className="h-5 w-5" />
                    Manual Knowledge Entry
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Add manual natural knowledge entries for enhancing recovery recommendations and disruption.
                  </p>
                </div>
                <Button
                  className="btn-flydubai-primary"
                  onClick={() => setShowAddEntryForm(true)}
                >
                  Add Manual Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Entry Form */}
              {showAddEntryForm && (
                <Card className="mb-6 border-dashed border-2 border-gray-300">
                  <CardHeader>
                    <CardTitle className="text-sm">Create New Knowledge Entry</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          placeholder="Add manual knowledge entry title"
                          value={newManualEntry.title}
                          onChange={(e) => setNewManualEntry(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={newManualEntry.category}
                          onValueChange={(value) => setNewManualEntry(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="operations">Operations</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="crew">Crew</SelectItem>
                            <SelectItem value="weather">Weather</SelectItem>
                            <SelectItem value="passenger">Passenger Services</SelectItem>
                            <SelectItem value="security">Security</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Source</Label>
                      <Textarea
                        placeholder="Provide the specific guidelines, or list criteria that should be considered during recovery operations."
                        value={newManualEntry.source}
                        onChange={(e) => setNewManualEntry(prev => ({ ...prev, source: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <Input
                        placeholder="Add tags like: ATC, VIP, Emergency Weather..."
                        value={newManualEntry.tags}
                        onChange={(e) => setNewManualEntry(prev => ({ ...prev, tags: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddEntryForm(false);
                          setNewManualEntry({
                            title: '',
                            category: 'operations',
                            source: '',
                            tags: ''
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="btn-flydubai-primary"
                        onClick={handleAddManualEntry}
                        disabled={!newManualEntry.title.trim() || !newManualEntry.source.trim()}
                      >
                        Save Entry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Manual Entries List */}
              {manualEntries.length > 0 && (
                <div className="space-y-3">
                  {manualEntries.map((entry) => {
                    // Get category icon and color
                    const getCategoryIcon = (category: string) => {
                      switch (category.toLowerCase()) {
                        case 'passenger service':
                          return { icon: User, color: 'bg-purple-100 text-purple-600', badgeColor: 'bg-purple-100 text-purple-700' };
                        case 'emergency':
                          return { icon: AlertTriangle, color: 'bg-green-100 text-green-600', badgeColor: 'bg-green-100 text-green-700' };
                        case 'operations':
                          return { icon: Settings, color: 'bg-blue-100 text-blue-600', badgeColor: 'bg-blue-100 text-blue-700' };
                        default:
                          return { icon: FileText, color: 'bg-gray-100 text-gray-600', badgeColor: 'bg-gray-100 text-gray-700' };
                      }
                    };

                    const { icon: CategoryIcon, color: iconColor, badgeColor } = getCategoryIcon(entry.category);

                    return (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        {/* Category Icon */}
                        <div className={`p-2 rounded-lg ${iconColor} flex-shrink-0`}>
                          <CategoryIcon className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 text-sm leading-5 mb-1">
                                {entry.title}
                              </h5>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-gray-600">
                                  {entry.category}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-gray-500">
                                  {entry.source || 'No source specified'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                Created: {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'Unknown'} • By: {entry.createdBy || 'Unknown'}
                              </div>
                            </div>

                            {/* Source Badge */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant="outline" className={`text-xs px-2 py-1 ${badgeColor} border-0`}>
                                Passage Source
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteManualEntry(entry.id)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {manualEntries.length === 0 && !showAddEntryForm && (
                <div className="text-center py-8 text-gray-500">
                  <Edit className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No manual knowledge entries added yet</p>
                  <p className="text-sm">
                    Click "Add Manual Entry" to create your first knowledge entry
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* NLP Natural Language Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-flydubai-navy">
                <MessageSquare className="h-5 w-5" />
                NLP Natural Language Input
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Test natural language inputs for preprocessing using the native knowledge networks.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Sample Natural Language Inputs</h4>

                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Customer complaints who need special connectivity with rebooking flights:</strong>
                    • Book on next available options with forming cross-booking
                    • Check on any allowable options
                    • Weather is to passenger not affected service options
                    • Special in flight cancellation make to better before departure
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Test Input</Label>
                  <Textarea
                    placeholder="Test a customer strange input for performance using the customers knowledge networks."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expected Output</Label>
                  <Textarea
                    placeholder="Tell us what information the customer should get informed and their availability during flight disruptions."
                    className="min-h-[100px]"
                    readOnly
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button className="btn-flydubai-primary">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test Natural Language
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={saveNlpSettings}
              className="btn-flydubai-primary"
              disabled={isLoading || saveStatus === "saving"}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveStatus === "saving" ? "Saving..." : "Save NLP Settings"}
            </Button>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-flydubai-blue" />
                    Notification Preferences
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure how and when you receive notifications from AERON.
                  </p>
                </div>
                {/* <Button
                  onClick={saveNotificationSettings}
                  className="btn-flydubai-primary"
                  disabled={isLoading || saveStatus === "saving"}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveStatus === "saving"
                    ? "Saving..."
                    : "Save Notification Settings"}
                </Button> */}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-flydubai-navy">
                  Notification Channels
                </h3>

                {Object.entries({
                  email: "Email Notifications",
                  sms: "SMS Alerts",
                  push: "Push Notifications",
                  desktop: "Desktop Notifications",
                }).map(([key, label]) => {
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <Label className="text-sm font-medium">{label}</Label>
                      <Switch
                        // Cast notificationSettings to any for quick fix
                        checked={(notificationSettings as any)[key]}
                        onCheckedChange={() =>
                          handleNotificationToggle(key as NotificationKey)
                        }
                        className="switch-flydubai"
                      />
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-flydubai-navy">
                  Notification Types
                </h3>

                {Object.entries({
                  recoveryAlerts: "Recovery Plan Alerts",
                  passengerUpdates: "Passenger Service Updates",
                  systemAlerts: "System Status Alerts",
                }).map(([key, label]) => {
                  const typedKey = key as keyof typeof notificationSettings;
                  return (
                    <div
                      key={typedKey}
                      className="flex items-center justify-between"
                    >
                      <Label className="text-sm font-medium">{label}</Label>
                      <Switch
                        checked={notificationSettings[typedKey]}
                        onCheckedChange={() =>
                          handleNotificationToggle(typedKey)
                        }
                        className="switch-flydubai"
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Save Button at Bottom */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={saveNotificationSettings}
              className="btn-flydubai-primary"
              disabled={isLoading || saveStatus === "saving"}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveStatus === "saving"
                ? "Saving..."
                : "Save Notification Settings"}
            </Button>
          </div>
        </TabsContent>

        {/* System Settings Tab - Re-added with correct rendering */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-flydubai-blue" />
                System Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                General system settings and preferences.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-flydubai-navy">
                    Regional Settings
                  </h3>

                  <div>
                    <Label className="text-sm font-medium">Time Zone</Label>
                    <Select defaultValue="indian-standard">
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indian-standard">
                          Indian Standard Time (IST)
                        </SelectItem>
                        <SelectItem value="gulf-standard">
                          Gulf Standard Time (GST)
                        </SelectItem>
                        <SelectItem value="utc">
                          Coordinated Universal Time (UTC)
                        </SelectItem>
                        <SelectItem value="local">Local System Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">
                      Currency Display
                    </Label>
                    <Select defaultValue="aed">
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aed">AED (Dirham)</SelectItem>
                        <SelectItem value="usd">USD (US Dollar)</SelectItem>
                        <SelectItem value="eur">EUR (Euro)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-flydubai-navy">
                    Performance Settings
                  </h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">
                        High Performance Mode
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Enhanced processing for critical operations
                      </p>
                    </div>
                    <Switch checked={false} className="switch-flydubai" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">
                        Auto-Save Settings
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically save configuration changes
                      </p>
                    </div>
                    <Switch checked={true} className="switch-flydubai" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}