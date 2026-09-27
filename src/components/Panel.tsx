import type { PropsWithChildren, ReactNode } from 'react'

interface PanelProps extends PropsWithChildren {
  title: string
  eyebrow?: string
  actions?: ReactNode
  collapsible?: boolean
  collapsed?: boolean
  onToggle?: () => void
}

const Panel = ({
  title,
  eyebrow,
  actions,
  children,
  collapsible = false,
  collapsed = false,
  onToggle
}: PanelProps) => (
  <section className={`panel ${collapsed ? 'panel--collapsed' : ''}`}>
    <div className="panel__header">
      <button
        aria-expanded={!collapsed}
        className={`panel__summary ${collapsible ? 'panel__summary--interactive' : ''}`}
        disabled={!collapsible}
        onClick={onToggle}
        type="button"
      >
        <div>
          {eyebrow ? <p className="panel__eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
        </div>
        {collapsible ? <span className="panel__chevron">{collapsed ? '+' : '−'}</span> : null}
      </button>
      {actions ? <div className="panel__actions">{actions}</div> : null}
    </div>
    {!collapsed ? <div className="panel__body">{children}</div> : null}
  </section>
)

export default Panel
