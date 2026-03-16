'use client'

import { useState, useRef } from 'react'
import { Upload, Trash2, Save, Image as ImageIcon, Smartphone } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { uploadLogo, removeLogo, updateAppSetting, uploadPwaIcon } from '@/app/actions/settings-actions'
import { useRouter } from 'next/navigation'

interface SettingsFormProps {
  appName: string
  logoUrl: string | null
  pwaIconUrl: string | null
}

export function SettingsForm({ appName, logoUrl, pwaIconUrl }: SettingsFormProps) {
  const [name, setName] = useState(appName)
  const [preview, setPreview] = useState<string | null>(logoUrl)
  const [pwaPreview, setPwaPreview] = useState<string | null>(pwaIconUrl)
  const [uploading, setUploading] = useState(false)
  const [pwaUploading, setPwaUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const pwaFileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('logo', file)

    const result = await uploadLogo(formData)
    setUploading(false)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      setPreview(result.data!)
      toast({ title: 'Berhasil', description: 'Logo berhasil diupload' })
      router.refresh()
    }
  }

  async function handleRemoveLogo() {
    setUploading(true)
    const result = await removeLogo()
    setUploading(false)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      toast({ title: 'Berhasil', description: 'Logo berhasil dihapus' })
      router.refresh()
    }
  }

  async function handlePwaIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPwaUploading(true)
    const formData = new FormData()
    formData.append('pwa_icon', file)

    const result = await uploadPwaIcon(formData)
    setPwaUploading(false)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      setPwaPreview(result.data!)
      toast({ title: 'Berhasil', description: 'PWA icon berhasil diupload' })
      router.refresh()
    }
  }

  async function handleSaveName() {
    if (!name.trim()) return
    setSaving(true)
    const result = await updateAppSetting('app_name', name.trim())
    setSaving(false)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Berhasil', description: 'Nama aplikasi berhasil diupdate' })
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      {/* Logo Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-1">Logo Aplikasi</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Upload logo untuk ditampilkan di header & halaman login. Format: PNG, JPG, WebP, SVG. Maks 2MB.
        </p>

        <div className="flex items-start gap-6">
          {/* Preview */}
          <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/50 overflow-hidden flex-shrink-0">
            {preview ? (
              <img
                src={preview}
                alt="App logo"
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Logo'}
              </label>
            </div>

            {preview && (
              <button
                onClick={handleRemoveLogo}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Logo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PWA Icon Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-1">
          <Smartphone className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Icon Aplikasi (PWA)</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Icon yang muncul di home screen HP saat app di-install. Gunakan gambar <strong>PNG kotak (512x512px)</strong> untuk hasil terbaik.
        </p>

        <div className="flex items-start gap-6">
          {/* Preview */}
          <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/50 overflow-hidden flex-shrink-0">
            {pwaPreview ? (
              <img
                src={pwaPreview}
                alt="PWA icon"
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <Smartphone className="w-8 h-8 text-muted-foreground" />
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div>
              <input
                ref={pwaFileRef}
                type="file"
                accept="image/png"
                onChange={handlePwaIconUpload}
                className="hidden"
                id="pwa-icon-upload"
              />
              <label
                htmlFor="pwa-icon-upload"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {pwaUploading ? 'Uploading...' : 'Upload Icon'}
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Setelah upload, user perlu re-install app untuk melihat icon baru.
            </p>
          </div>
        </div>
      </div>

      {/* App Name Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-1">Nama Aplikasi</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Nama yang ditampilkan di seluruh aplikasi
        </p>

        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex h-10 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Nama aplikasi"
          />
          <button
            onClick={handleSaveName}
            disabled={saving || !name.trim() || name.trim() === appName}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
