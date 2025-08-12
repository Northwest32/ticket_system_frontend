// 测试头像同步功能的脚本
// 可以在浏览器控制台中运行

// 测试1: 检查头像URL处理
function testAvatarUrlHandling() {
  console.log('=== 测试头像URL处理 ===');
  
  // 模拟不同的头像URL格式
  const testUrls = [
    null,
    '',
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
    '/uploads/avatars/avatar_4_601a3e96-a3d8-4c24-b3c2-099b79408d97.jpg',
    'https://res.cloudinary.com/dfg4qzpnj/image/upload/v1754962553/ticket-system/avatars/api9jxym4trcd8rsvqth.jpg',
    'https://example.com/avatar.jpg'
  ];
  
  testUrls.forEach((url, index) => {
    try {
      // 这里需要导入getAvatarUrl函数，在实际使用时需要从avatarUtils导入
      console.log(`测试 ${index + 1}:`, {
        原始URL: url,
        处理结果: '需要导入getAvatarUrl函数测试'
      });
    } catch (error) {
      console.error(`测试 ${index + 1} 失败:`, error);
    }
  });
}

// 测试2: 检查用户信息同步
function testUserInfoSync() {
  console.log('=== 测试用户信息同步 ===');
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const token = localStorage.getItem('token');
  
  console.log('当前用户信息:', {
    token存在: !!token,
    userInfo: userInfo,
    avatarUrl: userInfo.avatarUrl
  });
  
  // 检查头像URL是否为Cloudinary格式
  if (userInfo.avatarUrl) {
    const isCloudinary = userInfo.avatarUrl.includes('cloudinary.com');
    console.log('头像URL分析:', {
      URL: userInfo.avatarUrl,
      isCloudinary: isCloudinary,
      isLocalPath: userInfo.avatarUrl.includes('localhost:8080')
    });
  }
}

// 测试3: 检查事件详情中的组织者头像
async function testEventOrganizerAvatar() {
  console.log('=== 测试事件详情中的组织者头像 ===');
  
  try {
    // 获取当前页面的事件ID（如果存在）
    const eventId = window.location.pathname.match(/\/event\/(\d+)/)?.[1];
    
    if (eventId) {
      console.log('当前事件ID:', eventId);
      
      // 这里可以调用API获取事件详情
      // const response = await fetch(`https://sad-sarina-yezyeats-d7548659.koyeb.app/api/events/${eventId}`);
      // const eventData = await response.json();
      
      console.log('事件详情获取需要API调用，请手动检查页面上的组织者头像');
    } else {
      console.log('当前页面不是事件详情页面');
    }
  } catch (error) {
    console.error('测试事件组织者头像失败:', error);
  }
}

// 测试4: 模拟头像更新后的同步
function testAvatarUpdateSync() {
  console.log('=== 测试头像更新同步 ===');
  
  // 模拟更新localStorage中的头像URL
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const oldAvatarUrl = userInfo.avatarUrl;
  
  // 模拟新的Cloudinary头像URL
  const newAvatarUrl = 'https://res.cloudinary.com/dfg4qzpnj/image/upload/v1754962553/ticket-system/avatars/test-avatar.jpg';
  
  console.log('头像更新模拟:', {
    旧头像: oldAvatarUrl,
    新头像: newAvatarUrl
  });
  
  // 更新localStorage（仅用于测试）
  userInfo.avatarUrl = newAvatarUrl;
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
  
  console.log('localStorage已更新，请刷新页面查看效果');
  
  // 恢复原始头像（可选）
  // userInfo.avatarUrl = oldAvatarUrl;
  // localStorage.setItem('userInfo', JSON.stringify(userInfo));
}

// 运行所有测试
function runAllAvatarTests() {
  console.log('=== 头像同步功能测试 ===');
  
  console.log('\n1. 测试头像URL处理...');
  testAvatarUrlHandling();
  
  console.log('\n2. 测试用户信息同步...');
  testUserInfoSync();
  
  console.log('\n3. 测试事件详情中的组织者头像...');
  testEventOrganizerAvatar();
  
  console.log('\n4. 测试头像更新同步...');
  testAvatarUpdateSync();
  
  console.log('\n=== 测试完成 ===');
  console.log('请检查：');
  console.log('1. 头像URL是否正确显示');
  console.log('2. 更新头像后其他页面是否同步');
  console.log('3. 事件详情页面的组织者头像是否正确');
}

// 在浏览器控制台中运行: runAllAvatarTests()
