'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import Navbar from '@/components/shared/Navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { ParentDirectoryEntry, ParentDetailProfile, UserStatus } from '@/lib/types'
import { Search, User, Users, DollarSign, AlertCircle, ChevronRight, ArrowLeft, Mail } from 'lucide-react'

export default function AdminParentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [parents, setParents] = useState<ParentDirectoryEntry[]>([])
  const [selectedParent, setSelectedParent] = useState<ParentDetailProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20
  const [pricingModalOpen, setPricingModalOpen] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null)
  const [overridePriceNGN, setOverridePriceNGN] = useState('')
  const [overridePriceUSD, setOverridePriceUSD] = useState('')
  const [updatingPrice, setUpdatingPrice] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'ADMIN') {
      router.push('/login')
      return
    }

    loadParents()
  }, [router, page, statusFilter])

  const loadParents = async () => {
    setLoading(true)
    try {
      const data = await api.getParentDirectory({
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page,
        limit,
      })
      console.log('Parent directory data:', data)
      setParents(Array.isArray(data?.data) ? data.data : [])
      setTotal(data?.total || 0)
    } catch (err) {
      console.error('Failed to load parents:', err)
      setParents([])
      setTotal(0)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load parent directory',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadParents()
  }

  const handleSelectParent = async (parentId: string) => {
    setDetailLoading(true)
    try {
      const data = await api.getParentDetail(parentId)
      // Transform API response to match expected structure with all details
      const transformedData = {
        parent: {
          id: data.id,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          status: data.status,
          timezone: data.timezone,
          profilePicture: data.profilePicture,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          childrenCount: data.children?.length || 0,
          activeEnrollments: data.children?.reduce((acc: number, child: any) => acc + (child.enrollments?.length || 0), 0) || 0,
          pendingPayments: 0,
          totalPaidNGN: 0,
          totalPaidUSD: 0,
          complaintCount: data.complaintCount || 0,
        },
        children: data.children?.map((child: any) => ({
          id: child.id,
          parentId: child.parentId,
          userId: child.userId,
          fullName: child.fullName,
          dateOfBirth: child.dateOfBirth,
          actualGrade: child.actualGrade || child.gradeLevel,
          gradeLevel: child.gradeLevel,
          gradeBandTier: child.gradeBandTier,
          gender: child.gender,
          school: child.school,
          notes: child.notes,
          studentStatus: child.user?.status,
          createdAt: child.createdAt,
          enrollments: child.enrollments || [],
        })) || [],
        enrollments: data.children?.flatMap((child: any) =>
          child.enrollments?.map((enrollment: any) => ({
            id: enrollment.id,
            enrollmentGroupId: enrollment.enrollmentGroupId,
            studentId: enrollment.studentId,
            studentName: child.fullName,
            subjectId: enrollment.subjectId,
            subjectName: enrollment.subject?.name || 'No subject',
            subjectCategory: enrollment.subject?.category,
            subjectGradeBand: enrollment.subject?.gradeBand,
            tutorId: enrollment.tutorId,
            tutorName: enrollment.tutor?.fullName || null,
            tutorProfilePicture: enrollment.tutor?.profilePicture,
            sessionFrequency: enrollment.sessionFrequency,
            availableDays: enrollment.availableDays,
            preferredStartHour: enrollment.preferredStartHour,
            preferredEndHour: enrollment.preferredEndHour,
            billingFrequency: enrollment.billingFrequency,
            yearlyPrice: enrollment.yearlyPrice,
            yearlyPriceNGN: enrollment.yearlyPriceNGN,
            yearlyPriceUSD: enrollment.yearlyPriceUSD,
            status: enrollment.status,
            startDate: enrollment.startDate,
            endDate: enrollment.endDate,
            effectivePriceNGN: enrollment.effectivePriceNGN || 0,
            effectivePriceUSD: enrollment.effectivePriceUSD || 0,
            priceSource: enrollment.priceSource || 'subject_price',
            hasPendingPayment: enrollment.hasPendingPayment,
            payments: enrollment.payments || [],
            createdAt: enrollment.createdAt,
          })) || []
        ) || [],
        recentPayments: data.recentPayments || [],
      }
      setSelectedParent(transformedData)
    } catch (err) {
      console.error('Failed to load parent details:', err)
      toast({
        title: 'Error',
        description: 'Failed to load parent details',
        variant: 'destructive',
      })
    } finally {
      setDetailLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  const handleOpenPricingModal = (enrollment: any) => {
    setSelectedEnrollment(enrollment)
    setOverridePriceNGN(enrollment.effectivePriceNGN?.toString() || '')
    setOverridePriceUSD(enrollment.effectivePriceUSD?.toString() || '')
    setPricingModalOpen(true)
  }

  const handleUpdatePricing = async () => {
    if (!selectedEnrollment) return

    setUpdatingPrice(true)
    try {
      const payload: any = {}
      if (overridePriceNGN) payload.yearlyPriceNGN = parseFloat(overridePriceNGN)
      if (overridePriceUSD) payload.yearlyPriceUSD = parseFloat(overridePriceUSD)

      await api.updateEnrollmentPricing(selectedEnrollment.id, payload)
      toast({
        title: 'Pricing Updated',
        description: 'The pricing has been updated for this enrollment',
      })
      setPricingModalOpen(false)
      // Reload parent details to show updated pricing
      if (selectedParent) {
        await handleSelectParent(selectedParent.parent.id ?? '')
      }
    } catch (err) {
      console.error('Failed to update pricing:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update pricing',
        variant: 'destructive',
      })
    } finally {
      setUpdatingPrice(false)
    }
  }

  if (selectedParent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-12">
          <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedParent(null)}
            className="gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-3xl font-serif font-bold text-white">Parent Profile</h1>
            <p className="text-sm text-gray-400">{selectedParent.parent.fullName}</p>
          </div>
        </div>

        {detailLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" className="text-brand-gold" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card border-brand-gold/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-brand-gold" />
                    <div>
                      <p className="text-2xl font-bold text-white">{selectedParent.parent.childrenCount}</p>
                      <p className="text-xs text-gray-400">Children</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-brand-gold/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-brand-gold" />
                    <div>
                      <p className="text-2xl font-bold text-white">{selectedParent.parent.activeEnrollments}</p>
                      <p className="text-xs text-gray-400">Active Enrollments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-brand-gold/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-brand-gold" />
                    <div>
                      <p className="text-2xl font-bold text-white">₦{(selectedParent.parent.totalPaidNGN ?? 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Total Paid (NGN)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-brand-gold/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-brand-gold" />
                    <div>
                      <p className="text-2xl font-bold text-white">{selectedParent.parent.complaintCount}</p>
                      <p className="text-xs text-gray-400">Complaints</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Parent Basic Info */}
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Parent Information</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      // Open message composer for this parent
                      // This would typically open a modal or navigate to messages with this parent pre-selected
                      router.push('/admin/messages')
                    }}
                    className="gap-1 bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                  >
                    <Mail className="h-4 w-4" />
                    Message Parent
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Full Name</p>
                    <p className="text-white">{selectedParent.parent.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p className="text-white">{selectedParent.parent.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Phone</p>
                    <p className="text-white">{selectedParent.parent.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Timezone</p>
                    <p className="text-white">{selectedParent.parent.timezone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <StatusBadge status={selectedParent.parent.status as UserStatus} />
                  </div>
                  <div>
                    <p className="text-gray-400">Account Created</p>
                    <p className="text-white">{new Date(selectedParent.parent.createdAt ?? '').toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Children */}
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <CardTitle className="text-white">Children ({selectedParent.children.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedParent.children.map((child) => (
                    <div key={child.id} className="p-4 bg-brand-dark/30 rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-white text-lg">{child.fullName}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                            <span>Grade: {child.actualGrade || child.gradeLevel}</span>
                            <span>•</span>
                            <span>Grade Band: {child.gradeBandTier}</span>
                          </div>
                        </div>
                        <StatusBadge status={child.studentStatus as UserStatus} />
                      </div>
                      {child.school && (
                        <div>
                          <p className="text-xs text-gray-400">School</p>
                          <p className="text-white text-sm">{child.school}</p>
                        </div>
                      )}
                      {child.notes && (
                        <div>
                          <p className="text-xs text-gray-400">Notes</p>
                          <p className="text-white text-sm">{child.notes}</p>
                        </div>
                      )}
                      {child.enrollments && child.enrollments.length > 0 && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-gray-400 mb-2">Enrollments ({child.enrollments.length})</p>
                          <div className="space-y-2">
                            {child.enrollments.map((enrollment: any) => (
                              <div key={enrollment.id} className="p-2 bg-brand-dark/20 rounded text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-white">{enrollment.subject?.name || 'No subject'}</span>
                                  <StatusBadge status={enrollment.status} />
                                </div>
                                {enrollment.tutor && (
                                  <p className="text-gray-400 text-xs mt-1">Tutor: {enrollment.tutor.fullName}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enrollments Detail */}
            <Card className="bg-card border-brand-gold/30">
              <CardHeader>
                <CardTitle className="text-white">All Enrollments ({selectedParent.enrollments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedParent.enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="p-4 bg-brand-dark/30 rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium text-white">{enrollment.studentName}</p>
                            <StatusBadge status={enrollment.status} />
                          </div>
                          <p className="text-sm text-gray-400">{enrollment.subjectName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Category: {enrollment.subjectCategory} • Grade Band: {enrollment.subjectGradeBand}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenPricingModal(enrollment)}
                          className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Update Pricing
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-border">
                        <div>
                          <p className="text-gray-400">Tutor</p>
                          <p className="text-white">{enrollment.tutorName || 'Unassigned'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Session Frequency</p>
                          <p className="text-white">{enrollment.sessionFrequency || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Available Days</p>
                          <p className="text-white">{enrollment.availableDays?.join(', ') || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Billing Frequency</p>
                          <p className="text-white">{enrollment.billingFrequency || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Yearly Price</p>
                          <p className="text-white">${enrollment.yearlyPrice || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Effective Price (NGN)</p>
                          <p className="text-white">₦{enrollment.effectivePriceNGN?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Effective Price (USD)</p>
                          <p className="text-white">${enrollment.effectivePriceUSD?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Price Source</p>
                          <p className={`text-xs font-medium ${enrollment.priceSource === 'error' ? 'text-red-400' : 'text-brand-gold'}`}>
                            {enrollment.priceSource === 'error' ? 'Not Configured' : enrollment.priceSource}
                          </p>
                          {enrollment.priceSource === 'error' && (
                            <p className="text-xs text-red-300 mt-1">
                              Pricing not configured for this subject and grade band. Contact admin to set up pricing.
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-gray-400">Start Date</p>
                          <p className="text-white">{enrollment.startDate ? new Date(enrollment.startDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Pending Payment</p>
                          <p className="text-white">{enrollment.hasPendingPayment ? 'Yes' : 'No'}</p>
                        </div>
                      </div>

                      {enrollment.payments && enrollment.payments.length > 0 && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-gray-400 mb-2">Payments ({enrollment.payments.length})</p>
                          <div className="space-y-1">
                            {enrollment.payments.map((payment: any) => (
                              <div key={payment.id} className="text-xs text-gray-300">
                                Payment ID: {payment.id} - Status: {payment.status}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Payments */}
            {selectedParent.recentPayments && selectedParent.recentPayments.length > 0 && (
              <Card className="bg-card border-brand-gold/30">
                <CardHeader>
                  <CardTitle className="text-white">Recent Payments ({selectedParent.recentPayments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedParent.recentPayments.map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-brand-dark/30 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{payment.studentName}</p>
                          <p className="text-sm text-gray-400">{payment.subjectName} • {payment.reference}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">
                            {payment.currency === 'NGN' ? '₦' : '$'}{payment.amount?.toLocaleString() || '0'}
                          </p>
                          <StatusBadge status={payment.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        </div>

        {/* Pricing Override Modal */}
        {pricingModalOpen && selectedEnrollment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-card border-brand-gold/30 w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-white">Update Enrollment Pricing</CardTitle>
                <CardDescription className="text-gray-400">
                  {selectedEnrollment.studentName} - {selectedEnrollment.subjectName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="price-ngn" className="text-gray-300">Override Price (NGN)</Label>
                    <Input
                      id="price-ngn"
                      type="number"
                      value={overridePriceNGN}
                      onChange={(e) => setOverridePriceNGN(e.target.value)}
                      placeholder="Leave empty to use default pricing"
                      className="bg-brand-dark/30 border-brand-gold/30 text-white mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Current: ₦{selectedEnrollment.effectivePriceNGN?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <div>
                    <Label htmlFor="price-usd" className="text-gray-300">Override Price (USD)</Label>
                    <Input
                      id="price-usd"
                      type="number"
                      value={overridePriceUSD}
                      onChange={(e) => setOverridePriceUSD(e.target.value)}
                      placeholder="Leave empty to use default pricing"
                      className="bg-brand-dark/30 border-brand-gold/30 text-white mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Current: ${selectedEnrollment.effectivePriceUSD?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <div className="flex gap-2 justify-end pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setPricingModalOpen(false)}
                      className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdatePricing}
                      disabled={updatingPrice}
                      className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark"
                    >
                      {updatingPrice ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                      Update Pricing
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white">Parent Directory</h1>
          <p className="text-sm text-gray-400">Manage parent accounts and view enrollment details</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-card border-brand-gold/30">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-brand-dark/30 border-brand-gold/30 text-white placeholder:text-gray-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-brand-dark/30 border-brand-gold/30 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="UNVERIFIED">Unverified</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="bg-brand-gold hover:bg-brand-goldLight text-brand-dark">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Parent List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" className="text-brand-gold" />
        </div>
      ) : parents.length === 0 ? (
        <Card className="bg-card border-brand-gold/30 text-center py-16">
          <CardContent>
            <User className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">No Parents Found</h3>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-card border-brand-gold/30">
            <CardContent className="p-0">
              <div className="divide-y divide-brand-gold/10">
                {parents.map((parent) => (
                  <button
                    key={parent.id}
                    onClick={() => handleSelectParent(parent.id)}
                    className="w-full text-left p-4 hover:bg-brand-gold/5 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-brand-gold/20 text-brand-gold">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{parent.fullName}</p>
                        <p className="text-sm text-gray-400">{parent.email} {parent.phone && `• ${parent.phone}`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-gray-400">{parent.childrenCount} children</p>
                        <p className="text-gray-400">{parent.activeEnrollments} active</p>
                      </div>
                      <StatusBadge status={parent.status as UserStatus} />
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-400">
                Page {page} of {totalPages} ({total} total)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  )
}
