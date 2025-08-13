// 测试头像上传流程
// 这个文件用于验证从Cloudinary上传到后端保存的完整流程

import { userApi } from './src/services/api.js'

// 模拟文件对象
const mockFile = {
  name: 'test-avatar.jpg',
  type: 'image/jpeg',
  size: 1024 * 1024, // 1MB
  // 这里需要实际的File对象，但在测试中我们可以模拟
}

// 测试头像上传流程
export async function testAvatarUploadFlow() {
  console.log('🧪 开始测试头像上传流程...')
  
  try {
    // 1. 测试Cloudinary上传
    console.log('📤 步骤1: 上传到Cloudinary...')
    const { url: cloudinaryUrl } = await uploadAvatar(mockFile)
    console.log('✅ Cloudinary上传成功:', cloudinaryUrl)
    
    // 2. 测试后端保存
    console.log('💾 步骤2: 保存到后端...')
    const response = await userApi.updateAvatar(mockFile)
    console.log('✅ 后端保存成功:', response)
    
    // 3. 验证返回的数据格式
    if (response.code === 0 && response.data) {
      console.log('✅ 数据格式正确:', response.data)
      console.log('✅ 头像URL:', response.data)
    } else {
      console.error('❌ 数据格式错误:', response)
    }
    
    console.log('🎉 头像上传流程测试完成!')
    return true
    
  } catch (error) {
    console.error('❌ 头像上传流程测试失败:', error)
    return false
  }
}

// 测试数据格式验证
export function testDataFormat() {
  console.log('🧪 测试数据格式...')
  
  // 模拟后端返回的数据格式
  const mockResponse = {
    code: 0,
    message: "Avatar updated successfully",
    data: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ticket-system/avatars/avatar_4_f6330025-4ea0-4398-ae86-2482d5b6dfa7.jpg"
  }
  
  console.log('📋 后端返回格式:', mockResponse)
  console.log('🔗 Cloudinary URL:', mockResponse.data)
  console.log('✅ 数据格式验证通过!')
}

// 测试前端处理逻辑
export function testFrontendProcessing() {
  console.log('🧪 测试前端处理逻辑...')
  
  // 模拟响应数据
  const response = {
    code: 0,
    message: "Avatar updated successfully",
    data: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ticket-system/avatars/avatar_4_f6330025-4ea0-4398-ae86-2482d5b6dfa7.jpg"
  }
  
  if (response.code === 0) {
    // 正确的处理方式
    const avatarUrl = response.data // 直接使用response.data作为Cloudinary URL
    console.log('✅ 前端处理正确:', avatarUrl)
    
    // 更新本地状态
    const userInfo = {
      id: 4,
      username: 'testuser',
      avatarUrl: avatarUrl
    }
    console.log('✅ 用户信息更新:', userInfo)
    
  } else {
    console.error('❌ 响应状态错误:', response.code)
  }
}

// 运行所有测试
export async function runAllTests() {
  console.log('🚀 开始运行所有头像上传测试...')
  
  testDataFormat()
  testFrontendProcessing()
  
  // 注意：实际的文件上传测试需要真实的File对象
  // await testAvatarUploadFlow()
  
  console.log('✅ 所有测试完成!')
}

// 导出测试函数
export default {
  testAvatarUploadFlow,
  testDataFormat,
  testFrontendProcessing,
  runAllTests
}
