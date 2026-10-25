'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getUserRole } from '@/lib/auth'
import { api } from '@/lib/api'
import { TutorApplication, TutorDocument, Subject, HighestQualification, TutorLevel, HowHeardSource, ApplicationStatus } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/shared/Avatar'
import { BrandHeader } from '@/components/shared/BrandHeader'
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  BookOpen,
  Briefcase,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  Lock,
  Save,
  Send,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'

type Step = 'about' | 'teaching' | 'profile' | 'documents' | 'review'

const QUALIFICATIONS: { value: HighestQualification; label: string }[] = [
  { value: 'SSCE_WAEC', label: 'SSCE / WAEC' },
  { value: 'OND_NCE', label: 'OND / NCE' },
  { value: 'HND', label: 'HND' },
  { value: 'BACHELORS', label: "Bachelor's Degree" },
  { value: 'BED_PGDE', label: 'B.Ed / PGDE' },
  { value: 'MASTERS', label: "Master's Degree" },
  { value: 'PHD', label: 'PhD' },
  { value: 'OTHER', label: 'Other' },
]

const LEVELS: { value: TutorLevel; label: string }[] = [
  { value: 'PRESCHOOL_TO_G1', label: 'Preschool to Grade 1' },
  { value: 'G2_TO_G4', label: 'Grade 2 to Grade 4' },
  { value: 'G5_TO_G8', label: 'Grade 5 to Grade 8' },
  { value: 'G9_TO_G12', label: 'Grade 9 to Grade 12' },
  { value: 'EXAM_LEVELS', label: 'Exam Levels' },
]

const HEARD_ABOUT: { value: HowHeardSource; label: string }[] = [
  { value: 'TEACHMENEST_TUTOR_OR_STAFF', label: 'A current Teachmenest tutor or staff member' },
  { value: 'PARENT_OR_FAMILY', label: 'A parent or family with Teachmenest' },
  { value: 'FRIEND_OR_FAMILY', label: 'Friend or family' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'WHATSAPP_GROUP', label: 'WhatsApp group' },
  { value: 'GOOGLE_SEARCH', label: 'Google search' },
  { value: 'JOB_BOARD', label: 'Job board' },
  { value: 'OTHER', label: 'Other' },
]

const SUBJECT_CATEGORIES = {
  CORE: 'Academic',
  ENRICHMENT: 'Extracurricular',
  TEST_PREP: 'Test Preparation',
}

