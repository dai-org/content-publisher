import React, { useRef, useState } from 'react';
import Cell from '../components/cell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faKey } from '@fortawesome/free-solid-svg-icons'
import Modali, { useModali } from 'modali';
import { getFirestore, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { sendPasswordResetEmail, getAuth} from "firebase/auth";


function AdminTable(props) {
    const { posts, searchQuery, AppUser } = props;
    const uploadButton = useRef();
    const db = getFirestore();
    const [editData, setEditData] = useState([]);
    const [idData, setIDData] = useState("");
    const [exampleModal, toggleExampleModal] = useModali({
        animated: true,
        large: true,
        closeButton: true,
        title: "Edit Admin Users"
      });
      const name = useRef();
      const email = useRef();
      const roles = useRef();
      const auths = getAuth();

    return (
        <div className='table-container'>
            {
                posts.length !== 0 &&
                <table className='w-100'>
                    <Modali.Modal {...exampleModal}>
                   { AppUser?.roles?.includes('Approver') ?
                    <div className='cp-form-inner mb-5 mt-5 col-12 px-md-5 justify-content-center'>
                        <div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Name</span>
                            <textarea className="form-control" rows="1" defaultValue={editData.name} ref={name}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Email Address</span>
                            <textarea className="form-control" rows="1" defaultValue={editData.email} ref={email}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Role</span>
                            <select className='form-select' value={editData.roles} multiple={false} ref={roles}>
                                    <option value='Approver'>Approver</option>
                                    <option value='Publisher'>Publisher</option>
                                </select>
                        </div>
                        
                            <button
                                type='button'
                                className='btn btn-success w-75 round-10'
                                ref={uploadButton}
                                onClick={event => {
                                    const docRef = doc(db, 'appUsers', idData);
                                    const data = {
                                        email: email.current.value,
                                        name: name.current.value,
                                        roles: roles.current.value
                                    };
                                      updateDoc(docRef, data)
                                      .then(docRef => {
                                        alert("User has been successfully updated.");
                                    })
                                      .catch(error => {
                                          alert("An error has occured with updating this User, Please try again.\n\n"+error);
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
                                    const docRef = doc(db, 'appUsers', idData);
                                   
                                    deleteDoc(docRef)
                                    .then(docRef => {
                                        alert("User has been successfully deleted.");
                                    })
                                      .catch(error => {
                                          alert("An error has occured with deleting the User, Please try again.\n\n"+error);
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
                        <th width='10%'></th>
                            <th width='30%'>Name</th>
                            <th width='30%'>Email</th>
                            <th width='30%'>Roles</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            posts.map(item => {
                                const { id } = item;
                                const {
                                    email,
                                    name,
                                    roles
                                } = item.data();


                                function openEdit() {
                                   if (AppUser?.roles?.includes('Approver')){
                                    setIDData(id)
                                    setEditData(item.data())
                                    toggleExampleModal() 
                                }
                                }

                                function resendPassword() {
                                    if (AppUser?.roles?.includes('Approver')){
                                        if (window.confirm("Are you sure you want to resend new password email to "+email)){
                                            sendPasswordResetEmail(auths, email);
                                            }
                                        }
                                 }

                                return(
                                    <tr key={id}>
                                       <td>
                                        { AppUser?.roles?.includes('Approver') ?
                                        <FontAwesomeIcon onClick={openEdit} style={{marginRight: 10}} color="red" icon={faEdit}/> : ""
                                        }
                                        <FontAwesomeIcon color="red" icon={faKey} onClick={resendPassword}/>
                                        </td>
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={name} />
                                        </td>
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={email} />
                                        </td>
                                        <td className=''>
                                            <Cell words={[searchQuery]} text={roles} />
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

export default AdminTable;