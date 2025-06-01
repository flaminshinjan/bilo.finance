import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function processFile(
  file: File,
  supabaseClient: SupabaseClient
): Promise<{ filePath: string; fileType: string }> {
  const timestamp = new Date().getTime()
  const fileExt = file.name.split('.').pop()
  const filePath = `invoices/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`
  
  const { error: uploadError } = await supabaseClient.storage
    .from('invoices')
    .upload(filePath, file)

  if (uploadError) {
    throw uploadError
  }

  return {
    filePath,
    fileType: file.type
  }
} 