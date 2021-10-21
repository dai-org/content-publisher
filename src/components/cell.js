import React from 'react';
import Highlighter from 'react-highlight-words';

// TODO: Invert progress bar text color as bar fills, see post [https://stackoverflow.com/a/61353195]

function Cell(props) {
    const { words, text } = props;
    return (
        <Highlighter
            highlightClassName="highlight"
            searchWords={words}
            autoEscape={true}
            textToHighlight={text}
        />
    );
}

export default Cell;