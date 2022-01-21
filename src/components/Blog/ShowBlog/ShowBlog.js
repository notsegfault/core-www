import React from "react";
import {
  Anchor,
  Panel,
  Avatar
} from 'react95';

import c from "./ShowBlog.module.css";
import { withRouter } from "react-router-dom";
import ToText from "../utils/ToText";
import moment from "moment";
import userPNG from '../../../assets/img/user.png';
import calendarPNG from '../../../assets/img/calendar.png';
import { WebampPlayTrackButton } from "../../Webamp";

function ShowBlog(props, p) {
  return <Panel
    variant='outside'
    shadow
    style={{ padding: '0.5rem', lineHeight: '1.5', marginBottom: '1em', width: '100%' }}
  >
    <div
      onClick={() => window.open(props.link, '_blank')}
      className={c.cardpost_image}
      style={{ backgroundImage: `url(${props.thumbnail})`, cursor: 'pointer' }}
    >

      <div className={c.authorimg}>
        <Avatar size={60} onClick={() => window.open(props.profileurl, '_blank')}>
          <img alt="home" src={props.avatar} width={60} />
        </Avatar>

      </div>
    </div>

    <Panel
      variant='well'
      style={{ backgroundColor: 'white', padding: '0.5rem', lineHeight: '1.5', width: '100%', marginTop: '0.5em' }}
    >
      <h5 style={{ fontWeight: 'bold' }}>
        <a
          href={props.link}
          rel="noopener noreferrer"
          target="_blank"
        >
          {props.title}
        </a>
      </h5>
      <p className={c.cardText}>{`${ToText(
        props.description.substring(0, 500)
      )}...`} [<Anchor target="_blank" href={props.link}>Read more...</Anchor>]</p>

      <span>
        <img src={userPNG} style={{ paddingRight: '0.5rem' }} />
        {props.author}
      </span>

      <br />
      <span>
        <img src={calendarPNG} style={{ paddingRight: '0.2rem' }} />
        {moment(props.pubDate).format("MMM DD, YYYY")}
      </span>

      {
        props.audioId &&
        <>
          <br />
          <WebampPlayTrackButton trackId={props.audioId} text="Listen" />
        </>
      }
    </Panel>
  </Panel>
}

export default withRouter(ShowBlog);
