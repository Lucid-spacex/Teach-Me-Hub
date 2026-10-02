import VerifyForm from '@/components/auth/VerifyForm'

export const metadata = {
  title: 'Verify Account | Teachmenest',
  description: 'Enter your OTP verification code to activate your Teachmenest account.',
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[350px] h-[350px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Grid line pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <VerifyForm />
    </div>
  )
}
