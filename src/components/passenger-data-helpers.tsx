// Helper functions for generating affected passenger data

export const requiresPassengerReaccommodation = (option) => {
  // Define option IDs that require passenger reaccommodation
  const reaccommodationOptions = [
    'CANCEL_REBOOK',
    'DELAY_4H_OVERNIGHT', 
    'OVERNIGHT_DELAY',
    'CANCEL_AND_REBOOK',
    'ROUTE_DIVERSION'
  ]

  // Ensure option.id is a string before using includes
  const optionId = String(option.id || '')
  return reaccommodationOptions.some(id => optionId.includes(id))
}

// PNR group templates for realistic passenger data
export const getPNRGroupTemplates = () => [
  // VIP Family - Al-Rashid Family (4 passengers)
  {
    pnr: 'FZ8M5K',
    baseContactName: 'Al-Rashid',
    baseContactEmail: 'omar.alrashid@emirates.ae',
    baseContactPhone: '+971 50 123 4567',
    priority: 'VIP',
    groupType: 'family',
    passengers: [
      {
        name: 'Omar Al-Rashid', 
        relationship: 'father',
        age: 45,
        specialRequirements: null,
        loyaltyTier: 'Platinum',
        seatPreference: 'Window',
        mealPreference: 'Halal'
      },
      {
        name: 'Layla Al-Rashid', 
        relationship: 'mother',
        age: 42,
        specialRequirements: null,
        loyaltyTier: 'Platinum',
        seatPreference: 'Aisle',
        mealPreference: 'Halal'
      },
      {
        name: 'Zaid Al-Rashid', 
        relationship: 'son',
        age: 16,
        specialRequirements: 'Minor',
        loyaltyTier: null,
        seatPreference: 'Window',
        mealPreference: 'Child Meal'
      },
      {
        name: 'Noor Al-Rashid', 
        relationship: 'daughter',
        age: 12,
        specialRequirements: 'Minor',
        loyaltyTier: null,
        seatPreference: 'Any',
        mealPreference: 'Child Meal'
      }
    ]
  },
  // Business Group - Dubai Construction Corp (3 passengers)
  {
    pnr: 'FZ9B7C',
    baseContactName: 'Dubai Construction Corp',
    baseContactEmail: 'travel@dubaiconst.com',
    baseContactPhone: '+971 4 567 8901',
    priority: 'Premium',
    groupType: 'business',
    passengers: [
      {
        name: 'Robert Johnson', 
        relationship: 'project_manager',
        age: 38,
        specialRequirements: null,
        loyaltyTier: 'Gold',
        seatPreference: 'Aisle',
        mealPreference: 'Standard'
      },
      {
        name: 'Priya Sharma', 
        relationship: 'engineer',
        age: 32,
        specialRequirements: null,
        loyaltyTier: 'Silver',
        seatPreference: 'Window',
        mealPreference: 'Vegetarian'
      },
      {
        name: 'Ahmed Hassan', 
        relationship: 'architect',
        age: 29,
        specialRequirements: null,
        loyaltyTier: 'Silver',
        seatPreference: 'Aisle',
        mealPreference: 'Halal'
      }
    ]
  },
  // Couple with infant - Thompson Family (3 passengers)
  {
    pnr: 'FZ4F9T',
    baseContactName: 'Thompson',
    baseContactEmail: 'james.thompson@outlook.com',
    baseContactPhone: '+44 7700 900123',
    priority: 'Premium',
    groupType: 'family',
    passengers: [
      {
        name: 'James Thompson', 
        relationship: 'father',
        age: 34,
        specialRequirements: null,
        loyaltyTier: 'Gold',
        seatPreference: 'Aisle',
        mealPreference: 'Standard'
      },
      {
        name: 'Emma Thompson', 
        relationship: 'mother',
        age: 31,
        specialRequirements: 'Infant',
        loyaltyTier: 'Gold',
        seatPreference: 'Aisle',
        mealPreference: 'Standard'
      },
      {
        name: 'Baby Thompson', 
        relationship: 'infant',
        age: 1,
        specialRequirements: 'Infant',
        loyaltyTier: null,
        seatPreference: 'Lap',
        mealPreference: 'Infant'
      }
    ]
  },
  // Elderly couple - Wilson (2 passengers)
  {
    pnr: 'FZ6W2L',
    baseContactName: 'Wilson',
    baseContactEmail: 'margaret.wilson@gmail.com',
    baseContactPhone: '+1 555 123 4567',
    priority: 'Standard',
    groupType: 'couple',
    passengers: [
      {
        name: 'Margaret Wilson', 
        relationship: 'spouse',
        age: 68,
        specialRequirements: 'Wheelchair',
        loyaltyTier: 'Silver',
        seatPreference: 'Aisle',
        mealPreference: 'Diabetic'
      },
      {
        name: 'David Wilson', 
        relationship: 'spouse',
        age: 71,
        specialRequirements: 'Medical',
        loyaltyTier: 'Silver',
        seatPreference: 'Aisle',
        mealPreference: 'Low Sodium'
      }
    ]
  },
  // Young couple - Patel (2 passengers)
  {
    pnr: 'FZ7P8R',
    baseContactName: 'Patel',
    baseContactEmail: 'raj.patel@techcorp.in',
    baseContactPhone: '+91 98765 43210',
    priority: 'Premium',
    groupType: 'couple',
    passengers: [
      {
        name: 'Raj Patel', 
        relationship: 'spouse',
        age: 28,
        specialRequirements: null,
        loyaltyTier: 'Gold',
        seatPreference: 'Window',
        mealPreference: 'Vegetarian'
      },
      {
        name: 'Sita Patel', 
        relationship: 'spouse',
        age: 26,
        specialRequirements: null,
        loyaltyTier: 'Silver',
        seatPreference: 'Middle',
        mealPreference: 'Vegetarian'
      }
    ]
  },
  // Extended family - Al-Mansoori (5 passengers)
  {
    pnr: 'FZ3M9A',
    baseContactName: 'Al-Mansoori',
    baseContactEmail: 'khalid.almansoori@adnoc.ae',
    baseContactPhone: '+971 50 987 6543',
    priority: 'VIP',
    groupType: 'family',
    passengers: [
      {
        name: 'Khalid Al-Mansoori', 
        relationship: 'father',
        age: 52,
        specialRequirements: null,
        loyaltyTier: 'Platinum',
        seatPreference: 'Aisle',
        mealPreference: 'Halal'
      },
      {
        name: 'Fatima Al-Mansoori', 
        relationship: 'mother',
        age: 48,
        specialRequirements: null,
        loyaltyTier: 'Platinum',
        seatPreference: 'Window',
        mealPreference: 'Halal'
      },
      {
        name: 'Sara Al-Mansoori', 
        relationship: 'daughter',
        age: 22,
        specialRequirements: null,
        loyaltyTier: 'Gold',
        seatPreference: 'Window',
        mealPreference: 'Halal'
      },
      {
        name: 'Yousef Al-Mansoori', 
        relationship: 'son',
        age: 19,
        specialRequirements: null,
        loyaltyTier: 'Silver',
        seatPreference: 'Aisle',
        mealPreference: 'Halal'
      },
      {
        name: 'Amna Al-Mansoori', 
        relationship: 'grandmother',
        age: 74,
        specialRequirements: 'Elderly Assistance',
        loyaltyTier: 'Gold',
        seatPreference: 'Aisle',
        mealPreference: 'Halal'
      }
    ]
  }
]

