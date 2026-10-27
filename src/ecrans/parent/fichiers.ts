/** Lit le fichier JSON choisi dans un <input type="file">. */
export async function lireJson(e: Event): Promise<unknown> {
  const input = e.currentTarget as HTMLInputElement;
  const fichier = input.files?.[0];
  input.value = '';
  if (!fichier) throw new Error('Aucun fichier choisi.');
  try {
    return JSON.parse(await fichier.text());
  } catch {
    throw new Error('Fichier illisible : ce n’est pas du JSON.');
  }
}

export function telechargerJson(nom: string, donnees: unknown): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(donnees, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nom;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
