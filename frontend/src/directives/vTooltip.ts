import type { Directive, DirectiveBinding } from 'vue'

let tooltipEl: HTMLDivElement | null = null

function getOrCreateTooltip(): HTMLDivElement {
  if (!tooltipEl) {
    tooltipEl = document.createElement('div')
    tooltipEl.className = 'tooltip'
    document.body.appendChild(tooltipEl)
  }
  return tooltipEl
}

function onMouseOver(e: MouseEvent): void {
  const item = (e.currentTarget as HTMLElement)
  const data = item.dataset.tooltipContent
  if (!data) return

  const tooltip = getOrCreateTooltip()
  const parts = data.split('|')
  tooltip.innerHTML = `
    <div class="tooltip-title">${parts[0] || ''}</div>
    <div class="tooltip-effect">${parts[1] || ''}</div>
    ${parts[2] ? `<div class="tooltip-meta">${parts[2]}</div>` : ''}
  `
  tooltip.classList.add('visible')
}

function onMouseMove(e: MouseEvent): void {
  const tooltip = getOrCreateTooltip()
  if (!tooltip.classList.contains('visible')) return
  const x = Math.min(e.clientX + 12, window.innerWidth - 270)
  const y = Math.min(e.clientY + 12, window.innerHeight - 100)
  tooltip.style.left = `${x}px`
  tooltip.style.top = `${y}px`
}

function onMouseOut(): void {
  const tooltip = getOrCreateTooltip()
  tooltip.classList.remove('visible')
}

export const vTooltip: Directive<HTMLElement, string> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
    el.dataset.tooltipContent = binding.value
    el.addEventListener('mouseover', onMouseOver)
    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseout', onMouseOut)
  },
  updated(el: HTMLElement, binding: DirectiveBinding<string>) {
    el.dataset.tooltipContent = binding.value
  },
  beforeUnmount(el: HTMLElement) {
    el.removeEventListener('mouseover', onMouseOver)
    el.removeEventListener('mousemove', onMouseMove)
    el.removeEventListener('mouseout', onMouseOut)
  },
}
