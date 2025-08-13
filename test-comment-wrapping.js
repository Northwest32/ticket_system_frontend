// 测试评论换行效果的脚本
// 可以在浏览器控制台中运行

// 测试1: 检查评论文本的CSS样式
function testCommentTextStyles() {
  console.log('=== 测试评论文本样式 ===')
  
  const commentTextElements = document.querySelectorAll('.comment-text')
  console.log('找到评论文本元素数量:', commentTextElements.length)
  
  commentTextElements.forEach((element, index) => {
    const styles = window.getComputedStyle(element)
    console.log(`评论 ${index + 1} 样式:`, {
      元素: element,
      文本内容: element.textContent.substring(0, 50) + '...',
      wordWrap: styles.wordWrap,
      wordBreak: styles.wordBreak,
      overflowWrap: styles.overflowWrap,
      lineHeight: styles.lineHeight,
      maxWidth: styles.maxWidth,
      width: styles.width
    })
  })
}

// 测试2: 检查评论容器的样式
function testCommentContainerStyles() {
  console.log('=== 测试评论容器样式 ===')
  
  const commentsListElements = document.querySelectorAll('.comments-list')
  console.log('找到评论列表容器数量:', commentsListElements.length)
  
  commentsListElements.forEach((element, index) => {
    const styles = window.getComputedStyle(element)
    console.log(`评论列表 ${index + 1} 样式:`, {
      元素: element,
      maxHeight: styles.maxHeight,
      overflowY: styles.overflowY,
      overflowX: styles.overflowX,
      width: styles.width,
      height: styles.height
    })
  })
}

// 测试3: 模拟长文本评论
function testLongCommentText() {
  console.log('=== 测试长文本评论 ===')
  
  // 创建一个测试用的长文本
  const longText = 'This is a very long comment that should test the word wrapping functionality. It contains a very long word: supercalifragilisticexpialidocious and also some URLs like https://www.verylongdomainnameexample.com/very/long/path/to/test/word/wrapping/behavior and some normal text that should wrap naturally at word boundaries.'
  
  console.log('测试长文本:', longText)
  console.log('文本长度:', longText.length, '字符')
  
  // 检查是否有评论元素可以测试
  const commentTextElements = document.querySelectorAll('.comment-text')
  if (commentTextElements.length > 0) {
    console.log('可以在第一个评论元素上测试长文本')
    console.log('当前第一个评论内容:', commentTextElements[0].textContent)
  } else {
    console.log('没有找到评论元素，无法进行测试')
  }
}

// 测试4: 检查评论项的布局
function testCommentItemLayout() {
  console.log('=== 测试评论项布局 ===')
  
  const commentItems = document.querySelectorAll('.comment-item')
  console.log('找到评论项数量:', commentItems.length)
  
  commentItems.forEach((item, index) => {
    const styles = window.getComputedStyle(item)
    const textElement = item.querySelector('.comment-text')
    
    console.log(`评论项 ${index + 1}:`, {
      元素: item,
      宽度: styles.width,
      高度: styles.height,
      内边距: styles.padding,
      边框: styles.border,
      文本元素存在: !!textElement,
      文本宽度: textElement ? window.getComputedStyle(textElement).width : 'N/A'
    })
  })
}

// 测试5: 检查响应式布局
function testResponsiveLayout() {
  console.log('=== 测试响应式布局 ===')
  
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  console.log('视口尺寸:', {
    宽度: viewportWidth + 'px',
    高度: viewportHeight + 'px'
  })
  
  // 检查评论区域在不同屏幕尺寸下的表现
  const commentsSections = document.querySelectorAll('.comments-section, .comments-list')
  commentsSections.forEach((section, index) => {
    const styles = window.getComputedStyle(section)
    console.log(`评论区域 ${index + 1}:`, {
      元素: section,
      宽度: styles.width,
      高度: styles.height,
      最大宽度: styles.maxWidth,
      最大高度: styles.maxHeight,
      在小屏幕下是否合适: viewportWidth < 768 ? '需要检查' : '正常'
    })
  })
}

// 运行所有测试
function runCommentWrappingTests() {
  console.log('=== 评论换行功能测试 ===')
  
  console.log('\n1. 测试评论文本样式...')
  testCommentTextStyles()
  
  console.log('\n2. 测试评论容器样式...')
  testCommentContainerStyles()
  
  console.log('\n3. 测试长文本评论...')
  testLongCommentText()
  
  console.log('\n4. 测试评论项布局...')
  testCommentItemLayout()
  
  console.log('\n5. 测试响应式布局...')
  testResponsiveLayout()
  
  console.log('\n=== 测试完成 ===')
  console.log('检查要点:')
  console.log('1. 评论文本是否正确换行')
  console.log('2. 长单词是否被正确截断')
  console.log('3. 评论列表是否有滚动条')
  console.log('4. 在小屏幕上是否正常显示')
}

// 在浏览器控制台中运行: runCommentWrappingTests()
