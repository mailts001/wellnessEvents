// booking.js — loaded separately so it's never confused with cached index.html
// v3 — check-before-insert duplicate detection

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/+esm";

const supabase = createClient(
  "https://utpwbrbpdyrwqlheaknm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0cHdicmJwZHlyd3FsaGVha25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzczNDEsImV4cCI6MjA5MDkxMzM0MX0.NThOb2kXgbz85s0kunWhSjblM8I_PjvE3byyhEzQB8U"
);

const EDGE_URL  = "https://utpwbrbpdyrwqlheaknm.supabase.co/functions/v1/super-worker";
const EDGE_AUTH = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0cHdicmJwZHlyd3FsaGVha25tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzczNDEsImV4cCI6MjA5MDkxMzM0MX0.NThOb2kXgbz85s0kunWhSjblM8I_PjvE3byyhEzQB8U";

// ── Exposed globally so index.html inline script can call it ──
window._supabase = supabase;

window.bookClass = async function({ classId, classTitle, classType, classStart, classEnd, instructor, studentInfo, btn }) {
  btn.disabled    = true;
  btn.textContent = "Booking…";

  try { (never throws, never returns 409) ──
    const { data: result, error: rpcErr } = await supabase
      .rpc("safe_book_class", {
        p_class_id:      classId,
        p_student_name:  studentInfo.name,
        p_student_email: studentInfo.email,
        p_student_phone: studentInfo.phone || null
      });

    if (rpcErr) {
      btn.disabled    = false;
      btn.textContent = "Book this class";
      alert("Booking failed: " + rpcErr.message);
      return;
    }

    if (result && result.reason === "duplicate") {
      btn.disabled         = false;
      btn.textContent      = "Already Booked";
      btn.style.background = "#FF9800";
      const classDate = new Date(classStart).toLocaleDateString("default", {
        weekday:"long", day:"numeric", month:"long", year:"numeric"
      });
      alert(
        `You're already registered for this class! 📋\n\n` +
        `Class: ${classTitle}\n` +
        `Date: ${classDate}\n` +
        `Email: ${studentInfo.email}\n\n` +
        `Each class can only be booked once per person.\n` +
        `To change your booking, please contact us directly.`
      );
      return;
    }

    // ── Step 3: Send email notification ──────────────────
    fetch(EDGE_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": EDGE_AUTH },
      body: JSON.stringify({
        student_name:  studentInfo.name,
        student_email: studentInfo.email,
        student_phone: studentInfo.phone || "",
        class_title:   classTitle,
        class_type:    classType  || "",
        instructor:    instructor,
        start_time:    classStart,
        end_time:      classEnd,
      })
    })
    .then(r => r.json())
    .then(d => console.log("[Email]", JSON.stringify(d)))
    .catch(e => console.warn("[Email failed]", e.message));

    // ── Step 4: Show success ──────────────────────────────
    btn.textContent      = "✅ Booked!";
    btn.style.background = "#388E3C";
    btn.disabled         = false;

    const startStr = new Date(classStart).toLocaleString("default", {
      weekday:"long", day:"numeric", month:"long",
      hour:"2-digit", minute:"2-digit"
    });
    alert(
      `Booking confirmed! 🎉\n\n` +
      `📚 ${classTitle}${classType ? " (" + classType + ")" : ""}\n` +
      `👤 Instructor: ${instructor}\n` +
      `📅 ${startStr}\n\n` +
      `A confirmation email has been sent to:\n${studentInfo.email}`
    );

  } catch (err) {
    btn.disabled    = false;
    btn.textContent = "Book this class";
    console.error("Booking error:", err);
    alert("An unexpected error occurred. Please try again.");
  }
};
