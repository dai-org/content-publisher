import React, { useRef, useState } from 'react';
import Cell from '../components/cell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import Modali, { useModali } from 'modali';
import { getFirestore, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DistroTable(props) {
    const { posts, searchQuery, AppUser } = props;
    const uploadButton = useRef();
    const db = getFirestore();
    const [editData, setEditData] = useState([]);
    const [idData, setIDData] = useState("");
    const [exampleModal, toggleExampleModal] = useModali({
        animated: true,
        large: true,
        closeButton: true,
        title: "Edit Distro List Email Addresses"
      });
      const name = useRef();
      const email = useRef();

    return (
        <div className='table-container'>
            {
                posts.length !== 0 &&
                <table className='w-100'>
                    <Modali.Modal {...exampleModal}>
                   { AppUser?.roles?.includes('SysAdmin') ?
                    <div className='cp-form-inner mb-5 mt-5 col-12 px-md-5 justify-content-center'>
                        <div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Distro Name</span>
                            <textarea className="form-control" rows="1" defaultValue={editData.name} ref={name}></textarea>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text w-25'>Distro Email Address</span>
                            <textarea className="form-control" rows="1" defaultValue={editData.email} ref={email}></textarea>
                        </div>

                            <button
                                type='button'
                                className='btn btn-success w-75 round-10'
                                ref={uploadButton}
                                onClick={event => {
                                    const docRef = doc(db, 'appDistro', idData);
                                    const data = {
                                        email: email.current.value,
                                        name: name.current.value,
                                    };
                                      updateDoc(docRef, data)
                                      .then(docRef => {
                                        toast.success('The distro has been successfully updated.', {
                                            position: "top-center",
                                            autoClose: 5000,
                                            hideProgressBar: true,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: false,
                                            progress: 0,
                                            }); 
                                    })
                                      .catch(error => {
                                        toast.error('An error has occured with updating this user, Please try again.\n\n'+error, {
                                            position: "top-center",
                                            autoClose: 5000,
                                            hideProgressBar: true,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: false,
                                            progress: 0,
                                            });
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
                                    const docRef = doc(db, 'appDistro', idData);
                                   
                                    deleteDoc(docRef)
                                    .then(docRef => {
                                        toast.success('The distro has been successfully deleted.', {
                                            position: "top-center",
                                            autoClose: 5000,
                                            hideProgressBar: true,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: false,
                                            progress: 0,
                                            }); 
                                    })
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
                                }}
                            >
                                Delete
                            </button>
                            <ToastContainer />
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
                            <th width='30%'>Distro Name</th>
                            <th width='30%'>Distro Email</th>
                            <th width='30%'>Distro Role</th>
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
                                   if (AppUser?.roles?.includes('SysAdmin')){
                                    setIDData(id)
                                    setEditData(item.data())
                                    toggleExampleModal() 
                                }
                                }

                                return(
                                    <tr key={id}>
                                       <td>
                                        { AppUser?.roles?.includes('SysAdmin') ?
                                        <FontAwesomeIcon onClick={openEdit} style={{marginRight: 10}} color="red" icon={faEdit}/> : ""
                                        }
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

export default DistroTable;