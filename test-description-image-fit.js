// 测试描述区域图片自适应效果的脚本
// 可以在浏览器控制台中运行

// 测试1: 检查描述区域图片的样式
function testDescriptionImageStyles() {
  console.log('=== 测试描述区域图片样式 ===')
  
  const descriptionImages = document.querySelectorAll('.description-content img')
  console.log('找到描述区域图片数量:', descriptionImages.length)
  
  descriptionImages.forEach((img, index) => {
    const styles = window.getComputedStyle(img)
    const rect = img.getBoundingClientRect()
    const parentRect = img.parentElement.getBoundingClientRect()
    
    console.log(`描述图片 ${index + 1}:`, {
      元素: img,
      图片原始尺寸: `${img.naturalWidth}x${img.naturalHeight}`,
      显示尺寸: `${rect.width}x${rect.height}`,
      父容器宽度: parentRect.width,
      最大宽度: styles.maxWidth,
      宽度: styles.width,
      高度: styles.height,
      对象适配: styles.objectFit,
      是否超出容器: rect.width > parentRect.width ? '超出' : '正常',
      圆角: styles.borderRadius,
      阴影: styles.boxShadow !== 'none' ? '有阴影' : '无阴影'
    })
  })
}

// 测试2: 检查描述内容区域的约束
function testDescriptionContentConstraints() {
  console.log('=== 测试描述内容区域约束 ===')
  
  const descriptionContent = document.querySelector('.description-content')
  if (!descriptionContent) {
    console.log('未找到描述内容区域')
    return
  }
  
  const styles = window.getComputedStyle(descriptionContent)
  const rect = descriptionContent.getBoundingClientRect()
  
  console.log('描述内容区域:', {
    元素: descriptionContent,
    宽度: rect.width + 'px',
    高度: rect.height + 'px',
    溢出处理: styles.overflow,
    文字换行: styles.wordWrap,
    现代换行: styles.overflowWrap,
    行高: styles.lineHeight,
    字体大小: styles.fontSize
  })
}

// 测试3: 检查图片自适应效果
function testImageResponsiveBehavior() {
  console.log('=== 测试图片自适应效果 ===')
  
  const descriptionImages = document.querySelectorAll('.description-content img')
  
  descriptionImages.forEach((img, index) => {
    const rect = img.getBoundingClientRect()
    const parentRect = img.parentElement.getBoundingClientRect()
    const aspectRatio = rect.width / rect.height
    const naturalAspectRatio = img.naturalWidth / img.naturalHeight
    
    console.log(`图片 ${index + 1} 自适应效果:`, {
      元素: img,
      原始宽高比: naturalAspectRatio.toFixed(2),
      显示宽高比: aspectRatio.toFixed(2),
      宽度适配: rect.width === parentRect.width ? '完全适配' : '部分适配',
      高度自适应: rect.height > 0 ? '正常' : '异常',
      是否保持比例: Math.abs(aspectRatio - naturalAspectRatio) < 0.1 ? '保持' : '变形',
      建议: rect.width > parentRect.width ? '需要调整' : '效果良好'
    })
  })
}

// 测试4: 检查不同屏幕尺寸下的表现
function testResponsiveImageBehavior() {
  console.log('=== 测试响应式图片表现 ===')
  
  const viewportWidth = window.innerWidth
  const isMobile = viewportWidth <= 768
  
  console.log('视口信息:', {
    宽度: viewportWidth + 'px',
    是否为移动端: isMobile
  })
  
  const descriptionImages = document.querySelectorAll('.description-content img')
  
  descriptionImages.forEach((img, index) => {
    const rect = img.getBoundingClientRect()
    const parentRect = img.parentElement.getBoundingClientRect()
    
    console.log(`图片 ${index + 1} 响应式:`, {
      元素: img,
      图片宽度: rect.width + 'px',
      容器宽度: parentRect.width + 'px',
      宽度比例: (rect.width / parentRect.width * 100).toFixed(1) + '%',
      在移动端表现: isMobile ? '需要检查' : '桌面端正常',
      建议: rect.width > parentRect.width ? '需要优化' : '表现良好'
    })
  })
}

