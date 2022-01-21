import React from 'react';
import {
  WindowContent,
} from 'react95';
import { CoreWindow, CoreWindowContent } from '../../../../components/Windows';

const FannyReadmeWindow = props => {
  return (
      <CoreWindow
        {...props}
        windowTitle='FANNY.readme'
        top='25%'
        left='20%'
        width='400px'
      >
        <CoreWindowContent>
          <h1>How it works</h1>
          <p>
            $FANNY is a fungible merchandise token that allows you to exchange 1 token for a limited-edition CORE Fanny Pack.
          </p>
          <p>
            Worldwide Shipping costs are included.
          </p>
          <p>
            Redeem $FANNY to get a real limited-edition CORE Fanny Pack shipped to you.
          </p>
          <br/>
          <h1>Price of $FANNY</h1>
          <p>
            Starting price of $FANNY tokens is $50 USD.
          </p>
          <p>
            Similar to other uniswap pools, buying and selling $FANNY tokens will move its price.
          </p>
        </CoreWindowContent>
      </CoreWindow>
  );
};
export default FannyReadmeWindow;
