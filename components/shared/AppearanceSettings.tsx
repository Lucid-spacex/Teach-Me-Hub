'use client'

import { useTheme } from '@/lib/theme-provider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Palette, Sun, Moon, Monitor } from 'lucide-react'

export function AppearanceSettings() {
  const { theme, setTheme, mounted } = useTheme()

  if (!mounted) return null

  return (
    <Card className="bg-card border-brand-gold/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-brand-gold" />
          Appearance
        </CardTitle>
        <CardDescription>
          Customize the visual theme of the application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Label className="text-sm">Theme Preference</Label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
                theme === 'light' 
                  ? 'border-brand-gold bg-brand-gold/10 text-brand-gold' 
                  : 'border-border bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              <Sun className="h-4 w-4" />
              Light
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
                theme === 'dark' 
                  ? 'border-brand-gold bg-brand-gold/10 text-brand-gold' 
                  : 'border-border bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              <Moon className="h-4 w-4" />
              Dark
            </button>
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
                theme === 'system' 
                  ? 'border-brand-gold bg-brand-gold/10 text-brand-gold' 
                  : 'border-border bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              <Monitor className="h-4 w-4" />
              System
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
