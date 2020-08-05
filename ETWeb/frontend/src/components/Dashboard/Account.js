import React from 'react';

export default props => {
    const { user } = props;
    return (
        <div className="row d-flex justify-content-center">
            <h3>Account for user { user.token }</h3>
        </div>
    );
};