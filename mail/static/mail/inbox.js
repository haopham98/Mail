document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');



});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Processing Submit Form
  document.querySelector('#compose-form').addEventListener('submit', (event) =>{
    event.preventDefault(); // prevent reload page

    // get value in form
    const sender = document.querySelector('#compose-sender').value;
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // Send email
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        sender: sender,
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(load_mailbox('sent')) // Load sent mailbox after sending email
    .catch(error => {
      console.error('Error sending email:', error);
    });
  });
}

function listArchieveEmail(mailbox) {
    // Fetch the email which is archived
    // display list of emails
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails);
      emails.forEach(element => {
        const email = renderEmailView(element);
        email.className = 'email-item';
        document.querySelector('#emails-view').append(email);
        
        // Add click event to each email to load email details
        email.addEventListener('click', () => {
          // Load the email details
          fetch(`/emails/${element.id}`)
          .then(response => response.json())
          .then(emailDetails => {
            // Show email details
            
            document.querySelector('#emails-view').innerHTML = `
              <h3> Subject: ${emailDetails.subject}</h3>
              <h4> Form: ${emailDetails.sender}</h4>
              <h4> Body: </h4> <br>
              <p class='email-body'>${emailDetails.body}</p>
              <span>${emailDetails.timestamp}</span><br>
              <button id="reply-button">Reply</button>
              <button id="archive-button">${emailDetails.archived ? 'Unarchive' : 'Archive'}</button>
              `;
          })
        })
      })
    })
}


function renderEmailView(email) {
  // render email view
  const emailElement = document.createElement('div');
  emailElement.className = 'email-item';
  emailElement.innerHTML = `
    <h4><strong>${email.subject}</strong></h4>
    <h5>${email.sender}</h5>
    <span>${email.timestamp}</span>
  `;
  return emailElement
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3><strong>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</strong></h3>`;
  
  // Fetch emails from the mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
   // check data in emails
  .then(emails => {
    // sort emails by timestamp
    emails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    // Loop through emails and display them
    emails.forEach(element => {
      const email = document.createElement('div');
      email.className = 'email-item';
      email.innerHTML = `<h4>${element.subject}</h4> <strong>${element.sender}</strong><br> <span>${element.timestamp}</span>`;
      
      if (mailbox === 'inbox' && element.read) {
        //email.className = 'read-email-item';
        email.className = 'email-item read-email-item';
      }
      
      document.querySelector('#emails-view').append(email);
      // Add click event to each email
      // to load email details
      email.addEventListener('click', () => {
        // Load the email details
        fetch(`/emails/${element.id}`)
        .then(response => response.json())
        .then(emailDetails => {
          // Show email details
          document.querySelector('#emails-view').innerHTML = `
            <h4> <strong>Subject: </strong> ${emailDetails.subject}</h3>
            <h5><strong>From: </strong> ${emailDetails.sender}</h5>
            <h5><strong>To: </strong>${emailDetails.recipients.join(', ')}</h5>
            <h5> <strong>Content: </strong> </h5>
            <textarea class='textarea-custom'>${emailDetails.body}</textarea>
            <span>${emailDetails.timestamp}</span><br>
            <button id="reply-button">Reply</button>
            `;
        })
      })
      email.addEventListener('click', () => {
        fetch(`/emails/${element.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
        .catch(error => {
          console.error('Error marking email as read:', error);
        });
      });
    })
  })
}




