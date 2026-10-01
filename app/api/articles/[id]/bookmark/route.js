import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { requireAuth } from '@/lib/auth';

// POST /api/articles/[id]/bookmark - Toggle bookmark
export async function POST(request, { params }) {
  try {
    const { user, error } = await requireAuth(request);
    if (error) return error;

    await dbConnect();
    const { id } = await params;
    const fullUser = await User.findById(user._id);

    const idx = fullUser.bookmarks.indexOf(id);
    if (idx > -1) {
      fullUser.bookmarks.splice(idx, 1);
    } else {
      fullUser.bookmarks.push(id);
    }

    await fullUser.save();
    return NextResponse.json({ bookmarked: idx === -1, bookmarks: fullUser.bookmarks });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
