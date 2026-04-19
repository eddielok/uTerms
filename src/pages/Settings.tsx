import React, { useEffect, useState } from "react";
import { useCookieConfig } from "../context/CookieContext";
import { API_URL } from "../lib/config";
import { supabase } from "../lib/supabase";
import "./Settings.css";

const POLICY_TABLES = [
  "privacy_policies",
  "cookie_policies",
  "terms_of_service",
  "eula",
  "return_policy",
  "disclaimer",
  "shipping_policy",
  "acceptable_use_policy",
  "impressum",
  "accessibility_statement",
];

export const Settings: React.FC = () => {
  const { userId } = useCookieConfig();

  // Email
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  // const [email, setEmail] = useState("");
  // const [emailMsg, setEmailMsg] = useState("");
  // const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const identities = user?.identities ?? [];
      setIsOAuthUser(identities.some((i) => i.provider !== "email"));
    });
  }, []);

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Export
  const [exportLoading, setExportLoading] = useState(false);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // const handleEmailChange = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setEmailLoading(true);
  //   setEmailMsg("");
  //   const { error } = await supabase.auth.updateUser(
  //     { email },
  //     { emailRedirectTo: `${window.location.origin}/auth/callback` },
  //   );
  //   setEmailLoading(false);
  //   if (error) {
  //     setEmailMsg(`Error: ${error.message}`);
  //   } else {
  //     setEmailMsg(
  //       "Confirmation email sent. Check your inbox to verify the new address.",
  //     );
  //     setEmail("");
  //   }
  // };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg("Password must be at least 8 characters.");
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg("");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (error) {
      setPasswordMsg(`Error: ${error.message}`);
    } else {
      setPasswordMsg("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleExportData = async () => {
    if (!userId) return;
    setExportLoading(true);
    const exportData: Record<string, unknown> = {
      exported_at: new Date().toISOString(),
    };

    const { data: cookieSettings } = await supabase
      .from("user_cookie_settings")
      .select("*")
      .eq("user_id", userId);
    exportData.cookie_settings = cookieSettings;

    for (const table of POLICY_TABLES) {
      const { data } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", userId);
      exportData[table] = data;
    }

    const { data: consentLogs } = await supabase
      .from("visitor_consent")
      .select("*")
      .eq("user_id", userId);
    exportData.visitor_consent = consentLogs;

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uterms-data-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportLoading(false);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirm !== "DELETE") {
      setDeleteMsg("Type DELETE (all caps) to confirm.");
      return;
    }
    setDeleteLoading(true);
    setDeleteMsg("");

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setDeleteMsg("Not authenticated. Please log in again.");
      setDeleteLoading(false);
      return;
    }

    const res = await fetch(`${API_URL}/api/delete-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setDeleteMsg(
        `Error: ${json.error || "Account deletion failed. Please try again."}`,
      );
      setDeleteLoading(false);
      return;
    }

    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="settings-container">
      <h1 className="settings-title">Account Settings</h1>

      {/* Change Email
      <section className="settings-section">
        <h2 className="settings-section-title">Change Email</h2>
        {isOAuthUser ? (
          <p className="settings-msg settings-msg-error">
            Your account is linked to Google. To change your email, update it in
            your Google account settings.
          </p>
        ) : (
          <form onSubmit={handleEmailChange} className="settings-form">
            <div className="settings-field">
              <label htmlFor="new-email">New Email Address</label>
              <input
                id="new-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="new@example.com"
                className="settings-input"
              />
            </div>
            {emailMsg && (
              <p
                className={`settings-msg ${emailMsg.startsWith("Error") ? "settings-msg-error" : "settings-msg-success"}`}
              >
                {emailMsg}
              </p>
            )}
            <button
              type="submit"
              className="settings-btn"
              disabled={emailLoading}
            >
              {emailLoading ? "Sending…" : "Update Email"}
            </button>
          </form>
        )}
      </section> */}

      {/* Change Password */}
      <section className="settings-section">
        <h2 className="settings-section-title">Change Password</h2>
        {isOAuthUser ? (
          <p className="settings-msg settings-msg-error">
            Your account is linked to Google. Passwords are managed by Google —
            you cannot set a separate password here.
          </p>
        ) : (
          <form onSubmit={handlePasswordChange} className="settings-form">
            <div className="settings-field">
              <label htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="settings-input"
              />
            </div>
            <div className="settings-field">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat password"
                className="settings-input"
              />
            </div>
            {passwordMsg && (
              <p
                className={`settings-msg ${passwordMsg.startsWith("Error") || passwordMsg.includes("match") || passwordMsg.includes("least") ? "settings-msg-error" : "settings-msg-success"}`}
              >
                {passwordMsg}
              </p>
            )}
            <button
              type="submit"
              className="settings-btn"
              disabled={passwordLoading}
            >
              {passwordLoading ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </section>

      {/* Export Data */}
      <section className="settings-section">
        <h2 className="settings-section-title">Export My Data</h2>
        <p className="settings-description">
          Download all your account data as a JSON file. This includes all
          policies, cookie settings, and visitor consent logs (GDPR Article 20 —
          right to data portability).
        </p>
        <button
          onClick={handleExportData}
          className="settings-btn"
          disabled={exportLoading || !userId}
        >
          {exportLoading ? "Preparing export…" : "Download My Data"}
        </button>
      </section>

      {/* Danger Zone */}
      <section className="settings-section settings-danger-zone">
        <h2 className="settings-section-title settings-danger-title">
          Delete Account
        </h2>
        <p className="settings-description">
          Permanently delete your account and all associated data. This action
          cannot be undone (GDPR Article 17 — right to erasure).
        </p>
        <form onSubmit={handleDeleteAccount} className="settings-form">
          <div className="settings-field">
            <label htmlFor="delete-confirm">
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              id="delete-confirm"
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="settings-input"
              autoComplete="off"
            />
          </div>
          {deleteMsg && (
            <p className="settings-msg settings-msg-error">{deleteMsg}</p>
          )}
          <button
            type="submit"
            className="settings-btn settings-btn-danger"
            disabled={deleteLoading || deleteConfirm !== "DELETE"}
          >
            {deleteLoading ? "Deleting account…" : "Delete My Account"}
          </button>
        </form>
      </section>
    </div>
  );
};
