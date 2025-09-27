import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ size: string[] }> }
) {
  const { size } = await params;
  const [width = '400', height = '400'] = size;
  
  // Create SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="50%" y="50%" width="60" height="60" rx="8" fill="#d1d5db" transform="translate(-30, -30)"/>
      <circle cx="50%" cy="40%" r="8" fill="#9ca3af"/>
      <path d="M ${50 - 15}% ${60}% L ${50 - 5}% ${50}% L ${50 + 5}% ${60}% L ${50 + 15}% ${50}% Z" fill="#9ca3af"/>
      <text x="50%" y="80%" font-family="system-ui, sans-serif" font-size="12" fill="#6b7280" text-anchor="middle">
        ${width}×${height}
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400', // Cache for 1 day
    },
  });
}
