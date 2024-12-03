
<svelte:head>
  <title>Contact - Zoey Zhao</title>
</svelte:head>

<h1>Contact</h1>

<form action="mailto:your-email@example.com" method="GET" id="contactForm">
    <label for="subject">Subject:</label>
    <input type="text" name="subject" id="subject" required>
    
    <label for="body">Message:</label>
    <textarea name="body" id="body" rows="4" required></textarea>
    
    <button type="submit">Send</button>
</form>
