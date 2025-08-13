# 头像上传流程指南

## 概述

本系统使用Cloudinary云存储来处理头像上传，确保头像文件不会因为后端重启而丢失。

## 完整流程

### 1. 前端上传流程

```javascript
// 用户选择文件后触发
const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件类型和大小
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }
  
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size should be less than 5MB')
    return
  }
  
  try {
    // 调用API上传头像
    const response = await userApi.updateAvatar(file)
    
    if (response.code === 0) {
      // 获取Cloudinary URL
      const avatarUrl = response.data
      
      // 更新本地用户信息
      if (currentUser.value) {
        currentUser.value.avatarUrl = avatarUrl
        
        // 更新localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        userInfo.avatarUrl = avatarUrl
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      }
      
      // 刷新用户信息
      const { refreshUserInfo } = useAuth()
      await refreshUserInfo()
      
      alert('Avatar updated successfully!')
    } else {
      alert(response.message || 'Failed to update avatar')
    }
  } catch (error) {
    console.error('Error uploading avatar:', error)
    alert('Failed to upload avatar. Please try again.')
  }
  
  // 清空输入
  event.target.value = ''
}
```

### 2. API层处理

```javascript
// src/services/api.js
export const userApi = {
  // 更新头像
  updateAvatar: async (file) => {
    try {
      // 1. 上传到Cloudinary
      const { url: cloudinaryUrl } = await uploadAvatar(file);
      
      // 2. 保存Cloudinary URL到后端
      const response = await http.post('/update-avatar', {
        avatarUrl: cloudinaryUrl
      });
      
      return response.data;
    } catch (error) {
      console.error('Update avatar failed:', error);
      throw error;
    }
  }
}
```

### 3. Cloudinary上传

```javascript
// src/api/cloudinary.js
export async function uploadAvatar(file) {
  return await uploadImage(file, 'ticket-system/avatars');
}

export async function uploadImage(file, folder = 'ticket-system/uploads', publicId) {
  try {
    // 1. 从后端获取签名
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
      throw new Error('Failed to get signature');
    }
    
    const { timestamp, signature, apiKey } = await sigRes.json();

    // 2. 上传到Cloudinary
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
    
    const data = await r.json();
    return { url: data.secure_url, publicId: data.public_id };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}
```

### 4. 后端处理

```java
// UserController.java
@PostMapping("/update-avatar")
public ResponseEntity<CommonResponse<String>> updateAvatar(
        @RequestBody Map<String, String> request,
        HttpServletRequest httpRequest) {
    
    // 验证用户身份
    String authHeader = httpRequest.getHeader("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new CommonResponse<>(1, "Missing or invalid token", null));
    }
    
    // 解析JWT token
    String token = authHeader.substring(7);
    Claims claims = jwtUtil.parseToken(token);
    Long userId = Long.valueOf(claims.getSubject());
    
    // 获取Cloudinary URL
    String cloudinaryUrl = request.get("avatarUrl");
    if (cloudinaryUrl == null || cloudinaryUrl.trim().isEmpty()) {
        return ResponseEntity.badRequest().body(new CommonResponse<>(1, "Avatar URL is required", null));
    }
    
    // 验证URL格式
    if (!cloudinaryUrl.startsWith("https://res.cloudinary.com/")) {
        return ResponseEntity.badRequest().body(new CommonResponse<>(1, "Invalid Cloudinary URL format", null));
    }
    
    try {
        // 更新用户头像URL
        int result = userMapper.updateAvatarUrl(userId, cloudinaryUrl);
        
        if (result > 0) {
            return ResponseEntity.ok(new CommonResponse<>(0, "Avatar updated successfully", cloudinaryUrl));
        } else {
            return ResponseEntity.badRequest().body(new CommonResponse<>(1, "Failed to update avatar", null));
        }
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(new CommonResponse<>(1, "Error updating avatar", null));
    }
}
```

## 数据格式

### 前端发送给后端
```json
{
  "avatarUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ticket-system/avatars/avatar_4_f6330025-4ea0-4398-ae86-2482d5b6dfa7.jpg"
}
```

### 后端返回给前端
```json
{
  "code": 0,
  "message": "Avatar updated successfully",
  "data": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ticket-system/avatars/avatar_4_f6330025-4ea0-4398-ae86-2482d5b6dfa7.jpg"
}
```

## 头像显示

### 使用avatarUtils处理URL
```javascript
// src/utils/avatarUtils.js
export function getAvatarUrl(avatarUrl) {
  if (!avatarUrl) return ''
  
  // Cloudinary URL直接返回
  if (avatarUrl.includes('cloudinary.com')) {
    return avatarUrl
  }
  
  // 其他URL处理逻辑...
}
```

### 在组件中使用
```vue
<template>
  <div 
    class="avatar"
    :style="currentUser?.avatarUrl ? { backgroundImage: `url(${getAvatarUrl(currentUser.avatarUrl)})` } : {}"
  >
    <span v-if="!currentUser?.avatarUrl" class="avatar-text">
      {{ getUserInitials() }}
    </span>
  </div>
</template>
```

## 优势

1. **持久化存储**: 头像存储在Cloudinary上，不会因为后端重启而丢失
2. **CDN加速**: Cloudinary提供全球CDN，头像加载速度快
3. **自动优化**: Cloudinary自动优化图片大小和格式
4. **安全性**: 使用签名验证，防止未授权上传
5. **可扩展性**: 支持多种图片格式和转换

## 注意事项

1. 确保环境变量`VITE_CLOUDINARY_CLOUD_NAME`已正确设置
2. 确保后端Cloudinary配置正确
3. 文件大小限制为5MB
4. 只支持图片格式文件
5. 头像URL格式必须为Cloudinary URL
