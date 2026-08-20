/** Middle-truncate an address for display: `kGkLE...xJdMi`. */
export function truncateAddress(address: string, lead = 5, tail = 5): string {
  if (address.length <= lead + tail + 1) return address;
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
}

/** Copy text to the clipboard, resolving to whether it worked. */
export async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
