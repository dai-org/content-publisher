import React from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import Cell from '../../components/cell';

function ReferenceGuidesTable(props) {
    const { referenceGuides, searchQuery } = props;

    return (
        <div className='table-container'>
            <h4 className={`text-start${referenceGuides.length !== 0 ? ' mb-4' : ' mb-0'}`}>Reference Guides ({referenceGuides.length})</h4>
            {
                referenceGuides.length !== 0 &&
                <table className='w-100'>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            referenceGuides.map(item => {
                                const { id } = item;
                                const {
                                    title,
                                    description,
                                } = item.data();

                                function openReferenceGuide(event) {
                                    const storage = getStorage();
                                    // getDownloadURL(ref(storage, `${edition.split(' ').join('-')}_${year}-${month}_${issue}.pdf`))
                                    getDownloadURL(ref(storage, `${id}.pdf`))
                                    .then((url) => {
                                        // console.log(url);
                                        window.open(url);
                                    })
                                    .catch((error) => {
                                        // Handle any errors
                                    });
                                }

                                return(
                                    <tr onClick={openReferenceGuide} key={item.id}>
                                        <td>
                                            <Cell words={[searchQuery]} text={title} />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={description} />
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

export default ReferenceGuidesTable;