'use server';

import { createClient } from './supabase-server';
import { revalidatePath } from 'next/cache';

/**
 * Connecte l'utilisateur en tant qu'invité (anonyme).
 * À appeler lorsque l'utilisateur arrive sur le tunnel d'achat sans compte.
 */
export async function signInGuest() {
  const supabase = createClient();
  
  // Vérifie s'il est déjà connecté
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return { success: true };

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error("Erreur signInAnonymously:", error);
    return { success: false, error: error.message };
  }
  
  return { success: true, user: data.user };
}

/**
 * Transforme le compte anonyme actuel en compte client permanent (Account Linking).
 */
export async function upgradeGuestToClient(email: string, password?: string) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !user.is_anonymous) {
    return { success: false, error: "Aucun compte invité actif à transformer." };
  }

  // Si on utilise l'authentification Email/Mot de passe classique
  const updatePayload: any = { email };
  if (password) {
    updatePayload.password = password;
  }

  const { data, error } = await supabase.auth.updateUser(updatePayload);
  
  if (error) {
    console.error("Erreur lors de la liaison de compte:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/admin');
  revalidatePath('/mon-compte');
  
  return { success: true, user: data.user };
}
