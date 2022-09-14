import React, { useRef, useState } from 'react';
import Cell from '../../components/cell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import Modali, { useModali } from 'modali';
import { getFirestore, updateDoc, doc, deleteDoc } from 'firebase/firestore'


function NewsTable(props) {
    const { posts, searchQuery, AppUser } = props;
    const uploadButton = useRef();
    const db = getFirestore();
    const [editData, setEditData] = useState([]);
    const [idData, setIDData] = useState("");
    const [exampleModal, toggleExampleModal] = useModali({
        animated: true,
        large: true,
        closeButton: true,
        title: "Edit News/Post Entry"
      });
      const subject = useRef();
      const postType = useRef();
      const maradminid = useRef();
      const body = useRef();
      const video = useRef();

    return (
        <div className='table-container'>
            {
                posts.length !== 0 &&
                <table className='w-100'>
                    <Modali.Modal {...exampleModal}>
                   { AppUser?.roles?.includes('Approver') ?
                    <div className='cp-form-inner mb-5 mt-5 col-14 px-md-5 justify-content-center'>
                        <div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Subject</span>
                            <textarea className="form-control" rows="1" defaultValue={editData.subject} ref={subject}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Body</span>
                            <textarea className="form-control" rows="6" defaultValue={editData.body} ref={body}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Video/MarAdmin URL</span>
                            <textarea placeholder="http://www.website.com (Leave Blank, if there is no URL)" defaultValue={editData.video} className="form-control" rows="1" ref={video}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text px-md-15 w-25'>MarAdmin ID</span>
                            <textarea placeholder="245/34 (Leave Blank, if not MarAdmin)" defaultValue={editData.maradminid} className="form-control" rows="1" ref={maradminid}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Post Type</span>
                            <select className='form-select' value={editData.postType} id='status' ref={postType} >
                                    <option value='alert'>Alert</option>
                                    <option value='info'>Information Only</option>
                                    <option value='general'>General</option>
                                </select>
                        </div>
                            <button
                                type='button'
                                className='btn btn-success w-75 round-10'
                                ref={uploadButton}
                                onClick={event => {
                                    const docRef = doc(db, 'posts', idData);
                                    const data = {
                                        subject: subject.current.value,
                                        body: body.current.value,
                                        video: video.current.value,
                                        maradminid: maradminid.current.value,
                                        postType: postType.current.value

                                    };
                                      updateDoc(docRef, data)
                                      .then(docRef => {
                                        alert("Post has been successfully updated.");
                                    })
                                      .catch(error => {
                                          alert("An error has occured with updating this Post, Please try again.\n\n"+error);
                                      })
                                }}
                            >
                                Update
                            </button>

                            <button
                                type='button'
                                style={{marginLeft:5}}
                                className='btn btn-danger w-20 round-10'
                                ref={uploadButton}
                                onClick={async (event) => {
                                    const docRef = doc(db, 'posts', idData);
                                    deleteDoc(docRef)
                                    .then(docRef => {
                                        alert("Post has been successfully deleted.\n\nThis page will now refresh once you click OK.");
                                    })
                                      .catch(error => {
                                          alert("An error has occured with deleting the Data Dictionary, Please try again.\n\n"+error);
                                      })
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                    :
                    
<div class="alert">
  <h4 class="alert-heading">Access Denied!</h4>
  <p>Current user does not have access to edit data.</p>
</div>
}
                                        </Modali.Modal>  
                    <thead>
                        <tr>
                        <th width='5%'></th>
                            <th width='5%'>Type</th>
                            <th width='20%'>Subject</th>
                            <th width='40%'>Body / Video URL / MarAdmin ID</th>
                            <th width='15%'>Published</th>
                            <th width='15%'>Approved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            posts.map(item => {
                                const { id } = item;
                                const {
                                    subject,
                                    body,
                                    video,
                                    maradminid,
                                    publishedOn,
                                    approvedOn,
                                    publishedBy,
                                    approvedBy,
                                    type
                                } = item.data();


                                function openEdit() {
                                   if (AppUser?.roles?.includes('Approver')){
                                    setIDData(id)
                                    setEditData(item.data())
                                    toggleExampleModal() 
                                }
                                }

                                return(
                                    <tr onClick={openEdit} key={id}>
                                       <td>
                                        { AppUser?.roles?.includes('Approver') ?
                                        <FontAwesomeIcon color="red" icon={faEdit}/> : ""
                                        }
                                        </td>
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={type} />
                                        </td>
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={subject} />
                                        </td>
                                        <td className='word-break'>
                                            <Cell words={[searchQuery]} text={body +' | URL: '+ video +' | Maradmin ID: '+ maradminid}/>
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={( publishedBy || '' ) + ' ' + ( publishedOn?.toDate()?.toLocaleDateString() || '') } />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={( approvedBy || '' ) + ' ' + ( approvedOn?.toDate()?.toLocaleDateString() || '' )} />
                                        </td>

                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            }
        </div>
    );
}

export default NewsTable;