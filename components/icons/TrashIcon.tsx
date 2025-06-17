
import React from 'react';

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.9h1.368c1.603 0 2.816 1.336 2.816 2.9ZM12 3.25a.75.75 0 0 1 .75.75v.008l.008.008H12v-.008L11.25 4a.75.75 0 0 1 .75-.75ZM10.5 8.25a.75.75 0 0 0-1.5 0v8.25a.75.75 0 0 0 1.5 0V8.25Zm3.75 0a.75.75 0 0 0-1.5 0v8.25a.75.75 0 0 0 1.5 0V8.25Z" clipRule="evenodd" />
  </svg>
);
export default TrashIcon;