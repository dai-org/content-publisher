import React from 'react';
import Cell from '../../components/cell';

function DataDictionaryTable(props) {
    const { entries, searchQuery } = props;

    return (
        <div className='table-container'>
            {/* <h4 className={`text-start${entries.length !== 0 ? ' mb-4' : ' mb-0'}`}>Data Dictionary Entries ({entries.length})</h4> */}
            {
                entries.length !== 0 &&
                <table className='w-100'>
                    <thead>
                        <tr>
                            <th>Term</th>
                            <th>Description</th>
                            <th>Published</th>
                            <th>Approved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            entries.map(item => {
                                const {
                                    term,
                                    description,
                                    group,
                                    publishedBy,
                                    publishedOn,
                                    approvedBy,
                                    approvedOn
                                } = item.data();

                                function editFaq(event) {
                                    console.log(event);
                                }

                                return(
                                    <tr onClick={editFaq} key={item.id}>
                                        <td>
                                            <Cell words={[searchQuery]} text={term} />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={description} />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={( publishedBy || '' ) + ' ' + ( publishedOn?.toDate()?.toLocaleDateString() || '') } />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={( approvedBy || '' ) + ' ' + ( approvedOn?.toDate()?.toLocaleDateString() || '' )} />
                                        </td>
                                        {/* <td>{term}</td>
                                        <td>{description}</td>
                                        <td></td> */}
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

export default DataDictionaryTable;