import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subscriber from '@/lib/models/Subscriber';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const existing = await Subscriber.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { message: 'You are already subscribed to the NewsHub Morning Briefing!' },
        { status: 200 }
      );
    }

    await Subscriber.create({ email: email.toLowerCase().trim() });

    return NextResponse.json(
      { message: '🎉 You are subscribed! Check your inbox for the morning briefing.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription. Please try again.' },
      { status: 500 }
    );
  }
}
