// app/actions/uploadSilhouette.ts
import { supabase } from '@/lib/supabase';
import { silhouetteFromCanvas } from '@/lib/silhouette';

export async function processAndUpload(canvas: HTMLCanvasElement, userId: string, drawId: string) {
  const result = await silhouetteFromCanvas(canvas);

  // Check if supabase client is available
  if (!supabase) {
    console.warn('Supabase client not available - skipping upload');
    return { 
      pngPath: null, 
      jsonPath: null, 
      meta: {
        area_pixels: result.areaPixels,
        width: result.width,
        height: result.height,
        verticality: result.verticality,
        uploaded_at: new Date().toISOString(),
      }
    };
  }

  // 1) PNG upload
  const pngPath = `drawings/${userId}/${drawId}.png`;
  const { error: pngErr } = await supabase
    .storage.from('drawings') // create this bucket
    .upload(pngPath, result.silhouettePNG, { contentType: 'image/png', upsert: true });
  if (pngErr) throw pngErr;

  // 2) Metadata upload (area + dimensions + verticality)
  const meta = {
    area_pixels: result.areaPixels,
    width: result.width,
    height: result.height,
    verticality: result.verticality,
    uploaded_at: new Date().toISOString(),
  };
  const jsonPath = `drawings/${userId}/${drawId}.json`;
  const { error: jsonErr } = await supabase
    .storage.from('drawings')
    .upload(jsonPath, new Blob([JSON.stringify(meta)], { type: 'application/json' }), {
      contentType: 'application/json',
      upsert: true
    });
  if (jsonErr) throw jsonErr;

  return { pngPath, jsonPath, meta };
}
