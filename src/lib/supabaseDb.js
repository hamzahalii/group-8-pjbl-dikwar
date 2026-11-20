// Supabase <-> Civic Quest bridge
// Converts between the app's camelCase shape and the DB's snake_case columns.

import { supabase } from './supabase';

// ── helpers ──────────────────────────────────────────────────────

/** Convert a JS submission object → DB row */
const toRow = (s) => ({
  id:              s.id || s.docId,
  student_name:    s.studentName || s.name || '-',
  student_prodi:      s.studentProdi || '-',
  student_university: s.studentUniversity || '-',
  mcq_score:       Number(s.mcqScore || s.mcCorrectCount || 0),
  mcq_percentage:  Number(s.mcqPercentage || 0),
  xp:              Number(s.xp || 0),
  base_xp:         Number(s.baseXp || s.xp || 0),
  max_streak:      Number(s.maxStreak || 0),
  mcq_answers:     s.mcqAnswers || [],
  essay9:          s.essay9 || {},
  essay10:         s.essay10 || {},
  admin_reviewed:  Boolean(s.moderatorReviewed || s.adminReviewed),
  submitted_at:    s.submittedAt || new Date().toISOString(),
  submitted_at_wib: s.submittedAtWIB || null
});

/** Convert a DB row → JS submission object */
const fromRow = (r) => ({
  id:               r.id,
  docId:            r.id,
  studentName:      r.student_name,
  studentProdi:     r.student_prodi || '-',
  studentUniversity: r.student_university || '-',
  mcqScore:         r.mcq_score,
  mcqPercentage:    r.mcq_percentage,
  xp:               r.xp,
  baseXp:           r.base_xp,
  maxStreak:        r.max_streak,
  mcqAnswers:       r.mcq_answers,
  essay9:           r.essay9,
  essay10:          r.essay10,
  moderatorReviewed: r.admin_reviewed,
  submittedAt:      r.submitted_at,
  submittedAtMs:    new Date(r.submitted_at).getTime(),
  submittedAtWIB:   r.submitted_at_wib
});

// ── public API ───────────────────────────────────────────────────

/** Insert or update (upsert) a single submission. */
export async function upsertSubmission(submission) {
  const row = toRow(submission);
  const { error } = await supabase
    .from('civic_quest_submissions')
    .upsert(row, { onConflict: 'id' });

  if (error) {
    console.error('[Supabase] upsert error:', error.message);
    return false;
  }
  return true;
}

/** Fetch every submission, newest first. */
export async function fetchAllSubmissions() {
  const { data, error } = await supabase
    .from('civic_quest_submissions')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('[Supabase] fetch error:', error.message);
    return null;           // caller falls back to localStorage
  }
  return data.map(fromRow);
}

/** Update only the admin grading fields for one submission. */
export async function updateAdminGrade(id, essay9Patch, essay10Patch) {
  const { error } = await supabase
    .from('civic_quest_submissions')
    .update({
      essay9:          essay9Patch,
      essay10:         essay10Patch,
      admin_reviewed:  true
    })
    .eq('id', id);

  if (error) {
    console.error('[Supabase] grade update error:', error.message);
    return false;
  }
  return true;
}

/** Get total row count (lightweight, for the HUD badge). */
export async function getSubmissionCount() {
  const { count, error } = await supabase
    .from('civic_quest_submissions')
    .select('id', { count: 'exact', head: true });

  if (error) return null;
  return count;
}

/** Delete a submission by id from Supabase. */
export async function deleteSubmission(id) {
  const { error } = await supabase
    .from('civic_quest_submissions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[Supabase] delete error:', error.message);
    return false;
  }
  return true;
}