export const getIndividualPNRTemplates = () => [
  {
    pnr: 'FZ5X1Q',
    passengers: [{
      name: 'Michael Chen',
      relationship: 'individual',
      age: 35,
      specialRequirements: null,
      loyaltyTier: 'Gold',
      seatPreference: 'Window',
      mealPreference: 'Standard',
      contactEmail: 'michael.chen@singapore.com',
      contactPhone: '+65 9123 4567',
      priority: 'Premium'
    }]
  },
  {
    pnr: 'FZ8L4K',
    passengers: [{
      name: 'Sophie Mueller',
      relationship: 'individual',
      age: 29,
      specialRequirements: null,
      loyaltyTier: 'Silver',
      seatPreference: 'Aisle',
      mealPreference: 'Vegetarian',
      contactEmail: 'sophie.mueller@gmail.com',
      contactPhone: '+49 162 123 4567',
      priority: 'Standard'
    }]
  },
  {
    pnr: 'FZ2N7H',
    passengers: [{
      name: 'Carlos Rodriguez',
      relationship: 'individual',
      age: 43,
      specialRequirements: 'Dietary',
      loyaltyTier: 'Bronze',
      seatPreference: 'Window',
      mealPreference: 'Gluten Free',
      contactEmail: 'carlos.rodriguez@iberica.es',
      contactPhone: '+34 600 123 456',
      priority: 'Standard'
    }]
  },
  {
    pnr: 'FZ9K6M',
    passengers: [{
      name: 'Yuki Tanaka',
      relationship: 'individual',
      age: 31,
      specialRequirements: null,
      loyaltyTier: 'Silver',
      seatPreference: 'Window',
      mealPreference: 'Standard',
      contactEmail: 'yuki.tanaka@tokyo.jp',
      contactPhone: '+81 90 1234 5678',
      priority: 'Premium'
    }]
  }
]

