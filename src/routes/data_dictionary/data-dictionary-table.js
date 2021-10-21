import React from 'react';
import Cell from '../../components/cell';

function DataDictionaryTable(props) {
    const { entries, searchQuery } = props;

    return (
        <div className='table-container'>
            <h4 className='mb-4 text-start'>Data Dictionary Entries ({entries.length})</h4>
            {
                entries.length !== 0 &&
                <table className='w-100'>
                    <thead>
                        <tr>
                            <th>Term</th>
                            <th>Description</th>
                            <th>Group</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            entries.map(item => {
                                const {
                                    term,
                                    description,
                                    // group
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
                                            {/* <Cell words={[searchQuery]} text={group} /> */}
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