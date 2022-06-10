import React from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import Cell from '../../components/cell';

// TODO: Invert progress bar text color as bar fills, see post [https://stackoverflow.com/a/61353195]

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

function NewslettersTable(props) {
    const { newsletters, searchQuery } = props;

    return (
        <div className='table-container'>
            {
                newsletters.length !== 0 &&
                <table className='w-100'>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Issue</th>
                            <th>Month</th>
                            <th>Year</th>
                            <th>Edition</th>
                            <th>Published</th>
                            <th>Approved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            newsletters.map(item => {
                                const {
                                    edition,
                                    title,
                                    issue,
                                    month,
                                    year,
                                    status,
                                    publishedBy,
                                    publishedOn,
                                    approvedBy,
                                    approvedOn
                                } = item.data();

                                function openNewsletter(event) {
                                    const storage = getStorage();
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
                                    <tr onClick={openNewsletter} key={item.id}>
                                        <td>
                                            <Cell words={[searchQuery]} text={title} />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={issue.toString()} />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={months[month - 1]} />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={year.toString()} />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={edition} />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={( publishedBy || '' ) + ' ' + ( publishedOn?.toDate()?.toLocaleDateString() || '') } />
                                        </td>
                                        <td>
                                            <Cell words={[searchQuery]} text={( approvedBy || '' ) + ' ' + ( approvedOn?.toDate()?.toLocaleDateString() || '' )} />
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
                    </tbody>
                </table>
            }
        </div>
    );
}

export default NewslettersTable;