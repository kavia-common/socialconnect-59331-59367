import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

/**
 * Post-signup onboarding with simple steps:
 * - Welcome
 * - Optional: Set display name and bio (local only placeholder)
 * - Finish
 * In a full app, you'd save these via backend endpoints.
 */
// PUBLIC_INTERFACE
export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuthStore((s) => ({ user: s.user }));
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    displayName: user?.username || "",
    bio: "",
  });

  const next = () => setStep((s) => Math.min(2, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    // In a real scenario, call update profile here.
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-6 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <Progress current={step} total={3} />

        {step === 0 && (
          <section className="text-center">
            <h1 className="text-2xl font-semibold mb-2">Welcome{user?.username ? `, @${user.username}` : ""} 👋</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Let’s personalize your experience in a few quick steps.
            </p>
            <button onClick={next} className="w-full bg-accent text-white py-2 rounded hover:opacity-90">
              Get started
            </button>
          </section>
        )}

        {step === 1 && (
          <section>
            <h2 className="text-xl font-semibold mb-2">Set up your profile</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Add a display name and a short bio. You can change these later.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Display name</label>
                <input
                  className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
                  value={profile.displayName}
                  onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Bio</label>
                <textarea
                  rows={3}
                  className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell people about yourself"
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <button onClick={prev} className="px-3 py-2 rounded border text-sm border-gray-300 dark:border-zinc-700">
                Back
              </button>
              <button onClick={next} className="px-3 py-2 rounded bg-accent text-white text-sm">
                Continue
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="text-center">
            <h2 className="text-xl font-semibold mb-2">You’re all set 🎉</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Start exploring, follow friends, and share moments.
            </p>
            <button onClick={finish} className="w-full bg-accent text-white py-2 rounded hover:opacity-90">
              Go to Feed
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

function Progress({ current, total }) {
  return (
    <div className="flex gap-1 h-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 rounded ${i <= current ? "bg-accent" : "bg-gray-200 dark:bg-zinc-700"}`}
        />
      ))}
    </div>
  );
}
