import React, { useState } from "react";
import { supabase } from "../integrations/supabase/client";

// Pour l'upload, on utilise un fichier texte généré côté client
const TEST_BUCKET = "test-bucket"; // Remplace par un bucket existant si besoin
const TEST_FILE_NAME = "debug-test.txt";
const TEST_FILE_CONTENT = "Ceci est un test d'upload Supabase.";

const SUPABASE_URL = "https://ddvboxgescsptvhkjgjl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdmJveGdlc2NzcHR2aGtqZ2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxOTY2MjUsImV4cCI6MjA2NDc3MjYyNX0.eIDNQwbV1MLDaplX3yH9CdTb6W7DXF8qZ15sb60C0fQ";

export default function DebugSupabase() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string | null>(null);

  // 1. Test connexion
  const testConnexion = async () => {
    setLoading("connexion");
    try {
      // On fait une requête simple (par ex. lister les tables publiques)
      const { data, error } = await supabase.from("business_events").select("id").limit(1);
      if (error) throw error;
      setResults((r: any) => ({ ...r, connexion: { success: true, data } }));
    } catch (e: any) {
      setResults((r: any) => ({ ...r, connexion: { success: false, error: e.message || e } }));
    } finally {
      setLoading(null);
    }
  };

  // 2. Test authentification (anonyme)
  const testAuth = async () => {
    setLoading("auth");
    try {
      // On tente de s'inscrire/se connecter avec un email bidon (mode magic link désactivé)
      const email = `debug${Date.now()}@test.com`;
      const password = "DebugTest123!";
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setResults((r: any) => ({ ...r, auth: { success: true, data } }));
    } catch (e: any) {
      setResults((r: any) => ({ ...r, auth: { success: false, error: e.message || e } }));
    } finally {
      setLoading(null);
    }
  };

  // 3. Lecture d'une table simple
  const testLecture = async () => {
    setLoading("lecture");
    try {
      const { data, error } = await supabase.from("business_events").select("*").limit(1);
      if (error) throw error;
      setResults((r: any) => ({ ...r, lecture: { success: true, data } }));
    } catch (e: any) {
      setResults((r: any) => ({ ...r, lecture: { success: false, error: e.message || e } }));
    } finally {
      setLoading(null);
    }
  };

  // 4. Test upload fichier
  const testUpload = async () => {
    setLoading("upload");
    try {
      const file = new File([TEST_FILE_CONTENT], TEST_FILE_NAME, { type: "text/plain" });
      const { data, error } = await supabase.storage.from(TEST_BUCKET).upload(TEST_FILE_NAME, file, { upsert: true });
      if (error) throw error;
      setResults((r: any) => ({ ...r, upload: { success: true, data } }));
    } catch (e: any) {
      setResults((r: any) => ({ ...r, upload: { success: false, error: e.message || e } }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Diagnostic connexion Supabase</h2>
      <p>Utilisez les boutons ci-dessous pour tester chaque étape de la connexion à Supabase.</p>
      <div style={{ margin: "1rem 0" }}>
        <button onClick={testConnexion} disabled={loading === "connexion"} style={{ marginRight: 8 }}>
          Tester connexion
        </button>
        {results.connexion && (
          <span style={{ color: results.connexion.success ? "green" : "red" }}>
            {results.connexion.success ? "Succès" : `Erreur : ${results.connexion.error}`}
          </span>
        )}
      </div>
      <div style={{ margin: "1rem 0" }}>
        <button onClick={testAuth} disabled={loading === "auth"} style={{ marginRight: 8 }}>
          Tester authentification
        </button>
        {results.auth && (
          <span style={{ color: results.auth.success ? "green" : "red" }}>
            {results.auth.success ? "Succès" : `Erreur : ${results.auth.error}`}
          </span>
        )}
      </div>
      <div style={{ margin: "1rem 0" }}>
        <button onClick={testLecture} disabled={loading === "lecture"} style={{ marginRight: 8 }}>
          Tester lecture table
        </button>
        {results.lecture && (
          <span style={{ color: results.lecture.success ? "green" : "red" }}>
            {results.lecture.success ? "Succès" : `Erreur : ${results.lecture.error}`}
          </span>
        )}
      </div>
      <div style={{ margin: "1rem 0" }}>
        <button onClick={testUpload} disabled={loading === "upload"} style={{ marginRight: 8 }}>
          Tester upload fichier
        </button>
        {results.upload && (
          <span style={{ color: results.upload.success ? "green" : "red" }}>
            {results.upload.success ? "Succès" : `Erreur : ${results.upload.error}`}
          </span>
        )}
      </div>
      <div style={{ marginTop: 24, fontSize: 14, color: "#555" }}>
        <b>Interprétation :</b>
        <ul>
          <li>Succès partout : la connexion frontend ↔ backend fonctionne.</li>
          <li>Erreur connexion : vérifier l'URL et la clé publique Supabase.</li>
          <li>Erreur auth : vérifier la configuration Auth (dashboard Supabase).</li>
          <li>Erreur lecture : vérifier les RLS policies et droits sur la table.</li>
          <li>Erreur upload : vérifier que le bucket existe et les droits Storage.</li>
        </ul>
      </div>
    </div>
  );
} 