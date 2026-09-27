import type { EditorState, LayoutResult } from '../types'
import { applyTextCase } from './text'

const slugify = (value: string, separator = '-') =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), '') || 'graphic'

const formatDate = () =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  })
    .format(new Date())
    .replace(/\//g, '')

export const buildFilename = (
  brandName: string,
  state: EditorState,
  layout: LayoutResult,
) => {
  const copyText = state.lines
    .map((line) => applyTextCase(line, state.textCase).trim())
    .filter(Boolean)
    .join(' ')

  if (copyText) {
    return [slugify(copyText, '_'), formatDate()].join('_')
  }

  const parts = [slugify(brandName, '_'), `${layout.width}px`, state.exportFormat]
  if (state.exportScale > 1) {
    parts.push(`${state.exportScale}x`)
  }
  if (state.transparentBackground && state.exportFormat !== 'jpeg') {
    parts.push('transparent')
  }
  parts.push(formatDate())
  return parts.join('_')
}
