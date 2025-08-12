<template>
  <div class="tiptap-editor">
    <!-- toolbar -->
    <div class="editor-toolbar">
      <button
        type="button"
        @click="editor?.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor?.isActive('bold') }"
        class="toolbar-button"
        :disabled="!editor"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.6 11.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 7.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" fill="currentColor"/>
        </svg>
      </button>
      
      <button
        type="button"
        @click="editor?.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor?.isActive('italic') }"
        class="toolbar-button"
        :disabled="!editor"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" fill="currentColor"/>
        </svg>
      </button>
      
      <div class="toolbar-divider"></div>
      
      <!-- image insert button -->
      <button
        type="button"
        @click="insertImage"
        class="toolbar-button"
        :disabled="!editor"
        title="Insert Image URL"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
        </svg>
      </button>
      
      <!-- image upload button -->
      <label class="toolbar-button" :class="{ 'disabled': !editor || isUploading }" title="Upload Image">
        <input
          type="file"
          accept="image/*"
          @change="handleImageUpload"
          class="file-input"
          :disabled="!editor || isUploading"
        />
        <svg v-if="!isUploading" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z" fill="currentColor"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
        </svg>
      </label>
      
      <div class="toolbar-divider"></div>
      
      <button
        type="button"
        @click="editor?.chain().focus().setParagraph().run()"
        :class="{ 'is-active': editor?.isActive('paragraph') }"
        class="toolbar-button"
        :disabled="!editor"
      >
        P
      </button>
      
      <button
        type="button"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'is-active': editor?.isActive('heading', { level: 1 }) }"
        class="toolbar-button"
        :disabled="!editor"
      >
        H1
      </button>
      
      <button
        type="button"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'is-active': editor?.isActive('heading', { level: 2 }) }"
        class="toolbar-button"
        :disabled="!editor"
      >
        H2
      </button>
      
      <div class="toolbar-divider"></div>
      
      <button
        type="button"
        @click="editor?.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor?.isActive('bulletList') }"
        class="toolbar-button"
        :disabled="!editor"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" fill="currentColor"/>
        </svg>
      </button>
      
      <button
        type="button"
        @click="editor?.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor?.isActive('orderedList') }"
        class="toolbar-button"
        :disabled="!editor"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill="currentColor"/>
        </svg>
      </button>
      
      <div class="toolbar-divider"></div>
      
      <button
        type="button"
        @click="editor?.chain().focus().toggleBlockquote().run()"
        :class="{ 'is-active': editor?.isActive('blockquote') }"
        class="toolbar-button"
        :disabled="!editor"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" fill="currentColor"/>
        </svg>
      </button>
      
      <div class="toolbar-divider"></div>
      
      <button
        type="button"
        @click="editor?.chain().focus().undo().run()"
        class="toolbar-button"
        :disabled="!editor?.can().undo()"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" fill="currentColor"/>
        </svg>
      </button>
      
      <button
        type="button"
        @click="editor?.chain().focus().redo().run()"
        class="toolbar-button"
        :disabled="!editor?.can().redo()"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" fill="currentColor"/>
        </svg>
      </button>
    </div>
    
    <!-- editor content -->
    <div class="editor-content">
      <editor-content :editor="editor" />
    </div>
    
    <!-- character count -->
    <div class="editor-footer">
      <span class="character-count">
        {{ characterCount }}/{{ props.maxLength }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { uploadEventImage } from '../api/cloudinary'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Start writing...'
  },
  maxLength: {
    type: Number,
    default: 1000
  }
})

const emit = defineEmits(['update:modelValue'])
const isUploading = ref(false)

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'editor-image',
      },
    }),
  ],
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    emit('update:modelValue', html)
  },
})

const characterCount = computed(() => {
  if (!editor.value) return 0
  // get plain text content and calculate character count
  const textContent = editor.value.getText()
  return textContent.length
})

// insert image method
const insertImage = () => {
  if (!editor.value) return
  
  const url = prompt('Enter image URL:')
  if (url) {
    editor.value.chain().focus().setImage({ src: url }).run()
  }
}

// handle image file upload with Cloudinary
const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file || !editor.value) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }
  
  // 验证文件大小（限制为5MB）
  if (file.size > 5 * 1024 * 1024) {
    alert('Image size should be less than 5MB')
    return
  }
  
  isUploading.value = true
  
  try {
    // 上传到Cloudinary
    const { url, publicId } = await uploadEventImage(file)
    
    // 插入图片到编辑器
    editor.value.chain().focus().setImage({ src: url }).run()
    
    console.log('Image uploaded to Cloudinary:', url)
  } catch (error) {
    console.error('Failed to upload image:', error)
    alert('Failed to upload image. Please try again.')
  } finally {
    isUploading.value = false
    // 清空input
    event.target.value = ''
  }
}

// monitor modelValue change
watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== editor.value.getHTML()) {
    editor.value.commands.setContent(newValue, false)
  }
})

onMounted(() => {
  if (editor.value) {
    editor.value.commands.setContent(props.modelValue, false)
  }
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style scoped>
.tiptap-editor {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.tiptap-editor:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.toolbar-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem;
  font-weight: 600;
}

.toolbar-button:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.toolbar-button.is-active {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
}

.toolbar-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.5;
}

.toolbar-button.disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.5;
}

.file-input {
  display: none;
}

.editor-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background-color: #f9fafb;
  color: #6b7280;
  font-style: italic;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background-color: #d1d5db;
  margin: 0 0.25rem;
}

.editor-content {
  min-height: 200px;
  padding: 1rem;
  background-color: white;
}

.editor-content :deep(.ProseMirror) {
  outline: none;
  min-height: 200px;
}

.editor-content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: #9ca3af;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.editor-content :deep(.ProseMirror h1) {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem 0;
  color: #1f2937;
}

.editor-content :deep(.ProseMirror h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem 0;
  color: #1f2937;
}

.editor-content :deep(.ProseMirror p) {
  margin: 0.5rem 0;
  line-height: 1.6;
  color: #374151;
}

.editor-content :deep(.ProseMirror ul),
.editor-content :deep(.ProseMirror ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.editor-content :deep(.ProseMirror li) {
  margin: 0.25rem 0;
  line-height: 1.6;
}

.editor-content :deep(.ProseMirror strong) {
  font-weight: 600;
}

.editor-content :deep(.ProseMirror em) {
  font-style: italic;
}

.editor-content :deep(.ProseMirror u) {
  text-decoration: underline;
}

.editor-content :deep(.ProseMirror img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.editor-content :deep(.ProseMirror img.editor-image) {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.editor-content :deep(.ProseMirror img.editor-image:hover) {
  transform: scale(1.02);
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem 1rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.character-count {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.toolbar-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-button.disabled:hover {
  background-color: white;
  border-color: #d1d5db;
}

.character-count {
  text-align: right;
  font-size: 0.8rem;
  color: #6b7280;
  padding: 0.5rem 1rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

/* responsive design */
@media (max-width: 768px) {
  .editor-toolbar {
    padding: 0.5rem;
    gap: 0.125rem;
  }
  
  .toolbar-button {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }
  
  .editor-content {
    padding: 0.75rem;
  }
  
  .editor-content :deep(.ProseMirror) {
    min-height: 150px;
  }
}
</style> 