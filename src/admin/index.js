const sgMail = require('@sendgrid/mail');

export async function sendApprovalEmail(from, to, subject, html) {
    sgMail.setApiKey('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');
    const mail = {
      from: from,
      to: to,
      subject: subject,
      html,
    };
    await sgMail.send(mail)
    .then(() => {
    console.log(JSON.stringify({ message: "Email sent" }));
    })
    .catch((error) => {
      console.log(JSON.stringify({ message: String(error) }));
  })

}

export async function handleClick(from, to, subject, html) {
  var formData = new FormData();
  formData.append('from', from);
  formData.append('to', to);
  formData.append('subject', subject);
  formData.append('html', html);
  fetch('http://dunn-carabali.com/fetch.php', {
    method: 'POST', 
    mode: 'no-cors', 
    body: formData
  })
}