export const generateAffectedPassengers = (flight, option) => {
  const totalPassengers = flight?.passengers || 167
  const passengers = []

  // Get PNR group templates
  const pnrGroups = getPNRGroupTemplates()
  const individualPNRs = getIndividualPNRTemplates()

  // Combine group and individual passengers
  const allPNRGroups = [...pnrGroups, ...individualPNRs]

  let passengerCounter = 1
  let seatCounter = 1
  const seatRows = ['A', 'B', 'C', 'D', 'E', 'F']
  let pnrCounter = 1

  // Calculate how many times we need to multiply the base groups
  const basePassengerCount = allPNRGroups.reduce((sum, group) => sum + group.passengers.length, 0)
  const multiplier = Math.ceil(totalPassengers / basePassengerCount)

  // Generate enough PNR groups to cover all passengers
  const expandedPNRGroups = []
  
  // First, add original groups
  for (let i = 0; i < multiplier && expandedPNRGroups.reduce((sum, group) => sum + group.passengers.length, 0) < totalPassengers; i++) {
    for (const templateGroup of allPNRGroups) {
      const currentPassengerCount = expandedPNRGroups.reduce((sum, group) => sum + group.passengers.length, 0)
      if (currentPassengerCount >= totalPassengers) break

      const newPnr = i === 0 ? templateGroup.pnr : `FZ${Math.random().toString(36).substring(2, 5).toUpperCase()}${pnrCounter++}`
      
      expandedPNRGroups.push({
        ...templateGroup,
        pnr: newPnr,
        passengers: templateGroup.passengers.map(p => ({
          ...p,
          name: i === 0 ? p.name : generateRandomName(p.relationship)
        }))
      })
    }
  }

  // Generate individual passengers to exactly match total count
  while (expandedPNRGroups.reduce((sum, group) => sum + group.passengers.length, 0) < totalPassengers) {
    const singlePassengerPnr = `FZ${Math.random().toString(36).substring(2, 5).toUpperCase()}${pnrCounter++}`
    expandedPNRGroups.push({
      pnr: singlePassengerPnr,
      baseContactEmail: null,
      baseContactPhone: null,
      priority: ['Standard', 'Premium', 'VIP'][Math.floor(Math.random() * 3)],
      groupType: 'individual',
      passengers: [{
        name: generateRandomName('individual'),
        relationship: 'individual',
        age: 25 + Math.floor(Math.random() * 40),
        specialRequirements: Math.random() > 0.8 ? ['Dietary', 'Wheelchair', 'Medical'][Math.floor(Math.random() * 3)] : null,
        loyaltyTier: ['Bronze', 'Silver', 'Gold', 'Platinum', null][Math.floor(Math.random() * 5)],
        seatPreference: ['Window', 'Aisle', 'Any'][Math.floor(Math.random() * 3)],
        mealPreference: ['Standard', 'Vegetarian', 'Halal', 'Kosher'][Math.floor(Math.random() * 4)]
      }]
    })
  }

  // Generate passenger records from PNR groups
  expandedPNRGroups.forEach((pnrGroup) => {
    if (passengerCounter > totalPassengers) return

    pnrGroup.passengers.forEach((passengerTemplate, index) => {
      if (passengerCounter > totalPassengers) return

      // Determine seat assignment
      let seat
      if (passengerTemplate.seatPreference === 'Lap') {
        seat = 'LAP'
      } else {
        const seatRow = Math.floor((seatCounter - 1) / 6) + 1
        const seatLetter = seatRows[(seatCounter - 1) % 6]
        seat = `${seatRow}${seatLetter}`
        seatCounter++
      }

      // Determine contact info
      const contactEmail = pnrGroup.baseContactEmail || passengerTemplate.contactEmail || `${passengerTemplate.name.toLowerCase().replace(/\s+/g, '.')}@email.com`
      const contactPhone = pnrGroup.baseContactPhone || passengerTemplate.contactPhone || '+971 50 000 0000'

      // Determine status based on recovery option
      let status = 'Confirmed'
      if (requiresPassengerReaccommodation(option)) {
        if (pnrGroup.priority === 'VIP') {
          status = Math.random() > 0.7 ? 'Rebooking Required' : 'Accommodation Needed'
        } else if (pnrGroup.priority === 'Premium') {
          status = Math.random() > 0.5 ? 'Rebooking Required' : 'Alternative Flight'
        } else {
          status = Math.random() > 0.3 ? 'Rebooking Required' : 'Accommodation Needed'
        }
      }

      const passenger = {
        id: `PAX-${String(passengerCounter).padStart(3, '0')}`,
        name: passengerTemplate.name,
        pnr: pnrGroup.pnr,
        priority: pnrGroup.priority || passengerTemplate.priority || 'Standard',
        status: status,
        seat: seat,
        contactInfo: contactEmail,
        contactPhone: contactPhone,
        age: passengerTemplate.age,
        relationship: passengerTemplate.relationship,
        specialRequirements: passengerTemplate.specialRequirements,
        preferences: {
          seatPreference: passengerTemplate.seatPreference || 'Any',
          mealPreference: passengerTemplate.mealPreference || 'Standard',
          classPreference: pnrGroup.priority === 'VIP' ? 'Business' : 
                         pnrGroup.priority === 'Premium' ? 'Premium Economy' : 'Economy',
          loyaltyTier: passengerTemplate.loyaltyTier
        },
        connectedFlights: Math.random() > 0.7 ? ['FZ567', 'FZ892'] : [],
        groupType: pnrGroup.groupType || 'individual',
        familySize: pnrGroup.passengers.length
      }

      passengers.push(passenger)
      passengerCounter++
    })
  })

  // Ensure we have exactly the right number of passengers
  const finalPassengers = passengers.slice(0, totalPassengers)
  console.log(`Generated ${finalPassengers.length} passengers for flight ${flight?.flightNumber || 'Unknown'} with ${totalPassengers} expected passengers`)
  
  // Log PNR distribution
  const pnrBreakdown = finalPassengers.reduce((acc, p) => {
    acc[p.pnr] = (acc[p.pnr] || 0) + 1
    return acc
  }, {})
  console.log('Final PNR breakdown:', pnrBreakdown)
  console.log('Status breakdown:', finalPassengers.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {}))
  
  return finalPassengers
}

