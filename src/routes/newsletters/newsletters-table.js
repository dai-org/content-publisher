import { getStorage, ref, getDownloadURL, deleteObject } from 'firebase/storage';
import Cell from '../../components/cell';
import { faFilePdf, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getFirestore, doc, deleteDoc } from 'firebase/firestore'
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// TODO: Invert progress bar text color as bar fills, see post [https://stackoverflow.com/a/61353195]

const months = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12'
];

function NewslettersTable(props) {
    const { newsletters, searchQuery, AppUser } = props;
    const db = getFirestore();
    const storage = getStorage();

    return (
        <div className='table-container'>
            {
                newsletters.length !== 0 &&
                <table className='w-100'>
                    <thead>
                        <tr>
                        <th width='5%'></th>
                            <th width='30%'>Title</th>
                            <th width='25%'>File Name</th>
                            <th width='20%'>Published</th> 
                            <th width='20%'>Approved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            newsletters.map(item => {
                                const { id } = item;

                                const {
                                    edition,
                                    title,
                                    issue,
                                    month,
                                    year,
                                    publishedBy,
                                    publishedOn,
                                    approvedBy,
                                    status,
                                    approvedOn
                                } = item.data();

                                function openEdit(event) {
                                    if (AppUser?.roles?.includes('NewsletterPublisher')){
                                    if (window.confirm("Are you sure you want to delete this Newsletter.")){
                                        const docRef = doc(db, 'newsletters', id);
                                        deleteDoc(docRef)
                                        .then(docRef => {
                                            const desertRef = ref(storage, `${edition}_${year}-${month}_${issue}.pdf`)
                                            deleteObject(desertRef).then(() => {
                                                // File deleted successfully
                                              }).catch((error) => {
                                                // Uh-oh, an error occurred!
                                              });
                                              toast.success('The entry has been successfully deleted.', {
                                                position: "top-center",
                                                autoClose: 5000,
                                                hideProgressBar: true,
                                                closeOnClick: true,
                                                pauseOnHover: true,
                                                draggable: false,
                                                progress: 0,
                                                });                                        })
                                          .catch(error => {
                                            toast.error('An error has occured, Please try again.\n\n'+error, {
                                                position: "top-center",
                                                autoClose: 5000,
                                                hideProgressBar: true,
                                                closeOnClick: true,
                                                pauseOnHover: true,
                                                draggable: false,
                                                progress: 0,
                                                });
                                                                                      })
                                 }
                                }else{
                                    toast.error('This account does not have permisions to delete this newsletter.', {
                                        position: "top-center",
                                        autoClose: 5000,
                                        hideProgressBar: true,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: false,
                                        progress: 0,
                                        });
                                }
                                 }

                                function openNewsletter(event) {
                                    // getDownloadURL(ref(storage, `${edition.split(' ').join('-')}_${year}-${month}_${issue}.pdf`))
                                    getDownloadURL(ref(storage, `${edition}_${year}-${month}_${issue}.pdf`))
                                    .then((url) => {
                                        // console.log(url);
                                        window.open(url);
                                    })
                                    .catch((error) => {
                                        // Handle any errors
                                    });
                                }

                                return(
                                    <tr key={id} bgcolor={status !== "Approved" ? "#ffffe0" : ""}>
                                        <td>
                                        { AppUser?.roles?.includes('NewsletterPublisher') &&
                                        <FontAwesomeIcon style={{marginRight: 15}} onClick={openEdit} key={item.id} color="red" icon={faTrash}/> 
                                        }

                                        <FontAwesomeIcon onClick={openNewsletter} key={item.id} icon={faFilePdf}/>
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={title} />
                                        </td>
                                        <td>
                                            <Cell  words={[searchQuery]} text={ edition +'-'+ year.toString()+'-'+ months[month - 1] +'-'+ issue.toString()+'.pdf'}/>
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={( publishedBy || '' ) + ' ' + ( (publishedOn === "") ? "" : publishedOn?.toDate()?.toLocaleDateString() || '') } />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={( approvedBy || '' ) + ' ' + ( (approvedOn === "") ? "" : approvedOn?.toDate()?.toLocaleDateString() || '' )} />
                                        </td>
                                        {/* <td>{title}</td>
                                        <td>{issue}</td>
                                        <td>{months[month - 1]}</td>
                                        <td>{year}</td>
                                        <td>{edition}</td> */}
                                    </tr>
                                )
                            })
                        }
                        <ToastContainer />
                    </tbody>
                </table>
                
            }
        </div>
    );
}

export default NewslettersTable;