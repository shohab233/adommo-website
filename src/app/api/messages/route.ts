import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const conversations = await db.findManyAsync<any>('conversations') || [];
    return NextResponse.json({ success: true, conversations });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, threadId, message, newThread } = body;

    if (action === 'create_thread' && newThread) {
      const existing = await db.findOneAsync<any>('conversations', (c: any) => c.id === newThread.id);
      if (existing) {
        return NextResponse.json({ success: true, thread: existing });
      }
      const created = await db.createAsync('conversations', newThread);
      return NextResponse.json({ success: true, thread: created });
    }

    if (action === 'send_message' && threadId && message) {
      let thread = await db.findOneAsync<any>('conversations', (c: any) => c.id === threadId);
      if (!thread) {
        thread = await db.createAsync('conversations', {
          id: threadId,
          type: threadId.startsWith('thread_batch') ? 'batch_group' : (threadId.startsWith('thread_direct') ? 'direct' : 'doubt'),
          studentName: message.senderName || 'ব্যবহারকারী',
          status: 'pending',
          messages: [],
        });
      }

      const updatedMessages = [...(thread.messages || []), message];
      const updatedThread = await db.updateAsync('conversations', thread.id, {
        messages: updatedMessages,
        lastMessageText: message.text || 'ছবি সংযুক্ত করা হয়েছে',
        lastMessageTime: 'এইমাত্র',
        lastUpdated: Date.now(),
        unreadCountTeacher: message.senderRole === 'student' ? (thread.unreadCountTeacher || 0) + 1 : (thread.unreadCountTeacher || 0),
        unreadCountStudent: message.senderRole === 'teacher' ? (thread.unreadCountStudent || 0) + 1 : (thread.unreadCountStudent || 0),
      });

      return NextResponse.json({ success: true, thread: updatedThread });
    }

    if (action === 'mark_read' && threadId) {
      const thread = await db.findOneAsync<any>('conversations', (c: any) => c.id === threadId);
      if (thread) {
        const role = body.role || 'student';
        const updatedThread = await db.updateAsync('conversations', thread.id, {
          unreadCountTeacher: role === 'teacher' ? 0 : thread.unreadCountTeacher,
          unreadCountStudent: role === 'student' ? 0 : thread.unreadCountStudent,
          messages: (thread.messages || []).map((m: any) => ({ ...m, isRead: true }))
        });
        return NextResponse.json({ success: true, thread: updatedThread });
      }
    }

    if (action === 'toggle_status' && threadId) {
      const thread = await db.findOneAsync<any>('conversations', (c: any) => c.id === threadId);
      if (thread) {
        const nextStatus = thread.status === 'solved' ? 'pending' : 'solved';
        const updatedThread = await db.updateAsync('conversations', thread.id, {
          status: nextStatus,
        });
        return NextResponse.json({ success: true, thread: updatedThread });
      }
    }

    return NextResponse.json({ success: false, error: 'অবৈধ অনুরোধ' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
