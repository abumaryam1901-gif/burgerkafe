import multer from 'multer';
import { supabase } from './supabase.js';

// Fayllarni xotirada saqlaymiz
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Faqat rasm fayllari qabul qilinadi'));
    }
  },
});

export async function uploadImageToSupabase(file) {
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${file.originalname.split('.').pop() || 'jpg'}`;

  // Agar Supabase storage mavjud bo'lsa
  try {
    if (supabase && supabase.storage) {
      const { data, error } = await supabase.storage
        .from('menu-images')
        .upload(filename, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('menu-images')
          .getPublicUrl(filename);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    }
  } catch (err) {
    console.warn('Supabase storage upload failed, falling back to data URL:', err.message);
  }

  // Fallback: Agar Supabase Storage sozlanmagan bo'lsa, data URL sifatida qaytaramiz
  const base64 = file.buffer.toString('base64');
  return `data:${file.mimetype};base64,${base64}`;
}
