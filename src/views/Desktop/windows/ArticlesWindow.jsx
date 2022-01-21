import React from 'react';
import bookIMG from '../../../assets/img/book2.png';
import { CoreWindow, CoreWindowContent } from '../../../components/Windows';
import Blog from '../../../components/Blog/Blog';

const ArticlesWindow = props => {
  return (
    <CoreWindow
      {...props}
      icon={bookIMG}
      windowTitle='Articles'
      maxWidth='700px'
      height='700px'
      maxHeight='700px'
      top="5%"
    >
      <CoreWindowContent>
        <Blog />
      </CoreWindowContent>
    </CoreWindow>
  );
};
export default ArticlesWindow;
