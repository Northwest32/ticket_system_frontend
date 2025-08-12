const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API = import.meta.env.VITE_API_BASE_URL || 'https://sad-sarina-yezyeats-d7548659.koyeb.app/api';

export async function uploadImage(file, folder = 'ticket-system/uploads', publicId) {
  try {
    // 1) get signature from backend
    const url = new URL(`${API}/cloudinary/signature`);
    url.searchParams.set('folder', folder);
    if (publicId) url.searchParams.set('publicId', publicId);

    const token = localStorage.getItem('token');
    const sigRes = await fetch(url, { 
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!sigRes.ok) {
      throw new Error('获取签名失败');
    }
    
    const { timestamp, signature, apiKey } = await sigRes.json();

    // 2) upload to Cloudinary
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', apiKey);
    form.append('timestamp', timestamp);
    form.append('signature', signature);
    form.append('folder', folder);
    if (publicId) form.append('public_id', publicId);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`;
    const r = await fetch(uploadUrl, { method: 'POST', body: form });
    
    if (!r.ok) {
      throw new Error('Upload to Cloudinary failed');
    }
    
    const data = await r.json(); // contains secure_url / public_id

    return { url: data.secure_url, publicId: data.public_id };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

// upload avatar
export async function uploadAvatar(file) {
  return await uploadImage(file, 'ticket-system/avatars');
}

// upload event cover
export async function uploadEventCover(file) {
  return await uploadImage(file, 'ticket-system/event-covers');
}

// upload event image
export async function uploadEventImage(file) {
  return await uploadImage(file, 'ticket-system/event-images');
}
