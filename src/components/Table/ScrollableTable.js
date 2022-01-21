import { Table } from 'react95';
import styled from 'styled-components'

const ScrollableTable = styled(Table)`
  tbody {
    display: block;
    overflow-y: scroll;
  }
  thead, tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
    text-align: center;
  }
`;

export default ScrollableTable;
