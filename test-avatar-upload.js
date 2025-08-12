// 测试头像上传功能的脚本
// 可以在浏览器控制台中运行

// 测试1: 检查token是否存在
function testToken() {
  const token = localStorage.getItem('token');
  console.log('Token exists:', !!token);
  console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');
  return token;
}

// 测试2: 测试Cloudinary签名获取
async function testCloudinarySignature() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const url = new URL('https://sad-sarina-yezyeats-d7548659.koyeb.app/api/cloudinary/signature');
    url.searchParams.set('folder', 'ticket-system/avatars');
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Signature response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Signature data:', data);
      return data;
    } else {
      const errorText = await response.text();
      console.error('Signature error:', errorText);
    }
  } catch (error) {
    console.error('Signature request failed:', error);
  }
}

// 测试3: 测试完整的头像上传流程
async function testAvatarUpload() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return;
  }

  // 创建一个测试文件（模拟）
  const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
  
  try {
    // 1. 获取签名
    const url = new URL('https://sad-sarina-yezyeats-d7548659.koyeb.app/api/cloudinary/signature');
    url.searchParams.set('folder', 'ticket-system/avatars');
    
    const sigResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!sigResponse.ok) {
      throw new Error('Failed to get signature');
    }
    
    const { timestamp, signature, apiKey } = await sigResponse.json();
    console.log('Got signature:', { timestamp, signature: signature.substring(0, 10) + '...', apiKey: apiKey.substring(0, 10) + '...' });
    
    // 2. 上传到Cloudinary（这里需要真实的Cloudinary配置）
    console.log('Would upload to Cloudinary with:', {
      timestamp,
      signature: signature.substring(0, 10) + '...',
      apiKey: apiKey.substring(0, 10) + '...',
      folder: 'ticket-system/avatars'
    });
    
    // 3. 测试后端API调用
    const updateResponse = await fetch('https://sad-sarina-yezyeats-d7548659.koyeb.app/api/update-avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        avatarUrl: 'https://example.com/test-avatar.jpg',
        publicId: 'ticket-system/avatars/test-avatar'
      })
    });
    
    console.log('Update avatar response status:', updateResponse.status);
    
    if (updateResponse.ok) {
      const data = await updateResponse.json();
      console.log('Update avatar success:', data);
    } else {
      const errorText = await updateResponse.text();
      console.error('Update avatar error:', errorText);
    }
    
  } catch (error) {
    console.error('Avatar upload test failed:', error);
  }
}

// 运行所有测试
function runAllTests() {
  console.log('=== 头像上传功能测试 ===');
  console.log('1. 检查Token...');
  testToken();
  
  console.log('\n2. 测试Cloudinary签名...');
  testCloudinarySignature();
  
  console.log('\n3. 测试完整上传流程...');
  testAvatarUpload();
}

// 在浏览器控制台中运行: runAllTests()
