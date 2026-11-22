'use client'

import { useRouter } from 'next/navigation'
import { GraduationCap, Users, Calendar, DollarSign, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, TrendingUp, Clock, Zap } from 'lucide-react'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default function TutorsContent() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Become a Tutor
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Share your knowledge.{' '}
                <span className="bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
                  Shape futures.
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Join a community of passionate educators making a real difference in students' lives. 
                Teach on your terms with flexible scheduling and competitive pay.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => router.push('/tutor/register')}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-bold text-background shadow-lg transition-all hover:bg-primary/90 hover:scale-105"
                >
                  Start Your Application
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                <button
                  onClick={() => router.push('/tutor/login')}
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-muted px-6 py-3 font-bold transition-all hover:bg-muted/80"
                >
                  Tutor Sign In
                </button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-yellow-500/20 rounded-3xl blur-3xl" />
              <div className="relative rounded-3xl border border-border bg-card p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-background" />
                  </div>
                  <div>
                    <p className="font-bold">Dr. Adewale A.</p>
                    <p className="text-sm text-muted-foreground">Mathematics Tutor</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">45+ active students</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">₦150,000/month average earnings</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">4.9/5 student rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t border-border bg-muted/30 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Why Teach with Teachmenest?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to focus on what matters most - teaching.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Flexible Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Set your own availability and teach when it works for you.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Competitive Pay</h3>
              <p className="text-sm text-muted-foreground">
                Monthly salary structure with predictable income and growth opportunities.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Matching System</h3>
              <p className="text-sm text-muted-foreground">
                Get matched with students based on your subjects and expertise.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Secure Platform</h3>
              <p className="text-sm text-muted-foreground">
                Protected payments, verified families, and safety-first approach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Simple Application Process
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Get started in just a few steps.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-background font-black text-xl">
                1
              </div>
              <h3 className="mt-4 font-bold text-lg">Submit Application</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Tell us about your qualifications, subjects, and teaching experience.
              </p>
            </div>
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-background font-black text-xl">
                2
              </div>
              <h3 className="mt-4 font-bold text-lg">Vetting Process</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Our team reviews your application and credentials for quality assurance.
              </p>
            </div>
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-background font-black text-xl">
                3
              </div>
              <h3 className="mt-4 font-bold text-lg">Start Teaching</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Once approved, set your availability and start receiving student matches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="border-t border-border bg-muted/30 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                What We're Looking For
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join us if you're passionate about education and have the skills to back it up.
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span>Strong subject knowledge in your teaching areas</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span>Excellent communication and interpersonal skills</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span>Patience and ability to adapt to different learning styles</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span>Reliable internet connection for online sessions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span>Commitment to student success and professional growth</span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8">
              <h3 className="font-bold text-lg mb-4">Ready to get started?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Applications are reviewed within 3-5 business days. We look forward to learning more about you!
              </p>
              <button
                onClick={() => router.push('/tutor/register')}
                className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 font-bold text-background shadow-lg transition-all hover:bg-primary/90 hover:scale-105"
              >
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Start Making a Difference Today
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join hundreds of tutors already helping students achieve their goals.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push('/tutor/register')}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 font-bold text-background shadow-lg transition-all hover:bg-primary/90 hover:scale-105"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Begin Your Application
            </button>
            <button
              onClick={() => router.push('/tutor/login')}
              className="inline-flex items-center justify-center rounded-xl border border-border bg-muted px-8 py-4 font-bold transition-all hover:bg-muted/80"
            >
              Already a Tutor? Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
