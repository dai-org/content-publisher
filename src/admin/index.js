
 export async function sendEmailApprover(to, page) {
  fetch('https://dunn-carabali.com/fetch.php?approver='+to+'&page='+page)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      return response.json()
    }).catch(err=>{
    console.log(err)
})
 }
