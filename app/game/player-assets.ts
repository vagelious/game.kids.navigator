// SVG string converted to Data URL for easy Canvas usage

const svgToDataUrl = (svg: string) => `data:image/svg+xml;base64,${btoa(svg)}`

const kidAvatarSvg = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Face -->
  <circle cx="50" cy="50" r="40" fill="#FFD700" stroke="#B45309" stroke-width="3"/>
  
  <!-- Hair/Hat -->
  <path d="M15,40 Q50,5 85,40" fill="#3B82F6" stroke="#1D4ED8" stroke-width="3"/>
  
  <!-- Eyes -->
  <circle cx="35" cy="55" r="5" fill="#000"/>
  <circle cx="65" cy="55" r="5" fill="#000"/>
  
  <!-- Smile -->
  <path d="M30,70 Q50,85 70,70" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/>
  
  <!-- Cheeks -->
  <circle cx="25" cy="65" r="4" fill="#F87171" opacity="0.6"/>
  <circle cx="75" cy="65" r="4" fill="#F87171" opacity="0.6"/>
</svg>`

export const DEFAULT_KID_AVATAR = svgToDataUrl(kidAvatarSvg)