// Helper function to generate random names
const generateRandomName = (relationship) => {
  const firstNames = {
    father: ['Ahmed', 'Mohammed', 'Omar', 'Hassan', 'Ali', 'Khalid', 'Saeed', 'Rashid', 'Mahmoud', 'Yusuf'],
    mother: ['Fatima', 'Aisha', 'Layla', 'Maryam', 'Noura', 'Sara', 'Huda', 'Zainab', 'Khadija', 'Amina'],
    son: ['Zaid', 'Yousef', 'Abdullah', 'Hamza', 'Tariq', 'Salam', 'Nasser', 'Fahad', 'Majid', 'Waleed'],
    daughter: ['Noor', 'Amna', 'Hala', 'Rana', 'Lara', 'Maya', 'Reem', 'Dana', 'Sama', 'Lina'],
    individual: ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'Robert', 'Maria', 'James', 'Anna'],
    spouse: ['Elena', 'Carlos', 'Sophie', 'Marco', 'Nina', 'Paulo', 'Isabella', 'Antonio', 'Lucia', 'Fernando']
  }
  
  const lastNames = ['Al-Rashid', 'Al-Mansoori', 'Thompson', 'Johnson', 'Wilson', 'Patel', 'Rodriguez', 'Chen', 'Mueller', 'Tanaka']
  
  const names = firstNames[relationship] || firstNames.individual
  const firstName = names[Math.floor(Math.random() * names.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  
  return `${firstName} ${lastName}`
}