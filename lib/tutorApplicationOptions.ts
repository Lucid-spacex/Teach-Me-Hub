import { HighestQualification, TutorLevel, HowHeardSource } from './types'

export const QUALIFICATIONS: { value: HighestQualification; label: string }[] = [
  { value: 'SSCE_WAEC', label: 'SSCE / WAEC' },
  { value: 'OND_NCE', label: 'OND / NCE' },
  { value: 'HND', label: 'HND' },
  { value: 'BACHELORS', label: "Bachelor's Degree" },
  { value: 'BED_PGDE', label: 'B.Ed / PGDE' },
  { value: 'MASTERS', label: "Master's Degree" },
  { value: 'PHD', label: 'PhD' },
  { value: 'OTHER', label: 'Other' },
]

export const LEVELS: { value: TutorLevel; label: string }[] = [
  { value: 'PRESCHOOL_TO_G1', label: 'Preschool to Grade 1' },
  { value: 'G2_TO_G4', label: 'Grade 2 to Grade 4' },
  { value: 'G5_TO_G8', label: 'Grade 5 to Grade 8' },
  { value: 'G9_TO_G12', label: 'Grade 9 to Grade 12' },
  { value: 'EXAM_LEVELS', label: 'Exam Levels' },
]

export const HEARD_ABOUT: { value: HowHeardSource; label: string }[] = [
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

export const SUBJECT_CATEGORIES = {
  CORE: 'Academic',
  ENRICHMENT: 'Extracurricular',
  TEST_PREP: 'Test Preparation',
}