// 测试5: 模拟窗口大小变化
function testWindowResizeBehavior() {
  console.log('=== 测试窗口大小变化行为 ===')
  
  const descriptionImages = document.querySelectorAll('.description-content img')
  
  if (descriptionImages.length === 0) {
    console.log('没有找到图片，无法测试')
    return
  }
  
  // 记录当前尺寸
  const originalSizes = Array.from(descriptionImages).map(img => ({
    element: img,
    width: img.getBoundingClientRect().width,
    height: img.getBoundingClientRect().height
  }))
  
  console.log('当前图片尺寸:', originalSizes.map((size, index) => 
    `图片 ${index + 1}: ${size.width}x${size.height}px`
  ))
  
  // 模拟窗口大小变化测试
  console.log('建议测试步骤:')
  console.log('1. 调整浏览器窗口大小')
  console.log('2. 观察图片是否自动调整')
  console.log('3. 检查图片是否始终保持在容器内')
  console.log('4. 验证图片比例是否保持')
  
  // 提供测试函数
  window.testImageResize = () => {
    const currentSizes = Array.from(descriptionImages).map(img => ({
      element: img,
      width: img.getBoundingClientRect().width,
      height: img.getBoundingClientRect().height
    }))
    
    console.log('调整后图片尺寸:', currentSizes.map((size, index) => 
      `图片 ${index + 1}: ${size.width}x${size.height}px`
    ))
    
    // 检查是否有变化
    const hasChanged = currentSizes.some((current, index) => 
      current.width !== originalSizes[index].width || 
      current.height !== originalSizes[index].height
    )
    
    console.log('图片尺寸是否变化:', hasChanged ? '是' : '否')
  }
  
  console.log('可以调用 window.testImageResize() 来检查调整后的尺寸')
}

// 测试6: 检查图片加载状态
function testImageLoadingState() {
  console.log('=== 测试图片加载状态 ===')
  
  const descriptionImages = document.querySelectorAll('.description-content img')
  
  descriptionImages.forEach((img, index) => {
    console.log(`图片 ${index + 1} 加载状态:`, {
      元素: img,
      是否完成加载: img.complete,
      是否有错误: img.naturalWidth === 0,
      原始尺寸: img.naturalWidth > 0 ? `${img.naturalWidth}x${img.naturalHeight}` : '加载失败',
      当前显示尺寸: `${img.offsetWidth}x${img.offsetHeight}`,
      建议: img.complete && img.naturalWidth > 0 ? '加载正常' : '需要检查'
    })
  })
}

// 运行所有测试
function runDescriptionImageTests() {
  console.log('=== 描述区域图片自适应功能测试 ===')
  
  console.log('\n1. 测试描述区域图片样式...')
  testDescriptionImageStyles()
  
  console.log('\n2. 测试描述内容区域约束...')
  testDescriptionContentConstraints()
  
  console.log('\n3. 测试图片自适应效果...')
  testImageResponsiveBehavior()
  
  console.log('\n4. 测试响应式图片表现...')
  testResponsiveImageBehavior()
  
  console.log('\n5. 测试窗口大小变化行为...')
  testWindowResizeBehavior()
  
  console.log('\n6. 测试图片加载状态...')
  testImageLoadingState()
  
  console.log('\n=== 测试完成 ===')
  console.log('检查要点:')
  console.log('1. 图片是否限制在描述区域内')
  console.log('2. 图片是否自适应容器宽度')
  console.log('3. 图片是否保持合适的宽高比')
  console.log('4. 图片是否有圆角和阴影效果')
  console.log('5. 在不同屏幕尺寸下是否正常显示')
  console.log('6. 图片加载是否正常')
}

// 在浏览器控制台中运行: runDescriptionImageTests()
