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
