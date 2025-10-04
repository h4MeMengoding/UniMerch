import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all variant types
export async function GET() {
  try {
    const variantTypes = await prisma.variantType.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(variantTypes);
  } catch (error) {
    console.error('Error fetching variant types:', error);
    return NextResponse.json(
      { message: 'Error fetching variant types' },
      { status: 500 }
    );
  }
}

// POST - Create new variant type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { message: 'Nama varian wajib diisi' },
        { status: 400 }
      );
    }

    // Check if variant type already exists
    const existingVariant = await prisma.variantType.findUnique({
      where: { name: name.trim() }
    });

    if (existingVariant) {
      return NextResponse.json(
        { message: 'Varian dengan nama ini sudah ada' },
        { status: 400 }
      );
    }

    const variantType = await prisma.variantType.create({
      data: {
        name: name.trim()
      }
    });

    return NextResponse.json(variantType, { status: 201 });
  } catch (error) {
    console.error('Error creating variant type:', error);
    return NextResponse.json(
      { message: 'Error creating variant type' },
      { status: 500 }
    );
  }
}