export default function TutorApplicationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<Step>('about')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [application, setApplication] = useState<TutorApplication | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  const [documents, setDocuments] = useState<File[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<TutorDocument[]>([])

  const [formData, setFormData] = useState<Partial<TutorApplication>>({
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    birthday: '',
    country: '',
    city: '',
    highestQualification: undefined,
    subjects: [],
    levels: [],
    yearsOfExperience: 0,
    whyTeach: '',
    howHeard: undefined,
    aboutYou: '',
  })

  const [error, setError] = useState('')

  useEffect(() => {
    const user = getUser()
    if (!user || getUserRole() !== 'TUTOR') {
      router.push('/login')
      return
    }

    // Redirect pending tutors to status screen
    if (user.status === 'PENDING_VETTING') {
      router.push('/tutor/pending')
      return
    }

    // Redirect rejected tutors to status screen
    if (user.status === 'REJECTED') {
      router.push('/tutor/rejected')
      return
    }

    // Approved tutors go to dashboard
    if (user.status === 'APPROVED') {
      router.push('/tutor')
      return
    }

    loadData()
  }, [router])

  const loadData = async () => {
    setLoading(true)
    try {
      const [appData, subjectsData] = await Promise.all([
        api.getTutorApplication().catch(() => null),
        api.getPublicSubjects().catch(() => []),
      ])

      if (appData) {
        setApplication(appData)
        setFormData({
          firstName: appData.firstName || '',
          lastName: appData.lastName || '',
          middleName: appData.middleName || '',
          phone: appData.phone || '',
          birthday: appData.birthday || '',
          country: appData.country || '',
          city: appData.city || '',
          highestQualification: appData.highestQualification,
          subjects: appData.subjects || [],
          levels: appData.levels || [],
          yearsOfExperience: appData.yearsOfExperience || 0,
          whyTeach: appData.whyTeach || '',
          howHeard: appData.howHeard,
          aboutYou: appData.aboutYou || '',
        })

        // Load uploaded documents
        const docs = await api.getTutorDocuments().catch(() => [])
        setUploadedDocuments(docs)
      }

      setSubjects(subjectsData)
    } catch (err) {
      console.error('Failed to load data:', err)
      toast({
        title: 'Error',
        description: 'Failed to load application data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAutosave = async (changedData: Partial<TutorApplication>) => {
    setSaving(true)
    try {
      await api.updateTutorApplication(changedData)
      // Refresh application data
      const updated = await api.getTutorApplication()
      setApplication(updated)
    } catch (err) {
      console.error('Autosave failed:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleFieldChange = (field: keyof TutorApplication, value: any) => {
    setFormData({ ...formData, [field]: value })

    // Debounced autosave
    const timeoutId = setTimeout(() => {
      handleAutosave({ [field]: value })
    }, 800)

    return () => clearTimeout(timeoutId)
  }

  const handleProfilePictureSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image (JPEG, PNG, GIF, or WebP)',
        variant: 'destructive',
      })
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      })
      return
    }

    setProfilePicture(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleProfilePictureUpload = async () => {
    if (!profilePicture) return

    setSaving(true)
    try {
      await api.uploadProfilePicture(profilePicture)
      toast({
        title: 'Profile picture updated',
        description: 'Your profile picture has been uploaded successfully',
      })
      setProfilePicture(null)
      setProfilePicturePreview(null)
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Failed to upload profile picture',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const maxSize = 5 * 1024 * 1024
    const validFiles = files.filter(file => {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} must be PDF, DOC, DOCX, JPG, or PNG`,
          variant: 'destructive',
        })
        return false
      }

      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: `${file.name} is larger than 5MB`,
          variant: 'destructive',
        })
        return false
      }

      return true
    })

    if (uploadedDocuments.length + documents.length + validFiles.length > 5) {
      toast({
        title: 'Too many files',
        description: 'Maximum 5 documents allowed',
        variant: 'destructive',
      })
      return
    }

    setDocuments([...documents, ...validFiles])
  }

  const handleDocumentUpload = async (file: File) => {
    setSaving(true)
    try {
      const doc = await api.uploadTutorDocument(file)
      setUploadedDocuments([...uploadedDocuments, doc])
      setDocuments(documents.filter(d => d !== file))
      toast({
        title: 'Document uploaded',
        description: `${file.name} has been uploaded successfully`,
      })
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Failed to upload document',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDocumentDelete = async (docId: string) => {
    setSaving(true)
    try {
      await api.deleteTutorDocument(docId)
      setUploadedDocuments(uploadedDocuments.filter(d => d.id !== docId))
      toast({
        title: 'Document deleted',
        description: 'Document has been removed',
      })
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Failed to delete document',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (application?.missingFields && application.missingFields.length > 0) {
      toast({
        title: 'Incomplete application',
        description: 'Please fill in all required fields before submitting',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      await api.submitTutorApplication()
      toast({
        title: 'Application submitted',
        description: 'Your application is now under review',
      })
      router.push('/tutor')
    } catch (err) {
      toast({
        title: 'Submission failed',
        description: err instanceof Error ? err.message : 'Failed to submit application',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const groupSubjectsByCategory = () => {
    const grouped: Record<string, Subject[]> = {
      CORE: [],
      ENRICHMENT: [],
      TEST_PREP: [],
    }

    subjects.forEach(subject => {
      if (grouped[subject.category]) {
        grouped[subject.category].push(subject)
      }
    })

    return grouped
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const user = getUser()

  const groupedSubjects = groupSubjectsByCategory()
  const missingFields = application?.missingFields || []

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandHeader />
              <div>
                <h1 className="text-lg font-semibold">Tutor Application</h1>
                <p className="text-xs text-zinc-400">
                  {application?.applicationStatus === 'SUBMITTED' ? 'Under Review' : 'Complete your application'}
                </p>
              </div>
            </div>
            {saving && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <LoadingSpinner size="sm" />
                <span>Saving...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-4">
          {[
            { key: 'about', label: 'About You' },
            { key: 'teaching', label: 'Teaching' },
            { key: 'profile', label: 'Profile' },
            { key: 'documents', label: 'Documents' },
            { key: 'review', label: 'Review' },
          ].map((s, index) => (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    step === s.key
                      ? 'bg-primary text-black'
                      : 'bg-muted text-zinc-500'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-1 text-zinc-400">{s.label}</span>
              </div>
              {index < 4 && <div className={`flex-1 h-0.5 mx-2 ${step === s.key ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <Card className="bg-card/95 backdrop-blur-xl border border-border">
          <CardHeader>
            <CardTitle>
              {step === 'about' && 'About You'}
              {step === 'teaching' && 'Teaching Experience'}
              {step === 'profile' && 'Your Profile'}
              {step === 'documents' && 'Documents'}
              {step === 'review' && 'Review & Submit'}
            </CardTitle>
            <CardDescription>
              {step === 'about' && 'Tell us about yourself'}
              {step === 'teaching' && 'Share your teaching expertise'}
              {step === 'profile' && 'Create your tutor profile'}
              {step === 'documents' && 'Upload your CV and certificates'}
              {step === 'review' && 'Review your application before submitting'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: About You */}
            {step === 'about' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleFieldChange('firstName', e.target.value)}
                      placeholder="Your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleFieldChange('lastName', e.target.value)}
                      placeholder="Your last name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Middle Name (Optional)</Label>
                  <Input
                    value={formData.middleName}
                    onChange={(e) => handleFieldChange('middleName', e.target.value)}
                    placeholder="Your middle name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Birthday (Day and Month) *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      value={formData.birthday?.split('-')[1] || ''}
                      onValueChange={(month) => {
                        const day = formData.birthday?.split('-')[2] || ''
                        handleFieldChange('birthday', `1900-${month}-${day}`)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
                          <SelectItem key={m} value={m}>
                            {new Date(2000, parseInt(m) - 1).toLocaleString('default', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={formData.birthday?.split('-')[2] || ''}
                      onValueChange={(day) => {
                        const month = formData.birthday?.split('-')[1] || ''
                        handleFieldChange('birthday', `1900-${month}-${day}`)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                          <SelectItem key={d} value={d.toString().padStart(2, '0')}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-zinc-400">So we can celebrate you</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Country *</Label>
                    <Input
                      value={formData.country}
                      onChange={(e) => handleFieldChange('country', e.target.value)}
                      placeholder="Your country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      placeholder="Your city"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Highest Qualification *</Label>
                  <Select
                    value={formData.highestQualification}
                    onValueChange={(value) => handleFieldChange('highestQualification', value as HighestQualification)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUALIFICATIONS.map(qual => (
                        <SelectItem key={qual.value} value={qual.value}>
                          {qual.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Teaching */}
            {step === 'teaching' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Subjects You Can Teach *</Label>
                  {Object.entries(groupedSubjects).map(([category, categorySubjects]) => (
                    <div key={category} className="space-y-2">
                      <p className="text-sm font-medium text-zinc-400">{SUBJECT_CATEGORIES[category as keyof typeof SUBJECT_CATEGORIES]}</p>
                      <div className="flex flex-wrap gap-2">
                        {categorySubjects.map(subject => (
                          <button
                            key={subject.id}
                            type="button"
                            onClick={() => {
                              const subjects = formData.subjects || []
                              if (subjects.includes(subject.id)) {
                                handleFieldChange('subjects', subjects.filter(s => s !== subject.id))
                              } else {
                                handleFieldChange('subjects', [...subjects, subject.id])
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              (formData.subjects || []).includes(subject.id)
                                ? 'bg-primary text-black'
                                : 'bg-muted text-zinc-400 hover:text-white'
                            }`}
                          >
                            {subject.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Label>Levels You Can Teach *</Label>
                  <div className="flex flex-wrap gap-2">
                    {LEVELS.map(level => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => {
                          const levels = formData.levels || []
                          if (levels.includes(level.value)) {
                            handleFieldChange('levels', levels.filter(l => l !== level.value))
                          } else {
                            handleFieldChange('levels', [...levels, level.value])
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          (formData.levels || []).includes(level.value)
                            ? 'bg-primary text-black'
                            : 'bg-muted text-zinc-400 hover:text-white'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Years of Teaching Experience *</Label>
                  <Input
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => handleFieldChange('yearsOfExperience', parseInt(e.target.value) || 0)}
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Why Do You Want to Teach? *</Label>
                  <Textarea
                    value={formData.whyTeach}
                    onChange={(e) => handleFieldChange('whyTeach', e.target.value)}
                    placeholder="Tell us what motivates you to teach..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>How Did You Hear About Us? *</Label>
                  <Select
                    value={formData.howHeard}
                    onValueChange={(value) => handleFieldChange('howHeard', value as HowHeardSource)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {HEARD_ABOUT.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Profile */}
            {step === 'profile' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Profile Picture</Label>
                  <div className="flex items-start gap-4">
                    <Avatar
                      fullName={`${formData.firstName} ${formData.lastName}`}
                      profilePictureUrl={profilePicturePreview}
                      size="lg"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('profile-picture')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                        <input
                          id="profile-picture"
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={handleProfilePictureSelect}
                          className="hidden"
                        />
                        {profilePicture && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleProfilePictureUpload}
                              disabled={saving}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setProfilePicture(null)
                                setProfilePicturePreview(null)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">JPEG, PNG, GIF, or WebP. Max 5MB.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>A Little About You *</Label>
                  <p className="text-xs text-zinc-400">Up to 3 paragraphs, maximum 180 words</p>
                  <Textarea
                    value={formData.aboutYou}
                    onChange={(e) => handleFieldChange('aboutYou', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={6}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-400">
                      Word count: {getWordCount(formData.aboutYou || '')} / 180
                    </p>
                    {getWordCount(formData.aboutYou || '') > 180 && (
                      <p className="text-xs text-destructive">Exceeds word limit</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Documents */}
            {step === 'documents' && (
              <div className="space-y-6">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-500">Private Documents</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Only the review team can open these documents. Your CV and certificates will not be shared with anyone else.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Upload Documents</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('documents')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select Files
                    </Button>
                    <input
                      id="documents"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      multiple
                      onChange={handleDocumentSelect}
                      className="hidden"
                    />
                    <p className="text-xs text-zinc-400 self-center">
                      PDF, DOC, DOCX, JPG, PNG. Max 5MB each. Max 5 files total.
                    </p>
                  </div>
                </div>

                {/* Pending uploads */}
                {documents.length > 0 && (
                  <div className="space-y-2">
                    <Label>Pending Uploads</Label>
                    <div className="space-y-2">
                      {documents.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-zinc-400" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleDocumentUpload(file)}
                              disabled={saving}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Uploaded documents */}
                {uploadedDocuments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Documents</Label>
                    <div className="space-y-2">
                      {uploadedDocuments.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{doc.fileName}</span>
                            <Badge variant="outline" className="text-xs">Uploaded</Badge>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDocumentDelete(doc.id)}
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Review */}
            {step === 'review' && (
              <div className="space-y-6">
                {missingFields.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-destructive">Missing Required Fields</p>
                        <ul className="text-xs text-zinc-400 mt-2 list-disc list-inside">
                          {missingFields.map(field => (
                            <li key={field}>{field}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Personal Information</h3>
                    <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                      <p><span className="text-zinc-400">Name:</span> {formData.firstName} {formData.middleName} {formData.lastName}</p>
                      <p><span className="text-zinc-400">Phone:</span> {formData.phone}</p>
                      <p><span className="text-zinc-400">Birthday:</span> {formData.birthday}</p>
                      <p><span className="text-zinc-400">Location:</span> {formData.city}, {formData.country}</p>
                      <p><span className="text-zinc-400">Qualification:</span> {QUALIFICATIONS.find(q => q.value === formData.highestQualification)?.label}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Teaching Information</h3>
                    <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                      <p><span className="text-zinc-400">Subjects:</span> {formData.subjects?.length || 0} selected</p>
                      <p><span className="text-zinc-400">Levels:</span> {formData.levels?.map(l => LEVELS.find(lev => lev.value === l)?.label).join(', ')}</p>
                      <p><span className="text-zinc-400">Experience:</span> {formData.yearsOfExperience} years</p>
                      <p><span className="text-zinc-400">Why Teach:</span> {formData.whyTeach}</p>
                      <p><span className="text-zinc-400">Heard About:</span> {HEARD_ABOUT.find(h => h.value === formData.howHeard)?.label}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Profile</h3>
                    <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                      <p><span className="text-zinc-400">About:</span> {formData.aboutYou}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Documents</h3>
                    <div className="bg-muted rounded-lg p-4 text-sm">
                      <p>{uploadedDocuments.length} document(s) uploaded</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const steps: Step[] = ['about', 'teaching', 'profile', 'documents', 'review']
                  const currentIndex = steps.indexOf(step)
                  if (currentIndex > 0) setStep(steps[currentIndex - 1])
                }}
                disabled={step === 'about'}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {step === 'review' ? (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || missingFields.length > 0}
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    const steps: Step[] = ['about', 'teaching', 'profile', 'documents', 'review']
                    const currentIndex = steps.indexOf(step)
                    if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1])
                  }}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
