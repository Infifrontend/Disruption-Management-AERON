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

// PNR group templates for realistic passenger data with 5-10 passengers per PNR
export const getPNRGroupTemplates = () => [
  // Large Family - Al-Rashid Extended Family (8 passengers)
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
      },
      {
        name: 'Ahmed Al-Rashid', 
        relationship: 'uncle',
        age: 50,
        specialRequirements: null,
        loyaltyTier: 'Gold',
        seatPreference: 'Aisle',
        mealPreference: 'Halal'
      },
      {
        name: 'Maryam Al-Rashid', 
        relationship: 'aunt',
        age: 47,
        specialRequirements: null,
        loyaltyTier: 'Gold',
        seatPreference: 'Window',
        mealPreference: 'Halal'
      },
      {
        name: 'Khalil Al-Rashid', 
        relationship: 'cousin',
        age: 20,
        specialRequirements: null,
        loyaltyTier: 'Silver',
        seatPreference: 'Any',
        mealPreference: 'Halal'
      },
      {
        name: 'Fatima Al-Rashid', 
        relationship: 'grandmother',
        age: 75,
        specialRequirements: 'Elderly Assistance',
        loyaltyTier: 'Platinum',
        seatPreference: 'Aisle',
        mealPreference: 'Halal'
      }
    ]
  },
  // Business Group - Dubai Construction Corp (7 passengers)
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
      },
      {
        name: 'Lisa Chen', 
        relationship: 'consultant',
        age: 35,
        specialRequirements: null,
        loyaltyTier: 'Gold',
        seatPreference: 'Window',
        mealPreference: 'Standard'
      },
      {
        name: 'Mohammed Ali', 
        relationship: 'supervisor',
        age: 41,
        specialRequirements: null,
        loyaltyTier: 'Silver',
        seatPreference: 'Aisle',
        mealPreference: 'Halal'
      },
      {
        name: 'Sarah Williams', 
        relationship: 'analyst',
        age: 28,
        specialRequirements: null,
        loyaltyTier: 'Bronze',
        seatPreference: 'Any',
        mealPreference: 'Standard'
      },
      {
        name: 'David Park', 
        relationship: 'coordinator',
        age: 33,
        specialRequirements: null,
        loyaltyTier: 'Silver',
        seatPreference: 'Window',
        mealPreference: 'Standard'
      }
    ]
  },
  // Extended Family - Thompson Group (6 passengers)
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
      },
      {
        name: 'Michael Thompson', 
        relationship: 'brother',
        age: 36,
        specialRequirements: null,
        loyaltyTier: 'Silver',
        seatPreference: 'Window',
        mealPreference: 'Standard'
      },
      {
        name: 'Jennifer Thompson', 
        relationship: 'sister-in-law',
        age: 34,
        specialRequirements: null,
        loyaltyTier: 'Silver',
        seatPreference: 'Aisle',
        mealPreference: 'Standard'
      },
      {
        name: 'Lucy Thompson', 
        relationship: 'niece',
        age: 8,
        specialRequirements: 'Minor',
        loyaltyTier: null,
        seatPreference: 'Window',
        mealPreference: 'Child Meal'
      }
    ]
  },
  // Travel Group - Wilson Extended (5 passengers)
  {
    pnr: 'FZ6W2L',
    baseContactName: 'Wilson',
    baseContactEmail: 'margaret.wilson@gmail.com',
    baseContactPhone: '+1 555 123 4567',
    priority: 'Standard',
    groupType: 'friends',
    passengers: [
      {
        name: 'Margaret Wilson', 
        relationship: 'traveler',
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
      },
      {
        name: 'Mary Johnson', 
        relationship: 'friend',
        age: 66,
        specialRequirements: null,
        loyaltyTier: 'Bronze',
        seatPreference: 'Window',
        mealPreference: 'Standard'
      },
      {
        name: 'Robert Brown', 
        relationship: 'friend',
        age: 69,
        specialRequirements: null,
        loyaltyTier: 'Bronze',
        seatPreference: 'Aisle',
        mealPreference: 'Standard'
      },
      {
        name: 'Helen Davis', 
        relationship: 'friend',
        age: 65,
        specialRequirements: null,
        loyaltyTier: 'Silver',
        seatPreference: 'Window',
        mealPreference: 'Vegetarian'
      }
    ]
  },
  // Corporate Group - Patel Tech Team (9 passengers)
  {
    pnr: 'FZ7P8R',
    baseContactName: 'Patel Tech Solutions',
    baseContactEmail: 'raj.patel@techcorp.in',
    baseContactPhone: '+91 98765 43210',
    priority: 'Premium',
    groupType: 'business',
    passengers: [
      {
        name: 'Raj Patel', 
        relationship: 'ceo',
        age: 28,
        specialRequirements: null,
        loyaltyTier: 'Gold',
        seatPreference: 'Window',
        mealPreference: 'Vegetarian'
      },
      {
        name: 'Sita Patel', 
        relationship: 'cto',
        age: 26,
        specialRequirements: null,
        loyaltyTier: 'Silver',
        seatPreference: 'Middle',
        mealPreference: 'Vegetarian'
      },
      {
        name: 'Arjun Kumar', 
        relationship: 'developer',
        age: 30,
        specialRequirements: null,
        loyaltyTier: 'Silver',
        seatPreference: 'Aisle',
        mealPreference: 'Vegetarian'
      },
      {
        name: 'Priya Singh', 
        relationship: 'designer',
        age: 27,
        specialRequirements: null,
        loyaltyTier: 'Bronze',
        seatPreference: 'Window',
        mealPreference: 'Standard'
      },
      {
        name: 'Vikram Sharma', 
        relationship: 'analyst',
        age: 25,
        specialRequirements: null,
        loyaltyTier: 'Bronze',
        seatPreference: 'Any',
        mealPreference: 'Vegetarian'
      },
      {
        name: 'Deepika Rao', 
        relationship: 'manager',
        age: 32,
        specialRequirements: null,
        loyaltyTier: 'Gold',
        seatPreference: 'Aisle',
        mealPreference: 'Vegetarian'
      },
      {
        name: 'Suresh Gupta', 
        relationship: 'consultant',
        age: 35,
        specialRequirements: null,
        loyaltyTier: 'Silver',
        seatPreference: 'Window',
        mealPreference: 'Standard'
      },
      {
        name: 'Anita Joshi', 
        relationship: 'coordinator',
        age: 29,
        specialRequirements: null,
        loyaltyTier: 'Bronze',
        seatPreference: 'Any',
        mealPreference: 'Vegetarian'
      },
      {
        name: 'Kiran Reddy', 
        relationship: 'intern',
        age: 23,
        specialRequirements: null,
        loyaltyTier: null,
        seatPreference: 'Any',
        mealPreference: 'Standard'
      }
    ]
  },
  // VIP Family - Al-Mansoori Extended (10 passengers)
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
      },
      {
        name: 'Abdullah Al-Mansoori', 
        relationship: 'grandfather',
        age: 78,
        specialRequirements: 'Medical',
        loyaltyTier: 'Platinum',
        seatPreference: 'Aisle',
        mealPreference: 'Halal'
      },
      {
        name: 'Omar Al-Mansoori', 
        relationship: 'uncle',
        age: 45,
        specialRequirements: null,
        loyaltyTier: 'Gold',
        seatPreference: 'Window',
        mealPreference: 'Halal'
      },
      {
        name: 'Aisha Al-Mansoori', 
        relationship: 'aunt',
        age: 42,
        specialRequirements: null,
        loyaltyTier: 'Gold',
        seatPreference: 'Aisle',
        mealPreference: 'Halal'
      },
      {
        name: 'Hassan Al-Mansoori', 
        relationship: 'cousin',
        age: 25,
        specialRequirements: null,
        loyaltyTier: 'Silver',
        seatPreference: 'Any',
        mealPreference: 'Halal'
      },
      {
        name: 'Layla Al-Mansoori', 
        relationship: 'cousin',
        age: 18,
        specialRequirements: 'Minor',
        loyaltyTier: null,
        seatPreference: 'Window',
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

  let passengerCounter = 1
  let seatCounter = 1
  let pnrCounter = 100
  const seatRows = ['A', 'B', 'C', 'D', 'E', 'F']
  
  // Fixed middle letters for PNR generation
  const middleLetters = ['8M', '9B', '4F', '6W', '7P', '3M', '5X', '2K', '1Q', '0N']

  // Calculate how many complete groups we can fit
  const basePassengerCount = pnrGroups.reduce((sum, group) => sum + group.passengers.length, 0)
  const cyclesNeeded = Math.ceil(totalPassengers / basePassengerCount)
  

  // Generate passengers using template groups
  for (let cycle = 0; cycle < cyclesNeeded && passengerCounter <= totalPassengers; cycle++) {
    pnrGroups.forEach((templateGroup, groupIndex) => {
      if (passengerCounter > totalPassengers) return

      // Generate PNR with fixed middle letters
      let newPnr
      if (cycle === 0) {
        newPnr = templateGroup.pnr
      } else {
        const middleIndex = groupIndex % middleLetters.length
        const lastChar = String.fromCharCode(65 + ((cycle + groupIndex) % 26)) // A-Z
        newPnr = `FZ${middleLetters[middleIndex]}${lastChar}`
      }
      
      templateGroup.passengers.forEach((passengerTemplate, passengerIndex) => {
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
        const contactEmail = templateGroup.baseContactEmail || `${passengerTemplate.name.toLowerCase().replace(/\s+/g, '.')}@email.com`
        const contactPhone = templateGroup.baseContactPhone || '+971 50 000 0000'

        // Determine status based on recovery option - Start with Rebooking Required for disruptions
        let status = 'Rebooking Required'
        if (requiresPassengerReaccommodation(option)) {
          if (templateGroup.priority === 'VIP') {
            status = Math.random() > 0.7 ? 'Rebooking Required' : 'Accommodation Needed'
          } else if (templateGroup.priority === 'Premium') {
            status = Math.random() > 0.5 ? 'Rebooking Required' : 'Alternative Flight'
          } else {
            status = Math.random() > 0.3 ? 'Rebooking Required' : 'Accommodation Needed'
          }
        }

        const passenger = {
          id: `PAX-${String(passengerCounter).padStart(3, '0')}`,
          name: cycle === 0 ? passengerTemplate.name : generateRandomName(passengerTemplate.relationship),
          pnr: newPnr,
          priority: templateGroup.priority || 'Standard',
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
            classPreference: templateGroup.priority === 'VIP' ? 'Business' : 
                           templateGroup.priority === 'Premium' ? 'Premium Economy' : 'Economy',
            loyaltyTier: passengerTemplate.loyaltyTier
          },
          connectedFlights: Math.random() > 0.7 ? ['FZ567', 'FZ892'] : [],
          groupType: templateGroup.groupType || 'individual',
          familySize: templateGroup.passengers.length
        }

        passengers.push(passenger)
        passengerCounter++
      })
    })
  }

  
  // Log PNR distribution
  const pnrBreakdown = passengers.reduce((acc, p) => {
    acc[p.pnr] = (acc[p.pnr] || 0) + 1
    return acc
  }, {})
  console.log('Status breakdown:', passengers.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {}))
  
  return passengers
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