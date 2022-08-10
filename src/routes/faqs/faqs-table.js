import React from 'react';
import Cell from '../../components/cell';

function FaqsTable(props) {
    const { faqs, searchQuery } = props;
   
    return (
        <div className='table-container'>
            {
                faqs.length !== 0 &&
                <table className='w-100'>
                    <thead>
                        <tr>
                            <th>Question</th>
                            <th>Answer</th>
                            <th>Group</th>
                            <th>Published</th>
                            <th>Approved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            faqs.map(item => {
                                const {
                                    question,
                                    answer,
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
                                            <Cell words={[searchQuery]} text={question} />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={answer} />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={group} />
                                        </td>

                                        <td>
                                            <Cell words={[searchQuery]} text={( publishedBy || '' ) + ' ' + ( (publishedOn === "") ? "" : publishedOn?.toDate()?.toLocaleDateString() || '') } />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={( approvedBy || '' ) + ' ' + ( (approvedOn === "") ? "" : approvedOn?.toDate()?.toLocaleDateString() || '' )} />
                                        </td>
                                        {/* <td>{question}</td>
                                        <td>{answer}</td>
                                        <td>{group}</td> */}
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

export default FaqsTable;