'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Alert, AlertDescription } from './ui/alert'
import { Separator } from './ui/separator'
import { Checkbox } from './ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { 
  UtensilsCrossed, 
  CreditCard, 
  Send,
  AlertTriangle,
  Download,
  Receipt,
  Coffee,
  Utensils
} from 'lucide-react'

// Import airline configuration and currency utilities
import { useAirlineTheme } from '../hooks/useAirlineTheme'

const voucherTypes = [
  {
    id: 'meal',
    name: 'Meal Voucher',
    icon: UtensilsCrossed,
    amounts: [15, 25, 35, 50],
    defaultAmount: 25,
    description: 'For restaurant meals at airport or hotel',
    restrictions: 'Valid for 24 hours, food establishments only',
    color: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  {
    id: 'snack',
    name: 'Snack Voucher', 
    icon: Coffee,
    amounts: [5, 10, 15, 20],
    defaultAmount: 10,
    description: 'For light snacks and beverages',
    restrictions: 'Valid for 12 hours, includes cafes and food courts',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    id: 'dining',
    name: 'Fine Dining Voucher',
    icon: Utensils,
    amounts: [50, 75, 100, 150],
    defaultAmount: 75,
    description: 'For premium restaurant experiences',
    restrictions: 'Valid for 48 hours, premium dining establishments',
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  {
    id: 'general',
    name: 'General Service Voucher',
    icon: CreditCard,
    amounts: [20, 30, 50, 100],
    defaultAmount: 30,
    description: 'Multi-purpose voucher for various services',
    restrictions: 'Valid for 72 hours, participating merchants only',
    color: 'bg-green-100 text-green-700 border-green-200'
  }
]

const issuedVouchers = [
  {
    id: 'VCH001',
    passenger: 'John Smith',
    type: 'Meal Voucher',
    amount: 25,
    issued: '2025-06-06 14:30',
    expires: '2025-06-07 14:30',
    status: 'Active',
    used: false
  },
  {
    id: 'VCH002',
    passenger: 'Sarah Johnson',
    type: 'Snack Voucher',
    amount: 10,
    issued: '2025-06-06 13:45',
    expires: '2025-06-07 01:45',
    status: 'Used',
    used: true,
    usedAt: 'Terminal 3 Cafe'
  },
  {
    id: 'VCH003',
    passenger: 'Michael Chen',
    type: 'Fine Dining Voucher',
    amount: 75,
    issued: '2025-06-06 12:15',
    expires: '2025-06-08 12:15',
    status: 'Active',
    used: false
  }
]

export function VoucherManagement({ selectedPassengers }: { selectedPassengers: any; passengers: any }) {
  const [selectedVoucherType, setSelectedVoucherType] = useState('meal')
  const [voucherAmount, setVoucherAmount] = useState(25)
  const [quantity, setQuantity] = useState(1)
  const [customAmount, setCustomAmount] = useState('')
  const [useCustomAmount, setUseCustomAmount] = useState(false)
  const [bulkIssue, setBulkIssue] = useState(false)

  // Get airline configuration
  const { airlineConfig } = useAirlineTheme()
  
  // const selectedPassengerData = passengers.filter(p => selectedPassengers.includes(p.id))
  const selectedVoucherTypeData = voucherTypes.find(vt => vt.id === selectedVoucherType)
  const currency = airlineConfig.currency;
  
  // Get currency symbol using the currency utils
  import { getCurrencySymbol } from '../utils/currencyUtils'
  const currencySymbol = getCurrencySymbol(currency);

  const getTotalCost = () => {
    const amount = useCustomAmount ? parseFloat(customAmount) || 0 : voucherAmount
    return amount * quantity * (bulkIssue ? selectedPassengers.length : 1)
  }

  const handleIssueVouchers = () => {
    if (selectedPassengers.length === 0) {
      alert('Please select passengers first')
      return
    }

    const amount = useCustomAmount ? parseFloat(customAmount) || 0 : voucherAmount
    const recipientCount = bulkIssue ? selectedPassengers.length : 1
    const totalCost = getTotalCost()

    alert(`Issuing ${quantity} ${selectedVoucherTypeData?.name ?? 'Unknown'}(s) worth ${currencySymbol}${amount} each to ${recipientCount} passenger(s). Total cost: ${currencySymbol}${totalCost.toFixed(2)}`)
  }

  const handleBulkIssue = () => {
    setBulkIssue(true)
    handleIssueVouchers()
  }

  const getVoucherStatusColor = (status:any) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700'
      case 'Used': return 'bg-blue-100 text-blue-700'
      case 'Expired': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Voucher Management Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Meal & Service Voucher Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-lg font-semibold text-blue-600">{selectedPassengers.length}</p>
              <p className="text-sm text-blue-700">Selected Passengers</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded border border-green-200">
              <p className="text-lg font-semibold text-green-600">{issuedVouchers.filter(v => v.status === 'Active').length}</p>
              <p className="text-sm text-green-700">Active Vouchers</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded border border-orange-200">
              <p className="text-lg font-semibold text-orange-600">
                {currencySymbol}{issuedVouchers.reduce((sum, v) => sum + v.amount, 0)}
              </p>
              <p className="text-sm text-orange-700">Total Value Issued</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded border border-purple-200">
              <p className="text-lg font-semibold text-purple-600">{getTotalCost().toFixed(0)}</p>
              <p className="text-sm text-purple-700">Est. Cost ({currency})</p>
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Vouchers are automatically issued based on delay duration and time of day. 
              Manual issuance is available for special circumstances and passenger requests.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Voucher Issuance */}
      <Card>
        <CardHeader>
          <CardTitle>Issue New Vouchers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="voucherType">Voucher Type</Label>
                <Select
                value={selectedVoucherType}
                onValueChange={(value) => {
                  setSelectedVoucherType(value)
                  const typeData = voucherTypes.find(vt => vt.id === value)!
                  setVoucherAmount(typeData.defaultAmount)
                  setUseCustomAmount(false)
                }}
>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voucherTypes.map(type => {
                      const Icon = type.icon
                      return (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.name} - {currencySymbol}{type.defaultAmount}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {selectedVoucherTypeData && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedVoucherTypeData.description}
                  </p>
                )}
              </div>

              <div>
                <Label>Voucher Amount</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="customAmount" 
                      checked={useCustomAmount}
                      onCheckedChange={(checked) => setUseCustomAmount(checked === true)}
/>
                    <Label htmlFor="customAmount" className="text-sm">
                      Use custom amount
                    </Label>
                  </div>

                  {useCustomAmount ? (
                    <Input
                      type="number"
                      placeholder="Enter custom amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                    />
                  ) : (
                    <Select value={voucherAmount.toString()} onValueChange={(value) => setVoucherAmount(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedVoucherTypeData?.amounts.map(amount => (
                          <SelectItem key={amount} value={amount.toString()}>
                            {currencySymbol}{amount}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="quantity">Quantity per Passenger</Label>
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 voucher</SelectItem>
                    <SelectItem value="2">2 vouchers</SelectItem>
                    <SelectItem value="3">3 vouchers</SelectItem>
                    <SelectItem value="4">4 vouchers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleIssueVouchers} 
                  className="flex-1"
                  disabled={selectedPassengers.length === 0}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Issue to Selected
                </Button>
                <Button 
                  onClick={handleBulkIssue}
                  variant="outline"
                  disabled={selectedPassengers.length === 0}
                >
                  Bulk Issue
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Voucher Details</h4>
                {selectedVoucherTypeData && (
                  <Alert className={`border-2 ${selectedVoucherTypeData.color}`}>
                    <selectedVoucherTypeData.icon className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">{selectedVoucherTypeData.name}</p>
                        <p className="text-sm">{selectedVoucherTypeData.description}</p>
                        <p className="text-xs"><strong>Restrictions:</strong> {selectedVoucherTypeData.restrictions}</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-3">Issue Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Recipients:</span>
                    <span className="font-medium">{selectedPassengers.length} passengers</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Voucher Type:</span>
                    <span className="font-medium">{selectedVoucherTypeData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Each:</span>
                    <span className="font-medium">
                      {currencySymbol}{useCustomAmount ? customAmount || 0 : voucherAmount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity Each:</span>
                    <span className="font-medium">{quantity}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-base">
                    <span className="font-medium">Total Cost:</span>
                    <span className="font-semibold text-green-600">
                      {currencySymbol}{getTotalCost().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voucher Types Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Available Voucher Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voucherTypes.map(type => {
              const Icon = type.icon
              return (
                <div key={type.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-5 w-5" />
                    <h4 className="font-medium">{type.name}</h4>
                    <Badge className={type.color}>
                      {currencySymbol}{type.defaultAmount}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                  <p className="text-xs text-muted-foreground">{type.restrictions}</p>
                  <div className="flex gap-1 mt-2">
                    {type.amounts.map(amount => (
                      <Badge key={amount} variant="outline" className="text-xs">
                        {currencySymbol}{amount}
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recently Issued Vouchers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recently Issued Vouchers</span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voucher ID</TableHead>
                <TableHead>Passenger</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issuedVouchers.map(voucher => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-mono text-sm">{voucher.id}</TableCell>
                  <TableCell>{voucher.passenger}</TableCell>
                  <TableCell>{voucher.type}</TableCell>
                  <TableCell className="font-medium">{currencySymbol}{voucher.amount}</TableCell>
                  <TableCell className="text-sm">{voucher.issued}</TableCell>
                  <TableCell className="text-sm">{voucher.expires}</TableCell>
                  <TableCell>
                    <Badge className={getVoucherStatusColor(voucher.status)}>
                      {voucher.status}
                    </Badge>
                    {voucher.used && voucher.usedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Used at: {voucher.usedAt}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Receipt className="h-3 w-3" />
                      </Button>
                      {voucher.status === 'Active' && (
                        <Button size="sm" variant="outline">
                          Cancel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedPassengers.length === 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Please select passengers from the Passenger Lookup tab to issue vouchers.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}