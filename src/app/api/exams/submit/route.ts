import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { examId, studentId, studentName, college, answers, detailedSubmission } = body;

    if (!examId || !studentId) {
      return NextResponse.json({ success: false, error: 'পরীক্ষা ও শিক্ষার্থীর আইডি আবশ্যক।' }, { status: 400 });
    }

    const exam = db.findOne<any>('exams', e => e.id === examId);
    let finalScore = 0;
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    if (exam && exam.questions && Array.isArray(exam.questions) && answers) {
      exam.questions.forEach((q: any) => {
        const selected = answers[q.id];
        if (selected === undefined || selected === null) {
          unanswered++;
        } else if (selected === q.correctOption) {
          correct++;
        } else {
          wrong++;
        }
      });
      const qLen = exam.questions.length || 1;
      const totalMarks = exam.totalMarks || 100;
      const negMark = exam.negativeMarkPerWrong || 0.25;
      const rawScore = correct * (totalMarks / qLen) - wrong * negMark;
      finalScore = Math.max(0, Number(rawScore.toFixed(2)));
    }

    const submission = db.create('submissions', {
      examId,
      studentId,
      studentName: studentName || 'শিক্ষার্থী',
      college: college || 'কলেজ',
      score: finalScore,
      correctAnswers: correct,
      wrongAnswers: wrong,
      unanswered,
      selectedAnswers: answers || {},
      detailedSubmission: detailedSubmission || null,
      submittedAt: 'এইমাত্র',
    });

    // Auto calculate Leaderboard rank
    const leaderboardEntry = db.create('leaderboard', {
      examId,
      studentName: studentName || 'শিক্ষার্থী',
      college: college || 'কলেজ',
      score: finalScore,
      totalMarks: exam?.totalMarks || 100,
      accuracy: Math.round((correct / (correct + wrong || 1)) * 100),
      submittedAt: 'এইমাত্র',
    });

    return NextResponse.json({ success: true, submission, leaderboardEntry });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const submissions = db.findMany<any>('submissions') || [];
    const leaderboard = db.findMany<any>('leaderboard') || [];
    return NextResponse.json({ success: true, submissions, leaderboard });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, submissionId, cqMarksAwarded, teacherFeedback, partMarks, publishImmediately, examId } = body;

    if (action === 'publish_batch') {
      const all = db.findMany<any>('submissions');
      let count = 0;
      all.forEach((s) => {
        if (!examId || examId === 'all' || s.examId === examId) {
          if (s.status === 'evaluated' || s.status === 'pending_evaluation') {
            db.update('submissions', s.id, { status: 'published' });
            count++;
          }
        }
      });
      return NextResponse.json({ success: true, countPublished: count });
    }

    if (submissionId) {
      const target = db.findOne<any>('submissions', s => s.id === submissionId);
      if (target) {
        const mcq = target.mcqScore || target.score || 0;
        const cq = Number(cqMarksAwarded) || 0;
        const total = mcq + cq;
        const updated = db.update('submissions', submissionId, {
          cqScore: cq,
          score: total,
          teacherFeedback: teacherFeedback || target.teacherFeedback,
          partMarks: partMarks || target.partMarks,
          status: publishImmediately ? 'published' : 'evaluated',
          evaluatedAt: new Date().toLocaleDateString('bn-BD'),
        });
        return NextResponse.json({ success: true, submission: updated });
      }
    }

    return NextResponse.json({ success: false, error: 'সাবমিশন পাওয়া যায়নি।' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

