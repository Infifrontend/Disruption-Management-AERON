'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { Avatar, AvatarContent, AvatarFallback } from './ui/avatar'
import { 
  Bot, 
  Send, 
  User, 
  Lightbulb, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Plane,
  Settings,
  Zap,
  Copy,
  Trash2,
  Edit,
  Plus,
  MessageSquare,
  Sparkles,
  Code,
  FileText,
  Target
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
  ruleData?: any
}

interface RuleTemplate {
  id: string
  name: string
  category: string
  description: string
  template: any
}

const ruleTemplates: RuleTemplate[] = [
  {
    id: 'weather-delay',
    name: 'Weather Delay Recovery',
    category: 'Recovery',
    description: 'Automatic recovery rules for weather-related disruptions',
    template: {
      trigger: 'weather_disruption',
      conditions: ['delay > 60 minutes', 'visibility < 1 mile'],
      actions: ['generate_recovery_options', 'notify_passengers', 'update_eta'],
      priority: 'high'
    }
  },
  {
    id: 'crew-timeout',
    name: 'Crew Duty Time Limits',
    category: 'Compliance',
    description: 'Enforce regulatory crew duty time restrictions',
    template: {
      trigger: 'crew_duty_check',
      conditions: ['duty_time >= 8_hours', 'flight_time >= 4_hours'],
      actions: ['require_crew_change', 'notify_crew_scheduler'],
      priority: 'critical'
    }
  },
  {
    id: 'passenger-compensation',
    name: 'Automatic Compensation',
    category: 'Passenger Service',
    description: 'Auto-issue compensation based on delay duration',
    template: {
      trigger: 'flight_delay',
      conditions: ['delay > 3_hours', 'cause = airline_fault'],
      actions: ['issue_voucher', 'offer_rebooking', 'send_apology_email'],
      priority: 'medium'
    }
  },
  {
    id: 'aircraft-maintenance',
    name: 'Maintenance Priority Rules',
    category: 'Operations',
    description: 'Prioritize aircraft for maintenance scheduling',
    template: {
      trigger: 'maintenance_due',
      conditions: ['hours_since_check > 100', 'next_flight_distance > 1000'],
      actions: ['schedule_maintenance', 'find_replacement_aircraft'],
      priority: 'high'
    }
  }
]

const quickSuggestions = [
  "Create a weather disruption rule",
  "Set up passenger compensation automation",
  "Define crew duty time limits",
  "Create aircraft maintenance rules",
  "Set recovery time thresholds",
  "Configure cost optimization rules"
]

