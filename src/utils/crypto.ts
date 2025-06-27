// Alternative crypto utilities for serverless environments
// where bcrypt might have issues

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  // Derive key using PBKDF2
  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  // Combine salt and derived key
  const hashArray = new Uint8Array(salt.length + derivedKey.byteLength);
  hashArray.set(salt);
  hashArray.set(new Uint8Array(derivedKey), salt.length);
  
  // Convert to base64
  return btoa(String.fromCharCode(...hashArray));
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    // Decode hash from base64
    const hashArray = new Uint8Array(
      atob(hash).split('').map(char => char.charCodeAt(0))
    );
    
    // Extract salt (first 16 bytes)
    const salt = hashArray.slice(0, 16);
    const storedHash = hashArray.slice(16);
    
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // Derive key using same parameters
    const derivedKey = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    
    // Compare hashes
    const derivedArray = new Uint8Array(derivedKey);
    
    if (derivedArray.length !== storedHash.length) {
      return false;
    }
    
    for (let i = 0; i < derivedArray.length; i++) {
      if (derivedArray[i] !== storedHash[i]) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
} 