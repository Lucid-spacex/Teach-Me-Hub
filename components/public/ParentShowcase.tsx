import { Check, CreditCard, MessageCircle, UserRoundCheck } from 'lucide-react'

const features = [
  {
    title: 'Tutors reviewed before matching',
    description: 'Applications are reviewed before tutors are approved to work with learners.',
    icon: UserRoundCheck,
  },
  {
    title: 'Progress you can follow',
    description: 'Grades are reviewed by an administrator before they are shared with families.',
    icon: Check,
  },
  {
    title: 'Communication in one place',
    description: 'Keep class details, learning updates, and family conversations together.',
    icon: MessageCircle,
  },
  {
    title: 'Payment records you can keep',
    description: 'Secure payments include receipts for your family account.',
    icon: CreditCard,
  },
]

export function ParentFeatureList() {
  return (
    <section id="features" className="adult-section adult-features" aria-labelledby="parent-features-title">
      <div className="adult-section-inner">
        <div className="adult-section-heading">
          <p className="adult-eyebrow">Support around every lesson</p>
          <h2 id="parent-features-title">The details that make learning <em className="adult-accent">clear.</em></h2>
          <p className="adult-section-copy">Practical support before class, during learning, and after each lesson.</p>
        </div>
        <ol className="adult-feature-list">
          {features.map(({ title, description, icon: Icon }, index) => (
            <li key={title}>
              <span className="adult-list-number">0{index + 1}</span>
              <div className="adult-feature-copy">
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <Icon className="adult-feature-icon" strokeWidth={1.5} aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
