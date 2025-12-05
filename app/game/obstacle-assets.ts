// SVG strings converted to Data URLs for easy Canvas usage

const svgToDataUrl = (svg: string) => `data:image/svg+xml;base64,${btoa(svg)}`

export const OBSTACLE_TYPES = ['banana', 'rock', 'puddle', 'cone'] as const
export type ObstacleType = typeof OBSTACLE_TYPES[number]

const bananaSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M20,70 Q50,20 80,70 Q50,50 20,70 Z" fill="#FCD34D" stroke="#B45309" stroke-width="3"/>
  <path d="M50,20 L50,40" stroke="#B45309" stroke-width="2"/>
  <path d="M30,60 Q50,40 70,60" fill="none" stroke="#B45309" stroke-width="2"/>
</svg>`

const rockSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M20,80 L30,50 L50,30 L80,50 L90,80 Z" fill="#9CA3AF" stroke="#4B5563" stroke-width="3" stroke-linejoin="round"/>
  <path d="M30,80 L80,80" stroke="#4B5563" stroke-width="3"/>
  <circle cx="40" cy="60" r="2" fill="#4B5563"/>
  <circle cx="60" cy="50" r="3" fill="#4B5563"/>
</svg>`

const puddleSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M20,60 Q30,40 50,60 T80,60 T90,70 T50,90 T20,60 Z" fill="#60A5FA" stroke="#2563EB" stroke-width="2" opacity="0.8"/>
  <path d="M30,65 Q35,60 40,65" fill="none" stroke="white" stroke-width="2" opacity="0.5"/>
</svg>`

const coneSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="80" width="60" height="10" fill="#EA580C" rx="2"/>
  <path d="M30,80 L50,20 L70,80 Z" fill="#F97316"/>
  <path d="M34,70 L66,70 L64,60 L36,60 Z" fill="white"/>
  <path d="M39,50 L61,50 L59,40 L41,40 Z" fill="white"/>
</svg>`

export const OBSTACLE_ASSETS: Record<ObstacleType, string> = {
  banana: svgToDataUrl(bananaSvg),
  rock: svgToDataUrl(rockSvg),
  puddle: svgToDataUrl(puddleSvg),
  cone: svgToDataUrl(coneSvg),
}

