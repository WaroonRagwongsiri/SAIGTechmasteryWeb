// app/api/test-stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET(req: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        error: 'STRIPE_SECRET_KEY is not configured',
        configured: false
      }, { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      return NextResponse.json({
        error: 'NEXT_PUBLIC_BASE_URL is not configured',
        configured: false
      }, { status: 500 });
    }

    // Test Stripe connection
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    try {
      // Try to fetch account details to test connection
      const account = await stripe.accounts.retrieve();
      
      return NextResponse.json({
        configured: true,
        stripeAccount: {
          id: account.id,
          business_type: account.business_type,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled
        },
        environment: {
          baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
          nodeEnv: process.env.NODE_ENV
        }
      });
    } catch (stripeError) {
      return NextResponse.json({
        error: 'Stripe connection failed',
        stripeError: stripeError instanceof Error ? stripeError.message : 'Unknown error',
        configured: false
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Test endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      configured: false
    }, { status: 500 });
  }
} 