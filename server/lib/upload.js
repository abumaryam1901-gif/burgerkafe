import multer from 'multer';
import { supabase } from './supabase.js';

// Fayllarni xotirada saqlaymiz, keyin Supabase Storage'ga yuboramiz
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Faqat rasm fayllarini yuklash mumkin'));
    }
    cb(null, true);
  },
});

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'products';

export async function uploadImageToSupabase(file) {
  const ext = (file.originalname.split('.').pop() || 'jpg').toLowerCase();
  const fileName = `product_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}
