import React from 'react';
import { useHistory } from "react-router-dom";
import './upload.css'

function Upload() {
    const history = useHistory();

    return (
        <div className='upload-container'>
            <div className='upload-wrapper'>
                <div className='upload-inner pointer' onClick={event => { history.push('/data-dictionary'); }}>
                    <div>
                        <h5 className='mb-0'>Data Dictionary</h5>
                    </div>
                </div>
                <div className='upload-inner pointer' onClick={event => { history.push('/faqs'); }}>
                    <div>
                        <h5 className='mb-0'>FAQs</h5>
                    </div>
                </div>
                <div className='upload-inner pointer' onClick={event => { history.push('/newsletters'); }}>
                    <div>
                        <h5 className='mb-0'>Newsletters</h5>
                    </div>
                </div>
                <div className='upload-inner pointer' onClick={event => { history.push('/reference-guides'); }}>
                    <div>
                        <h5 className='mb-0'>Reference Guides</h5>
                    </div>
                </div>
                <div className='upload-inner pointer' onClick={event => { history.push('/training-guides'); }}>
                    <div>
                        <h5 className='mb-0'>Training Guides</h5>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Upload;