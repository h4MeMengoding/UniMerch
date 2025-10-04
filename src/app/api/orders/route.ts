import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { createInvoice } from '@/lib/xendit';

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const { userId } = decoded;

    const body = await request.json();
    const { productId, quantity = 1, variantOptions = [] } = body;

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check stock
    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const totalAmount = product.price * quantity;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        status: 'BELUM_DIBAYAR',
        items: {
          create: {
            productId,
            quantity,
            price: product.price,
            variantOptions: {
              connect: variantOptions.map((id: number) => ({ id })),
            },
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
            variantOptions: true,
          },
        },
      },
    });


    // Prepare items for Xendit invoice
    const invoiceItems = [
      {
        name: product.name,
        quantity,
        price: product.price,
      },
    ];

    // Create Xendit invoice
    const invoice = await createInvoice(
      order.id,
      totalAmount,
      `Order #${order.id} - ${product.name}`,
      user.email,
      invoiceItems,
      user.name || undefined
    );

    // Save payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        xenditInvoiceId: invoice.id!,
        amount: totalAmount,
        paymentUrl: invoice.invoiceUrl!,
        status: 'PENDING',
      },
    });

    // Update product stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });

    return NextResponse.json({
      order,
      paymentUrl: invoice.invoiceUrl,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}