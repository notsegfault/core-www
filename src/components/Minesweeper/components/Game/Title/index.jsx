import React from 'react';
import styled from 'styled-components'

const Title = () => (
  <TitleDiv >
    <Left />
    <Right />
  </TitleDiv>
);
const TitleDiv = styled.div`
  background-color: #008;
  height: 18px;
`
const Left = styled.div`
  float: left;
  background-image: url(data:image/gif;base64,R0lGODlhXgASALMAAAAAAIAAAACAAICAAAAAgIAAgACAgMDAwICAgP8AAAD/AP//AAAA//8A/wD//////ywAAAAAXgASAAAE1JDISau9OOvNO0deKI7k94Blqq4Yck4oK88Zgrr3AVTPQ/USIG2oQRxOrsPBptv9fBMhcVo8PpRGBMD5hPag1PAluVxqL9+gEPiVtqNrH9ubVsfrhHdeaCNfAVpbW11tdHtyiGp7i3OMhnGLjopSLldlgYI2hHqNjpxghWmhh6KPhZEEfUyCrINwkrCdPHSjUopPk2C3FFmYrrOxicHDkZDGprkWZq2/r86dd6BuhnbS0dbUE0vMgM1iM7Ye2zvdEuXfQ+EerucEXOjwIYLx9PX2QxEAADs=);
  height: 18px;
  width: 94px;
`
const Right = styled.div`
  float: right;
  background-image: url(data:image/gif;base64,R0lGODlhNAASALMAAAQCBISChMTCxAQChPz+/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAA0ABIAAwSicMhJq7046817J2AojsBoioB0rulACHAsx0E533Ct4rfu8rPaSxAoGo251hCY3DGTw6P05VsCALJr8/ck2oinAFWZxQq02yVTmFO3vc7YFZ3ueqNuMJxbDpK7bHpBY3Ewc2Z1gF9iPYR8Z2Z0VXKHiHdvg3tWlmiThpUygVJHjnk4nk+BAiuldlWjsEKxo0qzUi2Vubq7uRK8uh7BwsPExRcRADs=);
  height: 18px;
  width: 52px;
`


export default Title;
