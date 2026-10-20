import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Loader } from 'lucide-react'
import { uploadMarkdownImage } from '../../lib/storage'
import { IMAGE_TYPES, insertMarkdownImage, validateMarkdownImage } from '../../lib/markdownImages'
import './MarkdownEditor.css'

export default function MarkdownEditor({
  id, name, label, value = '', onChange, uploadFolder, onUploadingChange,
  placeholder, rows = 12, required = false, disabled = false, className = ''
}) {
  const textareaRef = useRef(null)
  const inputRef = useRef(null)
  const selectionRef = useRef(null)
  const mountedRef = useRef(false)
  const uploadingRef = useRef(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      onUploadingChange?.(false)
    }
  }, [onUploadingChange])

  const chooseImage = () => {
    const textarea = textareaRef.current
    selectionRef.current = { start: textarea.selectionStart, end: textarea.selectionEnd }
    inputRef.current.click()
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || uploadingRef.current) return
    setError('')

    try {
      validateMarkdownImage(file)
      uploadingRef.current = true
      setUploading(true)
      onUploadingChange?.(true)
      const url = await uploadMarkdownImage(file, uploadFolder)
      if (!mountedRef.current) return

      const selection = selectionRef.current || { start: value.length, end: value.length }
      const result = insertMarkdownImage(value, selection.start, selection.end, file.name, url)
      onChange(result.content)
      setImageUrl(url)
      requestAnimationFrame(() => {
        if (!mountedRef.current) return
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(result.cursor, result.cursor)
      })
    } catch (err) {
      if (mountedRef.current) setError('Görsel yüklenemedi: ' + (err.message || 'Lütfen tekrar deneyin.'))
    } finally {
      uploadingRef.current = false
      if (mountedRef.current) {
        setUploading(false)
        onUploadingChange?.(false)
      }
    }
  }

  return (
    <div className="form-group markdown-editor">
      <label htmlFor={id}>{label}</label>
      <div className="markdown-editor-toolbar">
        <button type="button" className="btn btn-secondary" onClick={chooseImage} disabled={disabled || uploading}>
          {uploading ? <Loader size={16} className="spin" /> : <ImagePlus size={16} />}
          {uploading ? 'Görsel yükleniyor…' : 'Görsel yükle'}
        </button>
        <span>PNG, JPEG, WebP, GIF, AVIF · En fazla 10 MB</span>
        <input ref={inputRef} type="file" accept={Object.keys(IMAGE_TYPES).join(',')} onChange={handleUpload} hidden />
      </div>
      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        className={`input-field markdown-editor-textarea ${className}`}
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={event => onChange(event.target.value)}
        readOnly={uploading}
        disabled={disabled}
        required={required}
        aria-describedby={`${id}-help`}
        aria-busy={uploading}
      />
      <p id={`${id}-help`} className="markdown-editor-help">
        Görsel yüklenince imlecin bulunduğu yere eklenir. Elle eklemek için: <code>![Görsel açıklaması](görsel-adresi)</code>
      </p>
      <div aria-live="polite" role="status">
        {uploading && <p className="markdown-editor-help">Görsel yükleniyor, lütfen bekleyin…</p>}
        {imageUrl && (
          <div className="markdown-editor-url">
            <label htmlFor={`${id}-image-url`}>Son yüklenen görselin adresi</label>
            <input id={`${id}-image-url`} className="input-field" value={imageUrl} readOnly onFocus={event => event.target.select()} />
          </div>
        )}
      </div>
      {error && <p className="markdown-editor-error" role="alert">{error}</p>}
    </div>
  )
}
