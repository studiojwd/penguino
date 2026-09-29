import { useRef, useState } from 'react'
import Icon from './Icon'
import { trackFileSelected } from '../utils/analytics'

interface DropZoneProps {
  accept: string
  file: File | null
  helpText: string
  onFile: (file: File) => void
}

const DropZone = ({ accept, file, helpText, onFile }: DropZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  return (
    <div
      className={`drop-zone ${dragging ? 'drop-zone--active' : ''}`}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        const nextFile = event.dataTransfer.files[0]
        if (nextFile) {
          void trackFileSelected(nextFile)
          onFile(nextFile)
        }
      }}
    >
      <input
        ref={inputRef}
        accept={accept}
        className="visually-hidden"
        onChange={(event) => {
          const nextFile = event.target.files?.[0]
          if (nextFile) {
            void trackFileSelected(nextFile)
            onFile(nextFile)
          }
          event.target.value = ''
        }}
        type="file"
      />
      <span className="drop-zone__icon"><Icon name="upload" /></span>
      <strong>{file ? file.name : 'Drop an image here'}</strong>
      <p>{file ? `${(file.size / 1024).toFixed(1)} KB` : helpText}</p>
      <button className="secondary-button" onClick={() => inputRef.current?.click()} type="button">
        {file ? 'Choose another' : 'Choose image'}
      </button>
    </div>
  )
}

export default DropZone
