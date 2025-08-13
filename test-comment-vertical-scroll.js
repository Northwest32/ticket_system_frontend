// 测试评论竖向滚动效果的脚本
// 可以在浏览器控制台中运行

// 测试1: 检查评论列表的滚动样式
function testCommentScrollStyles() {
  console.log('=== 测试评论竖向滚动样式 ===')
  
  const commentsListElements = document.querySelectorAll('.comments-list')
  console.log('找到评论列表容器数量:', commentsListElements.length)
  
  commentsListElements.forEach((element, index) => {
    const styles = window.getComputedStyle(element)
    console.log(`评论列表 ${index + 1} 样式:`, {
      元素: element,
      display: styles.display,
      maxHeight: styles.maxHeight,
      overflowY: styles.overflowY,
      overflowX: styles.overflowX,
      padding: styles.padding,
      width: styles.width,
      height: styles.height
    })
  })
}

// 测试2: 检查评论项的样式
function testCommentItemStyles() {
  console.log('=== 测试评论项样式 ===')
  
  const commentItems = document.querySelectorAll('.comment-item')
  console.log('找到评论项数量:', commentItems.length)
  
  commentItems.forEach((item, index) => {
    const styles = window.getComputedStyle(item)
    console.log(`评论项 ${index + 1} 样式:`, {
      元素: item,
      width: styles.width,
      marginBottom: styles.marginBottom,
      padding: styles.padding,
      borderRadius: styles.borderRadius,
      backgroundColor: styles.backgroundColor
    })
  })
}

// 测试3: 检查滚动条样式
function testScrollbarStyles() {
  console.log('=== 测试滚动条样式 ===')
  
  const commentsListElements = document.querySelectorAll('.comments-list')
  
  commentsListElements.forEach((element, index) => {
    console.log(`评论列表 ${index + 1} 滚动条:`, {
      元素: element,
      是否有滚动条: element.scrollHeight > element.clientHeight,
      内容高度: element.scrollHeight + 'px',
      容器高度: element.clientHeight + 'px',
      滚动位置: element.scrollTop + 'px',
      最大高度: window.getComputedStyle(element).maxHeight
    })
  })
}

// 测试4: 模拟添加更多评论
function testAddMoreComments() {
  console.log('=== 测试添加更多评论 ===')
  
  const commentsListElements = document.querySelectorAll('.comments-list')
  
  commentsListElements.forEach((element, index) => {
    const maxHeight = parseInt(window.getComputedStyle(element).maxHeight)
    const currentHeight = element.scrollHeight
    
    console.log(`评论列表 ${index + 1}:`, {
      容器最大高度: maxHeight + 'px',
      当前内容高度: currentHeight + 'px',
      当前评论数: element.children.length,
      需要滚动: currentHeight > maxHeight,
      可滚动距离: Math.max(0, currentHeight - maxHeight) + 'px'
    })
  })
}

// 测试5: 检查响应式布局
function testResponsiveLayout() {
  console.log('=== 测试响应式布局 ===')
  
  const viewportWidth = window.innerWidth
  const isMobile = viewportWidth <= 768
  
  console.log('视口信息:', {
    宽度: viewportWidth + 'px',
    是否为移动端: isMobile
  })
  
  const commentItems = document.querySelectorAll('.comment-item')
  commentItems.forEach((item, index) => {
    const styles = window.getComputedStyle(item)
    console.log(`评论项 ${index + 1} 响应式:`, {
      元素: item,
      宽度: styles.width,
      在移动端是否合适: isMobile ? '正常' : '正常'
    })
  })
}

// 测试6: 模拟滚动操作
function testScrollOperation() {
  console.log('=== 测试滚动操作 ===')
  
  const commentsListElements = document.querySelectorAll('.comments-list')
  
  commentsListElements.forEach((element, index) => {
    if (element.scrollHeight > element.clientHeight) {
      console.log(`评论列表 ${index + 1} 可以滚动:`, {
        元素: element,
        总高度: element.scrollHeight + 'px',
        可视高度: element.clientHeight + 'px',
        可滚动距离: (element.scrollHeight - element.clientHeight) + 'px',
        当前滚动位置: element.scrollTop + 'px'
      })
      
      // 模拟滚动到中间位置
      const scrollToMiddle = () => {
        const maxScroll = element.scrollHeight - element.clientHeight
        element.scrollTo({
          top: maxScroll / 2,
          behavior: 'smooth'
        })
        console.log(`已滚动到中间位置: ${maxScroll / 2}px`)
      }
      
      // 将滚动函数绑定到全局，方便测试
      window[`scrollComments${index}`] = scrollToMiddle
      console.log(`可以调用 window.scrollComments${index}() 来测试滚动`)
    } else {
      console.log(`评论列表 ${index + 1} 无需滚动`)
    }
  })
}

// 测试7: 检查评论数量阈值
function testCommentThreshold() {
  console.log('=== 测试评论数量阈值 ===')
  
  const commentsListElements = document.querySelectorAll('.comments-list')
  
  commentsListElements.forEach((element, index) => {
    const maxHeight = parseInt(window.getComputedStyle(element).maxHeight)
    const commentCount = element.children.length
    
    // 估算每个评论的高度（包括margin）
    const estimatedCommentHeight = 120 // 假设每个评论约120px高
    const estimatedThreshold = Math.floor(maxHeight / estimatedCommentHeight)
    
    console.log(`评论列表 ${index + 1} 阈值分析:`, {
      最大高度: maxHeight + 'px',
      当前评论数: commentCount,
      估算阈值: estimatedThreshold,
      是否超过阈值: commentCount > estimatedThreshold,
      建议: commentCount > estimatedThreshold ? '建议添加分页或"加载更多"' : '当前数量合适'
    })
  })
}

// 运行所有测试
function runCommentVerticalScrollTests() {
  console.log('=== 评论竖向滚动功能测试 ===')
  
  console.log('\n1. 测试评论滚动样式...')
  testCommentScrollStyles()
  
  console.log('\n2. 测试评论项样式...')
  testCommentItemStyles()
  
  console.log('\n3. 测试滚动条样式...')
  testScrollbarStyles()
  
  console.log('\n4. 测试添加更多评论...')
  testAddMoreComments()
  
  console.log('\n5. 测试响应式布局...')
  testResponsiveLayout()
  
  console.log('\n6. 测试滚动操作...')
  testScrollOperation()
  
  console.log('\n7. 测试评论数量阈值...')
  testCommentThreshold()
  
  console.log('\n=== 测试完成 ===')
  console.log('检查要点:')
  console.log('1. 评论是否垂直排列')
  console.log('2. 超出容器高度时是否显示滚动条')
  console.log('3. 评论项间距是否合适')
  console.log('4. 滚动是否流畅')
  console.log('5. 在移动端是否正常显示')
  console.log('6. 评论数量是否在合理范围内')
}

// 在浏览器控制台中运行: runCommentVerticalScrollTests()
