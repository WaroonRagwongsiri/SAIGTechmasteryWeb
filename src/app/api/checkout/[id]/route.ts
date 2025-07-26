// app/api/checkout/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const bookingId = params.id;

  // Check authentication
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload & { id: string };
    userId = decoded.id;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 });
    }

    // Check if base URL is configured
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.error('NEXT_PUBLIC_BASE_URL is not configured');
      return NextResponse.json({ error: 'Application URL not configured' }, { status: 500 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        mate: true,
        renter: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify user owns this booking
    if (booking.renterId !== userId) {
      return NextResponse.json({ error: 'Unauthorized access to booking' }, { status: 403 });
    }

    // Check if booking is in correct status for payment
    if (booking.status !== 'PAYMENT_PENDING') {
      return NextResponse.json({ 
        error: `Booking is not ready for payment. Current status: ${booking.status}` 
      }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: {
              name: `Booking with ${booking.mate.firstName} ${booking.mate.lastName}`,
              description: `${booking.activity} on ${new Date(booking.date).toLocaleDateString()}`,
            },
            unit_amount: Math.round(booking.totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/bookings/${booking.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/bookings/${booking.id}?canceled=true`,
      metadata: {
        bookingId: booking.id,
        renterId: booking.renterId,
        mateId: booking.mateId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    
    // Provide more specific error messages
    if (err instanceof Error) {
      if (err.message.includes('Invalid API key')) {
        return NextResponse.json({ error: 'Payment service configuration error' }, { status: 500 });
      }
      if (err.message.includes('No such customer')) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }
    }
    
    return NextResponse.json({ error: 'Failed to create payment session' }, { status: 500 });
  }
}
