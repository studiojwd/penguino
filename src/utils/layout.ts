import { resolveFontWeight } from '../constants'
import type { EditorState, LayoutResult } from '../types'
import { applyTextCase } from './text'

const measureCanvas = document.createElement('canvas')
const measureContext = measureCanvas.getContext('2d')

const getTextWidth = (text: string, font: string, letterSpacing: number) => {
  if (!measureContext) {
    return text.length * 16
  }

  measureContext.font = font
  const baseWidth = measureContext.measureText(text || ' ').width
  const spacingWidth = Math.max(0, text.length - 1) * letterSpacing
  return baseWidth + spacingWidth
}

const wrapLine = (text: string, maxWidth: number, font: string, letterSpacing: number) => {
  const collapsed = text.replace(/\s+/g, ' ').trim()
  if (!collapsed) {
    return []
  }

  if (getTextWidth(collapsed, font, letterSpacing) <= maxWidth) {
    return [collapsed]
  }

  const words = collapsed.split(' ')
  const wrapped: string[] = []
  let currentLine = ''

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word
    if (getTextWidth(candidate, font, letterSpacing) <= maxWidth || !currentLine) {
      currentLine = candidate
      continue
    }

    wrapped.push(currentLine)
    currentLine = word
  }

  if (currentLine) {
    wrapped.push(currentLine)
  }

  return wrapped
}

export const computeLayout = (state: EditorState): LayoutResult => {
  const resolvedFontWeight = resolveFontWeight(state.fontFamily, state.fontWeight)
  const fontSize = Math.max(1, state.fontSizePx)
  const letterSpacing = state.letterSpacing
  const font = `${resolvedFontWeight} ${fontSize}px "${state.fontFamily}", sans-serif`
  const availableWidth = Math.max(32, state.exportWidth - state.padding * 2)
  const textBoxWidth = Math.max(32, availableWidth * (state.maxTextWidthPercent / 100))
  const sourceLines = state.lines
    .map((line) => applyTextCase(line, state.textCase).trim())
    .filter(Boolean)

  const wrappedLines = sourceLines.flatMap((line) => wrapLine(line, textBoxWidth, font, letterSpacing))
  const activeLines = wrappedLines.length > 0 ? wrappedLines : [' ']
  const lineWidths = activeLines.map((line) => getTextWidth(line, font, letterSpacing))
  const maxLineWidth = Math.max(...lineWidths, 1)
  const overflowWord =
    sourceLines
      .flatMap((line) => line.split(/\s+/))
      .find((word) => getTextWidth(word, font, letterSpacing) > textBoxWidth) ?? null
  const lineHeightPx = Math.max(fontSize * state.lineSpacing, fontSize * 0.92)
  const textBlockHeight = fontSize + Math.max(0, activeLines.length - 1) * lineHeightPx
  const autoHeight = Math.ceil(state.padding * 2 + textBlockHeight)
  const height = state.autoHeight ? autoHeight : Math.max(state.manualHeight, autoHeight)

  let textStartY = state.padding
  if (state.verticalAlign === 'center') {
    textStartY = (height - textBlockHeight) / 2
  }
  if (state.verticalAlign === 'bottom') {
    textStartY = height - state.padding - textBlockHeight
  }

  return {
    width: state.exportWidth,
    height: Math.ceil(height),
    textBlockHeight,
    fontSize,
    letterSpacing,
    lines: activeLines,
    lineWidths,
    maxLineWidth,
    textStartY,
    lineHeightPx,
    textBoxWidth,
    hasOverflow: overflowWord !== null,
    overflowWord
  }
}

export const lineStartX = (
  width: number,
  padding: number,
  lineWidth: number,
  textAlign: EditorState['textAlign'],
) => {
  if (textAlign === 'left') {
    return padding
  }
  if (textAlign === 'right') {
    return width - padding - lineWidth
  }
  return (width - lineWidth) / 2
}
