import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const conversations = await db.findManyAsync<any>('conversations') || [];
    return NextResponse.json(
      { success: true, conversations },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, threadId, message, newThread } = body;
    const cleanThreadId = (threadId || '').trim();

    if (action === 'create_thread' && newThread) {
      const targetId = (newThread.id || '').trim();
      const existing = await db.findOneAsync<any>('conversations', (c: any) => c.id === targetId || c._id === targetId);
      if (existing) {
        return NextResponse.json({ success: true, thread: existing });
      }
      const created = await db.createAsync('conversations', newThread);
      return NextResponse.json({ success: true, thread: created });
    }

    if (action === 'send_message' && cleanThreadId && message) {
      let thread = await db.findOneAsync<any>('conversations', (c: any) => c.id === cleanThreadId || c._id === cleanThreadId);
      if (!thread) {
        const meta = body.threadMeta || {};
        thread = await db.createAsync('conversations', {
          id: cleanThreadId,
          type: cleanThreadId.startsWith('thread_batch') ? 'batch_group' : (cleanThreadId.startsWith('thread_direct') ? 'direct' : (cleanThreadId.startsWith('thread_support') ? 'support' : 'doubt')),
          studentId: meta.studentId || message.senderId,
          studentName: meta.studentName || message.senderName || 'ব্যবহারকারী',
          studentCollege: meta.studentCollege || 'শিক্ষার্থী',
          studentAvatar: meta.studentAvatar || message.senderAvatar,
          courseId: meta.courseId,
          courseTitle: meta.courseTitle,
          teacherId: meta.teacherId,
          teacherName: meta.teacherName,
          teacherAvatar: meta.teacherAvatar,
          ticketNumber: meta.ticketNumber,
          status: body.markSolved ? 'solved' : 'pending',
          messages: [],
        });
      }

      const updatedMessages = [...(thread.messages || []), message];
      const updates: any = {
        messages: updatedMessages,
        lastMessageText: message.text || 'ছবি সংযুক্ত করা হয়েছে',
        lastMessageTime: 'এইমাত্র',
        lastUpdated: Date.now(),
        // If teacher sent a message, their own unread badge resets to 0 and student gets +1
        unreadCountTeacher: message.senderRole === 'student' ? (thread.unreadCountTeacher || 0) + 1 : 0,
        // If student sent a message, student unread badge resets to 0 and teacher gets +1
        unreadCountStudent: (message.senderRole === 'teacher' || message.senderRole === 'admin') ? (thread.unreadCountStudent || 0) + 1 : 0,
      };

      if (body.markSolved) {
        updates.status = 'solved';
      }

      const updatedThread = await db.updateAsync('conversations', thread.id, updates);
      return NextResponse.json({ success: true, thread: updatedThread });
    }

    if (action === 'mark_read' && cleanThreadId) {
      const thread = await db.findOneAsync<any>('conversations', (c: any) => c.id === cleanThreadId || c._id === cleanThreadId);
      if (thread) {
        const role = body.role || 'student';
        const updatedThread = await db.updateAsync('conversations', thread.id, {
          unreadCountTeacher: (role === 'teacher' || role === 'admin') ? 0 : thread.unreadCountTeacher,
          unreadCountStudent: role === 'student' ? 0 : thread.unreadCountStudent,
          messages: (thread.messages || []).map((m: any) => ({ ...m, isRead: true }))
        });
        return NextResponse.json({ success: true, thread: updatedThread });
      }
    }

    if (action === 'toggle_status' && cleanThreadId) {
      const thread = await db.findOneAsync<any>('conversations', (c: any) => c.id === cleanThreadId || c._id === cleanThreadId);
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