export function RulesAssistantChatbot({ onRuleCreated }: { onRuleCreated?: (rule: any) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm AERON's Rules Assistant. I can help you create operational rules, recovery policies, and automation parameters for your airline operations. What type of rule would you like to create today?",
      timestamp: new Date(),
      suggestions: quickSuggestions
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<RuleTemplate | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const generateResponse = async (userMessage: string): Promise<Message> => {
    // Simulate AI processing delay
    setIsTyping(true)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    setIsTyping(false)

    const lowercaseMessage = userMessage.toLowerCase()
    
    // Rule creation logic based on user input
    if (lowercaseMessage.includes('weather') || lowercaseMessage.includes('storm') || lowercaseMessage.includes('delay')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "I'll help you create a weather disruption rule. This rule will automatically trigger recovery options when weather conditions affect flights. Here's a suggested configuration:",
        timestamp: new Date(),
        ruleData: {
          name: "Weather Disruption Recovery",
          type: "automatic_recovery",
          trigger: "weather_alert",
          conditions: [
            "visibility < 1 mile",
            "wind_speed > 35 knots",
            "thunderstorm_active = true"
          ],
          actions: [
            "generate_recovery_options",
            "notify_operations_center", 
            "update_passenger_notifications",
            "calculate_cost_impact"
          ],
          priority: "high",
          timeout: "30 minutes"
        },
        suggestions: [
          "Modify the weather conditions",
          "Add more recovery actions",
          "Set different priority level",
          "Create another rule type"
        ]
      }
    }

    if (lowercaseMessage.includes('crew') || lowercaseMessage.includes('duty') || lowercaseMessage.includes('pilot')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Perfect! Let's create a crew duty time rule to ensure compliance with aviation regulations. This rule will monitor crew duty times and trigger actions when limits are approached:",
        timestamp: new Date(),
        ruleData: {
          name: "Crew Duty Time Compliance",
          type: "compliance_check",
          trigger: "crew_duty_monitor",
          conditions: [
            "duty_time >= 8 hours",
            "flight_time >= 4 hours",
            "rest_time < 10 hours"
          ],
          actions: [
            "alert_crew_scheduler",
            "find_replacement_crew",
            "delay_flight_if_necessary",
            "log_compliance_event"
          ],
          priority: "critical",
          autoExecute: true
        },
        suggestions: [
          "Adjust duty time limits",
          "Add fatigue risk assessment",
          "Configure crew notifications",
          "Set up backup crew rules"
        ]
      }
    }

    if (lowercaseMessage.includes('passenger') || lowercaseMessage.includes('compensation') || lowercaseMessage.includes('refund')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Great choice! I'll help you set up automatic passenger compensation rules. This will ensure passengers receive appropriate compensation based on delay duration and circumstances:",
        timestamp: new Date(),
        ruleData: {
          name: "Passenger Compensation Automation",
          type: "passenger_service",
          trigger: "flight_delay_confirmed",
          conditions: [
            "delay_duration > 2 hours",
            "cause != weather_external",
            "passenger_checked_in = true"
          ],
          actions: [
            "calculate_compensation_amount",
            "issue_travel_voucher",
            "send_apology_communication",
            "offer_rebooking_options",
            "update_passenger_profile"
          ],
          priority: "medium",
          compensation_tiers: {
            "2-4 hours": "$200 voucher",
            "4-6 hours": "$400 voucher + meal",
            "6+ hours": "$600 voucher + hotel"
          }
        },
        suggestions: [
          "Modify compensation amounts",
          "Add special passenger categories",
          "Configure communication templates",
          "Set up escalation rules"
        ]
      }
    }

    if (lowercaseMessage.includes('maintenance') || lowercaseMessage.includes('aircraft') || lowercaseMessage.includes('technical')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Excellent! Let's create an aircraft maintenance priority rule. This will help optimize maintenance scheduling and minimize operational disruptions:",
        timestamp: new Date(),
        ruleData: {
          name: "Aircraft Maintenance Prioritization",
          type: "operational_planning",
          trigger: "maintenance_scheduler",
          conditions: [
            "hours_since_check > 95",
            "cycles_remaining < 10",
            "upcoming_long_haul = true"
          ],
          actions: [
            "prioritize_maintenance_slot",
            "identify_replacement_aircraft",
            "notify_maintenance_team",
            "update_flight_schedule",
            "calculate_disruption_cost"
          ],
          priority: "high",
          lead_time: "72 hours"
        },
        suggestions: [
          "Adjust maintenance thresholds",
          "Add aircraft type preferences",
          "Configure maintenance windows",
          "Set up cost optimization"
        ]
      }
    }

    if (lowercaseMessage.includes('cost') || lowercaseMessage.includes('budget') || lowercaseMessage.includes('optimization')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Smart thinking! Let's create cost optimization rules that will help AERON make financially efficient recovery decisions while maintaining service quality:",
        timestamp: new Date(),
        ruleData: {
          name: "Cost-Optimized Recovery",
          type: "cost_optimization",
          trigger: "recovery_planning",
          conditions: [
            "available_options > 1",
            "cost_difference > $5000",
            "passenger_impact_score < 0.8"
          ],
          actions: [
            "rank_by_cost_efficiency",
            "calculate_passenger_satisfaction",
            "check_budget_constraints",
            "recommend_optimal_solution",
            "log_cost_analysis"
          ],
          priority: "medium",
          optimization_weights: {
            "cost": 0.4,
            "time": 0.3,
            "passenger_satisfaction": 0.3
          }
        },
        suggestions: [
          "Adjust optimization weights",
          "Set cost thresholds",
          "Add revenue protection rules",
          "Configure budget alerts"
        ]
      }
    }

    // Default helpful response
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: "I can help you create various types of operational rules for AERON. Here are some common rule categories I specialize in:\n\n• **Recovery Rules** - Automatic responses to disruptions\n• **Compliance Rules** - Regulatory and safety requirements\n• **Passenger Service Rules** - Compensation and rebooking automation\n• **Cost Optimization Rules** - Financial efficiency guidelines\n• **Maintenance Rules** - Aircraft scheduling and priorities\n\nWhat specific operational challenge would you like to address with a new rule?",
      timestamp: new Date(),
      suggestions: [
        "Weather disruption recovery",
        "Crew duty time limits", 
        "Passenger compensation",
        "Cost optimization",
        "Maintenance scheduling",
        "Show me rule templates"
      ]
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    const assistantResponse = await generateResponse(inputValue)
    setMessages(prev => [...prev, assistantResponse])
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    inputRef.current?.focus()
  }

  const handleCreateRule = (ruleData: any) => {
    const newRule = {
      id: `rule_${Date.now()}`,
      ...ruleData,
      created_at: new Date(),
      created_by: 'rules_assistant',
      status: 'draft'
    }

    if (onRuleCreated) {
      onRuleCreated(newRule)
    }

    const confirmationMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `Perfect! I've created the rule "${ruleData.name}" for you. The rule has been saved as a draft and you can review or modify it in your rules configuration. Would you like to create another rule or need help with anything else?`,
      timestamp: new Date(),
      suggestions: [
        "Create another rule",
        "Modify this rule",
        "Show all my rules",
        "Export rule configuration"
      ]
    }

    setMessages(prev => [...prev, confirmationMessage])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-lg">AERON Rules Assistant</h3>
            <p className="text-sm text-muted-foreground font-normal">AI-powered rule creation and optimization</p>
          </div>
          <Badge className="ml-auto bg-green-100 text-green-700 border-green-200">
            <Sparkles className="h-3 w-3 mr-1" />
            Online
          </Badge>
        </CardTitle>
      </CardHeader>

      <Separator />

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className={message.type === 'user' ? 'bg-blue-100' : 'bg-purple-100'}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Bot className="h-4 w-4 text-purple-600" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white ml-auto inline-block' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {/* Rule Data Display */}
                  {message.ruleData && (
                    <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-blue-900 flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          {message.ruleData.name}
                        </h4>
                        <Badge className="bg-blue-100 text-blue-700">
                          {message.ruleData.type}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Trigger:</p>
                          <p className="text-gray-600 font-mono text-xs bg-white p-2 rounded border">
                            {message.ruleData.trigger}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Priority:</p>
                          <Badge className={
                            message.ruleData.priority === 'critical' ? 'bg-red-100 text-red-700' :
                            message.ruleData.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }>
                            {message.ruleData.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="font-medium text-gray-700 mb-2">Conditions:</p>
                        <ul className="text-xs space-y-1">
                          {message.ruleData.conditions?.map((condition: string, index: number) => (
                            <li key={index} className="bg-white p-2 rounded border font-mono text-gray-600">
                              {condition}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-3">
                        <p className="font-medium text-gray-700 mb-2">Actions:</p>
                        <ul className="text-xs space-y-1">
                          {message.ruleData.actions?.map((action: string, index: number) => (
                            <li key={index} className="bg-white p-2 rounded border font-mono text-gray-600 flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleCreateRule(message.ruleData)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Create Rule
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(JSON.stringify(message.ruleData, null, 2))}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Config
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-purple-100">
                    <Bot className="h-4 w-4 text-purple-600" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Input Area */}
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the operational rule you need help creating..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Press Enter to send • Shift+Enter for new line</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                AI-powered by AERON
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Airline operations specialized
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}