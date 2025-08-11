<template>
  <div class="help-page">
    <Header />
    
    <main class="help-main">
      <div class="container">
        <h1 class="page-title">Help & Support</h1>
        
        <div class="help-content">
          <div class="help-section">
            <h2>Frequently Asked Questions</h2>
            
            <div class="faq-item">
              <h3>How do I purchase tickets?</h3>
              <p>Browse our events, select the event you want to attend, choose your seats, and complete the payment process.</p>
            </div>
            
            <div class="faq-item">
              <h3>Can I get a refund?</h3>
              <p>Refund policies vary by event. Please check the specific event details for refund information.</p>
            </div>
            
            <div class="faq-item">
              <h3>How do I contact customer support?</h3>
              <p>You can reach our customer support team at support@ticketsystem.com or call us at 1-800-TICKETS.</p>
            </div>
            
            <div class="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>We accept all major credit cards, debit cards, and digital wallets including PayPal and Apple Pay.</p>
            </div>
          </div>
          
          <div class="help-section">
            <h2>Contact Information</h2>
            
            <div class="contact-info">
              <div class="contact-item">
                <h3>Email Support</h3>
                <p>yezi@ticketsystem.com</p>
              </div>
              
              <div class="contact-item">
                <h3>Phone Support</h3>
                <p>1-800-TICKETS</p>
                <p>Monday - Friday: 9 AM - 6 PM EST</p>
              </div>
              
              <div class="contact-item">
                <h3>Live Chat</h3>
                <p>Available 24/7 on our website</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
</script>

<style scoped>
.help-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.help-main {
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2rem;
  text-align: center;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.help-section {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.help-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.faq-item {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.faq-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.faq-item h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.faq-item p {
  color: #6b7280;
  line-height: 1.6;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contact-item {
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #2563eb;
}

.contact-item h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.contact-item p {
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.contact-item p:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .help-section {
    padding: 1.5rem;
  }
  
  .help-section h2 {
    font-size: 1.25rem;
  }
}
</style> 